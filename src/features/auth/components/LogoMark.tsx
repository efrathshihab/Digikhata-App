import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface LogoMarkProps {
  size?: number;
}

export const LogoMark = ({ size = 44 }: LogoMarkProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          padding: size * 0.22,
        },
      ]}
    >
      <Svg viewBox="0 0 40 40" fill="none" style={{ width: '100%', height: '100%' }}>
        {/* Truck body */}
        <Rect
          x="4"
          y="13"
          width="20"
          height="14"
          rx="2"
          stroke={colors.primary}
          strokeWidth="1.8"
          fill="none"
        />
        {/* Truck cab */}
        <Path
          d="M24 18h6.5l3.5 4.5V27H24V18Z"
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Wheels */}
        <Circle cx="10" cy="28.5" r="2.5" stroke={colors.primary} strokeWidth="1.8" fill="none" />
        <Circle cx="28" cy="28.5" r="2.5" stroke={colors.primary} strokeWidth="1.8" fill="none" />
        {/* Ledger lines on body */}
        <Line x1="8" y1="18" x2="20" y2="18" stroke={colors.primary} strokeWidth="1.4" strokeLinecap="round" />
        <Line x1="8" y1="21" x2="16" y2="21" stroke={colors.primary} strokeWidth="1.4" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: theme.radius.logo,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
