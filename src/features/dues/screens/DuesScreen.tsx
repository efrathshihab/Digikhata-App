import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';

import { useQuery } from '@tanstack/react-query';
import { customersApi, Customer as ApiCustomer } from '@/api/customers.api';
import { RefreshControl } from 'react-native';

// ── Types ────────────────────────────────────────────────────────────────────
interface DueItem {
  id: string;
  serialNo: string;
  name: string;
  phone: string;
  village: string;
  totalDue: number;
  daysSince: number;
  lastInvoice?: string;
}

type FilterKey = 'সব' | 'জরুরি' | '৭+ দিন' | 'মাঝারি';
const FILTERS: FilterKey[] = ['সব', 'জরুরি', '৭+ দিন', 'মাঝারি'];

function getUrgencyColor(days: number) {
  if (days >= 10) return colors.danger;
  if (days >= 7) return colors.warning;
  return colors.textSecondary;
}

function getUrgencyBg(days: number) {
  if (days >= 10) return colors.dangerSoft;
  if (days >= 7) return colors.warningSoft;
  return colors.background;
}

function getUrgencyLabel(days: number): string {
  if (days >= 10) return 'জরুরি';
  if (days >= 7) return '৭+ দিন';
  return 'মাঝারি';
}

// ── Due Card ─────────────────────────────────────────────────────────────────
const DueCard = ({ item, onPress, onCollect }: { item: DueItem; onPress: () => void; onCollect: () => void }) => {
  const urgencyColor = getUrgencyColor(item.daysSince);
  const urgencyBg = getUrgencyBg(item.daysSince);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: urgencyColor }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: urgencyColor }]}>
              {item.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                  {item.daysSince} দিন
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>{item.village} · #{item.serialNo}</Text>
            {item.lastInvoice ? <Text style={styles.invoiceRef}>{item.lastInvoice}</Text> : null}
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.dueLabel}>বকেয়া পরিমাণ</Text>
            <Text style={styles.dueAmount}>৳ {item.totalDue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                Linking.openURL(`tel:${item.phone}`);
              }}
            >
              <Feather name="phone-call" size={14} color={colors.success} />
              <Text style={styles.callBtnText}>কল</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.collectBtn}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                onCollect();
              }}
            >
              <Feather name="credit-card" size={14} color={colors.surface} />
              <Text style={styles.collectBtnText}>আদায়</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const DuesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['duesCustomers', { search }],
    queryFn: () => customersApi.getCustomers({ hasDue: true, search: search || undefined, limit: 100 }),
  });

  const dueItems: DueItem[] = useMemo(() => {
    const items = data?.items || [];
    return items
      .filter(c => Number(c.currentBalance) < 0)
      .map(c => {
        const diffDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 1;
        return {
          id: c.id,
          serialNo: `CUS-${c.id.substring(0, 4)}`,
          name: c.name,
          phone: c.phone,
          village: c.area || c.address || 'ঠিকানা নেই',
          totalDue: Math.abs(Number(c.currentBalance)),
          daysSince: Math.min(diffDays, 30),
        };
      });
  }, [data]);

  const filtered = useMemo(() => {
    return dueItems.filter((d) => {
      const urgency = getUrgencyLabel(d.daysSince);
      const matchesFilter =
        activeFilter === 'সব' || urgency === activeFilter;

      return matchesFilter;
    });
  }, [dueItems, activeFilter]);

  const totalDue = dueItems.reduce((s, d) => s + d.totalDue, 0);
  const urgentCount = dueItems.filter((d) => d.daysSince >= 10).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>বকেয়া তালিকা</Text>
          <Text style={styles.headerSub}>{dueItems.length} জন গ্রাহক</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            ৳ {totalDue.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summaryLabel}>মোট বকেয়া</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{dueItems.length}</Text>
          <Text style={styles.summaryLabel}>মোট গ্রাহক</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.danger }]}>{urgentCount}</Text>
          <Text style={styles.summaryLabel}>জরুরি</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="গ্রাহকের নাম বা ফোন নম্বর"
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <DueCard
            item={item}
            onPress={() => router.push(`/customers/${item.id}`)}
            onCollect={() =>
              router.push({
                pathname: '/payments/receive',
                params: { customerId: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="কোনো বকেয়া পাওয়া যায়নি"
            description="সকল গ্রাহকের হিসাব পরিষ্কার আছে।"
            icon="check-circle"
          />
        }
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
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
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
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
  },
  filterLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filterLabelActive: { color: colors.danger, fontWeight: '700' },

  listContent: { padding: theme.spacing.md, paddingBottom: 32, gap: 10 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  urgencyText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 12, color: colors.textSecondary },
  invoiceRef: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dueLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  dueAmount: { fontSize: 17, fontWeight: '700', color: colors.danger, letterSpacing: -0.3 },
  cardActions: { flexDirection: 'row', gap: 8 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  callBtnText: { fontSize: 12, fontWeight: '700', color: colors.success },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  collectBtnText: { fontSize: 12, fontWeight: '700', color: colors.surface },
});
