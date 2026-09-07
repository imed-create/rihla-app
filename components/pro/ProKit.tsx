/**
 * RIHLA — Pro Screen Kit
 * ──────────────────────
 * Shared primitives for the business & partner workspace screens.
 * Encodes the RIHLA pro surface language in one place:
 *   · crisp white surfaces framed by a 1px #E2E8F0 perimeter
 *   · radius 18 for layout blocks, 12–14 for internal components
 *   · Montserrat token hierarchy (mon / mon-sb / mon-b)
 *   · every pressable fires a light haptic click
 */

import type { ComponentProps } from 'react';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticLight, hapticSelection } from '@/utils/haptics';

export type IonName = ComponentProps<typeof Ionicons>['name'];

/** Pro workspace surface palette (light — matches the existing business/partner screens). */
export const PRO = {
  surface: '#FFFFFF',
  canvas: '#fafbfc',
  sunken: '#F1F5F9',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  navy: '#0a2540',
  teal: '#00a896',
  gold: '#f4a261',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  violet: '#8B5CF6',
} as const;

/* ────────────────────────────── Text ────────────────────────────── */

export function SectionTitle({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

/* ────────────────────────────── Panel ────────────────────────────── */

export function Panel({
  title,
  badge,
  accent,
  children,
  style,
}: {
  title?: string;
  badge?: string;
  accent?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.panel, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null, style]}>
      {title ? (
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{title}</Text>
          {badge ? <Pill label={badge} /> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Pill({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.pill, color ? { backgroundColor: color + '15' } : null]}>
      <Text style={[styles.pillText, color ? { color } : null]}>{label}</Text>
    </View>
  );
}

export function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.statusPill, { backgroundColor: color + '15' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

/* ────────────────────────────── Stats ────────────────────────────── */

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function StatCard({
  icon,
  label,
  value,
  color,
  hint,
}: {
  icon: IonName;
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

/** Wide hero metric — the high-impact span card in a bento layout. */
export function HeroStat({
  label,
  value,
  caption,
  color,
  icon,
  children,
}: {
  label: string;
  value: string;
  caption?: string;
  color: string;
  icon?: IonName;
  children?: React.ReactNode;
}) {
  return (
    <View style={[styles.hero, { borderLeftWidth: 3, borderLeftColor: color }]}>
      <View style={styles.heroHead}>
        <Text style={styles.heroLabel}>{label}</Text>
        {icon ? (
          <View style={[styles.heroIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
        ) : null}
      </View>
      <Text style={styles.heroValue}>{value}</Text>
      {caption ? <Text style={styles.muted}>{caption}</Text> : null}
      {children}
    </View>
  );
}

export function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={[styles.barTrack, { height, borderRadius: height / 2 }]}>
      <View style={[styles.barFill, { width: `${clamped}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

/* ────────────────────────────── Rows ────────────────────────────── */

export function ListRow({
  icon,
  iconColor = PRO.navy,
  title,
  subtitle,
  right,
  onPress,
  showChevron = true,
}: {
  icon?: IonName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const body = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {right}
      {onPress && showChevron ? <Ionicons name="chevron-forward" size={18} color={PRO.subtle} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => { hapticLight(); onPress(); }}
    >
      {body}
    </Pressable>
  );
}

/* ────────────────────────────── Controls ────────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  color = PRO.navy,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  color?: string;
}) {
  return (
    <View style={styles.segRow}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            style={[styles.segPill, active && { backgroundColor: color }]}
            onPress={() => { hapticSelection(); onChange(opt); }}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PrimaryButton({
  label,
  icon,
  color = PRO.navy,
  onPress,
  disabled,
}: {
  label: string;
  icon?: IonName;
  color?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: disabled ? PRO.subtle : color },
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      onPress={() => { hapticLight(); onPress(); }}
    >
      {icon ? <Ionicons name={icon} size={16} color="#FFFFFF" /> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  icon,
  color = PRO.navy,
  onPress,
}: {
  label: string;
  icon?: IonName;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
      onPress={() => { hapticLight(); onPress(); }}
    >
      {icon ? <Ionicons name={icon} size={16} color={color} /> : null}
      <Text style={[styles.ghostBtnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

/* ────────────────────────────── Form ────────────────────────────── */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  multiline = false,
  autoCapitalize = 'sentences',
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: IonName;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hint?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, focused && styles.fieldBoxFocused, multiline && styles.fieldBoxMultiline]}>
        {icon ? <Ionicons name={icon} size={17} color={focused ? PRO.navy : PRO.subtle} /> : null}
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PRO.subtle}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function Toggle({
  label,
  description,
  value,
  onValueChange,
  color = PRO.navy,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  color?: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleBody}>
        <Text style={styles.rowTitle}>{label}</Text>
        {description ? <Text style={styles.rowSubtitle}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={(next) => { hapticSelection(); onValueChange(next); }}
        trackColor={{ false: PRO.sunken, true: color + '70' }}
        thumbColor={value ? color : '#FFFFFF'}
      />
    </View>
  );
}

/* ────────────────────────────── States ────────────────────────────── */

export function EmptyBlock({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  color = PRO.navy,
}: {
  icon: IonName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon} size={30} color={color} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.emptyAction}>
          <PrimaryButton label={actionLabel} color={color} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

/* ────────────────────────────── Styles ────────────────────────────── */

const styles = StyleSheet.create({
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.3 },
  muted: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17 },

  panel: {
    backgroundColor: PRO.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRO.border,
    padding: 16,
    gap: 10,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },

  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: PRO.sunken },
  pillText: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.muted },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: 'mon-sb' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: PRO.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    padding: 14,
    gap: 8,
  },
  statIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 21, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: PRO.muted },
  statHint: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.subtle },

  hero: {
    backgroundColor: PRO.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRO.border,
    padding: 16,
    gap: 6,
  },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heroValue: { fontSize: 28, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.8 },

  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
  metricLabel: { fontSize: 13, fontFamily: 'mon', color: PRO.muted },
  metricValue: { fontSize: 13, fontFamily: 'mon-b', color: PRO.text },

  barTrack: { width: '100%', backgroundColor: PRO.sunken, overflow: 'hidden' },
  barFill: { height: '100%' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: PRO.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRO.border,
  },
  rowPressed: { backgroundColor: PRO.canvas },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, fontFamily: 'mon-sb', color: PRO.text },
  rowSubtitle: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 16 },

  segRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: PRO.sunken },
  segText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  segTextActive: { color: '#FFFFFF' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 14, fontFamily: 'mon-b', color: '#FFFFFF' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  ghostBtnText: { fontSize: 14, fontFamily: 'mon-sb' },
  pressed: { opacity: 0.7 },

  field: { gap: 7 },
  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.canvas,
  },
  fieldBoxFocused: { borderColor: PRO.navy, backgroundColor: PRO.surface },
  fieldBoxMultiline: { height: 96, alignItems: 'flex-start', paddingTop: 13 },
  fieldInput: { flex: 1, fontSize: 14, fontFamily: 'mon', color: PRO.text, padding: 0 },
  fieldInputMultiline: { height: '100%', textAlignVertical: 'top' },
  fieldHint: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  toggleBody: { flex: 1, gap: 2 },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontFamily: 'mon-b', color: PRO.text, textAlign: 'center' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: PRO.muted, textAlign: 'center', lineHeight: 19 },
  emptyAction: { marginTop: 10 },
});
