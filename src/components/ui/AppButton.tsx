import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
  fullWidth = true,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.touchPrimary, fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <View style={styles.inner}>
              {icon && <View style={styles.iconWrap}>{icon}</View>}
              <Text style={styles.primaryText}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<Exclude<ButtonVariant, 'primary'>, object> = {
    secondary: styles.secondary,
    danger: styles.dangerBtn,
    ghost: styles.ghost,
  };

  const variantTextStyles: Record<Exclude<ButtonVariant, 'primary'>, object> = {
    secondary: styles.secondaryText,
    danger: styles.dangerText,
    ghost: styles.ghostText,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant as Exclude<ButtonVariant, 'primary'>],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? colors.danger : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.baseText,
              variantTextStyles[variant as Exclude<ButtonVariant, 'primary'>],
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.55 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginRight: 8 },
  touchPrimary: {
    borderRadius: theme.radius.button,
    ...theme.shadows.button,
  },
  gradient: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  base: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerBtn: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  dangerText: {
    color: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.textSecondary,
  },
});