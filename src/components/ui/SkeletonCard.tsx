/**
 * SkeletonCard — animated placeholder shown while data is loading.
 * Uses a simple opacity pulse animation — no external deps required.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface SkeletonCardProps {
  style?: ViewStyle;
  /** Show rows inside the card (default 2) */
  rows?: number;
  /** Show avatar circle on the left */
  showAvatar?: boolean;
}

const SkeletonLine = ({
  width = '100%',
  height = 12,
  style,
  opacity,
}: {
  width?: any;
  height?: number;
  style?: ViewStyle;
  opacity: Animated.Value;
}) => (
  <Animated.View
    style={[
      {
        width,
        height,
        borderRadius: 6,
        backgroundColor: colors.border,
        opacity,
      },
      style,
    ]}
  />
);

export const SkeletonCard = ({
  style,
  rows = 2,
  showAvatar = true,
}: SkeletonCardProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        {showAvatar && (
          <Animated.View
            style={[styles.avatar, { opacity }]}
          />
        )}
        <View style={styles.lines}>
          <SkeletonLine opacity={opacity} width="70%" height={13} />
          {rows >= 2 && (
            <SkeletonLine opacity={opacity} width="50%" height={11} style={{ marginTop: 8 }} />
          )}
          {rows >= 3 && (
            <SkeletonLine opacity={opacity} width="40%" height={10} style={{ marginTop: 7 }} />
          )}
        </View>
        <View style={styles.rightLines}>
          <SkeletonLine opacity={opacity} width={60} height={14} />
          <SkeletonLine opacity={opacity} width={50} height={10} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
};

/** Renders n skeleton cards stacked */
export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} style={{ marginBottom: 10 }} />
    ))}
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  lines: {
    flex: 1,
  },
  rightLines: {
    alignItems: 'flex-end',
    marginLeft: 12,
    gap: 6,
  },
});
