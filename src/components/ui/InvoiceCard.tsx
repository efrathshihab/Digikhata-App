import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatusBadge } from './StatusBadge';

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  total: number;
  paid: number;
  due: number;
  status: 'paid' | 'partial' | 'unpaid';
}

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

const statusConfig = {
  paid: { label: 'পরিশোধিত', variant: 'success' as const },
  partial: { label: 'আংশিক', variant: 'warning' as const },
  unpaid: { label: 'বকেয়া', variant: 'danger' as const },
};

export const InvoiceCard = ({ invoice, onPress }: InvoiceCardProps) => {
  const cfg = statusConfig[invoice.status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.top}>
        <View>
          <Text style={styles.invoiceNo}>#{invoice.invoiceNo}</Text>
          <Text style={styles.customer} numberOfLines={1}>{invoice.customerName}</Text>
        </View>
        <StatusBadge label={cfg.label} variant={cfg.variant} />
      </View>
      <View style={styles.divider} />
      <View style={styles.bottom}>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>তারিখ</Text>
          <Text style={styles.metaValue}>{invoice.date}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>মোট</Text>
          <Text style={styles.metaValue}>৳ {invoice.total.toLocaleString()}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>বকেয়া</Text>
          <Text style={[styles.metaValue, invoice.due > 0 ? styles.dueRed : styles.dueGreen]}>
            ৳ {invoice.due.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    ...theme.shadows.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  invoiceNo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  customer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dueRed: { color: colors.danger },
  dueGreen: { color: colors.success },
});
