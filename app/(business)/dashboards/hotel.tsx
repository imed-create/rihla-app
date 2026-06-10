/**
 * RIHLA — Enterprise Hotel SaaS Platform
 * ─────────────────────────────────────────
 * Tabs: [Overview] [Rooms Matrix] [Order Intake] [Yield Engine] [Housekeeping]
 * Full CRUD with Zustand persistence: rooms → useBusinessAssets,
 * orders → usePartnerDispatches, campaigns + HK → local state.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { BusinessAsset } from '@/store/useBusinessAssets';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const H = { brand: '#1A6B3A', brandLt: '#E6F4EC', amber: '#F59E0B', red: '#EF4444', green: '#10B981', teal: '#00a896' };

type Tab = 'Overview' | 'Rooms Matrix' | 'Order Intake' | 'Yield Engine' | 'Housekeeping';
const TABS: Tab[] = ['Overview', 'Rooms Matrix', 'Order Intake', 'Yield Engine', 'Housekeeping'];

interface Campaign { id: string; code: string; discountPct: number; minNights: number; active: boolean; }
interface HkTask { id: string; room: string; task: string; assignee: string; status: 'pending' | 'inprogress' | 'done'; }

export default function HotelDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { assets, addAsset, updateAsset, removeAsset, toggleAvailable } = useBusinessAssets();
  const { dispatches, addDispatch, updateDispatch, removeDispatch, acceptDispatch, completeDispatch } = usePartnerDispatches();

  // ── Local items ──
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 'c1', code: 'SUMMER25', discountPct: 25, minNights: 3, active: true },
    { id: 'c2', code: 'WELCOME10', discountPct: 10, minNights: 1, active: false },
  ]);
  const [hkTasks, setHkTasks] = useState<HkTask[]>([
    { id: 'hk1', room: '101', task: 'Deep Clean', assignee: 'Fatima', status: 'done' },
    { id: 'hk2', room: '301', task: 'Maintenance Fix', assignee: 'Youcef', status: 'inprogress' },
    { id: 'hk3', room: '201', task: 'Turnover Clean', assignee: 'Amina', status: 'pending' },
  ]);

  // ── Modals ──
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editRoom, setEditRoom] = useState<BusinessAsset | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAddon, setShowAddon] = useState<PartnerDispatch | null>(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showDeleteCampaign, setShowDeleteCampaign] = useState<string | null>(null);
  const [showDeleteOrder, setShowDeleteOrder] = useState<string | null>(null);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [editHkTask, setEditHkTask] = useState<HkTask | null>(null);
  const [showDeleteHk, setShowDeleteHk] = useState<string | null>(null);
  // Edit price specific
  const [editPriceValue, setEditPriceValue] = useState('');
  // Room add form
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomType, setNewRoomType] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [newRoomCap, setNewRoomCap] = useState('');

  // ── Derived ──
  const rooms = assets.filter(a => a.businessType === 'hotel' && a.assetKind === 'room');
  const orders = dispatches.filter(d => d.jobType === 'hotel-order');
  const occupancyPct = rooms.length > 0 ? Math.round((rooms.filter(r => r.fields.status === 'occupied').length / rooms.length) * 100) : 0;
  const totalRevenueDZD = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.priceDZD, 0);
  const checkoutsToday = orders.filter(o => o.status === 'accepted' || o.status === 'in-progress').length;
  const upsellValue = 0;

  // ── Room CRUD (store-backed) ──
  const handleAddRoom = useCallback(() => {
    addAsset({
      businessType: 'hotel',
      assetKind: 'room',
      name: newRoomType || 'Standard Room',
      priceDZD: parseInt(newRoomPrice) || 10000,
      available: true,
      fields: { number: newRoomNum || String(rooms.length + 100), type: newRoomType || 'Standard', capacity: parseInt(newRoomCap) || 2, status: 'available' },
    });
    setNewRoomNum(''); setNewRoomType(''); setNewRoomPrice(''); setNewRoomCap('');
    setShowAddRoom(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addAsset, newRoomNum, newRoomType, newRoomPrice, newRoomCap, rooms.length]);

  const handleEditRoom = useCallback(() => {
    if (!editRoom) return;
    const val = parseInt(editPriceValue);
    if (!isNaN(val) && val > 0) updateAsset(editRoom.id, { priceDZD: val });
    setEditRoom(null);
    setEditPriceValue('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editRoom, editPriceValue, updateAsset]);

  const handleDeleteRoom = useCallback((id: string) => {
    removeAsset(id);
    setShowDeleteConfirm(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeAsset]);

  const handleToggleRoomStatus = useCallback((id: string, status: string) => {
    const room = assets.find(a => a.id === id);
    if (room) updateAsset(id, { fields: { ...room.fields, status } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [assets, updateAsset]);

  // ── Order CRUD (store-backed) ──
  const advanceOrder = useCallback((id: string) => {
    const statusMap: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const order = dispatches.find(d => d.id === id);
    const nextStatus = order ? statusMap[order.status] : undefined;
    if (nextStatus === 'completed') completeDispatch(id);
    else if (nextStatus) updateDispatch(id, { status: nextStatus as any });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [dispatches, updateDispatch, completeDispatch]);

  const addAddonToOrder = useCallback((orderId: string) => {
    if (!newAddonName || !newAddonPrice) return;
    const order = dispatches.find(d => d.id === orderId);
    if (order) {
      updateDispatch(orderId, {
        priceDZD: order.priceDZD + (parseInt(newAddonPrice) || 0),
        metadata: { ...order.metadata, addons: [...(order.metadata?.addons || []), { name: newAddonName, price: parseInt(newAddonPrice) || 0 }] },
      });
    }
    setNewAddonName(''); setNewAddonPrice(''); setShowAddon(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newAddonName, newAddonPrice, dispatches, updateDispatch]);

  // ── Order delete ──
  const handleDeleteOrder = useCallback((id: string) => {
    removeDispatch(id);
    setShowDeleteOrder(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeDispatch]);

  // ── Campaign CRUD (local) ──
  const addCampaign = useCallback(() => {
    const newC: Campaign = { id: 'c' + Date.now(), code: 'PROMO' + (campaigns.length + 1), discountPct: 15, minNights: 2, active: true };
    setCampaigns(p => [...p, newC]);
    setShowCampaign(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [campaigns]);

  const toggleCampaign = useCallback((id: string) => {
    setCampaigns(p => p.map(c => c.id === id ? { ...c, active: !c.active } : c));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleDeleteCampaign = useCallback((id: string) => {
    setCampaigns(p => p.filter(c => c.id !== id));
    setShowDeleteCampaign(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // ── HK CRUD (local) ──
  const advanceHk = useCallback((id: string) => {
    setHkTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const next = { pending: 'inprogress' as const, inprogress: 'done' as const, done: 'done' as const };
      return { ...t, status: next[t.status] };
    }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleDeleteHk = useCallback((id: string) => {
    setHkTasks(p => p.filter(t => t.id !== id));
    setShowDeleteHk(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  const renderTabBar = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      {TABS.map(t => (
        <Pressable key={t} style={[s.tabPill, tab === t && { backgroundColor: H.brand }]}
          onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
          <Text style={[s.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <View style={s.root}>
      <View style={s.kpiRow}>
        <View style={[s.kpi, { backgroundColor: H.brandLt }]}><Text style={[s.kpiVal, { color: H.brand }]}>{occupancyPct}%</Text><Text style={s.kpiLbl}>Occupancy</Text></View>
        <View style={[s.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[s.kpiVal, { color: H.green }]}>{(totalRevenueDZD / 1000).toFixed(0)}K</Text><Text style={s.kpiLbl}>Revenue</Text></View>
        <View style={[s.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[s.kpiVal, { color: H.amber }]}>{checkoutsToday}</Text><Text style={s.kpiLbl}>Checkouts</Text></View>
        <View style={[s.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[s.kpiVal, { color: '#3B82F6' }]}>{(upsellValue / 1000).toFixed(0)}K</Text><Text style={s.kpiLbl}>Upsell</Text></View>
      </View>
      {renderTabBar()}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'Overview' && (
          <>
            <View style={s.heroCard}>
              <Text style={s.heroTitle}>Hotel Operational Overview</Text>
              <Text style={s.heroSub}>{rooms.filter(r => r.available).length} rooms available · {orders.filter(o => o.status === 'pending').length} pending orders</Text>
              <View style={s.heroStats}>
                <HeroStat label="Occupancy" value={`${occupancyPct}%`} color={H.brand} />
                <HeroStat label="Revenue" value={`${(totalRevenueDZD / 1000).toFixed(0)}K DZD`} color={H.green} />
                <HeroStat label="Upsell" value={`${(upsellValue / 1000).toFixed(0)}K DZD`} color="#3B82F6" />
                <HeroStat label="Active Promos" value={String(campaigns.filter(c => c.active).length)} color={H.amber} />
              </View>
            </View>
            <View style={s.quickGrid}>
              <QuickStat icon="bed-outline" value={String(rooms.length)} label="Total Rooms" color={H.brand} />
              <QuickStat icon="calendar-outline" value={String(orders.length)} label="Orders" color={H.green} />
              <QuickStat icon="sparkles-outline" value={String(campaigns.length)} label="Campaigns" color={H.amber} />
              <QuickStat icon="construct-outline" value={String(hkTasks.filter(t => t.status !== 'done').length)} label="Tasks Open" color={H.red} />
            </View>
          </>
        )}

        {/* ═══ ROOMS MATRIX ═══ */}
        {tab === 'Rooms Matrix' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>🏨 Room Inventory — {rooms.length} units</Text>
              <Pressable style={s.addBtn} onPress={() => { setShowAddRoom(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={s.addBtnText}>Add Room</Text>
              </Pressable>
            </View>
            {rooms.map(room => {
              const status = room.fields?.status || 'available';
              return (
                <View key={room.id} style={s.roomCard}>
                  <View style={s.roomTop}>
                    <Text style={s.roomNumber}>Room {room.fields?.number || '—'}</Text>
                    <View style={[s.statusBadge, { backgroundColor: status === 'available' ? '#D1FAE5' : status === 'occupied' ? '#FEE2E2' : '#F1F5F9' }]}>
                      <Text style={[s.statusText, { color: status === 'available' ? '#059669' : status === 'occupied' ? '#DC2626' : '#64748B' }]}>{status}</Text>
                    </View>
                  </View>
                  <Text style={s.roomType}>{room.fields?.type || room.name} · {room.fields?.capacity || 2} pax</Text>
                  <Text style={s.roomPrice}>{formatDZD(room.priceDZD)} / night</Text>
                  {room.fields?.guest && <Text style={s.roomGuest}>👤 {room.fields.guest} · Checkout {room.fields.checkout}</Text>}
                  <View style={s.roomActions}>
                    <Pressable style={s.smBtn} onPress={() => { setEditRoom(room); setEditPriceValue(String(room.priceDZD)); }}>
                      <Ionicons name="pricetag-outline" size={14} color={H.brand} /><Text style={s.smBtnText}>Edit Price</Text>
                    </Pressable>
                    <Pressable style={s.smBtn} onPress={() => handleToggleRoomStatus(room.id, 'available')}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={H.green} /><Text style={[s.smBtnText, { color: H.green }]}>Avail</Text>
                    </Pressable>
                    <Pressable style={s.smBtn} onPress={() => handleToggleRoomStatus(room.id, 'occupied')}>
                      <Ionicons name="close-circle-outline" size={14} color={H.red} /><Text style={[s.smBtnText, { color: H.red }]}>Occupy</Text>
                    </Pressable>
                    <Pressable style={s.smBtn} onPress={() => { toggleAvailable(room.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                      <Ionicons name={room.available ? 'eye-outline' : 'eye-off-outline'} size={14} color="#64748B" /><Text style={s.smBtnText}>{room.available ? 'Visible' : 'Hidden'}</Text>
                    </Pressable>
                    <Pressable style={[s.smBtn, { borderColor: '#FECACA' }]} onPress={() => setShowDeleteConfirm(room.id)}>
                      <Ionicons name="trash-outline" size={14} color={H.red} /><Text style={[s.smBtnText, { color: H.red }]}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ═══ ORDER INTAKE ═══ */}
        {tab === 'Order Intake' && (
          <>
            <Text style={s.sectionTitle}>📋 Active Booking Orders</Text>
            {orders.map(order => (
              <View key={order.id} style={s.orderCard}>
                <View style={s.orderTop}>
                  <View>
                    <Text style={s.orderGuest}>{order.customerName}</Text>
                    <Text style={s.orderMeta}>{order.location} · {order.scheduledTime}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: order.status === 'pending' ? '#FEF3C7' : order.status === 'accepted' ? '#DBEAFE' : order.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9' }]}>
                    <Text style={[s.statusText, { color: order.status === 'pending' ? '#B45309' : order.status === 'accepted' ? '#1D4ED8' : order.status === 'in-progress' ? '#059669' : '#64748B' }]}>{order.status}</Text>
                  </View>
                </View>
                <Text style={s.orderTotal}>{formatDZD(order.priceDZD)}</Text>
                {order.metadata?.addons && order.metadata.addons.length > 0 && (
                  <View style={s.addonList}>{(order.metadata.addons as any[]).map((a: any, i: number) => <Text key={i} style={s.addonItem}>+ {a.name} ({formatDZD(a.price)})</Text>)}</View>
                )}
                <View style={s.orderActions}>
                  {order.status === 'pending' && <Pressable style={s.actionBtn} onPress={() => advanceOrder(order.id)}><Ionicons name="checkmark-circle" size={16} color="#fff" /><Text style={s.actionBtnText}>Confirm</Text></Pressable>}
                  {order.status === 'accepted' && <Pressable style={s.actionBtn} onPress={() => advanceOrder(order.id)}><Ionicons name="enter-outline" size={16} color="#fff" /><Text style={s.actionBtnText}>Check-In</Text></Pressable>}
                  {order.status === 'in-progress' && <Pressable style={[s.actionBtn, { backgroundColor: H.green }]} onPress={() => advanceOrder(order.id)}><Ionicons name="cash-outline" size={16} color="#fff" /><Text style={s.actionBtnText}>Check-Out</Text></Pressable>}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <Pressable style={[s.actionBtn, { backgroundColor: '#6366F1' }]} onPress={() => { setShowAddon(order); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                      <Ionicons name="add-circle-outline" size={16} color="#fff" /><Text style={s.actionBtnText}>Addon</Text>
                    </Pressable>
                  )}
                  <Pressable style={[s.actionBtn, { backgroundColor: H.red }]} onPress={() => setShowDeleteOrder(order.id)}>
                    <Ionicons name="trash-outline" size={16} color="#fff" /><Text style={s.actionBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ═══ YIELD ENGINE ═══ */}
        {tab === 'Yield Engine' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>📢 Promotional Campaigns</Text>
              <Pressable style={s.addBtn} onPress={() => { setShowCampaign(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={s.addBtnText}>New Campaign</Text>
              </Pressable>
            </View>
            {campaigns.map(c => (
              <View key={c.id} style={s.campaignCard}>
                <View style={s.campaignTop}>
                  <Text style={s.campaignCode}>{c.code}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Pressable onPress={() => { setEditCampaign(c); setShowCampaign(true); }}>
                      <Ionicons name="create-outline" size={18} color="#64748B" />
                    </Pressable>
                    <Pressable onPress={() => toggleCampaign(c.id)}>
                      <View style={[s.toggle, c.active && { backgroundColor: H.green }]}>
                        <View style={[s.toggleKnob, c.active && { alignSelf: 'flex-end' }]} />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => setShowDeleteCampaign(c.id)}>
                      <Ionicons name="trash-outline" size={18} color={H.red} />
                    </Pressable>
                  </View>
                </View>
                <Text style={s.campaignMeta}>{c.discountPct}% off · Min {c.minNights} night{c.minNights > 1 ? 's' : ''}</Text>
                <Text style={[s.campaignStatus, { color: c.active ? H.green : '#94A3B8' }]}>{c.active ? '● Live' : '○ Draft'}</Text>
              </View>
            ))}
          </>
        )}

        {/* ═══ HOUSEKEEPING ═══ */}
        {tab === 'Housekeeping' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>🧹 Housekeeping Tasks</Text>
              <Pressable style={s.addBtn} onPress={() => { setEditHkTask({ id: '', room: '', task: '', assignee: '', status: 'pending' }); setShowCampaign(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={s.addBtnText}>Add Task</Text>
              </Pressable>
            </View>
            {hkTasks.map(task => (
              <View key={task.id} style={s.hkCard}>
                <View style={[s.hkStripe, { backgroundColor: task.status === 'done' ? H.green : task.status === 'inprogress' ? H.amber : '#CBD5E1' }]} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.hkRoom}>Room {task.room}</Text>
                  <Text style={s.hkTask}>{task.task}</Text>
                  <Text style={s.hkAssignee}>👤 {task.assignee}</Text>
                </View>
                <Pressable onPress={() => advanceHk(task.id)} style={[s.hkStatusBtn, { backgroundColor: task.status === 'pending' ? '#FEF3C7' : task.status === 'inprogress' ? '#DBEAFE' : '#D1FAE5' }]}>
                  <Text style={{ fontSize: 10, fontFamily: 'mon-sb', color: task.status === 'pending' ? '#B45309' : task.status === 'inprogress' ? '#1D4ED8' : '#059669' }}>
                    {task.status === 'inprogress' ? 'Done' : task.status === 'pending' ? 'Start' : '✓'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setShowDeleteHk(task.id)} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={16} color={H.red} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Add Room Modal ── */}
      <Modal visible={showAddRoom} transparent animationType="fade" onRequestClose={() => setShowAddRoom(false)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Room Type</Text>
            <TextInput style={s.input} placeholder="Room Number (e.g. 101)" placeholderTextColor="#94A3B8" value={newRoomNum} onChangeText={setNewRoomNum} />
            <TextInput style={s.input} placeholder="Room Type (e.g. Deluxe Suite)" placeholderTextColor="#94A3B8" value={newRoomType} onChangeText={setNewRoomType} />
            <TextInput style={s.input} placeholder="Price per night (DZD)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newRoomPrice} onChangeText={setNewRoomPrice} />
            <TextInput style={s.input} placeholder="Capacity (pax)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newRoomCap} onChangeText={setNewRoomCap} />
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddRoom(false)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.brand }]} onPress={handleAddRoom}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Add Room</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Price Modal ── */}
      <Modal visible={!!editRoom} transparent animationType="fade" onRequestClose={() => setEditRoom(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Edit Price — Room {editRoom?.fields?.number || ''}</Text>
            <TextInput style={s.input} placeholder="New price (DZD)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={editPriceValue} onChangeText={setEditPriceValue} />
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditRoom(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.brand }]} onPress={handleEditRoom}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Update Price</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Room Confirm ── */}
      <Modal visible={!!showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Delete Room?</Text>
            <Text style={s.modalSub}>This will permanently remove this room from your inventory.</Text>
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteConfirm(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.red }]} onPress={() => showDeleteConfirm && handleDeleteRoom(showDeleteConfirm)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Addon Modal ── */}
      <Modal visible={!!showAddon} transparent animationType="fade" onRequestClose={() => setShowAddon(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Cross-Sell Addon Service</Text>
            <Text style={s.modalSub}>Add a local vendor activity to this booking ledger.</Text>
            <TextInput style={s.input} placeholder="Service name" placeholderTextColor="#94A3B8" value={newAddonName} onChangeText={setNewAddonName} />
            <TextInput style={s.input} placeholder="Price (DZD)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newAddonPrice} onChangeText={setNewAddonPrice} />
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddon(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.brand }]} onPress={() => showAddon && addAddonToOrder(showAddon.id)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Add to Ledger</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Order Confirm ── */}
      <Modal visible={!!showDeleteOrder} transparent animationType="fade" onRequestClose={() => setShowDeleteOrder(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Delete Order?</Text>
            <Text style={s.modalSub}>This will permanently remove this booking order.</Text>
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteOrder(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.red }]} onPress={() => showDeleteOrder && handleDeleteOrder(showDeleteOrder)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Campaign Modal (Add/Edit) ── */}
      <Modal visible={showCampaign} transparent animationType="fade" onRequestClose={() => setShowCampaign(false)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>{editCampaign ? 'Edit Campaign' : 'Create Yield Campaign'}</Text>
            <TextInput style={s.input} placeholder="Promo Code (e.g. SUMMER25)" placeholderTextColor="#94A3B8" />
            <TextInput style={s.input} placeholder="Discount %" placeholderTextColor="#94A3B8" keyboardType="numeric" />
            <TextInput style={s.input} placeholder="Min nights stay" placeholderTextColor="#94A3B8" keyboardType="numeric" />
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => { setShowCampaign(false); setEditCampaign(null); }}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.brand }]} onPress={() => { addCampaign(); setEditCampaign(null); }}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>{editCampaign ? 'Save' : 'Launch'}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Campaign Confirm ── */}
      <Modal visible={!!showDeleteCampaign} transparent animationType="fade" onRequestClose={() => setShowDeleteCampaign(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Delete Campaign?</Text>
            <Text style={s.modalSub}>This will permanently remove this promotional campaign.</Text>
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteCampaign(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.red }]} onPress={() => showDeleteCampaign && handleDeleteCampaign(showDeleteCampaign)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete HK Task Confirm ── */}
      <Modal visible={!!showDeleteHk} transparent animationType="fade" onRequestClose={() => setShowDeleteHk(null)}>
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Delete Task?</Text>
            <Text style={s.modalSub}>Remove this housekeeping task from the list.</Text>
            <View style={s.modalActions}>
              <Pressable style={[s.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteHk(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[s.modalBtn, { backgroundColor: H.red }]} onPress={() => showDeleteHk && handleDeleteHk(showDeleteHk)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={s.heroStat}><Text style={[s.heroStatVal, { color }]}>{value}</Text><Text style={s.heroStatLbl}>{label}</Text></View>;
}
function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return <View style={s.qStat}><Ionicons name={icon as any} size={16} color={color} /><Text style={s.qVal}>{value}</Text><Text style={s.qLbl}>{label}</Text></View>;
}

const s = StyleSheet.create({
  root: {}, kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabContent: { gap: 8, paddingRight: 8, paddingVertical: 4 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },
  content: { gap: 14, paddingBottom: 48 },

  heroCard: { backgroundColor: H.brandLt, borderRadius: 20, padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10, gap: 0, marginTop: 4 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 14, fontFamily: 'mon-b' }, heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280', textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: H.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },

  roomCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  roomTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomNumber: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  roomType: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  roomPrice: { fontSize: 14, fontFamily: 'mon-b', color: H.brand },
  roomGuest: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  roomActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  smBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' },
  smBtnText: { fontSize: 10, fontFamily: 'mon-sb', color: '#64748B' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },

  orderCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderGuest: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  orderMeta: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  orderTotal: { fontSize: 14, fontFamily: 'mon-b', color: H.brand },
  addonList: { gap: 2, paddingLeft: 8 },
  addonItem: { fontSize: 11, fontFamily: 'mon', color: '#6366F1' },
  orderActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: H.brand, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },

  campaignCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  campaignTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  campaignCode: { fontSize: 18, fontFamily: 'mon-b', color: H.brand, letterSpacing: 1 },
  campaignMeta: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  campaignStatus: { fontSize: 12, fontFamily: 'mon-sb' },
  toggle: { width: 40, height: 22, borderRadius: 11, backgroundColor: '#CBD5E1', padding: 2, justifyContent: 'center' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },

  hkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  hkStripe: { width: 5, alignSelf: 'stretch' },
  hkRoom: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' },
  hkTask: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280', marginTop: 1 },
  hkAssignee: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  hkStatusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 10 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
