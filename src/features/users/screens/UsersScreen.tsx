import React, { useState } from 'react';
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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserItem } from '@/api/users.api';

const statusCfg: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  ACTIVE: { label: 'সক্রিয়', variant: 'success' },
  INACTIVE: { label: 'নিষ্ক্রিয়', variant: 'danger' },
  LOCKED: { label: 'লকড', variant: 'warning' },
};

const roleLabels: Record<string, string> = {
  OWNER: 'মালিক',
  ADMIN: 'অ্যাডমিন',
  MANAGER: 'ম্যানেজার',
  ACCOUNTANT: 'অ্যাকাউন্ট্যান্ট',
  OPERATOR: 'অপারেটর',
  DRIVER: 'ড্রাইভার',
  VIEWER: 'দর্শনার্থী',
};

const UserCard = ({ user, onToggleStatus }: { user: UserItem; onToggleStatus: () => void }) => {
  const cfg = statusCfg[user.status] || { label: user.status, variant: 'danger' };
  const roleName = roleLabels[user.role] || user.role;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <Text style={styles.role}>{roleName} · @{user.username}</Text>
        {user.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
      </View>

      <TouchableOpacity style={styles.statusToggleBtn} onPress={onToggleStatus} activeOpacity={0.7}>
        <Feather name={user.status === 'ACTIVE' ? 'pause-circle' : 'play-circle'} size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export const UsersScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['users', { search }],
    queryFn: () => usersApi.getUsers({ search: search || undefined, limit: 100 }),
  });

  const usersList = data?.items || [];

  const filtered = usersList.filter(
    (u) =>
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
  );

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await usersApi.updateUserStatus(user.id, nextStatus);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert('সফল', `ব্যবহারকারীর স্ট্যাটাস ${nextStatus === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ব্যবহারকারী ব্যবস্থাপনা</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="নাম, ইউজারনেম বা ফোন নম্বর" />
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
              icon="users"
              title="কোনো ব্যবহারকারী পাওয়া যায়নি"
              description="তালিকায় কোনো টিমের সদস্য পাওয়া যায়নি।"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <UserCard user={item} onToggleStatus={() => handleToggleStatus(item)} />
        )}
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
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  role: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  phone: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusToggleBtn: {
    padding: 8,
  },
});
