import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';

// ── Transaction row ───────────────────────────────────────────────────────────
const TransactionRow = ({ tx }: { tx: any }) => (
  <View style={tStyles.row}>
    <View style={tStyles.dateCol}>
      <Text style={tStyles.date}>{tx.date}</Text>
      <Text style={tStyles.ref}>{tx.ref}</Text>
    </View>
    <View style={tStyles.descCol}>
      <Text style={tStyles.desc} numberOfLines={2}>{tx.desc}</Text>
    </View>
    <View style={tStyles.numCol}>
      <Text style={[tStyles.num, tx.debit > 0 ? tStyles.debit : tStyles.zero]}>
        {tx.debit > 0 ? `৳ ${tx.debit.toLocaleString()}` : '—'}
      </Text>
    </View>
    <View style={tStyles.numCol}>
      <Text style={[tStyles.num, tx.payment > 0 ? tStyles.payment : tStyles.zero]}>
        {tx.payment > 0 ? `৳ ${tx.payment.toLocaleString()}` : '—'}
      </Text>
    </View>
    <View style={tStyles.numCol}>
      <Text style={[tStyles.num, tx.balance > 0 ? tStyles.balanceDue : tStyles.balanceClear]}>
        ৳ {tx.balance.toLocaleString()}
      </Text>
    </View>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export const CustomerDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomer(id),
  });

  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['customerLedger', id],
    queryFn: () => customersApi.getCustomerLedger(id),
  });

  const handleEditPress = () => {
    router.push(`/customers/${id}/edit` as any);
  };

  if (isLoading || !customer) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = Number(customer.currentBalance) > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>গ্রাহকের বিবরণ</Text>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.7}
          onPress={handleEditPress}
        >
          <Feather name="edit-2" size={17} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Customer profile card ─────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{customer.name}</Text>
                {isOverdue && <StatusBadge label="বকেয়া" variant="danger" />}
              </View>
              <Text style={styles.meta}>#CUS-{customer.id.substring(0, 4)}</Text>
              <Text style={styles.meta}>{customer.address || customer.phone}</Text>
            </View>
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => Linking.openURL(`tel:${customer.phone}`)}
            >
              <Feather name="phone-call" size={16} color={colors.success} />
              <Text style={[styles.actionBtnLabel, { color: colors.success }]}>কল করুন</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={handleEditPress}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnLabel, { color: colors.primary }]}>সম্পাদনা</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/sms')}
            >
              <Feather name="message-circle" size={16} color={colors.info} />
              <Text style={[styles.actionBtnLabel, { color: colors.info }]}>SMS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Summary cards ─────────────────────────────────────────── */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>ক্রেডিট লিমিট</Text>
            <Text style={styles.summaryValue}>৳ {Number(customer.creditLimit).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>স্ট্যাটাস</Text>
            <Text style={[styles.summaryValue, { color: customer.status === 'ACTIVE' ? colors.success : colors.danger }]}>
              {customer.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardFull]}>
            <Text style={styles.summaryLabel}>বর্তমান ব্যালেন্স</Text>
            <Text style={[styles.summaryValue, { color: isOverdue ? colors.danger : colors.textPrimary, fontSize: 22 }]}>
              {isOverdue ? 'বকেয়া' : 'জমা'}: ৳ {Math.abs(Number(customer.currentBalance)).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ── Transaction history ───────────────────────────────────── */}
        <SectionHeader title="লেনদেনের ইতিহাস" />

        <View style={styles.tableCard}>
          {/* Table Header */}
          <View style={[tStyles.row, tStyles.tableHeader]}>
            <View style={tStyles.dateCol}><Text style={tStyles.headerText}>তারিখ</Text></View>
            <View style={tStyles.descCol}><Text style={tStyles.headerText}>বিবরণ</Text></View>
            <View style={tStyles.numCol}><Text style={tStyles.headerText}>ডেবিট</Text></View>
            <View style={tStyles.numCol}><Text style={tStyles.headerText}>পরিশোধ</Text></View>
            <View style={tStyles.numCol}><Text style={tStyles.headerText}>বকেয়া</Text></View>
          </View>

          {/* Table Body */}
          {ledger?.items?.map((tx, i) => (
            <React.Fragment key={tx.id}>
              <TransactionRow tx={{
                date: (tx.date || tx.entryDate) ? new Date((tx.date || tx.entryDate) as string).toLocaleDateString('bn-BD') : '—',
                ref: tx.referenceId || tx.sourceId || '',
                desc: tx.description,
                debit: Number(tx.debit),
                payment: Number(tx.credit),
                balance: Number(tx.balance ?? tx.balanceAfter ?? 0),
              }} />
              {i < ledger.items.length - 1 && <View style={tStyles.divider} />}
            </React.Fragment>
          ))}
          {!ledger?.items?.length && (
            <Text style={{ padding: 16, textAlign: 'center', color: colors.textSecondary }}>কোনো লেনদেন পাওয়া যায়নি</Text>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <AppButton
          title="নতুন বিক্রয়"
          variant="secondary"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={() =>
            router.push({
              pathname: '/invoices/create',
              params: { customerId: customer.id, name: customer.name, phone: customer.phone },
            })
          }
          icon={<Feather name="plus" size={15} color={colors.primary} />}
        />
        <AppButton
          title="পেমেন্ট নিন"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={() =>
            router.push({
              pathname: '/payments/receive',
              params: { customerId: customer.id },
            })
          }
          icon={<Feather name="credit-card" size={15} color={colors.surface} />}
        />
      </View>
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: theme.spacing.md, gap: 16 },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 13, color: colors.textSecondary },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnLabel: { fontSize: 13, fontWeight: '600' },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  summaryCardFull: { minWidth: '100%' },
  summaryLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  summaryValue: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },

  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },

  bottomSpacer: { height: 16 },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

const tStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  dateCol: { width: 80 },
  descCol: { flex: 1, paddingHorizontal: 8 },
  numCol: { width: 72, alignItems: 'flex-end' },
  date: { fontSize: 11, color: colors.textSecondary },
  ref: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  desc: { fontSize: 12, color: colors.textPrimary, lineHeight: 17 },
  num: { fontSize: 12, fontWeight: '600' },
  debit: { color: colors.danger },
  payment: { color: colors.success },
  balanceDue: { color: colors.danger },
  balanceClear: { color: colors.success },
  zero: { color: colors.textMuted },
});