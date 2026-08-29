import React, { useState } from 'react';
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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNo: string;
  status: 'available' | 'on_duty' | 'off';
  deliveriesCount: number;
}

const DRIVERS: Driver[] = [
  { id: '1', name: 'আলী হোসেন', phone: '01711-111222', vehicle: 'ট্রাক', vehicleNo: 'ঢাকা-মেট্রো-১২৩৪', status: 'on_duty', deliveriesCount: 145 },
  { id: '2', name: 'করিম ড্রাইভার', phone: '01811-333444', vehicle: 'পিকআপ', vehicleNo: 'ঢাকা-মেট্রো-৫৬৭৮', status: 'available', deliveriesCount: 89 },
  { id: '3', name: 'রহিম ড্রাইভার', phone: '01611-555666', vehicle: 'ট্রাক', vehicleNo: 'নারা-১১১১', status: 'off', deliveriesCount: 203 },
  { id: '4', name: 'জামাল উদ্দিন', phone: '01911-777888', vehicle: 'কভার্ড ভ্যান', vehicleNo: 'গাজী-২২২২', status: 'available', deliveriesCount: 67 },
];

const statusCfg = {
  available: { label: 'উপলব্ধ', variant: 'success' as const },
  on_duty: { label: 'কাজে আছেন', variant: 'info' as const },
  off: { label: 'অফ', variant: 'default' as const },
};

const DriverCard = ({ driver }: { driver: Driver }) => {
  const cfg = statusCfg[driver.status];
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{driver.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{driver.name}</Text>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <View style={styles.metaRow}>
          <Feather name="truck" size={12} color={colors.textMuted} />
          <Text style={styles.meta}>{driver.vehicle} · {driver.vehicleNo}</Text>
        </View>
        <Text style={styles.deliveryCount}>{driver.deliveriesCount} টি ডেলিভারি সম্পন্ন</Text>
      </View>
      <TouchableOpacity
        style={styles.callBtn}
        activeOpacity={0.7}
        onPress={() => Linking.openURL(`tel:${driver.phone}`)}
      >
        <Feather name="phone" size={16} color={colors.success} />
      </TouchableOpacity>
    </View>
  );
};

export const DriversScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = DRIVERS.filter((d) =>
    !search.trim() ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicleNo.includes(search)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>চালক তালিকা</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Summary */}
      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={styles.sumValue}>{DRIVERS.length}</Text>
          <Text style={styles.sumLabel}>মোট চালক</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.success }]}>
            {DRIVERS.filter((d) => d.status === 'available').length}
          </Text>
          <Text style={styles.sumLabel}>উপলব্ধ</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.info }]}>
            {DRIVERS.filter((d) => d.status === 'on_duty').length}
          </Text>
          <Text style={styles.sumLabel}>কাজে আছেন</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="চালকের নাম বা গাড়ি নম্বর" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <DriverCard driver={item} />}
        ListEmptyComponent={<EmptyState icon="user" title="কোনো চালক পাওয়া যায়নি" />}
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
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, color: colors.textSecondary },
  deliveryCount: { fontSize: 11, color: colors.textMuted },
  callBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.successBorder,
    alignItems: 'center', justifyContent: 'center',
  },
});
