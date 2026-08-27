import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { InvoiceCard, Invoice } from '@/components/ui/InvoiceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

// ── Mock data ─────────────────────────────────────────────────────────────────
const ALL_INVOICES: Invoice[] = [
  { id: '1', invoiceNo: 'INV-০০১৫', customerName: 'রহিম উদ্দিন', date: '২৭ আগ ২০২৬', total: 25000, paid: 9500, due: 15500, status: 'partial' },
  { id: '2', invoiceNo: 'INV-০০১৪', customerName: 'করিম মিয়া', date: '২৬ আগ ২০২৬', total: 8200, paid: 0, due: 8200, status: 'unpaid' },
  { id: '3', invoiceNo: 'INV-০০১৩', customerName: 'মোঃ সালাউদ্দিন', date: '২৫ আগ ২০২৬', total: 12000, paid: 12000, due: 0, status: 'paid' },
  { id: '4', invoiceNo: 'INV-০০১২', customerName: 'সুমাইয়া বেগম', date: '২৪ আগ ২০২৬', total: 22000, paid: 0, due: 22000, status: 'unpaid' },
  { id: '5', invoiceNo: 'INV-০০১১', customerName: 'মোঃ সালাউদ্দিন', date: '২০ আগ ২০২৬', total: 20500, paid: 20500, due: 0, status: 'paid' },
  { id: '6', invoiceNo: 'INV-০০১০', customerName: 'জামাল হোসেন', date: '১৮ আগ ২০২৬', total: 15000, paid: 9000, due: 6000, status: 'partial' },
];

type FilterKey = 'সব' | 'পরিশোধিত' | 'আংশিক' | 'বকেয়া';
const FILTERS: FilterKey[] = ['সব', 'পরিশোধিত', 'আংশিক', 'বকেয়া'];

const filterToStatus: Record<FilterKey, string | null> = {
  'সব': null,
  'পরিশোধিত': 'paid',
  'আংশিক': 'partial',
  'বকেয়া': 'unpaid',
};

export const InvoicesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');

  const filtered = useMemo(() => {
    const status = filterToStatus[activeFilter];
    return ALL_INVOICES.filter((inv) => {
      const matchesSearch =
        !search.trim() ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNo.includes(search);

      const matchesFilter = !status || inv.status === status;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const totalDue = ALL_INVOICES.reduce((s, inv) => s + inv.due, 0);
  const totalCollected = ALL_INVOICES.reduce((s, inv) => s + inv.paid, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>ইনভয়েস</Text>
          <Text style={styles.pageSubtitle}>{ALL_INVOICES.length}টি ইনভয়েস</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} activeOpacity={0.7}>
          <Feather name="download" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ৳ {totalCollected.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>আদায়</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            ৳ {totalDue.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>বকেয়া</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {ALL_INVOICES.filter((i) => i.status === 'paid').length}
          </Text>
          <Text style={styles.summaryLabel}>পরিশোধিত</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="ইনভয়েস নম্বর বা গ্রাহকের নাম"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterLabel,
                activeFilter === f && styles.filterLabelActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() => router.push(`/invoices/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="কোনো ইনভয়েস পাওয়া যায়নি"
            description="নতুন ইনভয়েস তৈরি করতে নিচের বোতামে ক্লিক করুন।"
            icon="file-text"
          />
        }
      />

      <FloatingActionButton
        onPress={() => router.push('/invoices/create')}
        label="নতুন ইনভয়েস"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  exportBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  searchWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  filterLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filterLabelActive: { color: colors.primary, fontWeight: '700' },
  listContent: { padding: theme.spacing.md, paddingBottom: 100 },
});
