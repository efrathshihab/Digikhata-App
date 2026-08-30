import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const HelpSupportScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>সাহায্য ও সাপোর্ট</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <SectionHeader title="যোগাযোগ" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => {}}>
            <View style={styles.iconBox}>
              <Feather name="phone-call" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>কল করুন</Text>
              <Text style={styles.infoSub}>+880 1234-567890</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => {}}>
            <View style={styles.iconBox}>
              <Feather name="mail" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ইমেইল করুন</Text>
              <Text style={styles.infoSub}>support@digikhata.com</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SectionHeader title="সাধারণ জিজ্ঞাসা (FAQ)" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.faqRow} activeOpacity={0.7} onPress={() => {}}>
            <Text style={styles.faqTitle}>কিভাবে নতুন গ্রাহক যোগ করবেন?</Text>
            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.faqRow} activeOpacity={0.7} onPress={() => {}}>
            <Text style={styles.faqTitle}>কিভাবে ইনভয়েস প্রিন্ট করবেন?</Text>
            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.faqRow} activeOpacity={0.7} onPress={() => {}}>
            <Text style={styles.faqTitle}>পাসওয়ার্ড ভুলে গেলে করণীয় কি?</Text>
            <Feather name="chevron-down" size={18} color={colors.textMuted} />
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
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
