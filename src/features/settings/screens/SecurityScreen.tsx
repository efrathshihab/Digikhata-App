import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const SecurityScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>পাসওয়ার্ড ও নিরাপত্তা</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <SectionHeader title="নিরাপত্তা সেটিংস" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <Feather name="lock" size={20} color={colors.textSecondary} />
              <Text style={styles.rowText}>পাসওয়ার্ড পরিবর্তন করুন</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <Feather name="smartphone" size={20} color={colors.textSecondary} />
              <Text style={styles.rowText}>টু-স্টেপ ভেরিফিকেশন (2FA)</Text>
            </View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>শীঘ্রই আসছে</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SectionHeader title="অ্যাক্টিভিটি" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <Feather name="log-out" size={20} color={colors.danger} />
              <Text style={[styles.rowText, { color: colors.danger }]}>অন্যান্য ডিভাইস থেকে লগআউট করুন</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.button,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  placeholder: { width: 36 },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  badgeWrap: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
