import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

export const AppButton = ({ title, onPress }: any) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({ button: { backgroundColor: colors.primary, borderRadius: theme.radius.button, padding: theme.spacing.md, alignItems: 'center' }, text: { color: colors.surface } });