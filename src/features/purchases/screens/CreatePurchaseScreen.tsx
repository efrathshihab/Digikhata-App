import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

interface PurchaseItem {
  id: string;
  name: string;
  qty: string;
  price: string;
}

const emptyItem = (): PurchaseItem => ({
  id: Date.now().toString(),
  name: '',
  qty: '1',
  price: '',
});

export const CreatePurchaseScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState('');
  const [transport, setTransport] = useState('');
  const [paid, setPaid] = useState('');
  const [note, setNote] = useState('');

  const updateItem = (id: string, key: keyof PurchaseItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmt = parseFloat(discount) || 0;
  const transportAmt = parseFloat(transport) || 0;
  const grandTotal = subtotal - discountAmt + transportAmt;
  const paidAmt = parseFloat(paid) || 0;
  const dueAmt = Math.max(0, grandTotal - paidAmt);

  const handleSubmit = async () => {
    if (!supplierName.trim()) {
      Alert.alert('সতর্কতা', 'সরবরাহকারীর নাম আবশ্যক।');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert('সফল', 'ক্রয় রেকর্ড তৈরি হয়েছে!', [
      { text: 'ঠিক আছে', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নতুন ক্রয়</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>সরবরাহকারী তথ্য</Text>
            <AppInput label="সরবরাহকারীর নাম *" placeholder="নাম লিখুন" value={supplierName} onChangeText={setSupplierName} />
            <AppInput label="ফোন নম্বর" placeholder="০১৭..." value={supplierPhone} onChangeText={setSupplierPhone} keyboardType="phone-pad" />
          </View>

          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <Text style={styles.sectionTitle}>পণ্যের বিবরণ</Text>
              <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
                <Feather name="plus" size={16} color={colors.primary} />
                <Text style={styles.addItemText}>আরও যোগ করুন</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemRowTop}>
                  <Text style={styles.itemIndex}>{index + 1}.</Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <AppInput label="পণ্যের নাম" placeholder="পণ্য নির্বাচন করুন বা লিখুন" value={item.name} onChangeText={(val) => updateItem(item.id, 'name', val)} />
                <View style={styles.qtyPriceRow}>
                  <View style={styles.flex}>
                    <AppInput label="পরিমাণ" placeholder="০" value={item.qty} onChangeText={(val) => updateItem(item.id, 'qty', val)} keyboardType="numeric" />
                  </View>
                  <View style={styles.flex}>
                    <AppInput label="দর (৳)" placeholder="০" value={item.price} onChangeText={(val) => updateItem(item.id, 'price', val)} keyboardType="numeric" />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>হিসাব ও পেমেন্ট</Text>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>মোট বিল:</Text>
              <Text style={styles.calcValue}>৳ {subtotal.toLocaleString()}</Text>
            </View>
            <AppInput label="ছাড় (৳)" placeholder="০" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
            <AppInput label="পরিবহন খরচ (৳)" placeholder="০" value={transport} onChangeText={setTransport} keyboardType="numeric" />
            
            <View style={[styles.calcRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>সর্বমোট:</Text>
              <Text style={styles.grandTotalValue}>৳ {grandTotal.toLocaleString()}</Text>
            </View>

            <AppInput label="জমা / পেমেন্ট (৳)" placeholder="০" value={paid} onChangeText={setPaid} keyboardType="numeric" />
            
            <View style={[styles.calcRow, styles.dueRow]}>
              <Text style={styles.dueLabel}>বকেয়া:</Text>
              <Text style={styles.dueValue}>৳ {dueAmt.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <AppInput label="নোট (ঐচ্ছিক)" placeholder="অতিরিক্ত তথ্য..." value={note} onChangeText={setNote} multiline numberOfLines={3} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AppButton title="ক্রয় রেকর্ড সেভ করুন" onPress={handleSubmit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerRight: { width: 36 },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 14, paddingBottom: 20 },
  section: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card, padding: theme.spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 12, ...theme.shadows.card,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primarySoft, borderRadius: 8 },
  addItemText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  itemRow: { gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemIndex: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  removeBtn: { padding: 4 },
  qtyPriceRow: { flexDirection: 'row', gap: 10 },
  calcRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  calcLabel: { fontSize: 14, color: colors.textSecondary },
  calcValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  grandTotalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  grandTotalValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  dueRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  dueLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  dueValue: { fontSize: 16, fontWeight: '700', color: colors.danger },
  footer: { padding: theme.spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
