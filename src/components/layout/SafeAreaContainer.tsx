import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export const SafeAreaContainer = ({ children }: any) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>{children}</SafeAreaView>
);