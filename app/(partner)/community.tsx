/**
 * RIHLA — Partner Community
 * ─────────────────────────
 * A forum for service partners: post a question, browse by topic, and
 * see who is active near you. Posts persist locally in useCommunityStore
 * so a partner's own contributions survive a restart.
 */

import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  Field,
  type IonName,
  Panel,
  PRO,
  PrimaryButton,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { type CommunityPost, type CommunityTopic, useCommunityStore } from '@/store/useCommunityStore';

const ACCENT = '#f4a261';

const TABS = ['Feed', 'My posts'] as const;
type Tab = (typeof TABS)[number];

const TOPICS: { key: CommunityTopic; label: string; icon: IonName; color: string }[] = [
  { key: 'tips', label: 'Tips', icon: 'bulb-outline', color: '#F59E0B' },
  { key: 'pricing', label: 'Pricing', icon: 'pricetag-outline', color: '#10B981' },
  { key: 'equipment', label: 'Equipment', icon: 'construct-outline', color: '#3B82F6' },
  { key: 'regions', label: 'Regions', icon: 'map-outline', color: '#8B5CF6' },
  { key: 'help', label: 'Help', icon: 'help-circle-outline', color: '#EF4444' },
];

/** Seeded discussions so a new partner lands in an active forum. */
const SEED_POSTS: CommunityPost[] = [
  {
    id: 'seed-c1',
    author: 'Yacine · Jet-ski, Oran',
    topic: 'pricing',
    title: 'What are you charging for jet-ski in July?',
    body: 'I have been at 3,000 DZD for 30 minutes all season but the club next to me went to 3,800 and is still full every weekend. Curious what the rest of the coast is doing before I adjust.',
    replies: 14,
    likes: 27,
    createdAt: '2026-06-12T09:20:00.000Z',
    mine: false,
  },
  {
    id: 'seed-c2',
    author: 'Fatima · Desert guide, Tamanrasset',
    topic: 'tips',
    title: 'Travellers cancel less when you message them the day before',
    body: 'Small thing that made a real difference for me: a short message the evening before with the meeting point and what to bring. My no-show rate went from roughly one in five to almost nothing.',
    replies: 22,
    likes: 61,
    createdAt: '2026-06-10T17:45:00.000Z',
    mine: false,
  },
  {
    id: 'seed-c3',
    author: 'Bilal · Transfers, Algiers',
    topic: 'regions',
    title: 'Airport runs — which terminal pickups actually pay off?',
    body: 'International arrivals are worth the wait, domestic usually is not once you count the parking. Anyone found a pattern that works for early mornings?',
    replies: 9,
    likes: 18,
    createdAt: '2026-06-08T06:15:00.000Z',
    mine: false,
  },
  {
    id: 'seed-c4',
    author: 'Amine · Buggy rental, Ghardaia',
    topic: 'equipment',
    title: 'Sand filters — how often do you actually change them?',
    body: 'Manual says every 40 hours. In the dunes I am changing every 15 or the engine starts losing power. Anyone running a pre-filter that lasts longer?',
    replies: 11,
    likes: 15,
    createdAt: '2026-06-05T14:02:00.000Z',
    mine: false,
  },
  {
    id: 'seed-c5',
    author: 'Nadia · Photography, Tipaza',
    topic: 'help',
    title: 'Payout took 6 days instead of 3 — normal?',
    body: 'First settlement went through fine, second one took almost a week. Support said it was the bank side. Has anyone else seen this with a CCP account?',
    replies: 7,
    likes: 4,
    createdAt: '2026-06-03T11:30:00.000Z',
    mine: false,
  },
];

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.round((Date.now() - then) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function PartnerCommunity() {
  const { user } = useApp();
  const { posts, addPost, toggleLike, removePost, isLiked } = useCommunityStore();
  const [tab, setTab] = useState<Tab>('Feed');
  const [topicFilter, setTopicFilter] = useState<CommunityTopic | 'all'>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState<CommunityTopic>('tips');

  const allPosts = useMemo(() => [...posts, ...SEED_POSTS], [posts]);

  const visible = useMemo(() => {
    const base = tab === 'My posts' ? allPosts.filter((p) => p.mine) : allPosts;
    const filtered = topicFilter === 'all' ? base : base.filter((p) => p.topic === topicFilter);
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, tab, topicFilter]);

  const myPosts = allPosts.filter((p) => p.mine).length;
  const totalReplies = allPosts.reduce((sum, p) => sum + p.replies, 0);

  const handlePost = () => {
    if (!title.trim()) {
      showToast('Give your post a title', 'error');
      return;
    }
    if (body.trim().length < 15) {
      showToast('Add a bit more detail so partners can help', 'error');
      return;
    }
    addPost({
      author: `${user.name || 'You'} · ${user.wilaya || 'RIHLA partner'}`,
      topic,
      title: title.trim(),
      body: body.trim(),
    });
    hapticSuccess();
    showToast('Posted to the community', 'success');
    setTitle('');
    setBody('');
    setTopic('tips');
    setComposerOpen(false);
    setTab('My posts');
  };

  return (
    <ProScreenChrome
      role="partner"
      title="Partner Community"
      subtitle="Forum & local network"
      headerRight={
        <Pressable style={[styles.addBtn, { backgroundColor: ACCENT }]} onPress={() => { hapticLight(); setComposerOpen(true); }}>
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StatGrid>
          <StatCard icon="chatbubbles-outline" label="Discussions" value={String(allPosts.length)} color={ACCENT} />
          <StatCard icon="arrow-undo-outline" label="Replies" value={String(totalReplies)} color={PRO.blue} />
          <StatCard icon="person-outline" label="Your posts" value={String(myPosts)} color={PRO.violet} />
          <StatCard icon="location-outline" label="Your area" value={user.wilaya || '—'} color={PRO.green} />
        </StatGrid>

        <Segmented options={TABS} value={tab} onChange={setTab} color={ACCENT} />

        <View style={styles.chipWrap}>
          <Pressable
            style={[styles.chip, topicFilter === 'all' && { backgroundColor: ACCENT, borderColor: ACCENT }]}
            onPress={() => { hapticLight(); setTopicFilter('all'); }}
          >
            <Text style={[styles.chipText, topicFilter === 'all' && styles.chipTextActive]}>All topics</Text>
          </Pressable>
          {TOPICS.map((t) => {
            const active = topicFilter === t.key;
            return (
              <Pressable
                key={t.key}
                style={[styles.chip, active && { backgroundColor: t.color, borderColor: t.color }]}
                onPress={() => { hapticLight(); setTopicFilter(active ? 'all' : t.key); }}
              >
                <Ionicons name={t.icon} size={13} color={active ? '#FFFFFF' : PRO.muted} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {visible.length === 0 ? (
          <EmptyBlock
            icon="chatbubbles-outline"
            title={tab === 'My posts' ? 'You have not posted yet' : 'Nothing in this topic'}
            subtitle={
              tab === 'My posts'
                ? 'Ask the network something. Partners here run the same kind of business you do.'
                : 'Try another topic, or start the first discussion in this one.'
            }
            actionLabel="Write a post"
            color={ACCENT}
            onAction={() => setComposerOpen(true)}
          />
        ) : (
          <>
            <SectionTitle>{`${visible.length} discussion${visible.length === 1 ? '' : 's'}`}</SectionTitle>
            <View style={styles.rows}>
              {visible.map((post) => {
                const topicDef = TOPICS.find((t) => t.key === post.topic) ?? TOPICS[0];
                const liked = isLiked(post.id);
                return (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHead}>
                      <View style={[styles.topicTag, { backgroundColor: topicDef.color + '15' }]}>
                        <Ionicons name={topicDef.icon} size={11} color={topicDef.color} />
                        <Text style={[styles.topicText, { color: topicDef.color }]}>{topicDef.label}</Text>
                      </View>
                      <Text style={styles.postTime}>{relativeTime(post.createdAt)}</Text>
                      {post.mine ? (
                        <Pressable
                          style={styles.deleteBtn}
                          onPress={() => { hapticLight(); removePost(post.id); showToast('Post removed', 'info'); }}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={14} color={PRO.subtle} />
                        </Pressable>
                      ) : null}
                    </View>

                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postBody}>{post.body}</Text>
                    <Text style={styles.postAuthor}>{post.author}</Text>

                    <View style={styles.postFoot}>
                      <Pressable
                        style={styles.footAction}
                        onPress={() => { hapticLight(); toggleLike(post.id); }}
                      >
                        <Ionicons
                          name={liked ? 'heart' : 'heart-outline'}
                          size={15}
                          color={liked ? PRO.red : PRO.muted}
                        />
                        <Text style={[styles.footText, liked && { color: PRO.red }]}>
                          {post.likes + (liked ? 1 : 0)}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.footAction}
                        onPress={() => { hapticLight(); showToast('Replies open in the next release', 'info'); }}
                      >
                        <Ionicons name="chatbubble-outline" size={15} color={PRO.muted} />
                        <Text style={styles.footText}>{post.replies}</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Panel title="Community guidelines">
          <Guideline text="Share real numbers and real experience — vague advice helps nobody." />
          <Guideline text="No poaching other partners' customers in the forum." />
          <Guideline text="Keep prices as discussion, not coordination. Price fixing is illegal." />
          <Guideline text="Report a problem with RIHLA to support, not here — support can actually fix it." />
        </Panel>
      </ScrollView>

      {/* ── Composer ── */}
      <Modal visible={composerOpen} animationType="slide" transparent onRequestClose={() => setComposerOpen(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>New post</Text>
                <Pressable style={styles.iconBtn} onPress={() => { hapticLight(); setComposerOpen(false); }}>
                  <Ionicons name="close" size={20} color={PRO.muted} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.fieldLabel}>Topic</Text>
                <View style={styles.chipWrap}>
                  {TOPICS.map((t) => {
                    const active = t.key === topic;
                    return (
                      <Pressable
                        key={t.key}
                        style={[styles.chip, active && { backgroundColor: t.color, borderColor: t.color }]}
                        onPress={() => { hapticLight(); setTopic(t.key); }}
                      >
                        <Ionicons name={t.icon} size={13} color={active ? '#FFFFFF' : PRO.muted} />
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Field label="Title" value={title} onChangeText={setTitle} placeholder="What is your question?" icon="chatbox-outline" autoCapitalize="sentences" />
                <Field
                  label="Details"
                  value={body}
                  onChangeText={setBody}
                  placeholder="Give enough context that another partner can actually answer…"
                  multiline
                  hint={`${body.trim().length} characters`}
                />

                <PrimaryButton label="Post to community" icon="send-outline" color={ACCENT} onPress={handlePost} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ProScreenChrome>
  );
}

function Guideline({ text }: { text: string }) {
  return (
    <View style={styles.guidelineRow}>
      <Ionicons name="checkmark-circle-outline" size={14} color={PRO.green} />
      <Text style={styles.guidelineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  rows: { gap: 10 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  chipTextActive: { color: '#FFFFFF' },

  postCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
    gap: 8,
  },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  topicText: { fontSize: 10, fontFamily: 'mon-b' },
  postTime: { flex: 1, fontSize: 11, fontFamily: 'mon', color: PRO.subtle },
  deleteBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  postTitle: { fontSize: 15, fontFamily: 'mon-b', color: PRO.text, lineHeight: 21, letterSpacing: -0.2 },
  postBody: { fontSize: 13, fontFamily: 'mon', color: PRO.muted, lineHeight: 20 },
  postAuthor: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.subtle },
  postFoot: {
    flexDirection: 'row',
    gap: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PRO.borderSoft,
  },
  footAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },

  guidelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  guidelineText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalWrap: { width: '100%' },
  sheet: { backgroundColor: PRO.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: '90%' },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: PRO.border },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  sheetTitle: { fontSize: 17, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.4 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: PRO.sunken },
  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
});
