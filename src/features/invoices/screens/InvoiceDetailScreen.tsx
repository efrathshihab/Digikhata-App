import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '@/api/purchases.api';

// ── Mock invoice data ─────────────────────────────────────────────────────────
// Replaced by real API data

const STATUS_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  paid: { label: 'পরিশোধিত', variant: 'success' },
  partial: { label: 'আংশিক', variant: 'warning' },
  unpaid: { label: 'বকেয়া', variant: 'danger' },
};

// ── Line item row ─────────────────────────────────────────────────────────────
const ItemRow = ({ item, index }: { item: any; index: number }) => (
  <View style={iStyles.row}>
    <View style={iStyles.indexCol}>
      <Text style={iStyles.index}>{index + 1}</Text>
    </View>
    <View style={iStyles.nameCol}>
      <Text style={iStyles.name} numberOfLines={2}>{item.name}</Text>
    </View>
    <View style={iStyles.numCol}>
      <Text style={iStyles.num}>{item.qty}</Text>
    </View>
    <View style={iStyles.numCol}>
      <Text style={iStyles.num}>৳ {item.price.toLocaleString()}</Text>
    </View>
    <View style={iStyles.numCol}>
      <Text style={[iStyles.num, { fontWeight: '700', color: colors.textPrimary }]}>
        ৳ {item.total.toLocaleString()}
      </Text>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export const InvoiceDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: purchase, isLoading } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasesApi.getPurchase(id),
  });

  const getStatusInfo = (status: string, dueAmount: number, totalAmount: number) => {
    if (dueAmount <= 0) return { label: 'পরিশোধিত', variant: 'success' as const };
    if (dueAmount < totalAmount) return { label: 'আংশিক', variant: 'warning' as const };
    return { label: 'বকেয়া', variant: 'danger' as const };
  };

  const handleShare = () => {
    Alert.alert('শেয়ার', 'ইনভয়েস PDF শেয়ার করার সুবিধা শীঘ্রই আসছে।');
  };

  if (isLoading || !purchase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const invoice = purchase.invoice || {
    id: purchase.id,
    invoiceNumber: `INV-${purchase.id.substring(0, 4)}`,
    totalAmount: purchase.netAmount || '0',
    dueAmount: '0',
  };
  const statusInfo = getStatusInfo(purchase.status, Number(invoice.dueAmount), Number(invoice.totalAmount));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{invoice.invoiceNumber}</Text>
          <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
          <Feather name="share-2" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer card */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>{purchase.customer?.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{purchase.customer?.name}</Text>
            <Text style={styles.customerPhone}>{purchase.customer?.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/customers/${purchase.customerId}`)}
          >
            <Text style={styles.viewProfileText}>প্রোফাইল</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {/* Invoice meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ইনভয়েস তারিখ</Text>
              <Text style={styles.metaValue}>{new Date(purchase.purchaseDate).toLocaleDateString('bn-BD')}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>স্ট্যাটাস</Text>
              <Text style={[styles.metaValue, { color: statusInfo.variant === 'danger' ? colors.danger : colors.textPrimary }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>পণ্যের তালিকা</Text>

          {/* Table header */}
          <View style={[iStyles.row, iStyles.tableHeader]}>
            <View style={iStyles.indexCol}><Text style={iStyles.headerText}>#</Text></View>
            <View style={iStyles.nameCol}><Text style={iStyles.headerText}>পণ্য</Text></View>
            <View style={iStyles.numCol}><Text style={iStyles.headerText}>পরিমাণ</Text></View>
            <View style={iStyles.numCol}><Text style={iStyles.headerText}>মূল্য</Text></View>
            <View style={iStyles.numCol}><Text style={iStyles.headerText}>মোট</Text></View>
          </View>

          {purchase.items?.map((item: any, idx: number) => (
            <React.Fragment key={item.id || idx}>
              <ItemRow item={{
                name: item.name || item.product?.name || 'অজানা পণ্য',
                qty: item.quantity,
                price: Number(item.unitPrice),
                total: Number(item.totalPrice)
              }} index={idx} />
              {idx < (purchase.items?.length || 0) - 1 && <View style={iStyles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>সাবটোটাল</Text>
            <Text style={styles.totalValue}>৳ {Number(purchase.netAmount || invoice.totalAmount).toLocaleString()}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>মোট</Text>
            <Text style={styles.grandValue}>৳ {Number(invoice.totalAmount).toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.success }]}>পরিশোধিত</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              - ৳ {(Number(invoice.totalAmount) - Number(invoice.dueAmount)).toLocaleString()}
            </Text>
          </View>
          {Number(invoice.dueAmount) > 0 && (
            <View style={[styles.totalRow, styles.dueRow]}>
              <Text style={styles.dueLabel}>বকেয়া</Text>
              <Text style={styles.dueValue}>৳ {Number(invoice.dueAmount).toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Note */}
        {!!purchase.notes && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>নোট</Text>
            <Text style={styles.noteText}>{purchase.notes}</Text>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom actions */}
      {Number(invoice.dueAmount) > 0 && (
        <View style={styles.bottomBar}>
          <AppButton
            title="পেমেন্ট নিন"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={() =>
              router.push({
                pathname: '/payments/receive',
                params: { customerId: purchase.customerId, invoiceId: invoice.id },
              })
            }
            icon={<Feather name="credit-card" size={15} color={colors.surface} />}
          />
        </View>
      )}
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
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 14 },

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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewProfileText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },

  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    ...theme.shadows.card,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: colors.textSecondary },
  totalValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  grandTotalRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    marginVertical: 4,
  },
  grandLabel: { fontSize: 15, fontWeight: '700', color: colors.primary },
  grandValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  dueRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
  },
  dueLabel: { fontSize: 15, fontWeight: '700', color: colors.danger },
  dueValue: { fontSize: 16, fontWeight: '700', color: colors.danger },

  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  noteTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  noteText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

const iStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tableHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 12 },
  indexCol: { width: 22 },
  nameCol: { flex: 1, paddingHorizontal: 6 },
  numCol: { width: 68, alignItems: 'flex-end' },
  index: { fontSize: 11, color: colors.textMuted },
  name: { fontSize: 12, color: colors.textPrimary, lineHeight: 17 },
  num: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});
