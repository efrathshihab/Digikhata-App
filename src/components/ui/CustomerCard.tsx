import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatusBadge } from './StatusBadge';

export interface Customer {
  id: string;
  serialNo: string;
  name: string;
  phone: string;
  village: string;
  totalDue: number;
  lastTransactionDate?: string;
  status: 'active' | 'inactive' | 'overdue';
}

interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
}

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function formatCurrency(amount: number): string {
  return `৳ ${Math.abs(amount).toLocaleString('en-BD')}`;
}

export const CustomerCard = ({ customer, onPress }: CustomerCardProps) => {
  const hasDue = customer.totalDue > 0;

  const statusVariant = customer.status === 'overdue'
    ? 'danger'
    : customer.status === 'inactive'
    ? 'default'
    : 'success';

  const statusLabel = customer.status === 'overdue'
    ? 'বকেয়া'
    : customer.status === 'inactive'
    ? 'নিষ্ক্রিয়'
    : 'সক্রিয়';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
          <StatusBadge label={statusLabel} variant={statusVariant} />
        </View>
        <Text style={styles.meta}>#{customer.serialNo} · {customer.phone}</Text>
        <Text style={styles.meta} numberOfLines={1}>{customer.village}</Text>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        <Text style={[styles.due, hasDue ? styles.dueRed : styles.dueClear]}>
          {hasDue ? formatCurrency(customer.totalDue) : 'পরিশোধিত'}
        </Text>
        {customer.lastTransactionDate && (
          <Text style={styles.date}>{customer.lastTransactionDate}</Text>
        )}
        <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    ...theme.shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    marginLeft: 8,
  },
  due: {
    fontSize: 14,
    fontWeight: '700',
  },
  dueRed: {
    color: colors.danger,
  },
  dueClear: {
    color: colors.success,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chevron: {
    marginTop: 2,
  },
});
