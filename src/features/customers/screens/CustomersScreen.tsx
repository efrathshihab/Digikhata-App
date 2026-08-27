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
import { CustomerCard, Customer } from '@/components/ui/CustomerCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

// ── Mock data ─────────────────────────────────────────────────────────────────
const ALL_CUSTOMERS: Customer[] = [
  { id: '1', serialNo: '০০১', name: 'রহিম উদ্দিন', phone: '01711-223344', village: 'মিরপুর, ঢাকা', totalDue: 15500, lastTransactionDate: '২৭ আগ ২০২৬', status: 'overdue' },
  { id: '2', serialNo: '০০২', name: 'করিম মিয়া', phone: '01812-334455', village: 'মতিঝিল, ঢাকা', totalDue: 8200, lastTransactionDate: '২৬ আগ ২০২৬', status: 'overdue' },
  { id: '3', serialNo: '০০৩', name: 'মোঃ সালাউদ্দিন', phone: '01912-445566', village: 'নারায়ণগঞ্জ', totalDue: 0, lastTransactionDate: '২৫ আগ ২০২৬', status: 'active' },
  { id: '4', serialNo: '০০৪', name: 'সুমাইয়া বেগম', phone: '01611-556677', village: 'গাজীপুর', totalDue: 22000, lastTransactionDate: '২৪ আগ ২০২৬', status: 'overdue' },
  { id: '5', serialNo: '০০৫', name: 'জামাল হোসেন', phone: '01511-667788', village: 'সাভার', totalDue: 0, lastTransactionDate: '২৩ আগ ২০২৬', status: 'active' },
  { id: '6', serialNo: '০০৬', name: 'শাহিদুল ইসলাম', phone: '01311-778899', village: 'কেরানীগঞ্জ', totalDue: 5700, lastTransactionDate: '২২ আগ ২০২৬', status: 'overdue' },
  { id: '7', serialNo: '০০৭', name: 'নাজমা আক্তার', phone: '01211-889900', village: 'ডেমরা, ঢাকা', totalDue: 0, lastTransactionDate: '২০ আগ ২০২৬', status: 'inactive' },
  { id: '8', serialNo: '০০৮', name: 'আবু সাঈদ', phone: '01411-990011', village: 'আদাবর, ঢাকা', totalDue: 33400, lastTransactionDate: '১৮ আগ ২০২৬', status: 'overdue' },
];

type FilterKey = 'সব' | 'বকেয়া' | 'পরিশোধিত' | 'নিষ্ক্রিয়';
const FILTERS: FilterKey[] = ['সব', 'বকেয়া', 'পরিশোধিত', 'নিষ্ক্রিয়'];

export const CustomersScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');

  const filtered = useMemo(() => {
    return ALL_CUSTOMERS.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.serialNo.includes(search);

      const matchesFilter =
        activeFilter === 'সব' ||
        (activeFilter === 'বকেয়া' && c.status === 'overdue') ||
        (activeFilter === 'পরিশোধিত' && c.status === 'active') ||
        (activeFilter === 'নিষ্ক্রিয়' && c.status === 'inactive');

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const totalDue = ALL_CUSTOMERS.reduce((s, c) => s + c.totalDue, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>গ্রাহক তালিকা</Text>
          <Text style={styles.pageSubtitle}>{ALL_CUSTOMERS.length} জন গ্রাহক</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} activeOpacity={0.7}>
          <Feather name="download" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{ALL_CUSTOMERS.length}</Text>
          <Text style={styles.summaryLabel}>মোট গ্রাহক</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            {ALL_CUSTOMERS.filter((c) => c.status === 'overdue').length}
          </Text>
          <Text style={styles.summaryLabel}>বকেয়া</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            ৳ {totalDue.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>মোট বকেয়া</Text>
        </View>
      </View>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} />
      </View>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text
              style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={() => router.push(`/customers/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="কোনো গ্রাহক পাওয়া যায়নি"
            description="অনুসন্ধান পরিবর্তন করুন অথবা নতুন গ্রাহক যোগ করুন।"
            icon="users"
          />
        }
      />

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <FloatingActionButton
        onPress={() => router.push('/customers/add')}
        label="গ্রাহক যোগ করুন"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
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
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
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
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
});