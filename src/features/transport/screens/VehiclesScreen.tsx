import React, { useState } from 'react';
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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterChip';

interface Vehicle {
  id: string;
  vehicleNo: string;
  type: string;
  driverName: string;
  status: 'active' | 'maintenance' | 'inactive';
}

const VEHICLES: Vehicle[] = [
  { id: '1', vehicleNo: 'ঢাকা-মেট্রো-১২৩৪', type: 'ট্রাক', driverName: 'আলী হোসেন', status: 'active' },
  { id: '2', vehicleNo: 'ঢাকা-মেট্রো-৫৬৭৮', type: 'পিকআপ', driverName: 'করিম ড্রাইভার', status: 'active' },
  { id: '3', vehicleNo: 'নারা-১১১১', type: 'ট্রাক', driverName: 'রহিম ড্রাইভার', status: 'maintenance' },
  { id: '4', vehicleNo: 'গাজী-২২২২', type: 'কভার্ড ভ্যান', driverName: 'জামাল উদ্দিন', status: 'inactive' },
];

const statusCfg = {
  active: { label: 'সক্রিয়', variant: 'success' as const },
  maintenance: { label: 'মেইনটেন্যান্স', variant: 'warning' as const },
  inactive: { label: 'নিষ্ক্রিয়', variant: 'danger' as const },
};

const FILTERS = ['সব', 'সক্রিয়', 'মেইনটেন্যান্স', 'নিষ্ক্রিয়'] as const;
type FilterKey = typeof FILTERS[number];

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const cfg = statusCfg[vehicle.status];
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Feather name="truck" size={20} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.vehicleNo}>{vehicle.vehicleNo}</Text>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <Text style={styles.type}>{vehicle.type}</Text>
        <View style={styles.driverRow}>
          <Feather name="user" size={14} color={colors.textMuted} />
          <Text style={styles.driverName}>{vehicle.driverName || 'চালক নির্ধারিত নেই'}</Text>
        </View>
      </View>
    </View>
  );
};

export const VehiclesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('সব');

  const filtered = VEHICLES.filter((v) => {
    const matchSearch = !search.trim() || v.vehicleNo.includes(search) || v.driverName.includes(search);
    const matchFilter = filter === 'সব' || statusCfg[v.status].label === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>যানবাহন তালিকা</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={styles.sumValue}>{VEHICLES.length}</Text>
          <Text style={styles.sumLabel}>মোট যান</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.success }]}>
            {VEHICLES.filter((v) => v.status === 'active').length}
          </Text>
          <Text style={styles.sumLabel}>সক্রিয়</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.warning }]}>
            {VEHICLES.filter((v) => v.status === 'maintenance').length}
          </Text>
          <Text style={styles.sumLabel}>মেইনটেন্যান্স</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="গাড়ি নম্বর বা চালকের নাম" />
      </View>

      <FilterBar options={[...FILTERS]} active={filter} onSelect={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
        ListEmptyComponent={<EmptyState icon="truck" title="কোনো যানবাহন পাওয়া যায়নি" />}
      />
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
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
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card,
    borderWidth: 1, borderColor: colors.border, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, ...theme.shadows.card,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vehicleNo: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  type: { fontSize: 13, color: colors.textSecondary },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  driverName: { fontSize: 13, color: colors.textMuted },
});
