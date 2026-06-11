/**
 * RIHLA — Date Range Calendar (Booking.com Style)
 * ───────────────────────────────────────────────
 * Month-view calendar with selectable check-in / check-out dates.
 * Shows price per night below each date. Highlights selected range.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';

interface DateRangeCalendarProps {
  /** Price to show under each day (optional) */
  pricePerNight?: number;
  /** Minimum nights */
  minNights?: number;
  /** Maximum nights */
  maxNights?: number;
  /** Called when range is selected */
  onRangeChange?: (checkIn: Date | null, checkOut: Date | null, nights: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateBetween(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

export default function DateRangeCalendar({
  pricePerNight,
  minNights = 1,
  maxNights = 30,
  onRangeChange,
}: DateRangeCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDay = useMemo(() => getFirstDayOfWeek(currentYear, currentMonth), [currentYear, currentMonth]);

  const goNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  const goPrev = () => {
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    if (prevDate < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const canGoPrev = currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  const handleDayPress = (day: number) => {
    const pressed = new Date(currentYear, currentMonth, day);
    pressed.setHours(0, 0, 0, 0);

    if (pressed < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(pressed);
      setCheckOut(null);
      onRangeChange?.(pressed, null, 0);
    } else {
      // Complete the range
      if (pressed <= checkIn) {
        setCheckIn(pressed);
        setCheckOut(null);
        onRangeChange?.(pressed, null, 0);
        return;
      }
      const nights = Math.round((pressed.getTime() - checkIn.getTime()) / 86400000);
      if (nights > maxNights) return;
      if (nights < minNights) return;
      setCheckOut(pressed);
      onRangeChange?.(checkIn, pressed, nights);
    }
  };

  const renderDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isCheckIn = checkIn && isSameDay(date, checkIn);
    const isCheckOut = checkOut && isSameDay(date, checkOut);
    const isInRange = checkIn && checkOut && isDateBetween(date, checkIn, checkOut);
    const isToday = isSameDay(date, today);

    return (
      <TouchableOpacity
        key={day}
        activeOpacity={isPast ? 1 : 0.6}
        onPress={() => handleDayPress(day)}
        style={[
          styles.dayCell,
          isCheckIn && styles.dayCheckIn,
          isCheckOut && styles.dayCheckOut,
          isInRange && styles.dayInRange,
          isPast && styles.dayPast,
        ]}
        disabled={isPast}
      >
        <Text style={[
          styles.dayNumber,
          (isCheckIn || isCheckOut) && styles.dayNumberActive,
          isPast && styles.dayNumberPast,
        ]}>
          {day}
        </Text>
        {pricePerNight && !isPast && (
          <Text style={[
            styles.dayPrice,
            (isCheckIn || isCheckOut) && styles.dayPriceActive,
          ]}>
            {(pricePerNight / 1000).toFixed(0)}k
          </Text>
        )}
        {isToday && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrev} disabled={!canGoPrev} style={[styles.navBtn, !canGoPrev && { opacity: 0.3 }]}>
          <Ionicons name="chevron-back" size={20} color={RIHLA.dark} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
        <TouchableOpacity onPress={goNext} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={RIHLA.dark} />
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((d) => (
          <Text key={d} style={styles.dayName}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((day, i) => (
          <View key={i} style={styles.dayWrap}>
            {day ? renderDay(day) : <View style={styles.dayEmpty} />}
          </View>
        ))}
      </View>

      {/* Selection summary */}
      {checkIn && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Ionicons name="log-in-outline" size={16} color="#10B981" />
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>
              {checkIn.getDate()} {MONTH_NAMES[checkIn.getMonth()].slice(0, 3)}
            </Text>
          </View>
          {checkOut && (
            <>
              <Ionicons name="arrow-forward" size={14} color="#CBD5E1" />
              <View style={styles.summaryItem}>
                <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                <Text style={styles.summaryLabel}>Check-out</Text>
                <Text style={styles.summaryValue}>
                  {checkOut.getDate()} {MONTH_NAMES[checkOut.getMonth()].slice(0, 3)}
                </Text>
              </View>
              <View style={styles.summaryNights}>
                <Text style={styles.summaryNightsText}>
                  {Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)} nights
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  dayWrap: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dayEmpty: {},
  dayCheckIn: {
    backgroundColor: '#10B981',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  dayCheckOut: {
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  dayInRange: {
    backgroundColor: '#DCFCE7',
  },
  dayPast: {
    opacity: 0.35,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: 'mon-sb',
    color: '#0F172A',
  },
  dayNumberActive: {
    color: '#FFFFFF',
    fontFamily: 'mon-b',
  },
  dayNumberPast: {
    color: '#CBD5E1',
  },
  dayPrice: {
    fontSize: 8,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  dayPriceActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RIHLA.accent,
    marginTop: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFC',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  summaryNights: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#0a2540',
  },
  summaryNightsText: {
    fontSize: 11,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
});
