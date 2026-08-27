import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard = ({ label, value, icon, iconBg, trend, trendUp }: StatCardProps) => (
  <View style={styles.card}>
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
    {trend && (
      <Text style={[styles.trend, trendUp ? styles.trendUp : styles.trendDown]}>
        {trendUp ? '↑' : '↓'} {trend}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  trend: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  trendUp: { color: colors.success },
  trendDown: { color: colors.danger },
});
