import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface TabIconProps {
  name: string;
  label: string;
  focused: boolean;
}

const TabIcon = ({ name, label, focused }: TabIconProps) => (
  <View style={styles.tabItem}>
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Feather
        name={name as any}
        size={20}
        color={focused ? colors.primary : colors.textSecondary}
      />
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid" label="ড্যাশবোর্ড" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="গ্রাহক" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="file-text" label="ইনভয়েস" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="menu" label="আরও" focused={focused} />
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
    height: Platform.OS === 'ios' ? 80 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 36,
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
});