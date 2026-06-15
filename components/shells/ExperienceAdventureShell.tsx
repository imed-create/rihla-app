/**
 * RIHLA — Shell 4: Experience & Outdoor Adventure
 * Safety requirements, participant metrics, intensity ratings.
 * Categories: activity, event, experience
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing, ActivityMetadata, EventMetadata, ExperienceMetadata } from '@/types/service';

type Props = { listing: Listing };

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: RIHLA.online, moderate: RIHLA.busy, challenging: '#FF6B35', extreme: RIHLA.error,
};

export default function ExperienceAdventureShell({ listing }: Props) {
  const { colors } = useTheme();
  const m = listing.metadata;
  const [participants, setParticipants] = useState(1);

  if (m.kind === 'activity') {
    const meta = m as ActivityMetadata;
    const diffColor = DIFFICULTY_COLORS[meta.difficulty] ?? colors.muted;
    return (
      <View style={styles.container}>
        <View style={styles.difficultyBar}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '18', borderColor: diffColor + '30' }]}>
            <Ionicons name="speedometer-outline" size={14} color={diffColor} />
            <Text style={[styles.diffText, { color: diffColor }]}>{meta.difficulty}</Text>
          </View>
          <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={14} color={RIHLA.accent} />
            <Text style={[styles.infoChipText, { color: colors.text }]}>{meta.session_duration_minutes} min</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Safety Info</Text>
          <View style={styles.row}>
            <Ionicons name="people-outline" size={16} color={RIHLA.accent} />
            <Text style={[styles.rowLabel, { color: colors.muted }]}>Max Participants</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{meta.max_participants}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="construct-outline" size={16} color={RIHLA.accent} />
            <Text style={[styles.rowLabel, { color: colors.muted }]}>Equipment</Text>
            <Text style={[styles.rowValue, { color: meta.equipment_included ? RIHLA.online : RIHLA.busy }]}>
              {meta.equipment_included ? 'Included' : 'Bring your own'}
            </Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="walk-outline" size={16} color={RIHLA.accent} />
            <Text style={[styles.rowLabel, { color: colors.muted }]}>Walk-in</Text>
            <Text style={[styles.rowValue, { color: meta.walkin_allowed ? RIHLA.online : colors.muted }]}>
              {meta.walkin_allowed ? 'Allowed' : 'Booking required'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Participants</Text>
          <View style={styles.control}>
            <Pressable style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setParticipants(Math.max(1, participants - 1))}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={[styles.partValue, { color: colors.text }]}>{participants}</Text>
            <Pressable style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setParticipants(Math.min(meta.max_participants, participants + 1))}>
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>Per person</Text>
          <Text style={styles.priceValue}>{listing.price_dzd.toLocaleString()} DA</Text>
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total ({participants})</Text>
            <Text style={styles.totalValue}>{(listing.price_dzd * participants).toLocaleString()} DA</Text>
          </View>
        </View>
      </View>
    );
  }

  if (m.kind === 'event') {
    const meta = m as EventMetadata;
    return (
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Event Details</Text>
          {[
            { icon: 'calendar-outline', label: 'Date', value: meta.event_date },
            { icon: 'time-outline', label: 'Time', value: `${meta.start_time} – ${meta.end_time}` },
            { icon: 'location-outline', label: 'Venue', value: meta.venue },
            { icon: 'people-outline', label: 'Capacity', value: `${meta.total_capacity}` },
          ].map((item) => (
            <View key={item.label} style={styles.row}>
              <Ionicons name={item.icon as any} size={16} color={RIHLA.accent} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
          {meta.age_restriction && (
            <View style={styles.row}>
              <Ionicons name="warning-outline" size={16} color={RIHLA.busy} />
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Age</Text>
              <Text style={[styles.rowValue, { color: RIHLA.busy }]}>{meta.age_restriction}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tickets</Text>
          {meta.ticket_types.map((ticket, i) => (
            <Pressable key={i} style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ticketName, { color: colors.text }]}>{ticket.name}</Text>
                <Text style={[styles.ticketAvail, { color: colors.muted }]}>{ticket.quantity} available</Text>
              </View>
              <Text style={styles.ticketPrice}>{ticket.price_dzd.toLocaleString()} DA</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const meta = m as ExperienceMetadata;
  const diffColor = DIFFICULTY_COLORS[meta.difficulty] ?? colors.muted;
  return (
    <View style={styles.container}>
      <View style={styles.difficultyBar}>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + '18', borderColor: diffColor + '30' }]}>
          <Ionicons name="speedometer-outline" size={14} color={diffColor} />
          <Text style={[styles.diffText, { color: diffColor }]}>{meta.difficulty}</Text>
        </View>
        <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="calendar-outline" size={14} color={RIHLA.accent} />
          <Text style={[styles.infoChipText, { color: colors.text }]}>{meta.duration_days} days</Text>
        </View>
        <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="people-outline" size={14} color={RIHLA.accent} />
          <Text style={[styles.infoChipText, { color: colors.text }]}>Max {meta.max_group_size}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>What's Included</Text>
        {meta.inclusions.map((item) => (
          <View key={item} style={styles.ieRow}>
            <Ionicons name="checkmark-circle" size={16} color={RIHLA.online} />
            <Text style={[styles.ieText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
        {meta.exclusions.length > 0 && (
          <>
            <Text style={[styles.cardTitle, { color: colors.text, marginTop: 12 }]}>Not Included</Text>
            {meta.exclusions.map((item) => (
              <View key={item} style={styles.ieRow}>
                <Ionicons name="close-circle" size={16} color={RIHLA.error} />
                <Text style={[styles.ieText, { color: colors.muted }]}>{item}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Departure Dates</Text>
        <View style={styles.dateChipRow}>
          {meta.departure_dates.map((d) => (
            <View key={d} style={[styles.dateChip, { backgroundColor: colors.card, borderColor: RIHLA.accent + '20' }]}>
              <Text style={styles.dateChipText}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.priceLabel, { color: colors.muted }]}>Per person</Text>
        <Text style={styles.priceValue}>{(meta.price_per_person_dzd || listing.price_dzd).toLocaleString()} DA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },

  difficultyBar: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  diffBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  diffText: { fontSize: 13, fontFamily: 'mon-b' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  infoChipText: { fontSize: 13, fontFamily: 'mon-sb' },

  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: 'mon' },
  rowValue: { fontSize: 13, fontFamily: 'mon-sb' },

  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  btn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  partValue: { fontSize: 24, fontFamily: 'mon-b', minWidth: 40, textAlign: 'center' },

  ticketCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  ticketName: { fontSize: 14, fontFamily: 'mon-b' },
  ticketAvail: { fontSize: 11, fontFamily: 'mon', marginTop: 2 },
  ticketPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.accent },

  ieRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  ieText: { fontSize: 13, fontFamily: 'mon' },

  dateChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateChip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  dateChipText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  priceLabel: { fontSize: 13, fontFamily: 'mon' },
  priceValue: { fontSize: 20, fontFamily: 'mon-b', color: RIHLA.accent },

  totalRow: { borderTopWidth: 1, paddingTop: 8, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 15, fontFamily: 'mon-b' },
  totalValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.accent },
});
