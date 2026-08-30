import React, { useState, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '@/api/purchases.api';
import { customersApi } from '@/api/customers.api';

interface InvoiceItem {
  id: string;
  name: string;
  qty: string;
  price: string;
}

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  items?: Record<string, { name?: string; qty?: string; price?: string }>;
  discount?: string;
  transport?: string;
  paid?: string;
}

const emptyItem = (): InvoiceItem => ({
  id: Date.now().toString(),
  name: '',
  qty: '1',
  price: '',
});

export const CreateInvoiceScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customerId: paramCustomerId, name, phone } = useLocalSearchParams<{ customerId?: string; name?: string; phone?: string }>();
  
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(name ?? '');
  const [customerPhone, setCustomerPhone] = useState(phone ?? '');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState('');
  const [transport, setTransport] = useState('');
  const [paid, setPaid] = useState('');
  const [note, setNote] = useState('');
  
  const [errors, setErrors] = useState<FormErrors>({});

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

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    let valid = true;

    if (!customerName.trim()) {
      nextErrors.customerName = 'গ্রাহকের নাম আবশ্যক';
      valid = false;
    }

    if (customerPhone.trim()) {
      const phoneClean = customerPhone.replace(/[-\s]/g, '');
      const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(phoneClean)) {
        nextErrors.customerPhone = 'সঠিক বাংলাদেশি ফোন নম্বর দিন';
        valid = false;
      }
    }

    // Items validation
    const itemErrors: Record<string, { name?: string; qty?: string; price?: string }> = {};
    let itemHasError = false;

    if (items.length === 0) {
      Alert.alert('সতর্কতা', 'কমপক্ষে একটি পণ্য যোগ করুন।');
      return false;
    }

    items.forEach((item) => {
      const errorsObj: { name?: string; qty?: string; price?: string } = {};
      if (!item.name.trim()) {
        errorsObj.name = 'পণ্যের নাম আবশ্যক';
        itemHasError = true;
      }
      
      const qtyVal = parseFloat(item.qty);
      if (isNaN(qtyVal) || qtyVal <= 0) {
        errorsObj.qty = 'পরিমাণ > ০ হতে হবে';
        itemHasError = true;
      }

      const priceVal = parseFloat(item.price);
      if (isNaN(priceVal) || priceVal < 0) {
        errorsObj.price = 'মূল্য >= ০ হতে হবে';
        itemHasError = true;
      }

      if (Object.keys(errorsObj).length > 0) {
        itemErrors[item.id] = errorsObj;
      }
    });

    if (itemHasError) {
      nextErrors.items = itemErrors;
      valid = false;
    }

    // Calculation validation
    if (discount.trim()) {
      const val = parseFloat(discount);
      if (isNaN(val) || val < 0) {
        nextErrors.discount = 'বৈধ ইতিবাচক সংখ্যা লিখুন';
        valid = false;
      }
    }

    if (transport.trim()) {
      const val = parseFloat(transport);
      if (isNaN(val) || val < 0) {
        nextErrors.transport = 'বৈধ ইতিবাচক সংখ্যা লিখুন';
        valid = false;
      }
    }

    if (paid.trim()) {
      const val = parseFloat(paid);
      if (isNaN(val) || val < 0) {
        nextErrors.paid = 'বৈধ ইতিবাচক সংখ্যা লিখুন';
        valid = false;
      }
    }

    setErrors(nextErrors);
    return valid;
  };

  const idempotencyKeyRef = useRef(`purchase_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

  const handleSubmit = async () => {
    if (loading) return;
    if (!validate()) return;
    
    setLoading(true);
    try {
      let activeCustomerId = paramCustomerId;

      // 1. If no customerId is provided, we might need to create a customer on the fly
      if (!activeCustomerId) {
        const newCustomer = await customersApi.createCustomer({
          name: customerName,
          phone: customerPhone,
        });
        activeCustomerId = newCustomer.id;
      }

      // 2. Map items with precise string decimals and quantities
      const purchaseItems = items.map(i => ({
        name: i.name.trim(),
        quantity: (parseFloat(i.qty) || 0).toString(),
        unitPrice: (parseFloat(i.price) || 0).toFixed(2),
      }));

      // 3. Create purchase with reused idempotencyKeyRef
      await purchasesApi.createPurchase({
        customerId: activeCustomerId,
        items: purchaseItems,
        discount: discount.trim() ? (parseFloat(discount) || 0).toFixed(2) : undefined,
        notes: note.trim() ? note.trim() : undefined,
        delivery: transport.trim() ? { address: '', contact: customerPhone, transportCharge: (parseFloat(transport) || 0).toFixed(2) } : undefined,
        initialPayment: paid.trim() ? { amount: (parseFloat(paid) || 0).toFixed(2), method: 'CASH' } : undefined,
      }, idempotencyKeyRef.current);

      // 4. Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger', activeCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', activeCustomerId] });

      Alert.alert('সফল', 'ইনভয়েস তৈরি হয়েছে!', [
        { text: 'ঠিক আছে', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log('Error creating purchase:', error);
      Alert.alert('ত্রুটি', error.response?.data?.message || 'ইনভয়েস তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
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
                onChangeText={(v) => {
                  setCustomerName(v);
                  if (errors.customerName) setErrors(prev => ({ ...prev, customerName: undefined }));
                }}
                error={errors.customerName}
                leftIcon={<Feather name="user" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="ফোন নম্বর"
                placeholder="01XXXXXXXXX"
                value={customerPhone}
                onChangeText={(v) => {
                  setCustomerPhone(v);
                  if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: undefined }));
                }}
                keyboardType="phone-pad"
                error={errors.customerPhone}
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
                    label="পণ্যের নাম *"
                    placeholder="পণ্য বা সেবার নাম"
                    value={item.name}
                    onChangeText={(v) => {
                      updateItem(item.id, 'name', v);
                      if (errors.items?.[item.id]?.name) {
                        setErrors(prev => ({
                          ...prev,
                          items: {
                            ...prev.items,
                            [item.id]: { ...prev.items?.[item.id], name: undefined }
                          }
                        }));
                      }
                    }}
                    error={errors.items?.[item.id]?.name}
                  />
                  <View style={styles.priceRow}>
                    <View style={styles.priceField}>
                      <AppInput
                        label="পরিমাণ *"
                        placeholder="১"
                        value={item.qty}
                        onChangeText={(v) => {
                          updateItem(item.id, 'qty', v);
                          if (errors.items?.[item.id]?.qty) {
                            setErrors(prev => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                [item.id]: { ...prev.items?.[item.id], qty: undefined }
                              }
                            }));
                          }
                        }}
                        keyboardType="numeric"
                        error={errors.items?.[item.id]?.qty}
                      />
                    </View>
                    <View style={styles.priceField}>
                      <AppInput
                        label="একক মূল্য (৳) *"
                        placeholder="০"
                        value={item.price}
                        onChangeText={(v) => {
                          updateItem(item.id, 'price', v);
                          if (errors.items?.[item.id]?.price) {
                            setErrors(prev => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                [item.id]: { ...prev.items?.[item.id], price: undefined }
                              }
                            }));
                          }
                        }}
                        keyboardType="numeric"
                        error={errors.items?.[item.id]?.price}
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
                onChangeText={(v) => {
                  setDiscount(v);
                  if (errors.discount) setErrors(prev => ({ ...prev, discount: undefined }));
                }}
                keyboardType="numeric"
                error={errors.discount}
                leftIcon={<Feather name="tag" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="পরিবহন / ডেলিভারি (৳)"
                placeholder="০"
                value={transport}
                onChangeText={(v) => {
                  setTransport(v);
                  if (errors.transport) setErrors(prev => ({ ...prev, transport: undefined }));
                }}
                keyboardType="numeric"
                error={errors.transport}
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
                onChangeText={(v) => {
                  setPaid(v);
                  if (errors.paid) setErrors(prev => ({ ...prev, paid: undefined }));
                }}
                keyboardType="numeric"
                error={errors.paid}
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
