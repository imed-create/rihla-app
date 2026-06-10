/**
 * RIHLA — Water Sports Fleet Management
 * ─────────────────────────────────────────
 * Tabs: Overview · Fleet Matrix · Safety Lockout
 * Store-backed CRUD: fleet → useAssetInventory, safety logs → local.
 * Full edit/delete on all fleet items with persisted storage.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAssetInventory } from '@/store/useAssetInventory';
import type { InventoryItem } from '@/store/useAssetInventory';

const W = { brand: '#0284C7', brandLt: '#E0F2FE', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

interface RentalClock { id: string; name: string; customer: string; startTime: string; duration: number; ratePerHr: number; }

export default function WaterSportsDashboard() {
  const { items: fleet, addItem: addFleet, updateItem: updateFleet, removeItem: removeFleet, rentItem, returnItem } = useAssetInventory();
  const [tab, setTab] = useState<'Overview' | 'Fleet Matrix' | 'Safety Lockout'>('Overview');

  const [showAddFleet, setShowAddFleet] = useState(false);
  const [editFleet, setEditFleet] = useState<InventoryItem | null>(null);
  const [showDeleteFleet, setShowDeleteFleet] = useState<string | null>(null);
  const [newFleetName, setNewFleetName] = useState('');
  const [newFleetQty, setNewFleetQty] = useState('1');
  const [newFleetPrice, setNewFleetPrice] = useState('');
  const [editPriceVal, setEditPriceVal] = useState('');

  const [seaState, setSeaState] = useState<'safe' | 'caution' | 'closed'>('safe');
  const [safetyLogs, setSafetyLogs] = useState<{ id: string; msg: string; time: string; type: 'info' | 'warning' | 'critical' }[]>([
    { id: 'sl1', msg: 'Daily equipment inspection passed', time: '08:30', type: 'info' },
    { id: 'sl2', msg: 'Jet-ski JS-03 fuel low — flagged', time: '10:15', type: 'warning' },
  ]);

  const myFleet = fleet.filter(f => f.businessType === 'water-sports');
  const [activeRentals] = useState<RentalClock[]>([
    { id: 'r1', name: 'Jet Ski JS-01', customer: 'Alex M.', startTime: '10:30', duration: 60, ratePerHr: 5000 },
    { id: 'r2', name: 'Parasail Gear', customer: 'Nadia K.', startTime: '11:00', duration: 45, ratePerHr: 8000 },
  ]);

  const addLog = useCallback((msg: string, type: 'info' | 'warning' | 'critical') => {
    setSafetyLogs(p => [{ id: 'sl'+Date.now(), msg, time: new Date().toLocaleTimeString().slice(0,5), type }, ...p]);
  }, []);

  const handleAddFleet = useCallback(() => {
    if (!newFleetName) return;
    addFleet({ businessType: 'water-sports', category: 'water', name: newFleetName, totalQuantity: parseInt(newFleetQty) || 1, rentedQuantity: 0, pricePerHourDZD: parseInt(newFleetPrice) || 5000, depositDZD: parseInt(newFleetPrice) || 5000, status: 'available' });
    setNewFleetName(''); setNewFleetQty('1'); setNewFleetPrice(''); setShowAddFleet(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addFleet, newFleetName, newFleetQty, newFleetPrice]);

  const handleEditFleet = useCallback(() => {
    if (!editFleet) return;
    const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateFleet(editFleet.id, { pricePerHourDZD: val });
    setEditFleet(null); setEditPriceVal('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editFleet, editPriceVal, updateFleet]);

  const handleDeleteFleet = useCallback((id: string) => { removeFleet(id); setShowDeleteFleet(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeFleet]);

  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: W.brandLt }]}><Text style={[styles.kpiVal, { color: W.brand }]}>{myFleet.reduce((s, f) => s + (f.totalQuantity - f.rentedQuantity), 0)}</Text><Text style={styles.kpiLbl}>Available</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: W.green }]}>{myFleet.reduce((s, f) => s + f.rentedQuantity, 0)}</Text><Text style={styles.kpiLbl}>Rented</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: W.blue }]}>{myFleet.length}</Text><Text style={styles.kpiLbl}>Assets</Text></View>
        <View style={[styles.kpi, { backgroundColor: seaState === 'safe' ? '#F0FDF4' : seaState === 'caution' ? '#FFFBEB' : '#FEF2F2' }]}><Text style={[styles.kpiVal, { color: seaState === 'safe' ? W.green : seaState === 'caution' ? W.amber : W.red }]}>{seaState}</Text><Text style={styles.kpiLbl}>Sea State</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Fleet Matrix', 'Safety Lockout'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: W.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: W.brandLt }]}>
              <Ionicons name="boat-outline" size={28} color={W.brand} />
              <Text style={styles.heroTitle}>🛥️ Fleet Operational Overview</Text>
              <Text style={styles.heroSub}>{activeRentals.length} active rentals · {seaState === 'safe' ? '✅ All clear' : seaState === 'caution' ? '⚠️ Caution advised' : '🚫 Beach closed'}</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Utilization" value={`${Math.round(myFleet.reduce((s, f) => s + f.rentedQuantity, 0) / Math.max(myFleet.reduce((s, f) => s + f.totalQuantity, 0), 1) * 100)}%`} color={W.brand} />
                <HeroStat label="Active Rentals" value={String(activeRentals.length)} color={W.green} />
                <HeroStat label="Safety Logs" value={String(safetyLogs.filter(l => l.type === 'critical').length)} color={W.red} />
                <HeroStat label="Sea State" value={seaState.toUpperCase()} color={seaState === 'safe' ? W.green : W.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="timer-outline" value={String(myFleet.reduce((s, f) => s + f.rentedQuantity, 0))} label="Rented" color={W.brand} />
              <QuickStat icon="checkmark-circle-outline" value={String(myFleet.reduce((s, f) => s + (f.totalQuantity - f.rentedQuantity), 0))} label="Free" color={W.green} />
              <QuickStat icon="construct-outline" value={String(myFleet.filter(f => f.status === 'maintenance').length)} label="Maint" color={W.amber} />
              <QuickStat icon="warning-outline" value={String(safetyLogs.filter(l => l.type === 'critical').length)} label="Critical" color={W.red} />
            </View>
            {activeRentals.map(r => (
              <View key={r.id} style={styles.rentalCard}>
                <View style={{ flex: 1 }}><Text style={styles.rentalName}>{r.name}</Text><Text style={styles.rentalCustomer}>👤 {r.customer} · {r.startTime} ({r.duration}min)</Text></View>
                <Text style={styles.rentalRate}>{formatDZD(r.ratePerHr)}/hr</Text>
              </View>
            ))}
          </>
        )}

        {tab === 'Fleet Matrix' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚤 Fleet Assets — {myFleet.length}</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddFleet(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Asset</Text>
              </Pressable>
            </View>
            {myFleet.map(f => (
              <View key={f.id} style={styles.fleetCard}>
                <View style={styles.fleetTop}>
                  <Text style={styles.fleetName}>{f.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: f.rentedQuantity >= f.totalQuantity ? '#FEE2E2' : '#D1FAE5' }]}>
                    <Text style={[styles.statusText, { color: f.rentedQuantity >= f.totalQuantity ? '#DC2626' : '#059669' }]}>{f.rentedQuantity >= f.totalQuantity ? 'OUT' : 'READY'}</Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}><View style={[styles.progressFill, { width: `${Math.round((f.rentedQuantity / Math.max(f.totalQuantity, 1)) * 100)}%`, backgroundColor: W.brand }]} /></View>
                  <Text style={styles.progressText}>{f.rentedQuantity}/{f.totalQuantity}</Text>
                </View>
                <Text style={styles.fleetPrice}>{formatDZD(f.pricePerHourDZD)} / hr</Text>
                <View style={styles.fleetActions}>
                  <Pressable style={styles.smBtn} onPress={() => { if (f.rentedQuantity < f.totalQuantity) { rentItem(f.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } }}><Ionicons name="arrow-up-circle-outline" size={14} color={W.brand} /><Text style={styles.smBtnText}>Rent</Text></Pressable>
                  <Pressable style={styles.smBtn} onPress={() => { if (f.rentedQuantity > 0) { returnItem(f.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } }}><Ionicons name="arrow-down-circle-outline" size={14} color={W.green} /><Text style={[styles.smBtnText, { color: W.green }]}>Return</Text></Pressable>
                  <Pressable style={styles.smBtn} onPress={() => { setEditFleet(f); setEditPriceVal(String(f.pricePerHourDZD)); }}><Ionicons name="pricetag-outline" size={14} color={W.brand} /><Text style={styles.smBtnText}>Rate</Text></Pressable>
                  <Pressable style={[styles.smBtn, { borderColor: '#FECACA' }]} onPress={() => setShowDeleteFleet(f.id)}><Ionicons name="trash-outline" size={14} color={W.red} /><Text style={[styles.smBtnText, { color: W.red }]}>Delete</Text></Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Safety Lockout' && (
          <>
            <Text style={styles.sectionTitle}>🚨 Sea State & Safety Control</Text>
            <View style={styles.seaStateRow}>
              {(['safe', 'caution', 'closed'] as const).map(s => (
                <Pressable key={s} style={[styles.seaBtn, { backgroundColor: seaState === s ? (s === 'safe' ? '#D1FAE5' : s === 'caution' ? '#FEF3C7' : '#FEE2E2') : '#F1F5F9', borderColor: seaState === s ? (s === 'safe' ? '#34D399' : s === 'caution' ? '#FBBF24' : '#F87171') : '#E5E7EB' }]} onPress={() => { setSeaState(s); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
                  <Ionicons name={s === 'safe' ? 'checkmark-circle' : s === 'caution' ? 'warning' : 'close-circle'} size={20} color={s === 'safe' ? W.green : s === 'caution' ? W.amber : W.red} />
                  <Text style={{ fontFamily: 'mon-b', fontSize: 12, color: '#111827', textTransform: 'capitalize' }}>{s}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>📋 Safety Log</Text><Pressable style={styles.addBtn} onPress={() => { addLog('Manual inspection', 'info'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}><Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Log</Text></Pressable></View>
            {safetyLogs.map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={[styles.logDot, { backgroundColor: log.type === 'critical' ? W.red : log.type === 'warning' ? W.amber : W.brand }]} />
                <View style={{ flex: 1 }}><Text style={styles.logMsg}>{log.msg}</Text><Text style={styles.logTime}>{log.time}</Text></View>
                <Pressable onPress={() => { setSafetyLogs(p => p.filter(x => x.id !== log.id)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}><Ionicons name="close-outline" size={18} color="#94A3B8" /></Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddFleet} transparent animationType="fade" onRequestClose={() => setShowAddFleet(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Add Fleet Asset</Text><TextInput style={styles.input} placeholder="Asset name" value={newFleetName} onChangeText={setNewFleetName} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Quantity" value={newFleetQty} onChangeText={setNewFleetQty} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Rate per hour (DZD)" value={newFleetPrice} onChangeText={setNewFleetPrice} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddFleet(false)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: W.brand }]} onPress={handleAddFleet}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Add Asset</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editFleet} transparent animationType="fade" onRequestClose={() => setEditFleet(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Rate — {editFleet?.name}</Text><TextInput style={styles.input} placeholder="Rate per hour (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditFleet(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: W.brand }]} onPress={handleEditFleet}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteFleet} transparent animationType="fade" onRequestClose={() => setShowDeleteFleet(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Asset?</Text><Text style={styles.modalSub}>Remove this fleet asset permanently.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteFleet(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: W.red }]} onPress={() => showDeleteFleet && handleDeleteFleet(showDeleteFleet)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable></View></View></View>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: W.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  fleetCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  fleetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, fleetName: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, progressBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' }, progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' }, fleetPrice: { fontSize: 14, fontFamily: 'mon-b', color: W.brand },
  fleetActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }, smBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' },
  smBtnText: { fontSize: 10, fontFamily: 'mon-sb', color: '#64748B' }, statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  rentalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  rentalName: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' }, rentalCustomer: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 1 },
  rentalRate: { fontSize: 14, fontFamily: 'mon-b', color: W.brand },
  seaStateRow: { flexDirection: 'row', gap: 8 }, seaBtn: { flex: 1, flexDirection: 'row', gap: 6, padding: 14, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  logCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  logDot: { width: 8, height: 8, borderRadius: 4 }, logMsg: { fontSize: 13, fontFamily: 'mon-sb', color: '#374151' }, logTime: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
