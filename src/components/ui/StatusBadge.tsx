import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: colors.successSoft, text: colors.success, border: colors.successBorder },
  danger: { bg: colors.dangerSoft, text: colors.danger, border: colors.dangerBorder },
  warning: { bg: colors.warningSoft, text: colors.warning, border: colors.warningBorder },
  info: { bg: colors.infoSoft, text: colors.info, border: colors.infoBorder },
  default: { bg: colors.background, text: colors.textSecondary, border: colors.border },
};

export const StatusBadge = ({ label, variant = 'default' }: StatusBadgeProps) => {
  const cfg = variantConfig[variant];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
