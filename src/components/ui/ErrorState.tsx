/**
 * ErrorState — shown when a data fetch fails.
 * Provides a retry action.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({
  title = 'কিছু একটা ভুল হয়েছে',
  description = 'তথ্য লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
  onRetry,
  retryLabel = 'আবার চেষ্টা করুন',
}: ErrorStateProps) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Feather name="alert-circle" size={32} color={colors.danger} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {onRetry && (
      <TouchableOpacity onPress={onRetry} activeOpacity={0.7} style={styles.retryBtn}>
        <Feather name="refresh-cw" size={14} color={colors.primary} />
        <Text style={styles.retryLabel}>{retryLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    gap: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginTop: 6,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
