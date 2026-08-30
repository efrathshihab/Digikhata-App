import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
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
import { FilterBar } from '@/components/ui/FilterChip';
import { useQuery } from '@tanstack/react-query';
import { customersApi, Customer as ApiCustomer } from '@/api/customers.api';
// ── Mock data ─────────────────────────────────────────────────────────────────
type FilterKey = 'সব' | 'বকেয়া' | 'পরিশোধিত' | 'নিষ্ক্রিয়';
const FILTERS: FilterKey[] = ['সব', 'বকেয়া', 'পরিশোধিত', 'নিষ্ক্রিয়'];


export const CustomersScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['customers', { status: activeFilter === 'সব' ? undefined : activeFilter === 'নিষ্ক্রিয়' ? 'INACTIVE' : 'ACTIVE', hasDue: activeFilter === 'বকেয়া' ? true : undefined, search }],
    queryFn: () => customersApi.getCustomers({
      status: activeFilter === 'সব' ? undefined : activeFilter === 'নিষ্ক্রিয়' ? 'INACTIVE' : 'ACTIVE',
      hasDue: activeFilter === 'বকেয়া' ? true : undefined,
      search: search || undefined,
    }),
  });

  const filtered = data?.items || [];

  const totalDue = filtered.reduce((s, c) => s + Number(c.currentBalance), 0);
  const overdueCount = filtered.filter((c) => Number(c.currentBalance) < 0).length;
  const inactiveCount = filtered.filter((c) => c.status === 'INACTIVE').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>গ্রাহক তালিকা</Text>
          <Text style={styles.pageSubtitle}>{data?.meta?.total || 0} জন গ্রাহক</Text>
        </View>
        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.7}
          onPress={() => Alert.alert('রপ্তানি অক্ষম', 'রিপোর্ট ডাউনলোড করার জন্য ব্যাকএন্ড API এবং স্টোরেজ অনুমতি প্রয়োজন।')}
        >
          <Feather name="download" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data?.meta?.total || 0}</Text>
          <Text style={styles.summaryLabel}>মোট গ্রাহক</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            {overdueCount}
          </Text>
          <Text style={styles.summaryLabel}>বকেয়া</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            ৳ {totalDue.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summaryLabel}>মোট বকেয়া</Text>
        </View>
      </View>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} />
      </View>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      <FilterBar
        options={FILTERS}
        active={activeFilter}
        onSelect={setActiveFilter}
        variant="primary"
        counts={{
          'বকেয়া': overdueCount,
          'নিষ্ক্রিয়': inactiveCount,
        }}
      />

      {/* ── List ────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <CustomerCard
            customer={{
              id: item.id,
              name: item.name,
              phone: item.phone,
              serialNo: `CUS-${item.id.substring(0, 4)}`,
              status: item.status === 'INACTIVE' ? 'inactive' : Number(item.currentBalance) < 0 ? 'overdue' : 'active',
              totalDue: Number(item.currentBalance) < 0 ? Math.abs(Number(item.currentBalance)) : 0,
              avatar: item.avatarUrl || null,
            } as unknown as Customer}
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
    paddingBottom: 24,
  },
});