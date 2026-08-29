/**
 * FilterChip — reusable horizontal filter pill.
 * Used in Customers, Invoices, Dues, Reports screens.
 */
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Optional count badge */
  count?: number;
  /** Danger color for 'বকেয়া'-style chips */
  variant?: 'primary' | 'danger' | 'success' | 'warning';
}

export const FilterChip = ({
  label,
  active,
  onPress,
  count,
  variant = 'primary',
}: FilterChipProps) => {
  const variantColors = {
    primary: { bg: colors.primarySoft, border: colors.primaryBorder, text: colors.primary },
    danger: { bg: colors.dangerSoft, border: colors.dangerBorder, text: colors.danger },
    success: { bg: colors.successSoft, border: colors.successBorder, text: colors.success },
    warning: { bg: colors.warningSoft, border: colors.warningBorder, text: colors.warning },
  };
  const vc = variantColors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active && { backgroundColor: vc.bg, borderColor: vc.border },
      ]}
    >
      <Text style={[styles.label, active && { color: vc.text, fontWeight: '700' }]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.countBadge, active && { backgroundColor: vc.text }]}>
          <Text style={[styles.countText, active && { color: colors.surface }]}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/** Horizontal scrollable filter bar — wraps FilterChips */
interface FilterBarProps<T extends string> {
  options: T[];
  active: T;
  onSelect: (opt: T) => void;
  variant?: FilterChipProps['variant'];
  counts?: Partial<Record<T, number>>;
}

export function FilterBar<T extends string>({
  options,
  active,
  onSelect,
  variant = 'primary',
  counts,
}: FilterBarProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.barContent}
      style={styles.bar}
    >
      {options.map((opt) => (
        <FilterChip
          key={opt}
          label={opt}
          active={active === opt}
          onPress={() => onSelect(opt)}
          variant={variant}
          count={counts?.[opt]}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barContent: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
