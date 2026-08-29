import React, { useState } from 'react';
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

// ── Types & Data ──────────────────────────────────────────────────────────────
interface Delivery {
  id: string;
  deliveryNo: string;
  customerName: string;
  destination: string;
  driverName: string;
  vehicle: string;
  date: string;
  items: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
}

const ALL_DELIVERIES: Delivery[] = [
  { id: '1', deliveryNo: 'DLV-০০২৩', customerName: 'রহিম উদ্দিন', destination: 'মিরপুর-১২, ঢাকা', driverName: 'আলী হোসেন', vehicle: 'ঢাকা-মেট্রো-১২৩৪', date: '২৭ আগ ২০২৬', items: 'সিমেন্ট ৫০ ব্যাগ', status: 'delivered' },
  { id: '2', deliveryNo: 'DLV-০০২২', customerName: 'করিম মিয়া', destination: 'মতিঝিল, ঢাকা', driverName: 'করিম ড্রাইভার', vehicle: 'ঢাকা-মেট্রো-৫৬৭৮', date: '২৭ আগ ২০২৬', items: 'রড ১ টন', status: 'in_progress' },
  { id: '3', deliveryNo: 'DLV-০০২১', customerName: 'মোঃ সালাউদ্দিন', destination: 'নারায়ণগঞ্জ', driverName: 'রহিম ড্রাইভার', vehicle: 'নারা-১১১১', date: '২৬ আগ ২০২৬', items: 'ব্লক ৫০০ পিস', status: 'pending' },
  { id: '4', deliveryNo: 'DLV-০০২০', customerName: 'সুমাইয়া বেগম', destination: 'গাজীপুর', driverName: 'আলী হোসেন', vehicle: 'ঢাকা-মেট্রো-১২৩৪', date: '২৫ আগ ২০২৬', items: 'সিমেন্ট ১০০ ব্যাগ', status: 'delivered' },
  { id: '5', deliveryNo: 'DLV-০০১৯', customerName: 'শাহিদুল ইসলাম', destination: 'কেরানীগঞ্জ', driverName: 'করিম ড্রাইভার', vehicle: 'ঢাকা-মেট্রো-৫৬৭৮', date: '২৪ আগ ২০২৬', items: 'বিভিন্ন', status: 'cancelled' },
];

const statusCfg = {
  pending: { label: 'অপেক্ষমাণ', variant: 'warning' as const },
  in_progress: { label: 'চলমান', variant: 'info' as const },
  delivered: { label: 'সম্পন্ন', variant: 'success' as const },
  cancelled: { label: 'বাতিল', variant: 'danger' as const },
};

const FILTERS = ['সব', 'চলমান', 'অপেক্ষমাণ', 'সম্পন্ন', 'বাতিল'] as const;
type FilterKey = typeof FILTERS[number];

// ── Delivery Card ─────────────────────────────────────────────────────────────
const DeliveryCard = ({ item, onPress }: { item: Delivery; onPress: () => void }) => {
  const cfg = statusCfg[item.status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Feather name="truck" size={18} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <Text style={styles.deliveryNo}>{item.deliveryNo}</Text>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={11} color={colors.textMuted} />
            <Text style={styles.meta}>{item.destination}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.bottomItem}>
          <Feather name="user" size={12} color={colors.textMuted} />
          <Text style={styles.bottomText}>{item.driverName}</Text>
        </View>
        <View style={styles.bottomItem}>
          <Feather name="box" size={12} color={colors.textMuted} />
          <Text style={styles.bottomText} numberOfLines={1}>{item.items}</Text>
        </View>
        <View style={styles.bottomItem}>
          <Feather name="calendar" size={12} color={colors.textMuted} />
          <Text style={styles.bottomText}>{item.date}</Text>
        </View>
        <Feather name="chevron-right" size={15} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const DeliveriesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('সব');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = ALL_DELIVERIES.filter((d) => {
    const matchSearch = !search.trim() ||
      d.deliveryNo.includes(search) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.destination.includes(search);
    const matchFilter = filter === 'সব' ||
      statusCfg[d.status].label === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ডেলিভারি</Text>
          <Text style={styles.headerSub}>{ALL_DELIVERIES.length} টি রেকর্ড</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.warning }]}>
            {ALL_DELIVERIES.filter((d) => d.status === 'pending').length}
          </Text>
          <Text style={styles.sumLabel}>অপেক্ষমাণ</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.info }]}>
            {ALL_DELIVERIES.filter((d) => d.status === 'in_progress').length}
          </Text>
          <Text style={styles.sumLabel}>চলমান</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.success }]}>
            {ALL_DELIVERIES.filter((d) => d.status === 'delivered').length}
          </Text>
          <Text style={styles.sumLabel}>সম্পন্ন</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="ডেলিভারি নম্বর বা গ্রাহকের নাম" />
      </View>

      {/* Filters */}
      <FilterBar options={[...FILTERS]} active={filter} onSelect={setFilter} />

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
          <DeliveryCard item={item} onPress={() => router.push(`/transport/deliveries/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="truck" title="কোনো ডেলিভারি পাওয়া যায়নি" />
        }
      />

      <FloatingActionButton onPress={() => router.push('/transport/deliveries/new')} label="নতুন ডেলিভারি" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background,
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
    flexDirection: 'row', backgroundColor: colors.surface,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sumItem: { flex: 1, alignItems: 'center' },
  sumValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sumLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sumDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  searchWrap: {
    paddingHorizontal: theme.spacing.md, paddingVertical: 10,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...theme.shadows.card,
  },
  cardTop: { flexDirection: 'row', padding: 13, gap: 12 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deliveryNo: { fontSize: 13, fontWeight: '700', color: colors.primary },
  customerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, color: colors.textSecondary },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, paddingHorizontal: 13,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
  },
  bottomItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  bottomText: { fontSize: 11, color: colors.textSecondary, flex: 1 },
});
