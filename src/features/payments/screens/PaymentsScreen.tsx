import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

const PAYMENTS = [
  { id: 'p1', customer: 'রহিম উদ্দিন', invoice: 'INV-০০১৫', amount: 9500, method: 'নগদ', date: '২৭ আগ ২০২৬', status: 'completed' as const },
  { id: 'p2', customer: 'করিম মিয়া', invoice: 'INV-০০১৪', amount: 5000, method: 'bKash', date: '২৬ আগ ২০২৬', status: 'completed' as const },
  { id: 'p3', customer: 'মোঃ সালাউদ্দিন', invoice: 'INV-০০১৩', amount: 12000, method: 'Nagad', date: '২৫ আগ ২০২৬', status: 'completed' as const },
  { id: 'p4', customer: 'আবু সাঈদ', invoice: 'INV-০০০৮', amount: 15000, method: 'ব্যাংক', date: '২৪ আগ ২০২৬', status: 'completed' as const },
  { id: 'p5', customer: 'সুমাইয়া বেগম', invoice: 'INV-০০১২', amount: 8000, method: 'নগদ', date: '২৩ আগ ২০২৬', status: 'completed' as const },
];

const METHOD_ICONS: Record<string, string> = {
  'নগদ': 'dollar-sign',
  'bKash': 'smartphone',
  'Nagad': 'smartphone',
  'ব্যাংক': 'credit-card',
  'অন্যান্য': 'more-horizontal',
};

export const PaymentsScreen = () => {
  const router = useRouter();
  const todayTotal = PAYMENTS.slice(0, 2).reduce((s, p) => s + p.amount, 0);
  const weekTotal = PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>পেমেন্ট</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.successSoft }]}>
              <Feather name="trending-up" size={16} color={colors.success} />
            </View>
            <Text style={styles.sumLabel}>আজকের আদায়</Text>
            <Text style={[styles.sumValue, { color: colors.success }]}>
              ৳ {todayTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sumLabel}>এই সপ্তাহ</Text>
            <Text style={[styles.sumValue, { color: colors.primary }]}>
              ৳ {weekTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.dangerSoft }]}>
              <Feather name="alert-circle" size={16} color={colors.danger} />
            </View>
            <Text style={styles.sumLabel}>মোট বকেয়া</Text>
            <Text style={[styles.sumValue, { color: colors.danger }]}>৳ ১,২৪,৭৫০</Text>
          </View>
        </View>

        {/* Recent payments */}
        <SectionHeader title="সাম্প্রতিক পেমেন্ট" />

        {PAYMENTS.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={[styles.payIcon, { backgroundColor: colors.successSoft }]}>
              <Feather
                name={METHOD_ICONS[payment.method] as any || 'dollar-sign'}
                size={16}
                color={colors.success}
              />
            </View>
            <View style={styles.payInfo}>
              <Text style={styles.payCustomer}>{payment.customer}</Text>
              <Text style={styles.payMeta}>{payment.invoice} · {payment.method}</Text>
              <Text style={styles.payDate}>{payment.date}</Text>
            </View>
            <View style={styles.payRight}>
              <Text style={styles.payAmount}>৳ {payment.amount.toLocaleString()}</Text>
              <StatusBadge label="সম্পন্ন" variant="success" />
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => {}}
        label="পেমেন্ট নিন"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
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
  content: { padding: theme.spacing.md, gap: 16, paddingBottom: 32 },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  sumIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sumLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  sumValue: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    ...theme.shadows.card,
  },
  payIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  payInfo: { flex: 1 },
  payCustomer: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  payMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  payDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  payRight: { alignItems: 'flex-end', gap: 6 },
  payAmount: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
});
