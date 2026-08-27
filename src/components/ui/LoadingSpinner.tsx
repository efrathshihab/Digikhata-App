import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner = ({ label }: LoadingSpinnerProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    {label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  label: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
});