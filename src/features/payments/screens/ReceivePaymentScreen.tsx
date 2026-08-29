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

// ── Mock data lookup ──────────────────────────────────────────────────────────
const CUSTOMER_LOOKUP: Record<string, { name: string; phone: string; due: number; invoice: string }> = {
  '1': { name: 'রহিম উদ্দিন', phone: '01711-223344', due: 15500, invoice: 'INV-০০১৫' },
  '2': { name: 'করিম মিয়া', phone: '01812-334455', due: 8200, invoice: 'INV-০০১৪' },
  '4': { name: 'সুমাইয়া বেগম', phone: '01611-556677', due: 22000, invoice: 'INV-০০১২' },
  '6': { name: 'শাহিদুল ইসলাম', phone: '01311-778899', due: 5700, invoice: 'INV-০০১০' },
  '8': { name: 'আবু সাঈদ', phone: '01411-990011', due: 33400, invoice: 'INV-০০০৮' },
};

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
  const { customerId, invoiceId } = useLocalSearchParams<{ customerId?: string; invoiceId?: string }>();

  const customer = customerId ? CUSTOMER_LOOKUP[customerId] : null;

  const [amount, setAmount] = useState(customer ? customer.due.toString() : '');
  const [method, setMethod] = useState('নগদ');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const maxDue = customer?.due ?? 0;
  const isOverpayment = parsedAmount > maxDue && maxDue > 0;

  const handleSubmit = async () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('সতর্কতা', 'বৈধ পরিমাণ লিখুন।');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert(
      'সফল',
      `৳ ${parsedAmount.toLocaleString()} পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`,
      [{ text: 'ঠিক আছে', onPress: () => router.back() }]
    );
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
          {/* Customer info card */}
          {customer && (
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>{customer.name.charAt(0)}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone}</Text>
              </View>
              <View style={styles.dueBox}>
                <Text style={styles.dueBoxLabel}>বকেয়া</Text>
                <Text style={styles.dueBoxAmount}>৳ {customer.due.toLocaleString()}</Text>
              </View>
            </View>
          )}

          {/* Invoice ref */}
          {customer && (
            <View style={styles.invoiceRef}>
              <Feather name="file-text" size={14} color={colors.primary} />
              <Text style={styles.invoiceRefText}>ইনভয়েস: {customer.invoice}</Text>
            </View>
          )}

          {/* Amount section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পেমেন্টের পরিমাণ</Text>
            <AppInput
              label="পরিমাণ (৳) *"
              placeholder="০"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
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
            title="পেমেন্ট নিশ্চিত করুন"
            onPress={handleSubmit}
            loading={loading}
            icon={<Feather name="check-circle" size={16} color={colors.surface} />}
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
});
