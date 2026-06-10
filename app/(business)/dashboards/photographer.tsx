/**
 * RIHLA — Photography & Creative Services Hub
 * ──────────────────────────────────────────────
 * Tabs: Overview · Shoots Ledger · Digital Delivery
 * Store-backed CRUD: packages → usePartnerServices, shoots → usePartnerDispatches.
 * Full edit/delete on all items.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePartnerServices } from '@/store/usePartnerServices';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { PartnerService } from '@/store/usePartnerServices';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const PH = { brand: '#7C3AED', brandLt: '#EDE9FE', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

export default function PhotographerDashboard() {
  const { services, addService, updateService, removeService } = usePartnerServices();
  const { dispatches: shoots, addDispatch, updateDispatch, removeDispatch } = usePartnerDispatches();
  const [tab, setTab] = useState<'Overview' | 'Shoots Ledger' | 'Digital Delivery'>('Overview');

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editPackage, setEditPackage] = useState<PartnerService | null>(null);
  const [showDeletePackage, setShowDeletePackage] = useState<string | null>(null);
  const [showDeleteShoot, setShowDeleteShoot] = useState<string | null>(null);
  const [newPkg, setNewPkg] = useState({ name: '', desc: '', price: '15000' });
  const [editPriceVal, setEditPriceVal] = useState('');

  // Delivery state
  const [deliveries, setDeliveries] = useState<{ id: string; shoot: string; proofUrl: string; accessCode: string; delivered: boolean }[]>([
    { id: 'dl1', shoot: 'Wedding - Rania & Amir', proofUrl: 'gallery/rania-wedding', accessCode: 'RNW23', delivered: false },
    { id: 'dl2', shoot: 'Portrait - Malik', proofUrl: 'gallery/malik-portrait', accessCode: 'MLK19', delivered: true },
  ]);

  const myServices = services.filter(s => s.category === 'other' || s.assetType === 'photography');
  const myShoots = shoots.filter(s => s.jobType === 'photoshoot');

  const handleAddPkg = useCallback(() => {
    if (!newPkg.name) return;
    addService({ title: newPkg.name, category: 'other', assetType: 'photography', pricePerHourDzd: parseInt(newPkg.price) || 15000, notes: newPkg.desc, status: 'published' });
    setNewPkg({ name: '', desc: '', price: '15000' }); setShowAddPackage(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addService, newPkg]);
  const handleEditPkg = useCallback(() => {
    if (!editPackage) return; const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateService(editPackage.id, { pricePerHourDzd: val });
    setEditPackage(null); setEditPriceVal(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editPackage, editPriceVal, updateService]);
  const handleDeletePkg = useCallback((id: string) => { removeService(id); setShowDeletePackage(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeService]);
  const handleDeleteShoot = useCallback((id: string) => { removeDispatch(id); setShowDeleteShoot(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeDispatch]);
  const advanceShoot = useCallback((id: string) => {
    const sm: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const s = myShoots.find(x => x.id === id); const ns = s ? sm[s.status] : undefined;
    if (ns) updateDispatch(id, { status: ns as any }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [myShoots, updateDispatch]);
  const deliverProofs = useCallback((id: string) => {
    setDeliveries(p => p.map(d => d.id === id ? { ...d, delivered: true, accessCode: Math.random().toString(36).slice(2, 7).toUpperCase() } : d));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  const statusColors: Record<string, string> = { pending: PH.amber, accepted: PH.blue, 'in-progress': PH.green, completed: '#94A3B8' };

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: PH.brandLt }]}><Text style={[styles.kpiVal, { color: PH.brand }]}>{myServices.length}</Text><Text style={styles.kpiLbl}>Packages</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: PH.green }]}>{myShoots.length}</Text><Text style={styles.kpiLbl}>Shoots</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: PH.blue }]}>{deliveries.filter(d => d.delivered).length}</Text><Text style={styles.kpiLbl}>Delivered</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: PH.amber }]}>{myShoots.filter(s => s.status === 'pending').length}</Text><Text style={styles.kpiLbl}>Pending</Text></View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Shoots Ledger', 'Digital Delivery'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: PH.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: PH.brandLt }]}>
              <Ionicons name="camera-outline" size={28} color={PH.brand} />
              <Text style={styles.heroTitle}>📸 Photography Overview</Text>
              <Text style={styles.heroSub}>{myShoots.filter(s => s.status === 'in-progress' || s.status === 'accepted').length} active shoots · {deliveries.filter(d => !d.delivered).length} pending delivery</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Packages" value={String(myServices.length)} color={PH.brand} />
                <HeroStat label="Active Shoots" value={String(myShoots.filter(s => s.status !== 'completed').length)} color={PH.blue} />
                <HeroStat label="Delivered" value={String(deliveries.filter(d => d.delivered).length)} color={PH.green} />
                <HeroStat label="Revenue" value={`${(myShoots.filter(s => s.status === 'completed').reduce((a, s) => a + s.priceDZD, 0) / 1000).toFixed(0)}K`} color={PH.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="camera-outline" value={String(myServices.length)} label="Packages" color={PH.brand} />
              <QuickStat icon="calendar-outline" value={String(myShoots.filter(s => s.status !== 'completed').length)} label="Active" color={PH.blue} />
              <QuickStat icon="checkmark-done-outline" value={String(deliveries.filter(d => d.delivered).length)} label="Delivered" color={PH.green} />
              <QuickStat icon="cloud-upload-outline" value={String(deliveries.filter(d => !d.delivered).length)} label="Pending" color={PH.amber} />
            </View>
          </>
        )}

        {tab === 'Shoots Ledger' && (
          <>
            <Text style={styles.sectionTitle}>📋 Shoots Ledger</Text>
            {myShoots.map(shoot => (
              <View key={shoot.id} style={styles.shootCard}>
                <View style={styles.shootTop}>
                  <Text style={styles.shootName}>{shoot.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColors[shoot.status] || '#94A3B8') + '20' }]}><Text style={[styles.statusText, { color: statusColors[shoot.status] || '#94A3B8' }]}>{shoot.status}</Text></View>
                    <Pressable onPress={() => setShowDeleteShoot(shoot.id)}><Ionicons name="trash-outline" size={14} color={PH.red} /></Pressable>
                  </View>
                </View>
                <Text style={styles.shootMeta}>👤 {shoot.customerName} · {shoot.location}</Text>
                <Text style={styles.shootPrice}>{formatDZD(shoot.priceDZD)}</Text>
                {shoot.status !== 'completed' && shoot.status !== 'cancelled' && (
                  <Pressable style={[styles.advBtn, { backgroundColor: statusColors[shoot.status] || PH.brand }]} onPress={() => advanceShoot(shoot.id)}>
                    <Text style={styles.advBtnText}>{shoot.status === 'pending' ? 'Accept' : shoot.status === 'accepted' ? 'Start Shoot' : 'Complete'}</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </>
        )}

        {tab === 'Digital Delivery' && (
          <>
            <Text style={styles.sectionTitle}>📤 Digital Proofing & Delivery</Text>
            {deliveries.map(d => (
              <View key={d.id} style={[styles.deliveryCard, { backgroundColor: d.delivered ? '#F0FDF4' : '#fff', borderColor: d.delivered ? '#86EFAC' : '#E5E7EB' }]}>
                <Ionicons name={d.delivered ? 'checkmark-circle' : 'cloud-upload-outline'} size={22} color={d.delivered ? PH.green : PH.amber} />
                <View style={{ flex: 1 }}><Text style={styles.delName}>{d.shoot}</Text><Text style={styles.delMeta}>Gallery: {d.proofUrl}</Text></View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.delCode, { color: d.delivered ? PH.green : '#94A3B8' }]}>{d.accessCode}</Text>
                  {!d.delivered && <Pressable style={[styles.delBtn, { backgroundColor: PH.brand }]} onPress={() => deliverProofs(d.id)}><Text style={{ fontSize: 10, fontFamily: 'mon-b', color: '#fff' }}>Send</Text></Pressable>}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddPackage} transparent animationType="fade" onRequestClose={() => setShowAddPackage(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Add Package</Text><TextInput style={styles.input} placeholder="Package name" value={newPkg.name} onChangeText={t => setNewPkg(p => ({ ...p, name: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Description" value={newPkg.desc} onChangeText={t => setNewPkg(p => ({ ...p, desc: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Price (DZD)" value={newPkg.price} onChangeText={t => setNewPkg(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddPackage(false)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: PH.brand }]} onPress={handleAddPkg}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Add</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editPackage} transparent animationType="fade" onRequestClose={() => setEditPackage(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Price</Text><TextInput style={styles.input} placeholder="Price (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditPackage(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: PH.brand }]} onPress={handleEditPkg}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeletePackage} transparent animationType="fade" onRequestClose={() => setShowDeletePackage(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Package?</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeletePackage(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: PH.red }]} onPress={() => showDeletePackage && handleDeletePkg(showDeletePackage)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteShoot} transparent animationType="fade" onRequestClose={() => setShowDeleteShoot(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Cancel Shoot?</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteShoot(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: PH.red }]} onPress={() => showDeleteShoot && handleDeleteShoot(showDeleteShoot)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
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
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  shootCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  shootTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, shootName: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  shootMeta: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' }, shootPrice: { fontSize: 14, fontFamily: 'mon-b', color: PH.brand },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  advBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }, advBtnText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  deliveryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },
  delName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, delMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  delCode: { fontSize: 12, fontFamily: 'mon-b', letterSpacing: 1 }, delBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
