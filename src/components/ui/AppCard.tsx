import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

export const AppCard = ({ children }: any) => (
  <View style={styles.card}>{children}</View>
);

const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: theme.radius.card, padding: theme.spacing.md } });