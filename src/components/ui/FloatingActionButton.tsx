import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
}

export const FloatingActionButton = ({ onPress, label, style }: FloatingActionButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.fab, !label && styles.fabIconOnly]}
      >
        <Feather name="plus" size={22} color={colors.surface} />
        {label && <Text style={styles.label}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    ...theme.shadows.fab,
    borderRadius: theme.radius.fab,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.fab,
    paddingHorizontal: 18,
    height: theme.sizes.fabSize,
    minWidth: theme.sizes.fabSize,
    justifyContent: 'center',
  },
  fabIconOnly: {
    paddingHorizontal: 0,
    width: theme.sizes.fabSize,
  },
  label: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
