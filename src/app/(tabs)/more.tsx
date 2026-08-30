import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth.api';
import { tokenStorage } from '@/storage/tokenStorage';

interface MenuItemProps {
  icon: string;
  label: string;
  description?: string;
  iconBg: string;
  iconColor: string;
  onPress: () => void;
  badge?: string;
  badgeVariant?: 'danger' | 'warning' | 'success';
  divider?: boolean;
}

const badgeColors = {
  danger: colors.danger,
  warning: colors.warning,
  success: colors.success,
};

const MenuItem = ({
  icon,
  label,
  description,
  iconBg,
  iconColor,
  onPress,
  badge,
  badgeVariant = 'danger',
  divider,
}: MenuItemProps) => (
  <>
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.menuItem}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {description && <Text style={styles.menuDescription}>{description}</Text>}
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColors[badgeVariant] }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
    {divider && <View style={styles.divider} />}
  </>
);

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

const MenuGroup = ({ title, children }: MenuGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.groupCard}>{children}</View>
  </View>
);

export default function MoreRoute() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'লগআউট',
      'আপনি কি নিশ্চিতভাবে লগআউট করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'লগআউট',
          style: 'destructive',
          onPress: async () => {
            await authApi.logout();
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>আরও</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.name?.charAt(0) || 'আ'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'ব্যবহারকারী'}</Text>
            <Text style={styles.profileBiz}>{user?.shopId ? 'আপনার দোকান' : 'মেসার্স আহমেদ ট্রেডার্স'}</Text>
            <Text style={styles.profilePhone}>{user?.email || '+880 1711-223344'}</Text>
          </View>
          <View style={styles.profileEdit}>
            <Feather name="edit-2" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Business operations */}
        <MenuGroup title="ব্যবসায়িক কার্যক্রম">
          <MenuItem
            icon="credit-card"
            label="পেমেন্ট"
            description="পেমেন্ট আদায় ও ইতিহাস"
            iconBg={colors.successSoft}
            iconColor={colors.success}
            onPress={() => router.push('/payments')}
            divider
          />
          <MenuItem
            icon="truck"
            label="পরিবহন"
            description="ডেলিভারি ও পরিবহন ব্যবস্থাপনা"
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            onPress={() => router.push('/transport')}
            divider
          />
          <MenuItem
            icon="bar-chart-2"
            label="রিপোর্ট"
            description="বিক্রয়, আদায় ও বকেয়ার রিপোর্ট"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            onPress={() => router.push('/reports')}
            divider
          />
          <MenuItem
            icon="clock"
            label="বকেয়া"
            description="মোট ও গ্রাহক-ভিত্তিক বকেয়া"
            iconBg={colors.dangerSoft}
            iconColor={colors.danger}
            onPress={() => router.push('/dues')}
            badge="৫"
            badgeVariant="danger"
          />
        </MenuGroup>

        {/* Account */}
        <MenuGroup title="অ্যাকাউন্ট">
          <MenuItem
            icon="user"
            label="প্রোফাইল"
            description="ব্যক্তিগত তথ্য সম্পাদনা"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            onPress={() => router.push('/settings')}
            divider
          />
          <MenuItem
            icon="lock"
            label="পাসওয়ার্ড ও নিরাপত্তা"
            iconBg={colors.warningSoft}
            iconColor={colors.warning}
            onPress={() => router.push('/security')}
            divider
          />
          <MenuItem
            icon="bell"
            label="নোটিফিকেশন"
            description="পেমেন্ট ও বকেয়া অনুস্মারক"
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            onPress={() => router.push('/notifications')}
          />
        </MenuGroup>

        {/* Admin & Tools */}
        <MenuGroup title="অন্যান্য সেবা">
          <MenuItem
            icon="message-square"
            label="SMS ইতিহাস"
            description="প্রেরিত এসএমএস ও ডেলিভারি স্ট্যাটাস"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            onPress={() => router.push('/sms')}
            divider
          />
          <MenuItem
            icon="users"
            label="ব্যবহারকারী"
            description="অ্যাপ ব্যবহারকারী পরিচালনা"
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            onPress={() => router.push('/users')}
          />
        </MenuGroup>

        {/* Settings */}
        <MenuGroup title="সেটিংস">
          <MenuItem
            icon="settings"
            label="সেটিংস"
            description="ব্যবসা, ভাষা ও মুদ্রা"
            iconBg={colors.background}
            iconColor={colors.textSecondary}
            onPress={() => router.push('/settings')}
            divider
          />
          <MenuItem
            icon="help-circle"
            label="সাহায্য ও সহায়তা"
            iconBg={colors.successSoft}
            iconColor={colors.success}
            onPress={() => router.push('/help')}
          />
        </MenuGroup>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutBtn}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>লগআউট</Text>
        </TouchableOpacity>

        <View style={styles.version}>
          <Text style={styles.versionText}>DigiKhata v1.0.0 · সর্বস্বত্ব সংরক্ষিত © ২০২৬</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  pageHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 16, paddingBottom: 32 },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: { fontSize: 22, fontWeight: '700', color: colors.surface },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  profileBiz: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  profilePhone: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  profileEdit: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  group: { gap: 8 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...theme.shadows.card,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  menuDescription: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.surface },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 64 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: theme.radius.card,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },

  version: { alignItems: 'center', paddingTop: 4 },
  versionText: { fontSize: 12, color: colors.textMuted },
});