import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

export const AppInput = (props: any) => (
  <TextInput style={styles.input} {...props} />
);

const styles = StyleSheet.create({ input: { borderWidth: 1, borderColor: colors.border, borderRadius: theme.radius.input, padding: theme.spacing.md } });