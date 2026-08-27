import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const AppCard = ({ children, style, padding }: AppCardProps) => (
  <View style={[styles.card, padding !== undefined && { padding }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
});