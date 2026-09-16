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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';
import { paymentsApi, CreatePaymentInput } from '@/api/payments.api';

// ── Mock data lookup ──────────────────────────────────────────────────────────
// Replaced by real API data

const PAYMENT_METHODS = ['নগদ', 'bKash', 'Nagad', 'ব্যাংক', 'অন্যান্য'];

// ── Method pill ───────────────────────────────────────────────────────────────
const MethodPill = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.methodPill, selected && styles.methodPillActive]}
  >
    <Text style={[styles.methodLabel, selected && styles.methodLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export const ReceivePaymentScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customerId, invoiceId } = useLocalSearchParams<{ customerId?: string; invoiceId?: string }>();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customerId ?? null);
  const [customerSearch, setCustomerSearch] = useState('');

  const { data: customersData } = useQuery({
    queryKey: ['customers', { limit: 100 }],
    queryFn: () => customersApi.getCustomers({ limit: 100 }),
  });

  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: () => customersApi.getCustomer(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('নগদ');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ customer?: string; amount?: string }>({});

  const idempotencyKeyRef = React.useRef(`payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

  const paymentMutation = useMutation({
    mutationFn: (data: CreatePaymentInput) => paymentsApi.createPayment(data, idempotencyKeyRef.current),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger', selectedCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', selectedCustomerId] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      Alert.alert(
        'সফল',
        `৳ ${parsedAmount.toLocaleString()} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`,
        [{ text: 'ঠিক আছে', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      console.log('Error creating payment:', error);
      Alert.alert('ত্রুটি', error.response?.data?.message || 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে।');
    }
  });

  // Automatically set amount when customer is loaded if they have due
  React.useEffect(() => {
    if (selectedCustomer && !amount) {
      const balance = Number(selectedCustomer.currentBalance);
      if (balance > 0) {
        setAmount(balance.toString());
      }
    }
  }, [selectedCustomer]);

  const maxDue = selectedCustomer ? (Number(selectedCustomer.currentBalance) > 0 ? Number(selectedCustomer.currentBalance) : 0) : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const isOverpayment = parsedAmount > maxDue && maxDue > 0;

  const validate = () => {
    const nextErrors: { customer?: string; amount?: string } = {};
    let valid = true;

    if (!selectedCustomerId) {
      nextErrors.customer = 'গ্রাহক নির্বাচন করা আবশ্যক';
      valid = false;
    }

    const parsedAmt = parseFloat(amount) || 0;
    if (!amount.trim()) {
      nextErrors.amount = 'পেমেন্টের পরিমাণ আবশ্যক';
      valid = false;
    } else if (isNaN(parsedAmt) || parsedAmt <= 0) {
      nextErrors.amount = 'সঠিক পেমেন্ট পরিমাণ লিখুন';
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (paymentMutation.isPending) return;
    if (!validate()) return;
    if (!selectedCustomerId) return;

    let apiMethod: 'CASH' | 'MOBILE_BANKING' | 'BANK_TRANSFER' = 'CASH';
    if (method === 'bKash' || method === 'Nagad') apiMethod = 'MOBILE_BANKING';
    if (method === 'ব্যাংক') apiMethod = 'BANK_TRANSFER';

    paymentMutation.mutate({
      customerId: selectedCustomerId,
      amount: parsedAmount.toFixed(2),
      method: apiMethod,
      note: note ? note : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>পেমেন্ট গ্রহণ</Text>
        <View style={styles.backBtn} />
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
          {/* Customer info card / selector */}
          {selectedCustomer ? (
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>{selectedCustomer.name.charAt(0)}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerPhone}>{selectedCustomer.phone}</Text>
              </View>
              <View style={styles.dueBox}>
                <Text style={styles.dueBoxLabel}>বকেয়া</Text>
                <Text style={styles.dueBoxAmount}>৳ {maxDue.toLocaleString()}</Text>
              </View>
              {!customerId && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCustomerId(null);
                    setAmount('');
                  }}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>পরিবর্তন</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>গ্রাহক নির্বাচন করুন *</Text>
              <AppInput
                placeholder="গ্রাহকের নাম বা ফোন নম্বর লিখুন..."
                value={customerSearch}
                onChangeText={setCustomerSearch}
                leftIcon={<Feather name="search" size={16} color={colors.textMuted} />}
              />
              <View style={styles.selectorList}>
                {customersData?.items
                  ?.filter((c) => Number(c.currentBalance) > 0)
                  ?.filter((c) => 
                    !customerSearch.trim() ||
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    c.phone.includes(customerSearch)
                  )
                  .map((c) => {
                    const cDue = Number(c.currentBalance) > 0 ? Number(c.currentBalance) : 0;
                    return (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.selectorItem}
                      onPress={() => {
                        setSelectedCustomerId(c.id);
                        if (cDue > 0) {
                          setAmount(cDue.toString());
                        }
                        if (errors.customer) setErrors(prev => ({ ...prev, customer: undefined }));
                      }}
                    >
                      <View style={styles.selectorItemLeft}>
                        <View style={styles.itemAvatar}>
                          <Text style={styles.itemAvatarText}>{c.name.charAt(0)}</Text>
                        </View>
                        <View>
                          <Text style={styles.selectorName}>{c.name}</Text>
                          <Text style={styles.selectorPhone}>{c.phone}</Text>
                        </View>
                      </View>
                      <View style={styles.selectorItemRight}>
                        <Text style={styles.selectorDueLabel}>বকেয়া</Text>
                        <Text style={styles.selectorDueValue}>৳ {cDue.toLocaleString()}</Text>
                      </View>
                    </TouchableOpacity>
                  )})}
              </View>
              {errors.customer ? <Text style={styles.errorText}>{errors.customer}</Text> : null}
            </View>
          )}

          {/* Amount section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পেমেন্টের পরিমাণ</Text>
            <AppInput
              label="পরিমাণ (৳) *"
              placeholder="০"
              value={amount}
              onChangeText={(v) => {
                setAmount(v);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
              }}
              keyboardType="numeric"
              error={errors.amount}
              leftIcon={<Text style={styles.tkSign}>৳</Text>}
            />
            {isOverpayment && (
              <View style={styles.warningRow}>
                <Feather name="alert-triangle" size={13} color={colors.warning} />
                <Text style={styles.warningText}>
                  বকেয়ার চেয়ে বেশি পরিমাণ। নিশ্চিত করুন।
                </Text>
              </View>
            )}
            {parsedAmount > 0 && maxDue > 0 && !isOverpayment && (
              <View style={styles.remaining}>
                <Text style={styles.remainingText}>
                  এরপর বকেয়া:{' '}
                  <Text style={{ color: colors.danger, fontWeight: '700' }}>
                    ৳ {Math.max(0, maxDue - parsedAmount).toLocaleString()}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পেমেন্ট পদ্ধতি</Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((m) => (
                <MethodPill
                  key={m}
                  label={m}
                  selected={method === m}
                  onPress={() => setMethod(m)}
                />
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <AppInput
              label="নোট (ঐচ্ছিক)"
              placeholder="অতিরিক্ত তথ্য..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>পেমেন্টের পরিমাণ</Text>
              <Text style={styles.summaryValue}>৳ {parsedAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>পদ্ধতি</Text>
              <Text style={styles.summaryValue}>{method}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.submitWrap}>
          <AppButton
            title="পেমেন্ট গ্রহণ করুন"
            onPress={handleSubmit}
            loading={paymentMutation.isPending}
            icon={!paymentMutation.isPending ? <Feather name="check-circle" size={18} color={colors.surface} /> : undefined}
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
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },

  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 14, paddingBottom: 20 },

  customerCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.card,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  customerPhone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  dueBox: { alignItems: 'flex-end' },
  dueBoxLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  dueBoxAmount: { fontSize: 16, fontWeight: '700', color: colors.danger },

  invoiceRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignSelf: 'flex-start',
  },
  invoiceRefText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  section: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  methodPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  methodLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  methodLabelActive: { color: colors.primary, fontWeight: '700' },

  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  warningText: { fontSize: 12, color: colors.warning, fontWeight: '500', flex: 1 },

  remaining: { paddingHorizontal: 2 },
  remainingText: { fontSize: 13, color: colors.textSecondary },

  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    ...theme.shadows.card,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },

  tkSign: { fontSize: 16, color: colors.textMuted, fontWeight: '600' },

  submitWrap: {
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  selectorList: {
    gap: 8,
    marginTop: 8,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  selectorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectorPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  selectorItemRight: {
    alignItems: 'flex-end',
  },
  selectorDueLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  selectorDueValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '500',
    marginTop: 4,
  },
});
