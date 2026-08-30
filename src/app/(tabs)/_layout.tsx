import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

// ─── Tab icon component ────────────────────────────────────────────────────────
interface TabIconProps {
  name: string;
  label: string;
  focused: boolean;
  /** Optional badge count */
  badge?: number;
}

const TabIcon = ({ name, label, focused, badge }: TabIconProps) => (
  <View style={styles.tabItem}>
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather
        name={name as any}
        size={20}
        color={focused ? colors.primary : colors.textSecondary}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar
        ],
        // Ensure tab bar is above Android nav bar
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid" label="ড্যাশবোর্ড" focused={focused} />
          ),
        }}
      />

      {/* Customers */}
      <Tabs.Screen
        name="customers"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="গ্রাহক" focused={focused} />
          ),
        }}
      />

      {/* Invoices */}
      <Tabs.Screen
        name="invoices"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="file-text" label="ইনভয়েস" focused={focused} />
          ),
        }}
      />

      {/* More */}
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="menu" label="আরও" focused={focused} badge={5} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    // Subtle top shadow
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    paddingTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.surface,
  },
});