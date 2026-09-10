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
import { useQuery } from '@tanstack/react-query';
import { deliveriesApi, DeliveryItem } from '@/api/deliveries.api';

const statusCfg: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  PENDING: { label: 'অপেক্ষমাণ', variant: 'warning' },
  ASSIGNED: { label: 'বরাদ্দকৃত', variant: 'info' },
  IN_TRANSIT: { label: 'চলমান', variant: 'info' },
  DELIVERED: { label: 'সম্পন্ন', variant: 'success' },
  CANCELLED: { label: 'বাতিল', variant: 'danger' },
};

const FILTERS = ['সব', 'চলমান', 'অপেক্ষমাণ', 'সম্পন্ন', 'বাতিল'] as const;
type FilterKey = typeof FILTERS[number];

// ── Delivery Card ─────────────────────────────────────────────────────────────
const DeliveryCard = ({ item, onPress }: { item: DeliveryItem; onPress: () => void }) => {
  const cfg = statusCfg[item.status] || { label: item.status, variant: 'info' };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Feather name="truck" size={18} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <Text style={styles.deliveryNo}>{item.deliveryNumber}</Text>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
          <Text style={styles.customerName}>{item.customer?.name || 'গ্রাহক'}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={11} color={colors.textMuted} />
            <Text style={styles.meta}>{item.addressSnapshot}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottom}>
        <View style={styles.driverInfo}>
          <Feather name="user" size={12} color={colors.textSecondary} />
          <Text style={styles.driverText}>{item.driver?.name || 'ড্রাইভার নির্ধারিত নয়'}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Feather name="calendar" size={12} color={colors.textMuted} />
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('bn-BD')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const DeliveriesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('সব');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => deliveriesApi.getDeliveries({ limit: 100 }),
  });

  const deliveries = data?.items || [];

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch = !search.trim() ||
        d.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
        (d.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        d.addressSnapshot.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'চলমান') return d.status === 'IN_TRANSIT' || d.status === 'ASSIGNED';
      if (activeFilter === 'অপেক্ষমাণ') return d.status === 'PENDING';
      if (activeFilter === 'সম্পন্ন') return d.status === 'DELIVERED';
      if (activeFilter === 'বাতিল') return d.status === 'CANCELLED';

      return true;
    });
  }, [deliveries, search, activeFilter]);

  const totalCount = deliveries.length;
  const inProgressCount = deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'ASSIGNED').length;
  const deliveredCount = deliveries.filter((d) => d.status === 'DELIVERED').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ডেলিভারি ট্র্যাকিং</Text>
          <Text style={styles.headerSub}>মোট {totalCount} টি ডেলিভারি</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={styles.sumValue}>{totalCount}</Text>
          <Text style={styles.sumLabel}>মোট ডেলিভারি</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.info }]}>{inProgressCount}</Text>
          <Text style={styles.sumLabel}>চলমান</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.success }]}>{deliveredCount}</Text>
          <Text style={styles.sumLabel}>সম্পন্ন</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="ডেলিভারি নম্বর বা গ্রাহক দিয়ে খুঁজুন" />
      </View>

      {/* Filter */}
      <FilterBar
        options={[...FILTERS]}
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
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="truck"
              title="কোনো ডেলিভারি পাওয়া যায়নি"
              description="কোনো ডেলিভারি তথ্য পাওয়া যায়নি বা অনুসন্ধানে মেলেনি।"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <DeliveryCard item={item} onPress={() => router.push(`/transport/deliveries/${item.id}` as any)} />
        )}
      />

      <FloatingActionButton
        onPress={() => router.push('/transport/deliveries/new' as any)}
        label="নতুন ডেলিভারি"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sumItem: {
    flex: 1,
    alignItems: 'center',
  },
  sumValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sumLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sumDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryNo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
