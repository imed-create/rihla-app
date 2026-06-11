/**
 * RIHLA — Booking Modal (Uber-Style)
 * ──────────────────────────────────
 * Three-step booking flow: Where → When → Who
 * Real calendar date picker, animated card expand/collapse,
 * wired to AppContext addBooking flow.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import UberButton from '@/components/shared/UberButton';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

type StepCard = 'where' | 'when' | 'who';

const GUEST_GROUPS = [
  { name: 'Adults', desc: 'Ages 13 or above', count: 0 },
  { name: 'Children', desc: 'Ages 2–12', count: 0 },
  { name: 'Infants', desc: 'Under 2', count: 0 },
  { name: 'Pets', desc: 'Pets allowed', count: 0 },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Animated Card Component ──
function AnimatedCard({
  stepNumber,
  label,
  value,
  isOpen,
  onToggle,
  children,
}: {
  stepNumber: number;
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animRotate = useRef(new Animated.Value(0)).current;
  const prevOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      // Expanding
      animHeight.setValue(0);
      animOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(animHeight, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
          tension: 50,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.spring(animRotate, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else if (!isOpen && prevOpen.current) {
      // Collapsing
      Animated.parallel([
        Animated.timing(animHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.spring(animRotate, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  const bodyMaxHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  const chevronRotation = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.card, isOpen && styles.cardOpen]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        style={styles.cardPreview}
      >
        <View style={styles.cardPreviewLeft}>
          <View style={[styles.stepDot, isOpen && { backgroundColor: RIHLA.primary }]}>
            <Text style={[styles.stepDotText, isOpen && { color: '#FFFFFF' }]}>{stepNumber}</Text>
          </View>
          <View>
            <Text style={styles.previewLabel}>{label}</Text>
            <Text style={[styles.previewValue, !value && { color: '#94A3B8' }]}>
              {value || `Select ${label.toLowerCase()}`}
            </Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={18} color="#94A3B8" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.cardBodyWrapper,
          { maxHeight: bodyMaxHeight, opacity: animOpacity },
        ]}
      >
        <View style={styles.cardBody}>{children}</View>
      </Animated.View>
    </View>
  );
}

// ── Calendar Component ──
function CalendarPicker({
  checkIn,
  checkOut,
  onSelectDate,
}: {
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (date: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const isToday = (d: number) => {
    const date = new Date(year, month, d);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  };

  const isPast = (d: number) => {
    return new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSelected = (d: number) => {
    const dateStr = formatDateStr(year, month, d);
    return dateStr === checkIn || dateStr === checkOut;
  };

  const isBetween = (d: number) => {
    if (!checkIn || !checkOut) return false;
    const dateStr = formatDateStr(year, month, d);
    return dateStr > checkIn && dateStr < checkOut;
  };

  const rangeStart = checkIn ? new Date(checkIn) : null;
  const rangeEnd = checkOut ? new Date(checkOut) : null;

  return (
    <View style={styles.calendar}>
      {/* Month navigator */}
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.calMonthLabel}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.calWeekRow}>
        {DAYS_OF_WEEK.map(d => (
          <Text key={d} style={styles.calWeekLabel}>{d}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.calGrid}>
        {days.map((d, i) => {
          if (d === null) return <View key={`empty-${i}`} style={styles.calDayCell} />;
          const past = isPast(d);
          const selected = isSelected(d);
          const between = isBetween(d);
          const isCheckIn = checkIn === formatDateStr(year, month, d);
          const isCheckOut = checkOut === formatDateStr(year, month, d);

          return (
            <TouchableOpacity
              key={`day-${d}`}
              disabled={past}
              onPress={() => {
                hapticLight();
                onSelectDate(formatDateStr(year, month, d));
              }}
              style={[
                styles.calDayCell,
                between && styles.calDayBetween,
                isCheckIn && styles.calDayRangeStart,
                isCheckOut && styles.calDayRangeEnd,
              ]}
            >
              <View style={[
                styles.calDayInner,
                selected && styles.calDaySelected,
                isCheckIn && styles.calDayStartInner,
                isCheckOut && styles.calDayEndInner,
              ]}>
                <Text style={[
                  styles.calDayText,
                  past && styles.calDayPast,
                  selected && styles.calDayTextSelected,
                ]}>
                  {d}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick presets */}
      <View style={styles.calPresets}>
        {['This weekend', 'Next week', 'This month', 'Flexible'].map(preset => (
          <TouchableOpacity key={preset} style={styles.calPreset}>
            <Text style={styles.calPresetText}>{preset}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ──
export default function BookingModalScreen() {
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const [activeCard, setActiveCard] = useState<StepCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guestGroups, setGuestGroups] = useState(GUEST_GROUPS);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const toggleCard = (card: StepCard) => {
    hapticLight();
    setActiveCard(activeCard === card ? null : card);
  };
  const isCardOpen = (card: StepCard) => activeCard === card;

  const handleClear = () => {
    setSearchQuery('');
    setGuestGroups(GUEST_GROUPS);
    setCheckIn(null);
    setCheckOut(null);
    setActiveCard(null);
  };

  const totalGuests = guestGroups.reduce((sum, g) => sum + g.count, 0);
  const updateGuestCount = (index: number, delta: number) => {
    const updated = [...guestGroups];
    updated[index] = { ...updated[index], count: Math.max(0, updated[index].count + delta) };
    setGuestGroups(updated);
  };

  const handleDateSelect = useCallback((dateStr: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      // Start new range
      setCheckIn(dateStr);
      setCheckOut(null);
    } else {
      // Set checkout — if before check-in, swap
      if (dateStr <= checkIn) {
        setCheckOut(checkIn);
        setCheckIn(dateStr);
      } else {
        setCheckOut(dateStr);
      }
    }
  }, [checkIn, checkOut]);

  const handleSearch = () => {
    hapticSuccess();

    // Create a real booking
    addBooking({
      type: 'experience',
      icon: 'compass-outline',
      iconFamily: 'Ionicons',
      color: RIHLA.primary,
      title: searchQuery || 'Algeria Experience',
      subtitle: checkIn
        ? `${checkIn}${checkOut ? ` → ${checkOut}` : ''} · ${totalGuests || 1} guest${totalGuests > 1 ? 's' : ''}`
        : `${totalGuests || 1} guest${totalGuests > 1 ? 's' : ''}`,
      price: 0,
      businessId: 'booking-modal',
      details: {
        destination: searchQuery || 'Flexible',
        check_in: checkIn || 'TBD',
        check_out: checkOut || 'TBD',
        guests: totalGuests || 1,
        adults: guestGroups[0].count || 1,
        children: guestGroups[1].count || 0,
        infants: guestGroups[2].count || 0,
        pets: guestGroups[3].count || 0,
      },
    });

    // Navigate to trips
    router.replace('/(tabs)/trips');
  };

  const wherePreview = searchQuery || 'Search destinations';
  const whenPreview = checkIn
    ? `${checkIn}${checkOut ? ` → ${checkOut}` : ''}`
    : 'Select dates';
  const whoPreview = totalGuests > 0
    ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`
    : 'Add guests';

  return (
    <View style={styles.root}>
      {/* Uber-style dark header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerInner}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Book Your Trip</Text>
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── WHERE ── */}
        <AnimatedCard
          stepNumber={1}
          label="Where"
          value={wherePreview}
          isOpen={isCardOpen('where')}
          onToggle={() => toggleCard('where')}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, wilayas..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </Pressable>
            )}
          </View>
          <Text style={styles.popularLabel}>Popular destinations</Text>
          <View style={styles.popularGrid}>
            {[
              { name: 'Algiers', icon: '🏛️' },
              { name: 'Oran', icon: '🌊' },
              { name: 'Constantine', icon: '🏰' },
              { name: 'Taghit', icon: '🏜️' },
              { name: 'Tizi Ouzou', icon: '⛰️' },
              { name: 'Ghardaia', icon: '🕌' },
            ].map((dest) => (
              <TouchableOpacity
                key={dest.name}
                style={[styles.destChip, searchQuery === dest.name && styles.destChipActive]}
                onPress={() => setSearchQuery(dest.name)}
              >
                <Text style={styles.destEmoji}>{dest.icon}</Text>
                <Text style={[styles.destName, searchQuery === dest.name && { color: RIHLA.primary }]}>
                  {dest.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>

        {/* ── WHEN ── */}
        <AnimatedCard
          stepNumber={2}
          label="When"
          value={whenPreview}
          isOpen={isCardOpen('when')}
          onToggle={() => toggleCard('when')}
        >
          <CalendarPicker
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={handleDateSelect}
          />
        </AnimatedCard>

        {/* ── WHO ── */}
        <AnimatedCard
          stepNumber={3}
          label="Who"
          value={whoPreview}
          isOpen={isCardOpen('who')}
          onToggle={() => toggleCard('who')}
        >
          {guestGroups.map((group, index) => (
            <View
              key={group.name}
              style={[
                styles.guestRow,
                index < guestGroups.length - 1 && styles.guestRowBorder,
              ]}
            >
              <View>
                <Text style={styles.guestName}>{group.name}</Text>
                <Text style={styles.guestDesc}>{group.desc}</Text>
              </View>
              <View style={styles.guestControls}>
                <TouchableOpacity onPress={() => updateGuestCount(index, -1)} style={styles.guestBtn}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={28}
                    color={group.count > 0 ? '#64748B' : '#E2E8F0'}
                  />
                </TouchableOpacity>
                <Text style={styles.guestCount}>{group.count}</Text>
                <TouchableOpacity onPress={() => updateGuestCount(index, 1)} style={styles.guestBtn}>
                  <Ionicons name="add-circle-outline" size={28} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </AnimatedCard>
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.footerClear}>Clear all</Text>
        </TouchableOpacity>
        <UberButton
          title={totalGuests > 0
            ? `Search · ${totalGuests} guest${totalGuests > 1 ? 's' : ''}`
            : 'Search'}
          bgVariant="primary"
          onPress={handleSearch}
          IconRight={() => <Ionicons name="search-outline" size={18} color="#FFFFFF" />}
          style={{ paddingHorizontal: 28 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header (Uber dark solid)
  header: { backgroundColor: '#1a1a1a' },
  headerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontFamily: 'mon-b', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearText: { fontSize: 14, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.7)' },

  scrollContent: { padding: 16, gap: 12 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E2E8F0', overflow: 'hidden',
  },
  cardOpen: {
    borderColor: RIHLA.primary + '40',
    shadowColor: RIHLA.primary, shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  cardPreview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  cardPreviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardBodyWrapper: { overflow: 'hidden' },
  cardBody: { paddingHorizontal: 16, paddingBottom: 20, gap: 14 },

  // Step dot
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  stepDotText: { fontSize: 13, fontFamily: 'mon-b', color: '#64748B' },
  previewLabel: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewValue: { fontSize: 15, fontFamily: 'mon', color: '#0F172A', marginTop: 1 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F1F5F9', borderRadius: 12,
    paddingHorizontal: 14, height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'mon', color: '#0F172A' },
  popularLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#64748B' },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  destChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
  },
  destChipActive: { borderColor: RIHLA.primary, backgroundColor: RIHLA.primary + '08' },
  destEmoji: { fontSize: 16 },
  destName: { fontSize: 13, fontFamily: 'mon-sb', color: '#334155' },

  // Calendar
  calendar: { gap: 12 },
  calHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  calNavBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  calMonthLabel: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  calWeekRow: { flexDirection: 'row' },
  calWeekLabel: {
    flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'mon-sb',
    color: '#94A3B8', paddingVertical: 6,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 2 },
  calDayBetween: { backgroundColor: RIHLA.primary + '08' },
  calDayRangeStart: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  calDayRangeEnd: { borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  calDayInner: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  calDaySelected: { backgroundColor: RIHLA.primary },
  calDayStartInner: { backgroundColor: RIHLA.primary, borderRadius: 17 },
  calDayEndInner: { backgroundColor: RIHLA.primary, borderRadius: 17 },
  calDayText: { fontSize: 14, fontFamily: 'mon', color: '#1E293B' },
  calDayPast: { color: '#CBD5E1' },
  calDayTextSelected: { color: '#FFFFFF', fontFamily: 'mon-b' },
  calPresets: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  calPreset: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  calPresetText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },

  // Guests
  guestRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14,
  },
  guestRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9' },
  guestName: { fontSize: 15, fontFamily: 'mon-sb', color: '#0F172A' },
  guestDesc: { fontSize: 13, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  guestControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guestBtn: { padding: 2 },
  guestCount: { fontSize: 17, fontFamily: 'mon-b', color: '#0F172A', minWidth: 22, textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  footerClear: { fontSize: 15, fontFamily: 'mon-sb', color: '#64748B', textDecorationLine: 'underline' },
});
