import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

export const SettingsScreen = () => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('মেসার্স আহমেদ ট্রেডার্স');
  const [address, setAddress] = useState('মিরপুর-১২, ঢাকা-১২১৬');
  const [phone, setPhone] = useState('+880 1711-223344');
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifyDue, setNotifyDue] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
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
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>অ্যাপ্লিকেশন</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>ভাষা</Text>
              <Text style={styles.settingValue}>বাংলা</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>মুদ্রা</Text>
              <Text style={styles.settingValue}>BDT (৳)</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>নোটিফিকেশন</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.settingLabel}>পেমেন্ট গ্রহণ</Text>
              <Text style={styles.switchDesc}>পেমেন্ট পাওয়ার সাথে সাথে অবহিত করুন</Text>
            </View>
            <Switch
              value={notifyPayment}
              onValueChange={setNotifyPayment}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={notifyPayment ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.settingLabel}>বকেয়া অনুস্মারক</Text>
              <Text style={styles.switchDesc}>নির্ধারিত সময়ে বকেয়া মনে করিয়ে দিন</Text>
            </View>
            <Switch
              value={notifyDue}
              onValueChange={setNotifyDue}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={notifyDue ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        <AppButton
          title="পরিবর্তন সংরক্ষণ করুন"
          onPress={handleSave}
          loading={saving}
          icon={<Feather name="save" size={15} color={colors.surface} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerRight: { width: 36 },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 16, paddingBottom: 32 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fields: { gap: 14 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  settingValue: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchInfo: { flex: 1, paddingRight: 16 },
  switchDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
});
