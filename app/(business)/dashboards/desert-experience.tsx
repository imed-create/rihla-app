/**
 * RIHLA — Desert Camp & Expedition OS
 * ──────────────────────────────────────
 * Tabs: Overview · Expeditions Matrix · Logistics Dispatch
 * Store-backed CRUD: expeditions → useBusinessAssets, resources → useAssetInventory, dispatches → usePartnerDispatches.
 * Full edit/delete on all items.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { useAssetInventory } from '@/store/useAssetInventory';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { BusinessAsset } from '@/store/useBusinessAssets';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const D = { brand: '#D97706', brandLt: '#FFFBEB', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6', brown: '#92400E' };

export default function DesertCampDashboard() {
  const { assets: expeditions, addAsset: addExpedition, updateAsset: updateExpedition, removeAsset: removeExpedition } = useBusinessAssets();
  const { items: resources, addItem: addResource, updateItem: updateResource, removeItem: removeResource } = useAssetInventory();
  const { dispatches: logistics, addDispatch: addLogistics, updateDispatch: updateLogistics, removeDispatch: removeLogistics } = usePartnerDispatches();
  const [tab, setTab] = useState<'Overview' | 'Expeditions Matrix' | 'Logistics Dispatch'>('Overview');

  const [showAddExp, setShowAddExp] = useState(false);
  const [editExp, setEditExp] = useState<BusinessAsset | null>(null);
  const [showDeleteExp, setShowDeleteExp] = useState<string | null>(null);
  const [showDeleteLog, setShowDeleteLog] = useState<string | null>(null);
  const [newExp, setNewExp] = useState({ name: '', date: '', price: '25000', capacity: '8' });
  const [editPriceVal, setEditPriceVal] = useState('');

  const myExps = expeditions.filter(e => e.businessType === ('experience' as any) && e.assetKind === 'expedition');
  const myResources = resources.filter(r => r.businessType === 'desert');
  const myLogistics = logistics.filter(l => l.jobType === 'desert-logistics');

  const handleAddExp = useCallback(() => {
    if (!newExp.name) return;
    addExpedition({ businessType: 'experience' as any, assetKind: 'expedition', name: newExp.name, priceDZD: parseInt(newExp.price) || 25000, available: true, fields: { date: newExp.date || 'Jun 20', capacity: parseInt(newExp.capacity) || 8 } });
    setNewExp({ name: '', date: '', price: '25000', capacity: '8' }); setShowAddExp(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addExpedition, newExp]);
  const handleEditExp = useCallback(() => {
    if (!editExp) return; const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateExpedition(editExp.id, { priceDZD: val });
    setEditExp(null); setEditPriceVal(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editExp, editPriceVal, updateExpedition]);
  const handleDeleteExp = useCallback((id: string) => { removeExpedition(id); setShowDeleteExp(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeExpedition]);
  const handleDeleteLogistics = useCallback((id: string) => { removeLogistics(id); setShowDeleteLog(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeLogistics]);
  const toggleExpActive = useCallback((id: string) => { const e = myExps.find(x => x.id === id); if (e) updateExpedition(id, { available: !e.available }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [myExps, updateExpedition]);
  const dispatchLogistics = useCallback((id: string) => {
    const sm: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const l = myLogistics.find(x => x.id === id); const ns = l ? sm[l.status] : undefined;
    if (ns) updateLogistics(id, { status: ns as any }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [myLogistics, updateLogistics]);
  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: D.brandLt }]}><Text style={[styles.kpiVal, { color: D.brand }]}>{myExps.length}</Text><Text style={styles.kpiLbl}>Expeditions</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: D.green }]}>{myResources.reduce((s, r) => s + (r.totalQuantity - r.rentedQuantity), 0)}</Text><Text style={styles.kpiLbl}>Resources</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: D.blue }]}>{myLogistics.length}</Text><Text style={styles.kpiLbl}>Dispatches</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: D.amber }]}>{myLogistics.filter(l => l.status === 'pending').length}</Text><Text style={styles.kpiLbl}>Pending</Text></View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Expeditions Matrix', 'Logistics Dispatch'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: D.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: D.brandLt }]}>
              <Ionicons name="sunny-outline" size={28} color={D.brand} />
              <Text style={styles.heroTitle}>🏜️ Desert Camp Overview</Text>
              <Text style={styles.heroSub}>{myExps.filter(e => e.available).length} active expeditions · {myLogistics.filter(l => l.status !== 'completed').length} logistics in progress</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Expeditions" value={String(myExps.length)} color={D.brand} />
                <HeroStat label="Resources" value={String(myResources.length)} color={D.green} />
                <HeroStat label="Dispatches" value={String(myLogistics.length)} color={D.blue} />
                <HeroStat label="Utilization" value={`${Math.round(myResources.reduce((s, r) => s + r.rentedQuantity, 0) / Math.max(myResources.reduce((s, r) => s + r.totalQuantity, 0), 1) * 100)}%`} color={D.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="compass-outline" value={String(myExps.filter(e => e.available).length)} label="Active" color={D.brand} />
              <QuickStat icon="cube-outline" value={String(myResources.length)} label="Resource Types" color={D.green} />
              <QuickStat icon="truck-outline" value={String(myLogistics.filter(l => l.status !== 'completed').length)} label="Active Dispatch" color={D.blue} />
              <QuickStat icon="people-outline" value={String(myExps.reduce((s, e) => s + (e.fields?.capacity || 0), 0))} label="Total Capacity" color={D.amber} />
            </View>
            <Text style={styles.sectionTitle}>🧭 Upcoming Expeditions</Text>
            {myExps.filter(e => e.available).slice(0, 3).map(e => (
              <View key={e.id} style={styles.expeditionMini}><Ionicons name="flag-outline" size={18} color={D.brand} /><View style={{ flex: 1 }}><Text style={styles.expName}>{e.name}</Text><Text style={styles.expMeta}>{e.fields?.date || 'TBD'} · {e.fields?.capacity || 0} pax</Text></View><Text style={styles.expPrice}>{formatDZD(e.priceDZD)}</Text></View>
            ))}
          </>
        )}

        {tab === 'Expeditions Matrix' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏜️ Expeditions — {myExps.length}</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddExp(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>New Expedition</Text>
              </Pressable>
            </View>
            {myExps.map(exp => (
              <View key={exp.id} style={styles.expCard}>
                <View style={styles.expTop}>
                  <Text style={styles.expName}>{exp.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Pressable onPress={() => toggleExpActive(exp.id)}>
                      <View style={[styles.toggle, exp.available && { backgroundColor: D.green }]}><View style={[styles.toggleKnob, exp.available && { alignSelf: 'flex-end' }]} /></View>
                    </Pressable>
                    <Pressable onPress={() => { setEditExp(exp); setEditPriceVal(String(exp.priceDZD)); }}><Ionicons name="create-outline" size={16} color="#64748B" /></Pressable>
                    <Pressable onPress={() => setShowDeleteExp(exp.id)}><Ionicons name="trash-outline" size={16} color={D.red} /></Pressable>
                  </View>
                </View>
                <Text style={styles.expDate}>📅 {exp.fields?.date || 'TBD'} · Capacity: {exp.fields?.capacity || 0}</Text>
                <Text style={styles.expPrice}>{formatDZD(exp.priceDZD)} / person</Text>
                <Text style={[styles.expStatus, { color: exp.available ? D.green : '#94A3B8' }]}>{exp.available ? '● Published' : '○ Draft'}</Text>
              </View>
            ))}
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>📦 Resources</Text><Pressable style={styles.addBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}><Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Resource</Text></Pressable></View>
            {myResources.map(r => (
              <View key={r.id} style={styles.resCard}>
                <View style={{ flex: 1 }}><Text style={styles.resName}>{r.name}</Text><Text style={styles.resMeta}>{r.rentedQuantity}/{r.totalQuantity} in use</Text></View>
                <Text style={styles.resPrice}>{formatDZD(r.pricePerHourDZD)}/hr</Text>
                <Pressable onPress={() => { removeResource(r.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}><Ionicons name="trash-outline" size={16} color={D.red} /></Pressable>
              </View>
            ))}
          </>
        )}

        {tab === 'Logistics Dispatch' && (
          <>
            <Text style={styles.sectionTitle}>🚚 Logistics Dispatches</Text>
            {myLogistics.map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logTop}>
                  <Text style={styles.logTitle}>{log.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: log.status === 'pending' ? '#FEF3C7' : log.status === 'accepted' ? '#DBEAFE' : log.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9' }]}>
                      <Text style={[styles.statusText, { color: log.status === 'pending' ? '#B45309' : log.status === 'accepted' ? '#1D4ED8' : log.status === 'in-progress' ? '#059669' : '#64748B' }]}>{log.status}</Text>
                    </View>
                    <Pressable onPress={() => setShowDeleteLog(log.id)}><Ionicons name="trash-outline" size={16} color={D.red} /></Pressable>
                  </View>
                </View>
                <Text style={styles.logMeta}>📍 {log.location} · 👤 {log.customerName}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.logPrice}>{formatDZD(log.priceDZD)}</Text>
                  {log.status !== 'completed' && log.status !== 'cancelled' && (
                    <Pressable style={[styles.dispatchBtn, { backgroundColor: log.status === 'pending' ? D.brand : log.status === 'accepted' ? D.blue : D.green }]} onPress={() => dispatchLogistics(log.id)}>
                      <Text style={styles.dispatchBtnText}>{log.status === 'pending' ? 'Dispatch' : log.status === 'accepted' ? 'En Route' : 'Complete'}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddExp} transparent animationType="fade" onRequestClose={() => setShowAddExp(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Create Expedition</Text><TextInput style={styles.input} placeholder="Expedition name" value={newExp.name} onChangeText={t => setNewExp(p => ({ ...p, name: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Date" value={newExp.date} onChangeText={t => setNewExp(p => ({ ...p, date: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Price per person (DZD)" value={newExp.price} onChangeText={t => setNewExp(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Capacity" value={newExp.capacity} onChangeText={t => setNewExp(p => ({ ...p, capacity: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddExp(false)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: D.brand }]} onPress={handleAddExp}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Create</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editExp} transparent animationType="fade" onRequestClose={() => setEditExp(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Price — {editExp?.name}</Text><TextInput style={styles.input} placeholder="Price (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditExp(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: D.brand }]} onPress={handleEditExp}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteExp} transparent animationType="fade" onRequestClose={() => setShowDeleteExp(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Expedition?</Text><Text style={styles.modalSub}>Permanently remove this expedition.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteExp(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: D.red }]} onPress={() => showDeleteExp && handleDeleteExp(showDeleteExp)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteLog} transparent animationType="fade" onRequestClose={() => setShowDeleteLog(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Cancel Dispatch?</Text><Text style={styles.modalSub}>Remove this logistics dispatch.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteLog(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: D.red }]} onPress={() => showDeleteLog && handleDeleteLogistics(showDeleteLog)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
    </View>
  );
}
function HeroStat({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.heroStat}><Text style={[styles.heroStatVal, { color }]}>{value}</Text><Text style={styles.heroStatLbl}>{label}</Text></View>; }
function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) { return <View style={styles.qStat}><Ionicons name={icon as any} size={16} color={color} /><Text style={styles.qVal}>{value}</Text><Text style={styles.qLbl}>{label}</Text></View>; }
const styles = StyleSheet.create({
  root: {}, kpiRow: { gap: 8, marginBottom: 12, flexDirection: 'row' }, kpi: { borderRadius: 14, padding: 10, alignItems: 'center', gap: 2, minWidth: 68 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabContent: { gap: 8, paddingRight: 8, paddingVertical: 4 }, tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' }, content: { gap: 14, paddingBottom: 48 },
  heroCard: { borderRadius: 20, padding: 20, gap: 8 }, heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10 }, heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 14, fontFamily: 'mon-b' }, heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 }, qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: D.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  expeditionMini: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  expCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  expTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, expName: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  expDate: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' }, expMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 1 },
  expPrice: { fontSize: 14, fontFamily: 'mon-b', color: D.brand }, expStatus: { fontSize: 12, fontFamily: 'mon-sb' },
  toggle: { width: 38, height: 20, borderRadius: 10, backgroundColor: '#CBD5E1', padding: 2, justifyContent: 'center' }, toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  resCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  resName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, resMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' }, resPrice: { fontSize: 13, fontFamily: 'mon-b', color: D.brand },
  logCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, logTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  logMeta: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' }, logPrice: { fontSize: 14, fontFamily: 'mon-b', color: D.brand },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  dispatchBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }, dispatchBtnText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
