/**
 * RIHLA — Help Center
 * ───────────────────
 * Shared support surface for the business and partner workspaces.
 * Searchable FAQ with expandable answers, quick guides and contact channels.
 * Each role passes its own topics — the shell and behaviour stay identical.
 */

import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  Field,
  type IonName,
  ListRow,
  Panel,
  PRO,
  SectionTitle,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import type { ProRole } from '@/constants/proNavigation';
import { hapticLight } from '@/utils/haptics';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  topic: string;
};

export type GuideItem = {
  id: string;
  title: string;
  description: string;
  icon: IonName;
  color: string;
  minutes: number;
};

const SUPPORT_EMAIL = 'support@rihla.dz';
const SUPPORT_PHONE = '+213770000000';

export default function HelpCenter({
  role,
  accent,
  faqs,
  guides,
}: {
  role: ProRole;
  accent: string;
  faqs: FaqItem[];
  guides: GuideItem[];
}) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('All');

  const topics = useMemo(() => ['All', ...new Set(faqs.map((f) => f.topic))], [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (topic !== 'All' && f.topic !== topic) return false;
      if (!q) return true;
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [faqs, query, topic]);

  const openMail = () => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=RIHLA ${role} support`).catch(() =>
      showToast('No email app available on this device', 'error')
    );
  };

  const openPhone = () => {
    void Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() =>
      showToast('Cannot start a call on this device', 'error')
    );
  };

  return (
    <ProScreenChrome
      role={role}
      title={role === 'business' ? 'Help Center' : 'Help & Support'}
      subtitle="Guides, FAQ & support"
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field
          label="Search help"
          value={query}
          onChangeText={setQuery}
          placeholder="Payouts, verification, cancellations…"
          icon="search-outline"
          autoCapitalize="none"
        />

        {/* ── Contact ── */}
        <View style={styles.contactRow}>
          <Pressable style={[styles.contactCard, { borderColor: accent + '35' }]} onPress={() => { hapticLight(); openMail(); }}>
            <View style={[styles.contactIcon, { backgroundColor: accent + '15' }]}>
              <Ionicons name="mail-outline" size={19} color={accent} />
            </View>
            <Text style={styles.contactLabel}>Email us</Text>
            <Text style={styles.contactHint}>Replies within 24h</Text>
          </Pressable>
          <Pressable style={[styles.contactCard, { borderColor: accent + '35' }]} onPress={() => { hapticLight(); openPhone(); }}>
            <View style={[styles.contactIcon, { backgroundColor: accent + '15' }]}>
              <Ionicons name="call-outline" size={19} color={accent} />
            </View>
            <Text style={styles.contactLabel}>Call support</Text>
            <Text style={styles.contactHint}>Sun–Thu, 9:00–17:00</Text>
          </Pressable>
        </View>

        {/* ── Guides ── */}
        {guides.length > 0 && (
          <>
            <SectionTitle>Quick guides</SectionTitle>
            <View style={styles.rows}>
              {guides.map((g) => (
                <ListRow
                  key={g.id}
                  icon={g.icon}
                  iconColor={g.color}
                  title={g.title}
                  subtitle={`${g.description} · ${g.minutes} min read`}
                  onPress={() => showToast(`Opening “${g.title}”`, 'info')}
                />
              ))}
            </View>
          </>
        )}

        {/* ── FAQ ── */}
        <SectionTitle>Frequently asked</SectionTitle>
        <View style={styles.chipWrap}>
          {topics.map((t) => {
            const active = t === topic;
            return (
              <Pressable
                key={t}
                style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
                onPress={() => { hapticLight(); setTopic(t); }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {filtered.length === 0 ? (
          <EmptyBlock
            icon="help-buoy-outline"
            title="Nothing matched"
            subtitle={`We couldn't find an answer for “${query}”. Send us a message and a human will get back to you.`}
            actionLabel="Email support"
            color={accent}
            onAction={openMail}
          />
        ) : (
          <View style={styles.rows}>
            {filtered.map((f) => {
              const open = openId === f.id;
              return (
                <Pressable
                  key={f.id}
                  style={[styles.faqCard, open && { borderColor: accent + '45' }]}
                  onPress={() => { hapticLight(); setOpenId(open ? null : f.id); }}
                >
                  <View style={styles.faqHead}>
                    <Text style={styles.faqQuestion}>{f.question}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={17}
                      color={open ? accent : PRO.subtle}
                    />
                  </View>
                  {open ? <Text style={styles.faqAnswer}>{f.answer}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Still stuck ── */}
        <Panel title="Still need help?" accent={accent}>
          <Text style={styles.note}>
            Our {role === 'business' ? 'business' : 'partner'} team is based in Algiers and answers in Arabic,
            French and English.
          </Text>
          <ListRow
            icon="mail-outline"
            iconColor={accent}
            title={SUPPORT_EMAIL}
            subtitle="Best for document and payout questions"
            onPress={openMail}
          />
          <ListRow
            icon="logo-whatsapp"
            iconColor="#25D366"
            title="WhatsApp support"
            subtitle="Fastest for urgent booking issues"
            onPress={() => {
              void Linking.openURL(`https://wa.me/${SUPPORT_PHONE.replace('+', '')}`).catch(() =>
                showToast('WhatsApp is not installed', 'error')
              );
            }}
          />
        </Panel>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  rows: { gap: 10 },

  contactRow: { flexDirection: 'row', gap: 12 },
  contactCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: PRO.surface,
    gap: 6,
  },
  contactIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  contactHint: { fontSize: 11, fontFamily: 'mon', color: PRO.muted },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  chipTextActive: { color: '#FFFFFF' },

  faqCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
    gap: 10,
  },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQuestion: { flex: 1, fontSize: 14, fontFamily: 'mon-sb', color: PRO.text, lineHeight: 20 },
  faqAnswer: { fontSize: 13, fontFamily: 'mon', color: PRO.muted, lineHeight: 20 },
});
