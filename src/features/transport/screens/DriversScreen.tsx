import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
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
import { deliveriesApi, Driver as ApiDriver } from '@/api/deliveries.api';

const statusCfg: Record<string, { label: string; variant: 'success' | 'info' | 'default' | 'danger' }> = {
  ACTIVE: { label: 'উপলব্ধ', variant: 'success' },
  ON_LEAVE: { label: 'ছুটিতে', variant: 'info' },
  INACTIVE: { label: 'অফ', variant: 'default' },
};

const DriverCard = ({ driver }: { driver: ApiDriver }) => {
  const cfg = statusCfg[driver.status] || { label: driver.status, variant: 'default' };
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
          <Feather name="shield" size={12} color={colors.textMuted} />
          <Text style={styles.meta}>কোড: {driver.driverCode} {driver.licenseNo ? `· লাইসেন্স: ${driver.licenseNo}` : ''}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => Linking.openURL(`tel:${driver.phone}`)}
        activeOpacity={0.7}
      >
        <Feather name="phone-call" size={16} color={colors.success} />
      </TouchableOpacity>
    </View>
  );
};

export const DriversScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => deliveriesApi.getDrivers({ limit: 100 }),
  });

  const driversList = data?.items || [];

  const filtered = driversList.filter(
    (d) =>
      !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.driverCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ড্রাইভার তালিকা</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="ড্রাইভারের নাম বা ফোন নম্বর" />
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
              icon="user-check"
              title="কোনো ড্রাইভার পাওয়া যায়নি"
              description="তালিকায় কোনো ড্রাইভারের তথ্য নেই।"
            />
          ) : null
        }
        renderItem={({ item }) => <DriverCard driver={item} />}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
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
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
