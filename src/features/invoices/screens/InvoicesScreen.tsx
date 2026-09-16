import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
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

import { FilterBar } from '@/components/ui/FilterChip';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi, PurchaseListItem } from '@/api/purchases.api';
import { RefreshControl } from 'react-native';

type FilterKey = 'সব' | 'পরিশোধিত' | 'আংশিক' | 'বকেয়া';
const FILTERS: FilterKey[] = ['সব', 'পরিশোধিত', 'আংশিক', 'বকেয়া'];

export const InvoicesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchasesApi.getPurchases({ limit: 100 }),
  });

  const purchases = data?.items || [];

  const invoiceItems: Invoice[] = useMemo(() => {
    return purchases.map((p) => {
      const total = Number(p.invoice?.totalAmount || p.invoice?.grandTotal || p.netAmount || 0);
      const due = Number(p.invoice?.dueAmount || p.invoice?.currentDue || 0);
      const paid = Math.max(0, total - due);
      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (due <= 0) {
        status = 'paid';
      } else if (due < total) {
        status = 'partial';
      }

      return {
        id: p.id,
        invoiceNo: p.invoice?.invoiceNumber || `INV-${p.id.substring(0, 4)}`,
        customerName: p.customer?.name || 'অজানা গ্রাহক',
        date: new Date(p.purchaseDate).toLocaleDateString('bn-BD'),
        total,
        paid,
        due,
        status,
      };
    });
  }, [purchases]);

  const filtered = useMemo(() => {
    return invoiceItems.filter((inv) => {
      const matchesSearch = !search.trim() ||
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'পরিশোধিত') return inv.status === 'paid';
      if (activeFilter === 'আংশিক') return inv.status === 'partial';
      if (activeFilter === 'বকেয়া') return inv.status === 'unpaid';
      return true;
    });
  }, [invoiceItems, activeFilter, search]);

  const totalDue = invoiceItems.reduce((s, inv) => s + inv.due, 0);
  const totalCollected = invoiceItems.reduce((s, inv) => s + inv.paid, 0);
  const paidCount = invoiceItems.filter((i) => i.status === 'paid').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>ইনভয়েস</Text>
          <Text style={styles.pageSubtitle}>{data?.meta?.total || invoiceItems.length}টি ইনভয়েস</Text>
        </View>
        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.7}
          onPress={() => Alert.alert('রপ্তানি অক্ষম', 'ইনভয়েস তালিকা ডাউনলোড করার জন্য ব্যাকএন্ড API এবং স্টোরেজ অনুমতি প্রয়োজন।')}
        >
          <Feather name="download" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ৳ {totalCollected.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summaryLabel}>আদায়</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            ৳ {totalDue.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summaryLabel}>বকেয়া</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {paidCount}
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
      <FilterBar
        options={FILTERS}
        active={activeFilter}
        onSelect={setActiveFilter}
        variant="primary"
      />

      {/* List */}
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
  listContent: { padding: theme.spacing.md, paddingBottom: 24 },
});
