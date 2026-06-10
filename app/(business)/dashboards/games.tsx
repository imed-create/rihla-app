/**
 * RIHLA — Games & Gear Rental Concession
 * ──────────────────────────────────────────
 * Tabs: Overview · Inventory CRUD · Overdue Tracking
 * Store-backed CRUD: inventory → useAssetInventory.
 * Full edit/delete on all items with persisted storage.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAssetInventory } from '@/store/useAssetInventory';
import type { InventoryItem } from '@/store/useAssetInventory';

const G = { brand: '#F97316', brandLt: '#FFF7ED', green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6' };

export default function GamesDashboard() {
  const { items, addItem, updateItem, removeItem, toggleStatus, rentItem, returnItem } = useAssetInventory();
  const [tab, setTab] = useState<'Overview' | 'Inventory CRUD' | 'Overdue Tracking'>('Overview');

  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showDeleteItem, setShowDeleteItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', qty: '1', price: '500', deposit: '1000' });
  const [editPriceVal, setEditPriceVal] = useState('');

  const [overdueItems] = useState<{ id: string; name: string; customer: string; dueTime: string; itemId: string }[]>([
    { id: 'od1', name: 'PlayStation 5', customer: 'Amir K.', dueTime: '09:30', itemId: '' },
    { id: 'od2', name: 'Pool Table', customer: 'Rayan B.', dueTime: '10:00', itemId: '' },
  ]);

  const myItems = items.filter(i => i.businessType === 'games');
  const totalInventoryValue = myItems.reduce((s, i) => s + i.pricePerHourDZD * i.totalQuantity, 0);

  const handleAddItem = useCallback(() => {
    if (!newItem.name) return;
    addItem({ businessType: 'games', category: 'indoor', name: newItem.name, totalQuantity: parseInt(newItem.qty) || 1, rentedQuantity: 0, pricePerHourDZD: parseInt(newItem.price) || 500, depositDZD: parseInt(newItem.deposit) || 1000, status: 'available' });
    setNewItem({ name: '', qty: '1', price: '500', deposit: '1000' }); setShowAddItem(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addItem, newItem]);
  const handleEditItem = useCallback(() => {
    if (!editItem) return; const val = parseInt(editPriceVal);
    if (!isNaN(val) && val > 0) updateItem(editItem.id, { pricePerHourDZD: val });
    setEditItem(null); setEditPriceVal(''); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [editItem, editPriceVal, updateItem]);
  const handleDeleteItem = useCallback((id: string) => { removeItem(id); setShowDeleteItem(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, [removeItem]);
  const handleToggleStatus = useCallback((id: string, status: InventoryItem['status']) => { toggleStatus(id, status); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }, [toggleStatus]);
  const formatDZD = (v: number) => v.toLocaleString() + ' DZD';

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: G.brandLt }]}><Text style={[styles.kpiVal, { color: G.brand }]}>{myItems.length}</Text><Text style={styles.kpiLbl}>Items</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: G.green }]}>{myItems.filter(i => i.status === 'available' || i.rentedQuantity < i.totalQuantity).length}</Text><Text style={styles.kpiLbl}>Available</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.kpiVal, { color: G.blue }]}>{myItems.reduce((s, i) => s + i.rentedQuantity, 0)}</Text><Text style={styles.kpiLbl}>Rented</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: G.amber }]}>{overdueItems.length}</Text><Text style={styles.kpiLbl}>Overdue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {['Overview', 'Inventory CRUD', 'Overdue Tracking'].map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: G.brand }]} onPress={() => { Haptics.selectionAsync(); setTab(t as any); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: G.brandLt }]}>
              <Ionicons name="game-controller-outline" size={28} color={G.brand} />
              <Text style={styles.heroTitle}>🎮 Games & Gear Overview</Text>
              <Text style={styles.heroSub}>{myItems.reduce((s, i) => s + (i.totalQuantity - i.rentedQuantity), 0)} units available · {overdueItems.length} overdue</Text>
              <View style={styles.heroStats}>
                <HeroStat label="Inventory Value" value={`${(totalInventoryValue/1000).toFixed(0)}K DZD`} color={G.brand} />
                <HeroStat label="Units In Stock" value={String(myItems.reduce((s, i) => s + (i.totalQuantity - i.rentedQuantity), 0))} color={G.green} />
                <HeroStat label="Units Rented" value={String(myItems.reduce((s, i) => s + i.rentedQuantity, 0))} color={G.blue} />
                <HeroStat label="Overdue" value={String(overdueItems.length)} color={G.red} />
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="cube-outline" value={String(myItems.length)} label="Types" color={G.brand} />
              <QuickStat icon="checkmark-circle-outline" value={String(myItems.filter(i => i.rentedQuantity < i.totalQuantity).length)} label="In Stock" color={G.green} />
              <QuickStat icon="construct-outline" value={String(myItems.filter(i => i.status === 'maintenance').length)} label="Maint" color={G.amber} />
              <QuickStat icon="alert-circle-outline" value={String(overdueItems.length)} label="Overdue" color={G.red} />
            </View>
          </>
        )}

        {tab === 'Inventory CRUD' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 Inventory — {myItems.length} items</Text>
              <Pressable style={styles.addBtn} onPress={() => { setShowAddItem(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Item</Text>
              </Pressable>
            </View>
            {myItems.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#D1FAE5' : item.status === 'rented' ? '#FEE2E2' : item.status === 'maintenance' ? '#FEF3C7' : '#F1F5F9' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'available' ? '#059669' : item.status === 'rented' ? '#DC2626' : item.status === 'maintenance' ? '#B45309' : '#64748B' }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.itemMeta}>Qty: {item.totalQuantity} · Rented: {item.rentedQuantity} · Deposit: {formatDZD(item.depositDZD)}</Text>
                <Text style={styles.itemPrice}>{formatDZD(item.pricePerHourDZD)} / hr</Text>
                <View style={styles.itemActions}>
                  <Pressable style={styles.smBtn} onPress={() => { if (item.rentedQuantity < item.totalQuantity) { rentItem(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } }}>
                    <Ionicons name="arrow-up-circle-outline" size={14} color={G.brand} /><Text style={styles.smBtnText}>Rent Out</Text>
                  </Pressable>
                  <Pressable style={styles.smBtn} onPress={() => { if (item.rentedQuantity > 0) { returnItem(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } }}>
                    <Ionicons name="arrow-down-circle-outline" size={14} color={G.green} /><Text style={[styles.smBtnText, { color: G.green }]}>Return</Text>
                  </Pressable>
                  <Pressable style={styles.smBtn} onPress={() => handleToggleStatus(item.id, 'maintenance')}><Ionicons name="construct-outline" size={14} color={G.amber} /><Text style={[styles.smBtnText, { color: G.amber }]}>Maint</Text></Pressable>
                  <Pressable style={styles.smBtn} onPress={() => { setEditItem(item); setEditPriceVal(String(item.pricePerHourDZD)); }}><Ionicons name="pricetag-outline" size={14} color={G.brand} /><Text style={styles.smBtnText}>Edit Rate</Text></Pressable>
                  <Pressable style={[styles.smBtn, { borderColor: '#FECACA' }]} onPress={() => setShowDeleteItem(item.id)}><Ionicons name="trash-outline" size={14} color={G.red} /><Text style={[styles.smBtnText, { color: G.red }]}>Delete</Text></Pressable>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}><View style={[styles.progressFill, { width: `${Math.round((item.rentedQuantity / Math.max(item.totalQuantity, 1)) * 100)}%`, backgroundColor: G.brand }]} /></View>
                  <Text style={styles.progressText}>{item.rentedQuantity}/{item.totalQuantity}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Overdue Tracking' && (
          <>
            <Text style={styles.sectionTitle}>⚠️ Overdue Rentals ({overdueItems.length})</Text>
            {overdueItems.map(od => (
              <View key={od.id} style={styles.overdueCard}>
                <Ionicons name="alert-circle" size={22} color={G.red} />
                <View style={{ flex: 1 }}><Text style={styles.overdueName}>{od.name}</Text><Text style={styles.overdueMeta}>👤 {od.customer} · Due {od.dueTime}</Text></View>
                <View style={{ gap: 6 }}>
                  <Pressable style={[styles.overdueBtn, { backgroundColor: G.green }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
                    <Text style={{ fontSize: 10, fontFamily: 'mon-b', color: '#fff' }}>Returned</Text>
                  </Pressable>
                  <Pressable style={[styles.overdueBtn, { backgroundColor: G.red }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }}>
                    <Text style={{ fontSize: 10, fontFamily: 'mon-b', color: '#fff' }}>Forfeit</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddItem} transparent animationType="fade" onRequestClose={() => setShowAddItem(false)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Add Inventory Item</Text><TextInput style={styles.input} placeholder="Item name" value={newItem.name} onChangeText={t => setNewItem(p => ({ ...p, name: t }))} placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Quantity" value={newItem.qty} onChangeText={t => setNewItem(p => ({ ...p, qty: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Price per hour (DZD)" value={newItem.price} onChangeText={t => setNewItem(p => ({ ...p, price: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><TextInput style={styles.input} placeholder="Deposit (DZD)" value={newItem.deposit} onChangeText={t => setNewItem(p => ({ ...p, deposit: t }))} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowAddItem(false)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: G.brand }]} onPress={handleAddItem}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Add Item</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!editItem} transparent animationType="fade" onRequestClose={() => setEditItem(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Edit Rate — {editItem?.name}</Text><TextInput style={styles.input} placeholder="Price per hour (DZD)" value={editPriceVal} onChangeText={setEditPriceVal} keyboardType="numeric" placeholderTextColor="#94A3B8" /><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setEditItem(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: G.brand }]} onPress={handleEditItem}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Update</Text></Pressable></View></View></View>
      </Modal>
      <Modal visible={!!showDeleteItem} transparent animationType="fade" onRequestClose={() => setShowDeleteItem(null)}>
        <View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>Delete Inventory Item?</Text><Text style={styles.modalSub}>Remove this item permanently from inventory.</Text><View style={styles.modalActions}><Pressable style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setShowDeleteItem(null)}><Text>Cancel</Text></Pressable><Pressable style={[styles.modalBtn, { backgroundColor: G.red }]} onPress={() => showDeleteItem && handleDeleteItem(showDeleteItem)}><Text style={{ color: '#fff', fontFamily: 'mon-sb' }}>Delete</Text></Pressable></View></View></View>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: G.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, addBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: '#fff' },
  itemCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, itemName: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  itemMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' }, itemPrice: { fontSize: 14, fontFamily: 'mon-b', color: G.brand },
  itemActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }, smBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB' },
  smBtnText: { fontSize: 10, fontFamily: 'mon-sb', color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, statusText: { fontSize: 10, fontFamily: 'mon-b' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, progressBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' }, progressFill: { height: 6, borderRadius: 3 }, progressText: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  overdueCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', padding: 14 },
  overdueName: { fontSize: 14, fontFamily: 'mon-b', color: '#111827' }, overdueMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 1 }, overdueBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }, modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' }, modalSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontFamily: 'mon', fontSize: 13, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 }, modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
