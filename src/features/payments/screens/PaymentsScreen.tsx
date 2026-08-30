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

import { useQuery } from '@tanstack/react-query';
import { paymentsApi, PaymentListItem } from '@/api/payments.api';
import { dashboardApi } from '@/api/dashboard.api';
import { RefreshControl } from 'react-native';

const METHOD_ICONS: Record<string, string> = {
  'CASH': 'dollar-sign',
  'MOBILE_BANKING': 'smartphone',
  'BANK_TRANSFER': 'credit-card',
  'CHEQUE': 'file-text',
  'OTHER': 'more-horizontal',
  'নগদ': 'dollar-sign',
  'bKash': 'smartphone',
  'Nagad': 'smartphone',
  'ব্যাংক': 'credit-card',
  'অন্যান্য': 'more-horizontal',
};

const METHOD_LABELS: Record<string, string> = {
  'CASH': 'নগদ',
  'MOBILE_BANKING': 'মোবাইল ব্যাংকিং',
  'BANK_TRANSFER': 'ব্যাংক',
  'CHEQUE': 'চেক',
  'OTHER': 'অন্যান্য',
};

export const PaymentsScreen = () => {
  const router = useRouter();

  const { data: paymentsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getPayments({ limit: 100 }),
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
  });

  const payments = paymentsData?.items || [];
  const todayCollections = Number(summary?.todayCollections || 0);
  const totalDue = Number(summary?.totalDue || 0);
  const totalPaymentsAmount = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.successSoft }]}>
              <Feather name="trending-up" size={16} color={colors.success} />
            </View>
            <Text style={styles.sumLabel}>আজকের আদায়</Text>
            <Text style={[styles.sumValue, { color: colors.success }]}>
              ৳ {todayCollections.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.primarySoft }]}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sumLabel}>মোট আদায়</Text>
            <Text style={[styles.sumValue, { color: colors.primary }]}>
              ৳ {totalPaymentsAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.sumIcon, { backgroundColor: colors.dangerSoft }]}>
              <Feather name="alert-circle" size={16} color={colors.danger} />
            </View>
            <Text style={styles.sumLabel}>মোট বকেয়া</Text>
            <Text style={[styles.sumValue, { color: colors.danger }]}>৳ {totalDue.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Recent payments */}
        <SectionHeader title="পেমেন্টের তালিকা" />

        {payments.map((payment) => {
          const methodKey = payment.method || 'CASH';
          const methodLabel = METHOD_LABELS[methodKey] || payment.method;
          const methodIcon = METHOD_ICONS[methodKey] || 'dollar-sign';

          return (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={[styles.payIcon, { backgroundColor: colors.successSoft }]}>
                <Feather
                  name={methodIcon as any}
                  size={16}
                  color={colors.success}
                />
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payCustomer}>{payment.customer?.name || 'অজানা গ্রাহক'}</Text>
                <Text style={styles.payMeta}>{methodLabel} {payment.reference ? `· ${payment.reference}` : ''}</Text>
                <Text style={styles.payDate}>{new Date(payment.paymentDate).toLocaleDateString('bn-BD')}</Text>
              </View>
              <View style={styles.payRight}>
                <Text style={styles.payAmount}>৳ {Number(payment.amount).toLocaleString('en-IN')}</Text>
                <StatusBadge label={payment.status === 'COMPLETED' ? 'সম্পন্ন' : payment.status === 'REVERSED' ? 'বাতিল' : 'সম্পন্ন'} variant={payment.status === 'REVERSED' ? 'danger' : 'success'} />
              </View>
            </View>
          );
        })}

        {payments.length === 0 && (
          <Text style={{ textAlign: 'center', padding: 24, color: colors.textSecondary }}>কোনো পেমেন্ট পাওয়া যায়নি</Text>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => router.push('/payments/receive')}
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
