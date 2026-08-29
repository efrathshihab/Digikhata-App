import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { FilterBar } from '@/components/ui/FilterChip';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Purchase {
  id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  total: number;
  paid: number;
  due: number;
  status: 'paid' | 'partial' | 'unpaid';
  itemCount: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const ALL_PURCHASES: Purchase[] = [
  { id: '1', invoiceNo: 'INV-০০১৫', customerName: 'রহিম উদ্দিন', date: '২৭ আগ ২০২৬', total: 25000, paid: 9500, due: 15500, status: 'partial', itemCount: 2 },
  { id: '2', invoiceNo: 'INV-০০১৪', customerName: 'করিম মিয়া', date: '২৬ আগ ২০২৬', total: 8200, paid: 0, due: 8200, status: 'unpaid', itemCount: 1 },
  { id: '3', invoiceNo: 'INV-০০১৩', customerName: 'মোঃ সালাউদ্দিন', date: '২৫ আগ ২০২৬', total: 12000, paid: 12000, due: 0, status: 'paid', itemCount: 2 },
  { id: '4', invoiceNo: 'INV-০০১২', customerName: 'সুমাইয়া বেগম', date: '২৩ আগ ২০২৬', total: 22000, paid: 0, due: 22000, status: 'unpaid', itemCount: 3 },
  { id: '5', invoiceNo: 'INV-০০১১', customerName: 'রহিম উদ্দিন', date: '২২ আগ ২০২৬', total: 20500, paid: 20500, due: 0, status: 'paid', itemCount: 2 },
  { id: '6', invoiceNo: 'INV-০০১০', customerName: 'শাহিদুল ইসলাম', date: '২০ আগ ২০২৬', total: 15700, paid: 10000, due: 5700, status: 'partial', itemCount: 4 },
];

const statusCfg = {
  paid: { label: 'পরিশোধিত', variant: 'success' as const },
  partial: { label: 'আংশিক', variant: 'warning' as const },
  unpaid: { label: 'বকেয়া', variant: 'danger' as const },
};

const FILTERS = ['সব', 'পরিশোধিত', 'আংশিক', 'বকেয়া'] as const;
type FilterKey = typeof FILTERS[number];

// ── Invoice Card ──────────────────────────────────────────────────────────────
const InvoiceCard = ({ item, onPress }: { item: Purchase; onPress: () => void }) => {
  const cfg = statusCfg[item.status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      {/* Top */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
          <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
          <Text style={styles.meta}>{item.date} · {item.itemCount} টি পণ্য</Text>
        </View>
        <View style={styles.cardRight}>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
          <Text style={styles.totalAmount}>৳ {item.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Bottom strip */}
      <View style={styles.cardBottom}>
        <View style={styles.amountChip}>
          <View style={styles.chipDot} />
          <Text style={styles.chipLabel}>পরিশোধিত: </Text>
          <Text style={[styles.chipValue, { color: colors.success }]}>৳ {item.paid.toLocaleString()}</Text>
        </View>
        {item.due > 0 && (
          <View style={styles.amountChip}>
            <View style={[styles.chipDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.chipLabel}>বকেয়া: </Text>
            <Text style={[styles.chipValue, { color: colors.danger }]}>৳ {item.due.toLocaleString()}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={15} color={colors.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const PurchasesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('সব');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return ALL_PURCHASES.filter((p) => {
      const matchSearch = !search.trim() ||
        p.invoiceNo.includes(search) ||
        p.customerName.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'সব' ||
        (filter === 'পরিশোধিত' && p.status === 'paid') ||
        (filter === 'আংশিক' && p.status === 'partial') ||
        (filter === 'বকেয়া' && p.status === 'unpaid');
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const totalSales = ALL_PURCHASES.reduce((s, p) => s + p.total, 0);
  const totalDue = ALL_PURCHASES.reduce((s, p) => s + p.due, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>বিক্রয় / ইনভয়েস</Text>
          <Text style={styles.headerSub}>{ALL_PURCHASES.length} টি রেকর্ড</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/invoices/create')}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={styles.sumValue}>৳ {totalSales.toLocaleString()}</Text>
          <Text style={styles.sumLabel}>মোট বিক্রয়</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.danger }]}>৳ {totalDue.toLocaleString()}</Text>
          <Text style={styles.sumLabel}>মোট বকেয়া</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.success }]}>
            {ALL_PURCHASES.filter((p) => p.status === 'paid').length}
          </Text>
          <Text style={styles.sumLabel}>পরিশোধিত</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="ইনভয়েস নম্বর বা গ্রাহকের নাম" />
      </View>

      {/* Filters */}
      <FilterBar
        options={[...FILTERS]}
        active={filter}
        onSelect={setFilter}
        counts={{
          'বকেয়া': ALL_PURCHASES.filter((p) => p.status === 'unpaid').length,
          'আংশিক': ALL_PURCHASES.filter((p) => p.status === 'partial').length,
        }}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <InvoiceCard item={item} onPress={() => router.push(`/invoices/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="কোনো বিক্রয় পাওয়া যায়নি"
            description="নতুন বিক্রয় তৈরি করতে + বাটন চাপুন।"
          />
        }
      />

      <FloatingActionButton
        onPress={() => router.push('/invoices/create')}
        label="নতুন বিক্রয়"
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
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sumItem: { flex: 1, alignItems: 'center' },
  sumValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  sumLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sumDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  searchWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  cardLeft: { flex: 1, gap: 3 },
  invoiceNo: { fontSize: 14, fontWeight: '700', color: colors.primary },
  customerName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  totalAmount: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  amountChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  chipLabel: { fontSize: 11, color: colors.textSecondary },
  chipValue: { fontSize: 12, fontWeight: '700' },
  chevron: { marginLeft: 'auto' },
});
