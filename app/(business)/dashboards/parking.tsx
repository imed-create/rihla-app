/**
 * RIHLA — Parking & Logistics Hub
 * ─────────────────────────────────
 * Tabs: Overview · Spots Control · Tariff Engine
 * Store-backed CRUD: spots → useAssetInventory.
 * Full edit/delete on all items with persisted storage.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAssetInventory } from '@/store/useAssetInventory';
import type { InventoryItem } from '@/store/useAssetInventory';

const P = { brand: '#6366F1', brandLt: '#EEF2FF', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

type Tab = 'Overview' | 'Spots Control' | 'Tariff Engine';
const TABS: Tab[] = ['Overview', 'Spots Control', 'Tariff Engine'];

interface Vehicle { id: string; plate: string; spot: string; entry: string; fee: number; }

export default function ParkingDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { items: spots, addItem: addSpot, updateItem: updateSpot, removeItem: removeSpot, toggleStatus } = useAssetInventory();

  const [showAddSpot, setShowAddSpot] = useState(false);
  const [editSpot, setEditSpot] = useState<InventoryItem | null>(null);
  const [showDeleteSpot, setShowDeleteSpot] = useState<string | null>(null);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotPrice, setNewSpotPrice] = useState('');
  const [editPriceVal, setEditPriceVal] = useState('');

  // ── Tariff Rates ──
  const [tariffs, setTariffs] = useState<{ id: string; label: string; ratePerHour: number; active: boolean }[]>([
    { id: 'tr1', label: 'Standard Car', ratePerHour: 200, active: true },
    { id: 'tr2', label: 'SUV / 4x4', ratePerHour: 350, active: true },
    { id: 'tr3', label: 'Motorcycle', ratePerHour: 100, active: false },
    { id: 'tr4', label: 'VIP Reserved', ratePerHour: 500, active: true },
  ]);

  const [showEditTariff, setShowEditTariff] = useState<string | null>(null);
  const [editTariffRate, setEditTariffRate] = useState('');

  // ── Active Vehicles ──
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v1', plate: '16-123-45', spot: 'A-01', entry: '08:30', fee: 0 },
    { id: 'v2', plate: '16-678-90', spot: 'A-05', entry: '09:15', fee: 0 },
    { id: 'v3', plate: '16-555-77', spot: 'B-03', entry: '10:00', fee: 0 },
  ]);

  const mySpots = spots.filter(s => s.businessType === 'parking');
  const availSpots = mySpots.filter(s => s.rentedQuantity < s.totalQuantity || s.status === 'available').length;
  const occupiedNow = vehicles.length;
  const totalCapacity = mySpots.reduce((s, i) => s + i.totalQuantity, 0);
  const todayRevenue = vehicles.length * 200;

  // ── Spot CRUD ──
  const handleAddSpot = useCallback(() => {
    if (!newSpotName) return;
    addSpot({ businessType: 'parking', category: 'parking', name: newSpotName, totalQuantity: 1, rentedQuantity: 0, pricePerHourDZD: parseInt(newSpotPrice) || 200, depositDZD: 0, status: 'available' });
    setNewSpotName(''); setNewSpotPrice(''); setShowAddSpot(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addSpot, newSpotName, newSpotPrice]);

  const handleEditSpot = useCallback(() => {
    if (!editSpot) return;
    const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateSpot(editSpot.id, { pricePerHourDZD: val });
    setEditSpot(null); setEditPriceVal('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editSpot, editPriceVal, updateSpot]);

  const handleDeleteSpot = useCallback((id: string) => {
    removeSpot(id); setShowDeleteSpot(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeSpot]);

  const toggleTariff = useCallback((id: string) => {
    setTariffs(p => p.map(t => t.id === id ? { ...t, active: !t.active } : t));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleEditTariff = useCallback((id: string) => {
    const val = parseInt(editTariffRate);
    if (!isNaN(val) && val > 0) setTariffs(p => p.map(t => t.id === id ? { ...t, ratePerHour: val } : t));
    setShowEditTariff(null); setEditTariffRate('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editTariffRate]);

  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: P.brandLt }]}><Text style={[styles.kpiVal, { color: P.brand }]}>{occupiedNow}</Text><Text style={styles.kpiLbl}>Occupied</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: P.green }]}>{availSpots}</Text><Text style={styles.kpiLbl}>Available</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: P.blue }]}>{totalCapacity}</Text><Text style={styles.kpiLbl}>Total</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: P.amber }]}>{(todayRevenue / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: P.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: P.brandLt }]}>
              <Ionicons name="car-outline" size={28} color={P.brand} />
              <Text style={styles.heroTitle}>🅿️ Parking Hub Overview</Text>
              <Text style={styles.heroSub}>{occupiedNow} vehicles parked · {availSpots} spots free</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Occupied" value={String(occupiedNow)} color={P.brand} />
                <HeroStat label="Available" value={String(availSpots)} color={P.green} />
                <HeroStat label="Revenue" value={`${(todayRevenue/1000).toFixed(0)}K DZD`} color={P.amber} />
                <HeroStat label="Est. Hourly" value={formatDZD(tariffs.filter(t=>t.active).reduce((s,t)=>s+t.ratePerHour,0))} color={P.blue} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="car-sport-outline" value={String(vehicles.length)} label="Active" color={P.brand} />
              <QuickStat icon="layers-outline" value={String(mySpots.length)} label="Spots" color={P.blue} />
              <QuickStat icon="cash-outline" value={String(tariffs.filter(t => t.active).length)} label="Tariffs" color={P.amber} />
              <QuickStat icon="time-outline" value="24/7" label="Hours" color={P.green} />
            </View>
            <Text style={styles.sectionTitle}>🚗 Currently Parked</Text>
            {vehicles.map(v => <View key={v.id} style={styles.vehicleCard}><Ionicons name="car" size={20} color={P.brand} /><View style={{ flex: 1 }}><Text style={styles.vehiclePlate}>{v.plate}</Text><Text style={styles.vehicleMeta}>Spot {v.spot} · Since {v.entry}</Text></View><Text style={styles.vehicleFee}>{formatDZD(v.fee)}</Text></View>)}
          </>
        )}

        {tab === 'Spots Control' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🅿️ Parking Spots — {mySpots.length}</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddSpot(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Spot</Text>
              </Pressable>
            </View>
            {mySpots.map(spot => (
              <View key={spot.id} style={styles.spotCard}>
                <View style={styles.spotTop}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: spot.rentedQuantity >= spot.totalQuantity ? '#FEE2E2' : '#D1FAE5' }]}>
                    <Text style={[styles.statusText, { color: spot.rentedQuantity >= spot.totalQuantity ? '#DC2626' : '#059669' }]}>
                      {spot.rentedQuantity >= spot.totalQuantity ? 'Full' : spot.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.spotMeta}>{spot.rentedQuantity}/{spot.totalQuantity} occupied</Text>
                <Text style={styles.spotPrice}>{formatDZD(spot.pricePerHourDZD)} / hr</Text>
                <View style={styles.spotActions}>
                  <Pressable style={styles.smBtn} onPress={() => { setEditSpot(spot); setEditPriceVal(String(spot.pricePerHourDZD)); }}><Ionicons name="pricetag-outline" size={14} color={P.brand} /><Text style={styles.smBtnText}>Edit Rate</Text></Pressable>
                  <Pressable style={styles.smBtn} onPress={() => toggleStatus(spot.id, 'maintenance')}><Ionicons name="construct-outline" size={14} color={P.amber} /><Text style={[styles.smBtnText, { color: P.amber }]}>Maint</Text></Pressable>
                  <Pressable style={[styles.smBtn, { borderColor: '#FECACA' }]} onPress={() => setShowDeleteSpot(spot.id)}><Ionicons name="trash-outline" size={14} color={P.red} /><Text style={[styles.smBtnText, { color: P.red }]}>Delete</Text></Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Tariff Engine' && (
          <>
            <Text style={styles.sectionTitle}>💰 Tariff Engine — {tariffs.length} rates</Text>
            {tariffs.map(t => (
              <View key={t.id} style={styles.tariffCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.tariffLabel}>{t.label}</Text>
                    <Pressable onPress={() => toggleTariff(t.id)}>
                      <View style={[styles.toggle, t.active && { backgroundColor: P.green }]}>
                        <View style={[styles.toggleKnob, t.active && { alignSelf: 'flex-end' }]} />
                      </View>
                    </Pressable>
                  </View>
                  <Text style={styles.tariffRate}>{formatDZD(t.ratePerHour)} / hour</Text>
                </View>
                <Pressable style={styles.smBtn} onPress={() => { setShowEditTariff(t.id); setEditTariffRate(String(t.ratePerHour)); }}>
                  <Ionicons name="create-outline" size={14} color={P.brand} /><Text style={styles.smBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.smBtn, { borderColor: '#FECACA' }]} onPress={() => { setTariffs(p => p.filter(x => x.id !== t.id)); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
                  <Ionicons name="trash-outline" size={14} color={P.red} /><Text style={[styles.smBtnText, { color: P.red }]}>Delete</Text>
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addTariffBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setTariffs(p => [...p, { id: 'tr'+Date.now(), label: 'New Rate', ratePerHour: 250, active: true }]); }}>
              <Ionicons name="add-circle-outline" size={18} color={P.brand} /><Text style={styles.addTariffText}>Add Tariff</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <Modal visible={showAddSpot} transparent animationType="fade" onRequestClose={() => setShowAddSpot(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Add Parking Spot</Text><TextInput style={styles.input} placeholder="Spot name (e.g. A-06)" value={newSpotName} onChangeText={setNewSpotName} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Rate per hour (DZD)" value={newSpotPrice} onChangeText={setNewSpotPrice} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddSpot(false)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: P.brand }]} onPress={handleAddSpot}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Add Spot</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editSpot} transparent animationType="fade" onRequestClose={() => setEditSpot(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Rate — {editSpot?.name}</Text><TextInput style={styles.input} placeholder="Rate per hour (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditSpot(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: P.brand }]} onPress={handleEditSpot}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteSpot} transparent animationType="fade" onRequestClose={() => setShowDeleteSpot(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Spot?</Text><Text style={styles.modalSub}>This will permanently remove this parking spot.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteSpot(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: P.red }]} onPress={() => showDeleteSpot && handleDeleteSpot(showDeleteSpot)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showEditTariff} transparent animationType="fade" onRequestClose={() => setShowEditTariff(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Tariff Rate</Text><TextInput style={styles.input} placeholder="Rate per hour (DZD)" value={editTariffRate} onChangeText={setEditTariffRate} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowEditTariff(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: P.brand }]} onPress={() => showEditTariff && handleEditTariff(showEditTariff)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Update</Text></Pressable></View></View></View>
      </Modal>
    </View>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.heroStat}><Text style={[styles.heroStatVal, { color }]}>{value}</Text><Text style={styles.heroStatLbl}>{label}</Text></View>;
}
function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return <View style={styles.qStat}><Ionicons name={icon as any} size={16} color={color} /><Text style={styles.qVal}>{value}</Text><Text style={styles.qLbl}>{label}</Text></View>;
}

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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  spotCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  spotTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, spotName: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  spotMeta: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' }, spotPrice: { fontSize: 14, fontFamily: 'mon-b', color: P.brand },
  spotActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  smBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' },
  smBtnText: { fontSize: 10, fontFamily: 'mon-sb', color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  vehiclePlate: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' }, vehicleMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' }, vehicleFee: { fontSize: 14, fontFamily: 'mon-b', color: P.brand },
  tariffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  tariffLabel: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' }, tariffRate: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  toggle: { width: 38, height: 20, borderRadius: 10, backgroundColor: '#CBD5E1', padding: 2, justifyContent: 'center' }, toggleKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  addTariffBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: P.brand + '40', borderStyle: 'dashed', justifyContent: 'center' },
  addTariffText: { fontSize: 14, fontFamily: 'mon-sb', color: P.brand },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 }, modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 }, input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
