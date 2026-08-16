import React from 'react';
import { View } from 'react-native';
import { colors } from '@/constants/colors';

export const ScreenContainer = ({ children }: any) => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>
);