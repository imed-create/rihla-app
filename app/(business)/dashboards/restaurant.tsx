/**
 * RIHLA — Enterprise Restaurant Engine
 * ───────────────────────────────────────
 * Tabs: [Overview] [Live KOT Pipeline] [Menu Manager] [Table Management]
 * Store-backed CRUD: menu → useBusinessAssets, KOTs → usePartnerDispatches.
 * Full edit/delete modals on every item.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import type { BusinessAsset } from '@/store/useBusinessAssets';
import type { PartnerDispatch } from '@/store/usePartnerDispatches';

const R = { brand: '#C56A39', brandLt: '#FEF3E8', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

interface Table { id: string; number: string; capacity: number; status: 'available' | 'eating' | 'reserved'; guest?: string; }

export default function RestaurantDashboard() {
  const [tab, setTab] = useState<'Overview' | 'Live KOT Pipeline' | 'Menu Manager' | 'Table Management'>('Overview');
  const { assets, addAsset, updateAsset, removeAsset } = useBusinessAssets();
  const { dispatches, addDispatch, updateDispatch, removeDispatch, acceptDispatch, completeDispatch } = usePartnerDispatches();

  // ── Local state for Tables ──
  const [tables, setTables] = useState<Table[]>([
    { id: 't1', number: 'T1', capacity: 2, status: 'available' },
    { id: 't2', number: 'T2', capacity: 4, status: 'eating', guest: 'Karim F.' },
    { id: 't3', number: 'T3', capacity: 4, status: 'reserved' },
    { id: 't4', number: 'T4', capacity: 6, status: 'eating', guest: 'Nadia S.' },
    { id: 't5', number: 'T5', capacity: 2, status: 'available' },
    { id: 't6', number: 'T6', capacity: 8, status: 'available' },
    { id: 't7', number: 'T7', capacity: 4, status: 'eating', guest: 'Amir T.' },
  ]);

  // ── Modals ──
  const [showAddDish, setShowAddDish] = useState(false);
  const [editDish, setEditDish] = useState<BusinessAsset | null>(null);
  const [showDeleteDish, setShowDeleteDish] = useState<string | null>(null);
  const [showDeleteKot, setShowDeleteKot] = useState<string | null>(null);
  const [newDish, setNewDish] = useState({ name: '', category: 'Plats', priceDZD: '', prepTime: '15', description: '' });

  // ── Derived ──
  const menu = assets.filter(a => a.businessType === 'restaurant' && a.assetKind === 'menu-item');
  const kots = dispatches.filter(d => d.jobType === 'kot');
  const todayRevenue = kots.filter(k => k.status === 'completed').reduce((s, k) => s + k.priceDZD, 0);
  const avgSpeed = 15;
  const topDish = menu.reduce((best, m) => kots.filter(k => (k.metadata?.items as any[])?.some((i: any) => i.name === m.name)).length > 0 ? m : best, menu[0]);

  // ── Menu CRUD (store-backed) ──
  const handleAddDish = useCallback(() => {
    if (!newDish.name) return;
    addAsset({
      businessType: 'restaurant', assetKind: 'menu-item', name: newDish.name,
      priceDZD: parseInt(newDish.priceDZD) || 0, available: true,
      fields: { category: newDish.category || 'Plats', prepTime: parseInt(newDish.prepTime) || 15, description: newDish.description },
    });
    setNewDish({ name: '', category: 'Plats', priceDZD: '', prepTime: '15', description: '' });
    setShowAddDish(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addAsset, newDish]);

  const handleEditDish = useCallback(() => {
    if (!editDish) return;
    updateAsset(editDish.id, {
      name: newDish.name || editDish.name,
      priceDZD: parseInt(newDish.priceDZD) || editDish.priceDZD,
      fields: { ...editDish.fields, category: newDish.category || editDish.fields?.category || 'Plats', prepTime: parseInt(newDish.prepTime) || editDish.fields?.prepTime || 15, description: newDish.description || editDish.fields?.description || '' },
    });
    setEditDish(null);
    setNewDish({ name: '', category: 'Plats', priceDZD: '', prepTime: '15', description: '' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editDish, updateAsset, newDish]);

  const handleDeleteDish = useCallback((id: string) => {
    removeAsset(id);
    setShowDeleteDish(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeAsset]);

  const toggleStock = useCallback((id: string) => {
    const item = assets.find(a => a.id === id);
    if (item) updateAsset(id, { available: !item.available });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [assets, updateAsset]);

  // ── KOT CRUD (store-backed) ──
  const advanceKot = useCallback((id: string) => {
    const statusMap: Record<string, string> = { pending: 'accepted', accepted: 'in-progress', 'in-progress': 'completed' };
    const kot = dispatches.find(d => d.id === id);
    const nextStatus = kot ? statusMap[kot.status] : undefined;
    if (nextStatus === 'completed') completeDispatch(id);
    else if (nextStatus) updateDispatch(id, { status: nextStatus as any });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [dispatches, updateDispatch, completeDispatch]);

  const handleDeleteKot = useCallback((id: string) => {
    removeDispatch(id);
    setShowDeleteKot(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [removeDispatch]);

  // ── Table CRUD (local) ──
  const toggleTableStatus = useCallback((id: string) => {
    setTables(p => p.map(t => {
      if (t.id !== id) return t;
      const nxt = { available: 'eating' as const, eating: 'available' as const, reserved: 'available' as const };
      return { ...t, status: nxt[t.status], guest: undefined };
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  const TABS = ['Overview', 'Live KOT Pipeline', 'Menu Manager', 'Table Management'];

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: R.brandLt }]}><Text style={[styles.kpiVal, { color: R.brand }]}>{tables.filter(t => t.status === 'eating').length}</Text><Text style={styles.kpiLbl}>Diners</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: R.green }]}>{(todayRevenue / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: R.blue }]}>{avgSpeed}min</Text><Text style={styles.kpiLbl}>Avg Speed</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFF7ED' }]}><Text style={[styles.kpiVal, { color: R.brand }]}>{topDish ? topDish.name.slice(0, 6) : '—'}</Text><Text style={styles.kpiLbl}>Top Dish</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: R.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>🍽 Restaurant Operational Overview</Text>
              <Text style={styles.heroSub}>{tables.filter(t => t.status === 'eating').length} active covers · {kots.filter(k => k.status === 'pending' || k.status === 'accepted').length} orders in progress</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Active Diners" value={String(tables.filter(t => t.status === 'eating').length)} color={R.brand} />
                <HeroStat label="Revenue Today" value={`${(todayRevenue / 1000).toFixed(0)}K DZD`} color={R.green} />
                <HeroStat label="Avg. Speed" value={`${avgSpeed} min`} color={R.blue} />
                <HeroStat label="Top Dish" value={topDish ? topDish.name.slice(0, 10) : '—'} color={R.amber} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="restaurant-outline" value={String(menu.length)} label="Menu Items" color={R.brand} />
              <QuickStat icon="receipt-outline" value={String(kots.length)} label="Open KOTs" color={R.amber} />
              <QuickStat icon="grid-outline" value={String(tables.length)} label="Tables" color={R.blue} />
              <QuickStat icon="close-circle-outline" value={String(menu.filter(m => !m.available).length)} label="Out of Stock" color={R.red} />
            </View>
          </>
        )}

        {tab === 'Live KOT Pipeline' && (
          <>
            <Text style={styles.sectionTitle}>🧾 Kitchen Order Tickets</Text>
            {kots.map(kot => (
              <View key={kot.id} style={styles.kotCard}>
                <View style={styles.kotTop}>
                  <Text style={styles.kotTable}>{kot.location} · {kot.scheduledTime}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, { backgroundColor: kot.status === 'pending' ? '#FEF3C7' : kot.status === 'accepted' ? '#DBEAFE' : kot.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9' }]}>
                      <Text style={{ fontSize: 10, fontFamily: 'mon-sb', color: kot.status === 'pending' ? '#B45309' : kot.status === 'accepted' ? '#1D4ED8' : kot.status === 'in-progress' ? '#059669' : '#64748B' }}>{kot.status.toUpperCase()}</Text>
                    </View>
                    <Pressable onPress={() => setShowDeleteKot(kot.id)}>
                      <Ionicons name="trash-outline" size={16} color={R.red} />
                    </Pressable>
                  </View>
                </View>
                {kot.metadata?.items && (kot.metadata.items as any[]).map((item: any, i: number) => (
                  <View key={i} style={styles.kotItem}>
                    <Text style={styles.kotItemName}>{item.name}</Text>
                    {item.mods && <Text style={styles.kotItemMod}>📝 {item.mods}</Text>}
                  </View>
                ))}
                <Text style={styles.kotTotal}>{formatDZD(kot.priceDZD)}</Text>
                <View style={styles.kotActions}>
                  {kot.status === 'pending' && <ActionBtn label="Accept Order" color={R.green} onPress={() => advanceKot(kot.id)} />}
                  {kot.status === 'accepted' && <ActionBtn label="Fire to Kitchen" color={R.blue} onPress={() => advanceKot(kot.id)} />}
                  {kot.status === 'in-progress' && <ActionBtn label="Ready for Server" color={R.brand} onPress={() => advanceKot(kot.id)} />}
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Menu Manager' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Menu Catalog — {menu.length} items</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddDish(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Dish</Text>
              </Pressable>
            </View>
            {['Entrées', 'Plats', 'Desserts', 'Boissons'].map(cat => (
              <View key={cat}>
                <Text style={styles.catLabel}>{cat}</Text>
                {menu.filter(m => m.fields?.category === cat).map(item => (
                  <View key={item.id} style={styles.menuCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.fields?.description || ''} · {item.fields?.prepTime || 0}min prep</Text>
                    </View>
                    <Text style={styles.menuPrice}>{formatDZD(item.priceDZD)}</Text>
                    <Pressable onPress={() => toggleStock(item.id)} style={[styles.stockBtn, { backgroundColor: item.available ? '#D1FAE5' : '#FEE2E2' }]}>
                      <Text style={{ fontSize: 10, fontFamily: 'mon-sb', color: item.available ? '#059669' : '#DC2626' }}>{item.available ? 'In' : 'Out'}</Text>
                    </Pressable>
                    <Pressable onPress={() => { setEditDish(item); setNewDish({ name: item.name, category: item.fields?.category || 'Plats', priceDZD: String(item.priceDZD), prepTime: String(item.fields?.prepTime || 15), description: item.fields?.description || '' }); Haptics.selectionAsync(); }}>
                      <Ionicons name="create-outline" size={16} color="#64748B" />
                    </Pressable>
                    <Pressable onPress={() => setShowDeleteDish(item.id)}>
                      <Ionicons name="trash-outline" size={16} color={R.red} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {tab === 'Table Management' && (
          <>
            <Text style={styles.sectionTitle}>🪑 Floor Layout — {tables.length} tables</Text>
            <View style={styles.legend}>
              <LegendDot color="#10B981" label="Available" />
              <LegendDot color="#EF4444" label="Eating" />
              <LegendDot color="#3B82F6" label="Reserved" />
            </View>
            <View style={styles.tableGrid}>
              {tables.map(table => (
                <Pressable key={table.id} onPress={() => toggleTableStatus(table.id)}
                  style={[styles.tableCell, { backgroundColor: table.status === 'available' ? '#F0FDF4' : table.status === 'eating' ? '#FEF2F2' : '#EFF6FF', borderColor: table.status === 'available' ? '#86EFAC' : table.status === 'eating' ? '#FCA5A5' : '#93C5FD' }]}>
                  <Text style={styles.tableNum}>{table.number}</Text>
                  <Text style={styles.tableCap}>{table.capacity} pax</Text>
                  {table.guest && <Text style={styles.tableGuest} numberOfLines={1}>{table.guest}</Text>}
                  <View style={[styles.tableStatusDot, { backgroundColor: table.status === 'available' ? '#10B981' : table.status === 'eating' ? '#EF4444' : '#3B82F6' }]} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Add/Edit Dish Modal ── */}
      <Modal visible={showAddDish || !!editDish} transparent animationType="fade" onRequestClose={() => { setShowAddDish(false); setEditDish(null); }}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editDish ? 'Edit Dish' : 'Add Menu Dish'}</Text>
            <TextInput style={styles.input} placeholder="Dish name" placeholderTextColor="#94A3B8" value={newDish.name} onChangeText={(t) => setNewDish(p => ({ ...p, name: t }))} />
            <TextInput style={styles.input} placeholder="Category" placeholderTextColor="#94A3B8" value={newDish.category} onChangeText={(t) => setNewDish(p => ({ ...p, category: t }))} />
            <TextInput style={styles.input} placeholder="Price (DZD)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newDish.priceDZD} onChangeText={(t) => setNewDish(p => ({ ...p, priceDZD: t }))} />
            <TextInput style={styles.input} placeholder="Prep time (min)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newDish.prepTime} onChangeText={(t) => setNewDish(p => ({ ...p, prepTime: t }))} />
            <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#94A3B8" value={newDish.description} onChangeText={(t) => setNewDish(p => ({ ...p, description: t }))} />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => { setShowAddDish(false); setEditDish(null); setNewDish({ name: '', category: 'Plats', priceDZD: '', prepTime: '15', description: '' }); }}>
                <Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: R.brand }]} onPress={() => { editDish ? handleEditDish() : handleAddDish(); }}>
                <Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>{editDish ? 'Save' : 'Add Dish'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Dish Confirm ── */}
      <Modal visible={!!showDeleteDish} transparent animationType="fade" onRequestClose={() => setShowDeleteDish(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Menu Item?</Text>
            <Text style={styles.modalSub}>This will permanently remove this dish from your menu.</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteDish(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: R.red }]} onPress={() => showDeleteDish && handleDeleteDish(showDeleteDish)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete KOT Confirm ── */}
      <Modal visible={!!showDeleteKot} transparent animationType="fade" onRequestClose={() => setShowDeleteKot(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancel KOT?</Text>
            <Text style={styles.modalSub}>This will remove this kitchen order ticket.</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteKot(null)}><Text style={{ fontFamily: 'mon-sb', color: '#64748B' }}>Cancel</Text></Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: R.red }]} onPress={() => showDeleteKot && handleDeleteKot(showDeleteKot)}><Text style={{ fontFamily: 'mon-sb', color: '#fff' }}>Delete</Text></Pressable>
            </View>
          </View>
        </View>
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
function ActionBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return <Pressable style={[styles.actionBtn, { backgroundColor: color }]} onPress={onPress}><Text style={styles.actionBtnText}>{label}</Text></Pressable>;
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /><Text style={{ fontSize: 10, fontFamily: 'mon', color: '#6B7280' }}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: {}, kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabContent: { gap: 8, paddingRight: 8, paddingVertical: 4 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },
  content: { gap: 14, paddingBottom: 48 },

  heroCard: { backgroundColor: R.brandLt, borderRadius: 20, padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 14, fontFamily: 'mon-b' }, heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: R.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  catLabel: { fontSize: 13, fontFamily: 'mon-b', color: R.brand, marginTop: 8, marginBottom: 4 },

  menuCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  menuName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' },
  menuDesc: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 1 },
  menuPrice: { fontSize: 13, fontFamily: 'mon-b', color: R.brand },
  stockBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },

  kotCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  kotTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kotTable: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  kotItem: { paddingLeft: 8 },
  kotItemName: { fontSize: 13, fontFamily: 'mon-sb', color: '#374151' },
  kotItemMod: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', fontStyle: 'italic' },
  kotTotal: { fontSize: 14, fontFamily: 'mon-b', color: R.brand },
  kotActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  legend: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tableCell: { width: '29%', borderRadius: 14, borderWidth: 2, padding: 12, alignItems: 'center', gap: 4 },
  tableNum: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  tableCap: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  tableGuest: { fontSize: 9, fontFamily: 'mon', color: '#64748B', textAlign: 'center' },
  tableStatusDot: { width: 8, height: 8, borderRadius: 4 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
