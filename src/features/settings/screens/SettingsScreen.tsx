import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings.api';

export const SettingsScreen = () => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ['companySettings'],
    queryFn: settingsApi.getCompanySettings,
  });

  useEffect(() => {
    if (company) {
      setBusinessName(company.name || '');
      setAddress(company.address || '');
      setPhone(company.phone || '');
    }
  }, [company]);

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('ত্রুটি', 'ব্যবসার নাম প্রদান করুন');
      return;
    }
    setSaving(true);
    try {
      await settingsApi.updateCompanySettings({
        name: businessName.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      Alert.alert('সফল', 'ব্যবসার তথ্য পরিবর্তন সংরক্ষণ করা হয়েছে');
      refetch();
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'সংরক্ষণ করা সম্ভব হয়নি');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackingUp(true);
    try {
      await settingsApi.triggerBackup('Manual cloud backup from mobile app');
      Alert.alert('সফল', 'ক্লাউড ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে।');
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'ব্যাকআপ সম্পন্ন করা সম্ভব হয়নি');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>সেটিংস</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ব্যবসার তথ্য</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.fields}>
              <AppInput
                label="ব্যবসার নাম"
                value={businessName}
                onChangeText={setBusinessName}
                leftIcon={<Feather name="briefcase" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="ঠিকানা"
                value={address}
                onChangeText={setAddress}
                leftIcon={<Feather name="map-pin" size={16} color={colors.textMuted} />}
              />
              <AppInput
                label="ফোন নম্বর"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Feather name="phone" size={16} color={colors.textMuted} />}
              />
              <AppButton
                title="পরিবর্তন সংরক্ষণ করুন"
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </View>

        {/* Data & Cloud Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ক্লাউড ডাটা ব্যাকআপ</Text>
          <View style={styles.backupCard}>
            <View style={styles.backupInfo}>
              <Feather name="cloud" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.backupTitle}>তথ্য ব্যাকআপ সার্ভিস</Text>
                <Text style={styles.backupSub}>আপনার সমস্ত তথ্য ক্লাউড সার্ভারে নিরাপদ রয়েছে।</Text>
              </View>
            </View>
            <AppButton
              title="নতুন ব্যাকআপ নিন"
              variant="outline"
              onPress={handleTriggerBackup}
              loading={backingUp}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 36,
  },
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fields: {
    gap: theme.spacing.md,
  },
  backupCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  backupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backupSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
