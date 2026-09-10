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
import { useQuery } from '@tanstack/react-query';
import { deliveriesApi, Vehicle as ApiVehicle } from '@/api/deliveries.api';

const statusCfg: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  AVAILABLE: { label: 'উপলব্ধ', variant: 'success' },
  IN_USE: { label: 'কাজে আছে', variant: 'info' },
  MAINTENANCE: { label: 'মেইনটেন্যান্স', variant: 'warning' },
  INACTIVE: { label: 'নিষ্ক্রিয়', variant: 'danger' },
};

const VehicleCard = ({ vehicle }: { vehicle: ApiVehicle }) => {
  const cfg = statusCfg[vehicle.status] || { label: vehicle.status, variant: 'info' };
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Feather name="truck" size={20} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.vehicleNo}>{vehicle.registrationNumber}</Text>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <Text style={styles.type}>ধরন: {vehicle.type} {vehicle.capacity ? `· ধারণক্ষমতা: ${vehicle.capacity}` : ''}</Text>
      </View>
    </View>
  );
};

export const VehiclesScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => deliveriesApi.getVehicles({ limit: 100 }),
  });

  const vehiclesList = data?.items || [];

  const filtered = vehiclesList.filter(
    (v) =>
      !search.trim() ||
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>যানবাহন তালিকা</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="রেজিস্ট্রেশন নম্বর বা ধরন" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="truck"
              title="কোনো যানবাহন পাওয়া যায়নি"
              description="যানবাহন তালিকায় তথ্য পাওয়া যায়নি।"
            />
          ) : null
        }
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.md,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  vehicleNo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  type: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
