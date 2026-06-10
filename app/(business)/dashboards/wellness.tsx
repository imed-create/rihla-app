/**
 * RIHLA — Wellness & Spa Retreat OS
 * ──────────────────────────────────────
 * Tabs: Overview · Booking Schedule · Staff Allocation
 * Store-backed CRUD: treatments → useBusinessAssets, bookings → usePartnerDispatches.
 * Full edit/delete on all items.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { BusinessAsset } from '@/store/useBusinessAssets';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const S = { brand: '#8B5CF6', brandLt: '#EDE9FE', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

interface Therapist { id: string; name: string; specialty: string; available: boolean; }

export default function WellnessDashboard() {
  const { assets, addAsset, updateAsset, removeAsset } = useBusinessAssets();
  const { dispatches: bookings, addDispatch, updateDispatch, removeDispatch } = usePartnerDispatches();
  const [tab, setTab] = useState<'Overview' | 'Booking Schedule' | 'Staff Allocation'>('Overview');

  const [therapists, setTherapists] = useState<Therapist[]>([
    { id: 'th1', name: 'Amina T.', specialty: 'Massage', available: true },
    { id: 'th2', name: 'Leila M.', specialty: 'Facials', available: true },
    { id: 'th3', name: 'Sami K.', specialty: 'Hammam', available: false },
    { id: 'th4', name: 'Nadia R.', specialty: 'Yoga', available: true },
  ]);

  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [editTreatment, setEditTreatment] = useState<BusinessAsset | null>(null);
  const [showDeleteTreatment, setShowDeleteTreatment] = useState<string | null>(null);
  const [showDeleteBooking, setShowDeleteBooking] = useState<string | null>(null);
  const [newTreatment, setNewTreatment] = useState({ name: '', price: '3000', duration: '60' });
  const [editPriceVal, setEditPriceVal] = useState('');

  const treatments = assets.filter(a => a.businessType === ('wellness' as any) && a.assetKind === 'treatment');
  const spaBookings = bookings.filter(b => b.jobType === 'spa-booking').slice(0, 8);

  const handleAddTreatment = useCallback(() => {
    if (!newTreatment.name) return;
    addAsset({ businessType: 'wellness' as any, assetKind: 'treatment', name: newTreatment.name, priceDZD: parseInt(newTreatment.price) || 3000, available: true, fields: { duration: parseInt(newTreatment.duration) || 60 } });
    setNewTreatment({ name: '', price: '3000', duration: '60' }); setShowAddTreatment(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addAsset, newTreatment]);
  const handleEditTreatment = useCallback(() => {
    if (!editTreatment) return; const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateAsset(editTreatment.id, { priceDZD: val });
    setEditTreatment(null); setEditPriceVal(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editTreatment, editPriceVal, updateAsset]);
  const handleDeleteTreatment = useCallback((id: string) => { removeAsset(id); setShowDeleteTreatment(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeAsset]);
  const handleDeleteBooking = useCallback((id: string) => { removeDispatch(id); setShowDeleteBooking(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeDispatch]);
  const toggleTherapist = useCallback((id: string) => { setTherapists(p => p.map(t => t.id === id ? { ...t, available: !t.available } : t)); Haptics.selectionAsync(); }, []);
  const advanceBooking = useCallback((id: string) => {
    const statusMap: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const b = spaBookings.find(x => x.id === id); const ns = b ? statusMap[b.status] : undefined;
    if (ns) updateDispatch(id, { status: ns as any }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [spaBookings, updateDispatch]);
  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  const statusColors: Record<string, string> = { pending: S.amber, accepted: S.blue, 'in-progress': S.green, completed: '#94A3B8' };

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: S.brandLt }]}><Text style={[styles.kpiVal, { color: S.brand }]}>{treatments.length}</Text><Text style={styles.kpiLbl}>Treatments</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: S.green }]}>{therapists.filter(t => t.available).length}</Text><Text style={styles.kpiLbl}>Staff</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: S.blue }]}>{spaBookings.length}</Text><Text style={styles.kpiLbl}>Bookings</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: S.amber }]}>{spaBookings.filter(b => b.status === 'pending').length}</Text><Text style={styles.kpiLbl}>Pending</Text></View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Booking Schedule', 'Staff Allocation'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: S.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: S.brandLt }]}>
              <Ionicons name="leaf-outline" size={28} color={S.brand} />
              <Text style={styles.heroTitle}>🧖 Wellness & Spa Overview</Text>
              <Text style={styles.heroSub}>{therapists.filter(t => t.available).length} therapists on duty · {spaBookings.length} today's bookings</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Treatments" value={String(treatments.length)} color={S.brand} />
                <HeroStat label="Staff" value={String(therapists.filter(t => t.available).length)} color={S.green} />
                <HeroStat label="Bookings" value={String(spaBookings.length)} color={S.blue} />
                <HeroStat label="Occupancy" value={`${Math.round(spaBookings.filter(b => b.status !== 'completed').length / Math.max(spaBookings.length, 1) * 100)}%`} color={S.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="sparkles-outline" value={String(treatments.length)} label="Services" color={S.brand} />
              <QuickStat icon="people-outline" value={String(therapists.length)} label="Therapists" color={S.green} />
              <QuickStat icon="calendar-outline" value={String(spaBookings.filter(b => b.status !== 'completed').length)} label="Active" color={S.blue} />
              <QuickStat icon="checkmark-done-outline" value={String(spaBookings.filter(b => b.status === 'completed').length)} label="Done" color={S.green} />
            </View>
            <Text style={styles.sectionTitle}>🧴 Treatment Menu</Text>
            {treatments.map(t => <View key={t.id} style={styles.treatmentCard}><View style={{ flex: 1 }}><Text style={styles.treatName}>{t.name}</Text><Text style={styles.treatMeta}>{t.fields?.duration || 60} min</Text></View><Text style={styles.treatPrice}>{formatDZD(t.priceDZD)}</Text></View>)}
          </>
        )}

        {tab === 'Booking Schedule' && (
          <>
            <Text style={styles.sectionTitle}>📅 Booking Timeline — {spaBookings.length} today</Text>
            {spaBookings.map(b => (
              <View key={b.id} style={styles.bookingCard}>
                <View style={[styles.timeDot, { backgroundColor: statusColors[b.status] || '#94A3B8' }]} />
                <View style={styles.bookingInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.bookingName}>{b.customerName}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[styles.statusBadge, { backgroundColor: (statusColors[b.status] || '#94A3B8') + '20' }]}><Text style={[styles.statusText, { color: statusColors[b.status] || '#94A3B8' }]}>{b.status}</Text></View>
                      <Pressable onPress={() => setShowDeleteBooking(b.id)}><Ionicons name="trash-outline" size={14} color={S.red} /></Pressable>
                    </View>
                  </View>
                  <Text style={styles.bookingMeta}>{b.title} · {b.scheduledTime}</Text>
                  <Text style={styles.bookingMeta}>{formatDZD(b.priceDZD)}</Text>
                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <Pressable style={[styles.advBtn, { backgroundColor: statusColors[b.status] || S.brand }]} onPress={() => advanceBooking(b.id)}>
                      <Text style={styles.advBtnText}>{b.status === 'pending' ? 'Confirm' : b.status === 'accepted' ? 'Start' : 'Complete'}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Staff Allocation' && (
          <>
            <Text style={styles.sectionTitle}>👥 Therapist Roster</Text>
            <Text style={styles.sectionSub}>{therapists.filter(t => t.available).length} available · {therapists.length} total</Text>
            {therapists.map(t => (
              <View key={t.id} style={styles.therapistCard}>
                <View style={[styles.avatar, { backgroundColor: t.available ? S.brandLt : '#F1F5F9' }]}><Ionicons name="person" size={18} color={t.available ? S.brand : '#94A3B8'} /></View>
                <View style={{ flex: 1 }}><Text style={styles.therName}>{t.name}</Text><Text style={styles.therSpec}>{t.specialty}</Text></View>
                <Pressable style={[styles.staffToggle, { backgroundColor: t.available ? '#D1FAE5' : '#FEE2E2' }]} onPress={() => toggleTherapist(t.id)}>
                  <Text style={{ fontSize: 11, fontFamily: 'mon-sb', color: t.available ? '#059669' : '#DC2626' }}>{t.available ? 'On' : 'Off'}</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddTreatment} transparent animationType="fade" onRequestClose={() => setShowAddTreatment(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Add Treatment</Text><TextInput style={styles.input} placeholder="Treatment name" value={newTreatment.name} onChangeText={t => setNewTreatment(p => ({ ...p, name: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Price (DZD)" value={newTreatment.price} onChangeText={t => setNewTreatment(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Duration (min)" value={newTreatment.duration} onChangeText={t => setNewTreatment(p => ({ ...p, duration: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddTreatment(false)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: S.brand }]} onPress={handleAddTreatment}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Add</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editTreatment} transparent animationType="fade" onRequestClose={() => setEditTreatment(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Price — {editTreatment?.name}</Text><TextInput style={styles.input} placeholder="Price (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditTreatment(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: S.brand }]} onPress={handleEditTreatment}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteTreatment} transparent animationType="fade" onRequestClose={() => setShowDeleteTreatment(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Treatment?</Text><Text style={styles.modalSub}>Remove this treatment from your menu.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteTreatment(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: S.red }]} onPress={() => showDeleteTreatment && handleDeleteTreatment(showDeleteTreatment)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteBooking} transparent animationType="fade" onRequestClose={() => setShowDeleteBooking(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Cancel Booking?</Text><Text style={styles.modalSub}>Remove this spa booking.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteBooking(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: S.red }]} onPress={() => showDeleteBooking && handleDeleteBooking(showDeleteBooking)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
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
  sectionSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  treatmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  treatName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, treatMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' }, treatPrice: { fontSize: 14, fontFamily: 'mon-b', color: S.brand },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: S.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  bookingCard: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  timeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 }, bookingInfo: { flex: 1, gap: 4 },
  bookingName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, bookingMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  advBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }, advBtnText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  therapistCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  therName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, therSpec: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  staffToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
