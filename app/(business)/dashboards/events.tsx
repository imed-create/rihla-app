/**
 * RIHLA — Regional Tours & Mass Events Engine
 * ──────────────────────────────────────────────
 * Tabs: Overview · Event Manager · Gate Check-In
 * Store-backed CRUD: events → useBusinessAssets, check-ins → local.
 * Full edit/delete on all event items.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import type { BusinessAsset } from '@/store/useBusinessAssets';

const E = { brand: '#DC2626', brandLt: '#FEF2F2', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

interface Ticket { id: string; name: string; gate: string; scanned: boolean; }

export default function EventsDashboard() {
  const { assets, addAsset, updateAsset, removeAsset } = useBusinessAssets();
  const [tab, setTab] = useState<'Overview' | 'Event Manager' | 'Gate Check-In'>('Overview');

  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'tk1', name: 'Ahmed B.', gate: 'VIP', scanned: false },
    { id: 'tk2', name: 'Nadia T.', gate: 'General', scanned: false },
    { id: 'tk3', name: 'Malik R.', gate: 'VIP', scanned: true },
    { id: 'tk4', name: 'Fatima Z.', gate: 'General', scanned: true },
    { id: 'tk5', name: 'Yacine M.', gate: 'General', scanned: false },
  ]);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editEvent, setEditEvent] = useState<BusinessAsset | null>(null);
  const [showDeleteEvent, setShowDeleteEvent] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', price: '2000', capacity: '100' });
  const [editPriceVal, setEditPriceVal] = useState('');

  const events = assets.filter(a => a.businessType === 'event' && a.assetKind === 'event');
  const scannedCount = tickets.filter(t => t.scanned).length;

  const handleAddEvent = useCallback(() => {
    if (!newEvent.name) return;
    addAsset({ businessType: 'event' as any, assetKind: 'event', name: newEvent.name, priceDZD: parseInt(newEvent.price) || 2000, available: true, fields: { date: newEvent.date || 'Jun 15', capacity: parseInt(newEvent.capacity) || 100 } });
    setNewEvent({ name: '', date: '', price: '2000', capacity: '100' }); setShowAddEvent(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addAsset, newEvent]);
  const handleEditEvent = useCallback(() => {
    if (!editEvent) return; const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateAsset(editEvent.id, { priceDZD: val });
    setEditEvent(null); setEditPriceVal(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editEvent, editPriceVal, updateAsset]);
  const handleDeleteEvent = useCallback((id: string) => { removeAsset(id); setShowDeleteEvent(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeAsset]);
  const toggleEventActive = useCallback((id: string) => { const ev = events.find(e => e.id === id); if (ev) updateAsset(id, { available: !ev.available }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [events, updateAsset]);
  const scanTicket = useCallback((id: string) => {
    setTickets(p => p.map(t => t.id === id ? { ...t, scanned: true } : t));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: E.brandLt }]}><Text style={[styles.kpiVal, { color: E.brand }]}>{events.length}</Text><Text style={styles.kpiLbl}>Events</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: E.green }]}>{scannedCount}</Text><Text style={styles.kpiLbl}>Checked In</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: E.blue }]}>{tickets.length}</Text><Text style={styles.kpiLbl}>Tickets</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: E.amber }]}>{tickets.filter(t => !t.scanned).length}</Text><Text style={styles.kpiLbl}>Pending</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Event Manager', 'Gate Check-In'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: E.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: E.brandLt }]}>
              <Ionicons name="calendar-outline" size={28} color={E.brand} />
              <Text style={styles.heroTitle}>🎪 Events Overview</Text>
              <Text style={styles.heroSub}>{events.filter(e => e.available).length} published · {tickets.length} total tickets</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Events" value={String(events.length)} color={E.brand} />
                <HeroStat label="Tickets" value={String(tickets.length)} color={E.blue} />
                <HeroStat label="Checked In" value={String(scannedCount)} color={E.green} />
                <HeroStat label="Pending" value={String(tickets.filter(t => !t.scanned).length)} color={E.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="calendar-outline" value={String(events.filter(e => e.available).length)} label="Live" color={E.brand} />
              <QuickStat icon="ticket-outline" value={String(tickets.length)} label="Tickets" color={E.blue} />
              <QuickStat icon="enter-outline" value={String(scannedCount)} label="Entered" color={E.green} />
              <QuickStat icon="flag-outline" value={String(events.filter(e => !e.available).length)} label="Drafts" color={E.amber} />
            </View>
          </>
        )}

        {tab === 'Event Manager' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 Events — {events.length}</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddEvent(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>New Event</Text>
              </Pressable>
            </View>
            {events.map(ev => (
              <View key={ev.id} style={styles.eventCard}>
                <View style={styles.eventTop}>
                  <Text style={styles.eventName}>{ev.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Pressable onPress={() => toggleEventActive(ev.id)}>
                      <View style={[styles.toggle, ev.available && { backgroundColor: E.green }]}><View style={[styles.toggleKnob, ev.available && { alignSelf: 'flex-end' }]} /></View>
                    </Pressable>
                    <Pressable onPress={() => { setEditEvent(ev); setEditPriceVal(String(ev.priceDZD)); }}><Ionicons name="create-outline" size={16} color="#64748B" /></Pressable>
                    <Pressable onPress={() => setShowDeleteEvent(ev.id)}><Ionicons name="trash-outline" size={16} color={E.red} /></Pressable>
                  </View>
                </View>
                <Text style={styles.eventMeta}>{ev.fields?.date || 'TBD'} · Capacity {ev.fields?.capacity || 0}</Text>
                <Text style={styles.eventPrice}>{formatDZD(ev.priceDZD)} / ticket</Text>
                <Text style={[styles.eventStatus, { color: ev.available ? E.green : '#94A3B8' }]}>{ev.available ? '● Published' : '○ Draft'}</Text>
              </View>
            ))}
          </>
        )}

        {tab === 'Gate Check-In' && (
          <>
            <Text style={styles.sectionTitle}>🎫 Gate Terminal — {tickets.length} tickets</Text>
            <View style={styles.gateSummary}>
              <View style={styles.gateStat}><Text style={[styles.gateVal, { color: E.green }]}>{scannedCount}</Text><Text style={styles.gateLbl}>Scanned</Text></View>
              <View style={styles.gateDivider} />
              <View style={styles.gateStat}><Text style={[styles.gateVal, { color: E.amber }]}>{tickets.filter(t => !t.scanned).length}</Text><Text style={styles.gateLbl}>Remaining</Text></View>
              <View style={styles.gateDivider} />
              <View style={styles.gateStat}><Text style={[styles.gateVal, { color: '#059669' }]}>{Math.round(scannedCount / Math.max(tickets.length, 1) * 100)}%</Text><Text style={styles.gateLbl}>Progress</Text></View>
            </View>
            {tickets.map(t => (
              <View key={t.id} style={[styles.ticketCard, { backgroundColor: t.scanned ? '#F0FDF4' : '#fff', borderColor: t.scanned ? '#86EFAC' : '#E5E7EB' }]}>
                <Ionicons name={t.scanned ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={t.scanned ? E.green : '#94A3B8'} />
                <View style={{ flex: 1 }}><Text style={styles.ticketName}>{t.name}</Text><Text style={styles.ticketGate}>Gate: {t.gate}</Text></View>
                {!t.scanned && <Pressable style={styles.scanBtn} onPress={() => scanTicket(t.id)}><Ionicons name="camera-outline" size={16} color="#fff" /><Text style={styles.scanBtnText}>Scan</Text></Pressable>}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddEvent} transparent animationType="fade" onRequestClose={() => setShowAddEvent(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Create Event</Text><TextInput style={styles.input} placeholder="Event name" value={newEvent.name} onChangeText={t => setNewEvent(p => ({ ...p, name: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Date (e.g. Jun 20)" value={newEvent.date} onChangeText={t => setNewEvent(p => ({ ...p, date: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Ticket price (DZD)" value={newEvent.price} onChangeText={t => setNewEvent(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Capacity" value={newEvent.capacity} onChangeText={t => setNewEvent(p => ({ ...p, capacity: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddEvent(false)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: E.brand }]} onPress={handleAddEvent}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Create</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editEvent} transparent animationType="fade" onRequestClose={() => setEditEvent(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Price — {editEvent?.name}</Text><TextInput style={styles.input} placeholder="Price (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditEvent(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: E.brand }]} onPress={handleEditEvent}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteEvent} transparent animationType="fade" onRequestClose={() => setShowDeleteEvent(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Event?</Text><Text style={styles.modalSub}>Permanently remove this event.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteEvent(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: E.red }]} onPress={() => showDeleteEvent && handleDeleteEvent(showDeleteEvent)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
    </View>
  );
}
function HeroStat({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.heroStat}><Text style={[styles.heroStatVal, { color }]}>{value}</Text><Text style={styles.heroStatLbl}>{label}</Text></View>; }
function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) { return <View style={styles.qStat}><Ionicons name={icon as any} size={16} color={color} /><Text style={styles.qVal}>{value}</Text><Text style={styles.qLbl}>{label}</Text></View>; }
const styles = StyleSheet.create({
  root: {}, kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 }, kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabContent: { gap: 8, paddingRight: 8, paddingVertical: 4 }, tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' }, content: { gap: 14, paddingBottom: 48 },
  heroCard: { borderRadius: 20, padding: 20, gap: 8 }, heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10 }, heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 14, fontFamily: 'mon-b' }, heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 }, qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: E.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  eventCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eventName: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  eventMeta: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' }, eventPrice: { fontSize: 14, fontFamily: 'mon-b', color: E.brand },
  eventStatus: { fontSize: 12, fontFamily: 'mon-sb' },
  toggle: { width: 38, height: 20, borderRadius: 10, backgroundColor: '#CBD5E1', padding: 2, justifyContent: 'center' }, toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  gateSummary: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  gateStat: { flex: 1, alignItems: 'center', gap: 2 }, gateVal: { fontSize: 22, fontFamily: 'mon-b' }, gateLbl: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  gateDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },
  ticketCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },
  ticketName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, ticketGate: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: E.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }, scanBtnText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
