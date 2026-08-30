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
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive';
}

const USERS_DATA: User[] = [
  { id: '1', name: 'অ্যাডমিন', role: 'মালিক', phone: '01711-000000', status: 'active' },
  { id: '2', name: 'রহিম ম্যানেজার', role: 'ম্যানেজার', phone: '01811-000000', status: 'active' },
  { id: '3', name: 'করিম সেলসম্যান', role: 'সেলসম্যান', phone: '01911-000000', status: 'active' },
  { id: '4', name: 'সাবেক সেলসম্যান', role: 'সেলসম্যান', phone: '01611-000000', status: 'inactive' },
];

const statusCfg = {
  active: { label: 'সক্রিয়', variant: 'success' as const },
  inactive: { label: 'নিষ্ক্রিয়', variant: 'danger' as const },
};

const UserCard = ({ user }: { user: User }) => {
  const cfg = statusCfg[user.status];

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
        <Text style={styles.role}>{user.role}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
      </View>
      <TouchableOpacity style={styles.actionBtn}>
        <Feather name="more-vertical" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

export const UsersScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = USERS_DATA.filter((u) =>
    !search.trim() || u.name.includes(search) || u.phone.includes(search)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ব্যবহারকারী</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="নাম বা নম্বর খুঁজুন" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <UserCard user={item} />}
        ListEmptyComponent={<EmptyState icon="users" title="কোনো ব্যবহারকারী পাওয়া যায়নি" />}
      />

      <FloatingActionButton onPress={() => {}} label="নতুন ব্যবহারকারী" />
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
  searchWrap: {
    paddingHorizontal: theme.spacing.md, paddingVertical: 10,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 24 },
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
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  role: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  phone: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  actionBtn: { padding: 4 },
});
