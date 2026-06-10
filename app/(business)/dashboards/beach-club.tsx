/**
 * RIHLA — Beach Club Concession SaaS Dashboard
 * ─────────────────────────────────────────────
 * Tabs: Overview · Spots Grid · Beach Orders · Staff Control
 * Store-backed CRUD: spots → useBusinessAssets, orders → usePartnerDispatches.
 * Full edit/delete modals on every item.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { BusinessAsset } from '@/store/useBusinessAssets';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const C = { brand: '#00a896', brandDark: '#007a6e', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6', grey: '#94A3B8' };

type Tab = 'Overview' | 'Spots Grid' | 'Beach Orders' | 'Staff Control';
const TABS: Tab[] = ['Overview', 'Spots Grid', 'Beach Orders', 'Staff Control'];

const ZONES = ['Family Zone', 'VIP Cabanas', 'Public Zone'];
const ZONE_COLORS: Record<string, string> = { 'Family Zone': '#10B981', 'VIP Cabanas': '#F59E0B', 'Public Zone': '#3B82F6' };

interface StaffMember { id: string; name: string; role: string; shift: string; clockedIn: boolean; tasks: number; }

export default function BeachClubDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { assets: spots, addAsset: addSpot, updateAsset: updateSpot, removeAsset: removeSpot } = useBusinessAssets();
  const { dispatches: orders, addDispatch: addOrder, updateDispatch: updateOrder, removeDispatch: removeOrder } = usePartnerDispatches();

  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 'st1', name: 'Ahmed Benz', role: 'Lifeguard', shift: '08:00-16:00', clockedIn: true, tasks: 3 },
    { id: 'st2', name: 'Sami Loud', role: 'Server', shift: '10:00-18:00', clockedIn: true, tasks: 7 },
    { id: 'st3', name: 'Rania K.', role: 'Cashier', shift: '08:00-14:00', clockedIn: false, tasks: 0 },
    { id: 'st4', name: 'Malik R.', role: 'Runner', shift: '12:00-20:00', clockedIn: true, tasks: 5 },
    { id: 'st5', name: 'Yasmine H.', role: 'Lifeguard', shift: '14:00-22:00', clockedIn: false, tasks: 0 },
  ]);

  const [showMaintenance, setShowMaintenance] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteOrder, setShowDeleteOrder] = useState<string | null>(null);
  const [showDeleteSpot, setShowDeleteSpot] = useState<string | null>(null);
  const [editSpot, setEditSpot] = useState<BusinessAsset | null>(null);
  const [newOrderItem, setNewOrderItem] = useState('');
  const [orderSpot, setOrderSpot] = useState('');
  // Edit spot modal
  const [editSpotPrice, setEditSpotPrice] = useState('');
  // New spot modal
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [newSpotZone, setNewSpotZone] = useState('Family Zone');
  const [newSpotLabel, setNewSpotLabel] = useState('');

  const mySpots = spots.filter(s => s.businessType === 'beach' && s.assetKind === 'spot');
  const beachOrders = orders.filter(o => o.jobType === 'beach-order');

  const occCount = mySpots.filter(s => s.fields?.status === 'occupied').length;
  const availCount = mySpots.filter(s => s.fields?.status === 'available').length;
  const damagedCount = mySpots.filter(s => s.fields?.status === 'damaged').length;
  const staffOnDuty = staff.filter(s => s.clockedIn).length;
  const totalRevenue = beachOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.priceDZD, 0);

  const toggleSpotStatus = useCallback((id: string, newStatus: string) => {
    const spot = mySpots.find(s => s.id === id);
    if (spot) updateSpot(id, { fields: { ...spot.fields, status: newStatus } });
    setShowMaintenance(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [mySpots, updateSpot]);

  const handleDeleteSpot = useCallback((id: string) => {
    removeSpot(id);
    setShowDeleteSpot(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeSpot]);

  const handleAddSpot = useCallback(() => {
    if (!newSpotLabel) return;
    addSpot({ businessType: 'beach', assetKind: 'spot', name: newSpotLabel, priceDZD: 1500, available: true, fields: { zone: newSpotZone, status: 'available', occupant: '', window: '' } });
    setNewSpotLabel(''); setShowAddSpot(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addSpot, newSpotLabel, newSpotZone]);

  const handleEditSpot = useCallback(() => {
    if (!editSpot) return;
    const val = parseInt(editSpotPrice);
    if (!isNaN(val) && val > 0) updateSpot(editSpot.id, { priceDZD: val });
    setEditSpot(null); setEditSpotPrice('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editSpot, editSpotPrice, updateSpot]);

  const advanceOrderStatus = useCallback((id: string) => {
    const statusMap: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const order = beachOrders.find(o => o.id === id);
    const nextStatus = order ? statusMap[order.status] : undefined;
    if (nextStatus) updateOrder(id, { status: nextStatus as any });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [beachOrders, updateOrder]);

  const handleDeleteOrder = useCallback((id: string) => {
    removeOrder(id);
    setShowDeleteOrder(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeOrder]);

  const handleNewOrder = useCallback(() => {
    if (!orderSpot || !newOrderItem) return;
    addOrder({ jobType: 'beach-order', title: `Order for ${orderSpot}`, customerName: 'Walk-in', location: orderSpot, scheduledTime: 'Now', priceDZD: Math.floor(Math.random() * 3000) + 500, status: 'pending', metadata: { items: [newOrderItem] } });
    setNewOrderItem(''); setOrderSpot(''); setShowOrderModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addOrder, orderSpot, newOrderItem]);

  const toggleStaffClock = useCallback((id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, clockedIn: !s.clockedIn } : s));
    Haptics.selectionAsync();
  }, []);

  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: C.brand }]}>{occCount}</Text><Text style={styles.kpiLbl}>Occupied</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: C.green }]}>{availCount}</Text><Text style={styles.kpiLbl}>Available</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FEF2F2' }]}><Text style={[styles.kpiVal, { color: C.red }]}>{damagedCount}</Text><Text style={styles.kpiLbl}>Damaged</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: C.blue }]}>{beachOrders.length}</Text><Text style={styles.kpiLbl}>Orders</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: C.amber }]}>{staffOnDuty}</Text><Text style={styles.kpiLbl}>Staff</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: C.brand }]}>{(totalRevenue / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Rev</Text></View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: C.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="umbrella-outline" size={28} color={C.brand} />
              <Text style={styles.heroTitle}>☀️ Beach Overview</Text>
              <Text style={styles.heroSub}>{occCount} of {mySpots.length} spots occupied · {beachOrders.filter(o => o.status === 'completed').length}/{beachOrders.length} fulfilled</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{occCount}/{mySpots.length}</Text><Text style={styles.heroStatLbl}>Occupancy</Text></View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{formatDZD(totalRevenue)}</Text><Text style={styles.heroStatLbl}>Revenue</Text></View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{staffOnDuty}/{staff.length}</Text><Text style={styles.heroStatLbl}>Staff</Text></View>
              </View>
            </View>
            <View style={styles.quickGrid}>
              <View style={styles.qStat}><Ionicons name="thermometer-outline" size={18} color={C.amber} /><Text style={styles.qVal}>28°C</Text><Text style={styles.qLbl}>Temp</Text></View>
              <View style={styles.qStat}><Ionicons name="water-outline" size={18} color={C.blue} /><Text style={styles.qVal}>0.8m</Text><Text style={styles.qLbl}>Waves</Text></View>
              <View style={styles.qStat}><Ionicons name="sunny-outline" size={18} color={C.amber} /><Text style={styles.qVal}>7 UV</Text><Text style={styles.qLbl}>Index</Text></View>
              <View style={styles.qStat}><Ionicons name="flag-outline" size={18} color={C.green} /><Text style={styles.qVal}>Safe</Text><Text style={styles.qLbl}>Beach</Text></View>
            </View>
          </>
        )}

        {tab === 'Spots Grid' && (
          <View style={styles.spotsWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏖️ Beach Spots — {mySpots.length}</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddSpot(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Spot</Text>
              </Pressable>
            </View>
            {ZONES.map(zone => (
              <View key={zone} style={styles.zoneSection}>
                <View style={[styles.zoneHeader, { borderLeftColor: ZONE_COLORS[zone], borderLeftWidth: 3 }]}>
                  <Text style={styles.zoneLabel}>{zone}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={styles.zoneCount}>{mySpots.filter(s => s.fields?.zone === zone && s.fields?.status === 'occupied').length}/{mySpots.filter(s => s.fields?.zone === zone).length}</Text>
                    <Pressable onPress={() => { setNewSpotZone(zone); setShowAddSpot(true); }}><Ionicons name="add-circle-outline" size={18} color={C.brand} /></Pressable>
                  </View>
                </View>
                <View style={styles.spotRow}>
                  {mySpots.filter(s => s.fields?.zone === zone).map(spot => {
                    const status = spot.fields?.status || 'available';
                    return (
                      <Pressable key={spot.id} style={[styles.spotCell, { backgroundColor: status === 'occupied' ? '#D1FAE5' : status === 'damaged' ? '#FEE2E2' : '#F0FDF4', borderColor: status === 'available' ? C.brand + '40' : status === 'damaged' ? C.red + '40' : C.brand }]}
                        onLongPress={() => { Haptics.selectionAsync(); setEditSpot(spot); setEditSpotPrice(String(spot.priceDZD)); }}>
                        <Text style={[styles.spotLabel, { color: status === 'damaged' ? C.red : C.brand }]}>{spot.name}</Text>
                        <Ionicons name={status === 'occupied' ? 'umbrella' : status === 'damaged' ? 'warning' : 'add-circle'} size={16} color={status === 'damaged' ? C.red : C.brand} />
                        {status === 'occupied' && <Text style={styles.spotOcc}>{spot.fields?.occupant?.slice(0, 6) || '—'}</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'Beach Orders' && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>🏖️ Beach Orders</Text>
              <Pressable style={styles.addBtn} onPress={() => setShowOrderModal(true)}><Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>New</Text></Pressable>
            </View>
            {beachOrders.map(order => {
              const statusColors: Record<string, string> = { pending: C.amber, accepted: C.blue, 'in-progress': C.green, completed: C.grey };
              const statusIcons: Record<string, string> = { pending: 'time-outline', accepted: 'checkmark-circle-outline', 'in-progress': 'bicycle-outline', completed: 'checkmark-done-outline' };
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderSpotBadge}><Text style={styles.orderSpotText}>{order.location}</Text></View>
                    <Text style={styles.orderCustomer}>{order.customerName}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[styles.orderStatusBadge, { backgroundColor: statusColors[order.status] + '20' }]}>
                        <Ionicons name={statusIcons[order.status] as any} size={12} color={statusColors[order.status]} />
                        <Text style={[styles.orderStatusText, { color: statusColors[order.status] }]}>{order.status}</Text>
                      </View>
                      <Pressable onPress={() => setShowDeleteOrder(order.id)}><Ionicons name="trash-outline" size={16} color={C.red} /></Pressable>
                    </View>
                  </View>
                  <Text style={styles.orderItems}>{order.metadata?.items ? (order.metadata.items as string[]).join(' · ') : ''}</Text>
                  <View style={styles.orderBot}>
                    <Text style={styles.orderTotal}>{formatDZD(order.priceDZD)}</Text>
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <Pressable style={[styles.advanceBtn, { backgroundColor: statusColors[order.status] || C.brand }]} onPress={() => advanceOrderStatus(order.id)}>
                        <Text style={styles.advanceBtnText}>{order.status === 'pending' ? 'Accept' : order.status === 'accepted' ? 'Prepare' : 'Dispatch'}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === 'Staff Control' && (
          <>
            <Text style={styles.sectionTitle}>👥 Staff Roster</Text>
            <Text style={styles.sectionSub}>{staffOnDuty} on duty · {staff.length} total</Text>
            {staff.map(m => (
              <View key={m.id} style={styles.staffCard}>
                <View style={[styles.staffAvatar, { backgroundColor: m.clockedIn ? C.brand + '20' : '#F1F5F9' }]}>
                  <Ionicons name={m.clockedIn ? 'person' : 'person-outline'} size={20} color={m.clockedIn ? C.brand : C.grey} />
                </View>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{m.name}</Text>
                  <Text style={styles.staffRole}>{m.role} · {m.shift}</Text>
                  <Text style={styles.staffTasks}>{m.tasks} active tasks</Text>
                </View>
                <Pressable style={[styles.clockBtn, { backgroundColor: m.clockedIn ? '#FEF2F2' : '#F0FDF4', borderColor: m.clockedIn ? '#FECACA' : '#A7F3D0' }]} onPress={() => toggleStaffClock(m.id)}>
                  <Ionicons name={m.clockedIn ? 'pause-circle' : 'play-circle'} size={18} color={m.clockedIn ? C.red : C.green} />
                  <Text style={[styles.clockBtnText, { color: m.clockedIn ? C.red : C.green }]}>{m.clockedIn ? 'Out' : 'In'}</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Spot Maintenance Modal */}
      <Modal visible={!!showMaintenance} transparent animationType="fade" onRequestClose={() => setShowMaintenance(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>Spot Actions</Text>
            {showMaintenance && (() => {
              const spot = mySpots.find(s => s.id === showMaintenance);
              if (!spot) return null;
              return <><Text style={styles.modalSpot}>{spot.fields?.zone} · {spot.name}</Text><View style={styles.modalActions}><TouchableOpacity style={[styles.modalAction, { backgroundColor: '#F0FDF4', borderColor: C.green + '40' }]} onPress={() => toggleSpotStatus(showMaintenance, 'available')}><Ionicons name="checkmark-circle" size={20} color={C.green} /><Text style={[styles.modalActionText, { color: C.green }]}>Mark Available</Text></TouchableOpacity><TouchableOpacity style={[styles.modalAction, { backgroundColor: '#FEF2F2', borderColor: C.red + '40' }]} onPress={() => toggleSpotStatus(showMaintenance, 'damaged')}><Ionicons name="warning" size={20} color={C.red} /><Text style={[styles.modalActionText, { color: C.red }]}>Mark Damaged</Text></TouchableOpacity><TouchableOpacity style={[styles.modalAction, { backgroundColor: '#FEF2F2', borderColor: C.red + '40' }]} onPress={() => setShowDeleteSpot(spot.id)}><Ionicons name="trash-outline" size={20} color={C.red} /><Text style={[styles.modalActionText, { color: C.red }]}>Delete Spot</Text></TouchableOpacity></View></>;
            })()}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowMaintenance(null)}><Text style={styles.modalCancelText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Spot Price Modal */}
      <Modal visible={!!editSpot} transparent animationType="fade" onRequestClose={() => setEditSpot(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>Edit Spot Price</Text>
            <Text style={styles.modalSpot}>{editSpot?.fields?.zone} · {editSpot?.name}</Text>
            <TextInput style={styles.input} placeholder="Price (DZD)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={editSpotPrice} onChangeText={setEditSpotPrice} />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.brand }]} onPress={handleEditSpot}><Text style={styles.primaryBtnText}>Update Price</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setEditSpot(null)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Spot Modal */}
      <Modal visible={showAddSpot} transparent animationType="slide" onRequestClose={() => setShowAddSpot(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>Add Beach Spot</Text>
            <TextInput style={styles.input} placeholder="Label (e.g. F-05)" value={newSpotLabel} onChangeText={setNewSpotLabel} placeholderTextColor="#94A3B8" />
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{ZONES.map(z => <Pressable key={z} style={[styles.zoneChip, { backgroundColor: newSpotZone === z ? C.brand : '#F1F5F9' }]} onPress={() => setNewSpotZone(z)}><Text style={{ fontFamily: 'mon-sb', fontSize: 12, color: newSpotZone === z ? '#fff' : '#374151' }}>{z}</Text></Pressable>)}</View>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.brand }]} onPress={handleAddSpot}><Text style={styles.primaryBtnText}>Add Spot</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddSpot(false); setNewSpotLabel(''); }}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Order Modal */}
      <Modal visible={showOrderModal} transparent animationType="slide" onRequestClose={() => setShowOrderModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>New Beach Order</Text>
            <TextInput style={styles.input} placeholder="Spot (e.g. F-01)" value={orderSpot} onChangeText={setOrderSpot} placeholderTextColor="#94A3B8" />
            <TextInput style={styles.input} placeholder="Items (e.g. Parasol, Towel)" value={newOrderItem} onChangeText={setNewOrderItem} placeholderTextColor="#94A3B8" />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: C.brand }]} onPress={handleNewOrder}><Text style={styles.primaryBtnText}>Create Order</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowOrderModal(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirm Modals */}
      <Modal visible={!!showDeleteSpot} transparent animationType="fade" onRequestClose={() => setShowDeleteSpot(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Spot?</Text><Text style={styles.modalSub}>This will permanently remove this beach spot.</Text><View style={styles.modalActions2}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteSpot(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: C.red }]} onPress={() => showDeleteSpot && handleDeleteSpot(showDeleteSpot)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteOrder} transparent animationType="fade" onRequestClose={() => setShowDeleteOrder(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Cancel Order?</Text><Text style={styles.modalSub}>This will remove this beach order.</Text><View style={styles.modalActions2}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteOrder(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: C.red }]} onPress={() => showDeleteOrder && handleDeleteOrder(showDeleteOrder)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable></View></View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {}, kpiRow: { gap: 8, marginBottom: 12, flexDirection: 'row' }, kpi: { borderRadius: 14, padding: 10, alignItems: 'center', gap: 2, minWidth: 68 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabBar: { marginBottom: 16 }, tabContent: { gap: 8, paddingRight: 8 }, tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' }, content: { gap: 14, paddingBottom: 32 },
  heroCard: { borderRadius: 20, padding: 20, gap: 8 }, heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10, marginTop: 4 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 }, heroStatVal: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' }, heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  heroStatDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  quickGrid: { flexDirection: 'row', gap: 10 }, qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  spotsWrap: { gap: 16 }, zoneSection: { gap: 10 }, zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 8, paddingVertical: 4 },
  zoneLabel: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, zoneCount: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  spotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, spotCell: { width: '22%', aspectRatio: 1, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4 },
  spotLabel: { fontSize: 12, fontFamily: 'mon-b' }, spotOcc: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, orderSpotBadge: { backgroundColor: C.brand + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  orderSpotText: { fontSize: 11, fontFamily: 'mon-b', color: C.brand }, orderCustomer: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: '#111827' },
  orderStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }, orderStatusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  orderItems: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' }, orderBot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  orderTotal: { fontSize: 14, fontFamily: 'mon-b', color: C.brand }, advanceBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 }, advanceBtnText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  staffCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  staffAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, staffInfo: { flex: 1, gap: 2 },
  staffName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, staffRole: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' }, staffTasks: { fontSize: 11, fontFamily: 'mon-sb', color: C.brand },
  clockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 }, clockBtnText: { fontSize: 11, fontFamily: 'mon-b' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,37,64,0.55)', justifyContent: 'flex-end' }, modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 12 },
  modalKnob: { width: 44, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 8 }, modalTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#111827' },
  modalSpot: { fontSize: 15, fontFamily: 'mon-sb', color: '#374151' }, modalActions: { gap: 10, marginVertical: 8 }, modalAction: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  modalActionText: { fontSize: 14, fontFamily: 'mon-b' }, modalCancel: { height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }, modalCancelText: { fontSize: 15, fontFamily: 'mon-sb', color: '#4B5563' },
  input: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, fontSize: 14, fontFamily: 'mon', color: '#111827', backgroundColor: '#F8FAFC' },
  primaryBtn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }, primaryBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  zoneChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 }, modalActions2: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
