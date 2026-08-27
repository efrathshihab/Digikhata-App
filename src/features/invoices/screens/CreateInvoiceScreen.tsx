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

interface InvoiceItem {
  id: string;
  name: string;
  qty: string;
  price: string;
}

const emptyItem = (): InvoiceItem => ({
  id: Date.now().toString(),
  name: '',
  qty: '1',
  price: '',
});

export const CreateInvoiceScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState('');
  const [transport, setTransport] = useState('');
  const [paid, setPaid] = useState('');
  const [note, setNote] = useState('');

  const updateItem = (id: string, key: keyof InvoiceItem, value: string) => {
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
    if (!customerName.trim()) {
      Alert.alert('সতর্কতা', 'গ্রাহকের নাম আবশ্যক।');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert('সফল', 'ইনভয়েস তৈরি হয়েছে!', [
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
        <Text style={styles.headerTitle}>নতুন ইনভয়েস</Text>
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
          {/* Customer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>গ্রাহক নির্বাচন</Text>
            <View style={styles.fields}>
              <AppInput
                label="গ্রাহকের নাম *"
                placeholder="নাম লিখুন বা নির্বাচন করুন"
                value={customerName}
                onChangeText={setCustomerName}
                leftIcon={<Feather name="user" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="ফোন নম্বর"
                placeholder="01XXXXXXXXX"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                leftIcon={<Feather name="phone" size={16} color={colors.textMuted} />}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পণ্য / সেবা</Text>
            <View style={styles.fields}>
              {items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemIndex}>#{index + 1}</Text>
                    {items.length > 1 && (
                      <TouchableOpacity onPress={() => removeItem(item.id)} activeOpacity={0.7}>
                        <Feather name="trash-2" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <AppInput
                    label="পণ্যের নাম"
                    placeholder="পণ্য বা সেবার নাম"
                    value={item.name}
                    onChangeText={(v) => updateItem(item.id, 'name', v)}
                  />
                  <View style={styles.priceRow}>
                    <View style={styles.priceField}>
                      <AppInput
                        label="পরিমাণ"
                        placeholder="১"
                        value={item.qty}
                        onChangeText={(v) => updateItem(item.id, 'qty', v)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.priceField}>
                      <AppInput
                        label="একক মূল্য (৳)"
                        placeholder="০"
                        value={item.price}
                        onChangeText={(v) => updateItem(item.id, 'price', v)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.priceField}>
                      <Text style={styles.subLabel}>মোট</Text>
                      <View style={styles.totalDisplay}>
                        <Text style={styles.totalValue}>
                          ৳ {((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={addItem} activeOpacity={0.7} style={styles.addItemBtn}>
                <Feather name="plus" size={16} color={colors.primary} />
                <Text style={styles.addItemLabel}>পণ্য যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calculation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>হিসাব</Text>
            <View style={styles.fields}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>সাবটোটাল</Text>
                <Text style={styles.calcValue}>৳ {subtotal.toLocaleString()}</Text>
              </View>

              <AppInput
                label="ছাড় (৳)"
                placeholder="০"
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                leftIcon={<Feather name="tag" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="পরিবহন / ডেলিভারি (৳)"
                placeholder="০"
                value={transport}
                onChangeText={setTransport}
                keyboardType="numeric"
                leftIcon={<Feather name="truck" size={16} color={colors.textMuted} />}
              />

              <View style={[styles.calcRow, styles.grandTotalRow]}>
                <Text style={styles.grandLabel}>মোট</Text>
                <Text style={styles.grandValue}>৳ {grandTotal.toLocaleString()}</Text>
              </View>

              <AppInput
                label="অগ্রিম পরিশোধ (৳)"
                placeholder="০"
                value={paid}
                onChangeText={setPaid}
                keyboardType="numeric"
                leftIcon={<Text style={styles.tkSign}>৳</Text>}
              />

              <View style={[styles.calcRow, styles.dueRow]}>
                <Text style={styles.dueLabel}>বকেয়া</Text>
                <Text style={styles.dueValue}>৳ {dueAmt.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <AppInput
              label="নোট / মন্তব্য"
              placeholder="যেকোনো অতিরিক্ত তথ্য..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={styles.submitWrap}>
          <AppButton
            title="ইনভয়েস তৈরি করুন"
            onPress={handleSubmit}
            loading={loading}
            icon={<Feather name="file-plus" size={16} color={colors.surface} />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerRight: { width: 36 },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 16, paddingBottom: 20 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fields: { gap: 14 },
  itemRow: { gap: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemIndex: { fontSize: 13, fontWeight: '700', color: colors.primary },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceField: { flex: 1 },
  subLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  totalDisplay: {
    height: theme.sizes.inputHeight,
    backgroundColor: colors.background,
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    backgroundColor: colors.primarySoft,
  },
  addItemLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontSize: 14, color: colors.textSecondary },
  calcValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  grandTotalRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    marginTop: 4,
  },
  grandLabel: { fontSize: 15, fontWeight: '700', color: colors.primary },
  grandValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  dueRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
  },
  dueLabel: { fontSize: 15, fontWeight: '700', color: colors.danger },
  dueValue: { fontSize: 18, fontWeight: '700', color: colors.danger },
  tkSign: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },
  submitWrap: {
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
