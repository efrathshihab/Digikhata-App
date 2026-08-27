import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
