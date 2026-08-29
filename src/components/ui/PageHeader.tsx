/**
 * PageHeader — centralized header used by all push-stack screens.
 * Handles: back button, centered or left-aligned title, optional right action.
 * Does NOT wrap in SafeAreaView — screens own their safe area.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface PageHeaderProps {
  /** Screen title */
  title: string;
  /** Optional line below title */
  subtitle?: string;
  /** Show back arrow (for nested screens) */
  showBack?: boolean;
  /** Custom back handler — defaults to router.back() */
  onBack?: () => void;
  /** Element rendered on the right side (icon btn, export btn, etc.) */
  rightElement?: React.ReactNode;
  /** Center the title (default: left-aligned when no back, left with offset when back) */
  centerTitle?: boolean;
}

export const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
  centerTitle = false,
}: PageHeaderProps) => {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.header}>
      {/* Left — back button or spacer */}
      {showBack ? (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}

      {/* Center / title */}
      <View style={[styles.titleWrap, centerTitle && styles.titleCenter]}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* Right */}
      {rightElement ? (
        <View style={styles.right}>{rightElement}</View>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
};

/** Convenience icon button for the header right slot */
export const HeaderIconButton = ({
  icon,
  onPress,
  accent = false,
  badge = false,
}: {
  icon: string;
  onPress: () => void;
  accent?: boolean;
  badge?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.iconBtn, accent && styles.iconBtnAccent]}
  >
    <Feather name={icon as any} size={18} color={accent ? colors.primary : colors.textSecondary} />
    {badge && <View style={styles.badge} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    minHeight: 54,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnAccent: {
    backgroundColor: colors.primarySoft,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  titleCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
