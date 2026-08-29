import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface DividerProps {
  /** Margin above the divider */
  marginTop?: number;
  /** Margin below the divider */
  marginBottom?: number;
  /** Custom style for the divider line itself */
  style?: ViewStyle;
  /** Indent from the left edge */
  insetLeft?: number;
  /** Indent from the right edge */
  insetRight?: number;
}

/**
 * Divider — a thin 1px horizontal rule.
 * Use instead of inline `{ height: 1, backgroundColor: colors.border }`.
 */
export const Divider = ({
  marginTop = 0,
  marginBottom = 0,
  style,
  insetLeft = 0,
  insetRight = 0,
}: DividerProps) => (
  <View
    style={[
      styles.divider,
      {
        marginTop,
        marginBottom,
        marginLeft: insetLeft,
        marginRight: insetRight,
      },
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
