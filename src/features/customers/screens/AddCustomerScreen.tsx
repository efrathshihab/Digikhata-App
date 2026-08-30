import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';

interface FormData {
  serialNo: string;
  name: string;
  phone: string;
  village: string;
  address: string;
  openingBalance: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  openingBalance?: string;
}

export const AddCustomerScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      Alert.alert('সফল', 'নতুন গ্রাহক যোগ করা হয়েছে।', [
        { text: 'ঠিক আছে', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      console.log('Error creating customer:', error);
      Alert.alert('ত্রুটি', error.response?.data?.message || 'গ্রাহক যোগ করতে সমস্যা হয়েছে।');
    }
  });

  const [form, setForm] = useState<FormData>({
    serialNo: '',
    name: '',
    phone: '',
    village: '',
    address: '',
    openingBalance: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const update = (key: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'গ্রাহকের নাম আবশ্যক';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'ফোন নম্বর আবশ্যক';
    } else {
      const phoneClean = form.phone.replace(/[-\s]/g, '');
      const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(phoneClean)) {
        newErrors.phone = 'সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)';
      }
    }

    if (form.openingBalance.trim()) {
      const bal = parseFloat(form.openingBalance);
      if (isNaN(bal)) {
        newErrors.openingBalance = 'বৈধ সংখ্যা লিখুন';
      } else if (bal < 0) {
        newErrors.openingBalance = 'বকেয়া ঋণাত্মক হতে পারবে না';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (createCustomerMutation.isPending) return;
    if (!validate()) return;
    
    createCustomerMutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
      area: form.village.trim() || undefined,
      openingBalance: form.openingBalance.trim() ? (parseFloat(form.openingBalance) || 0).toFixed(2) : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নতুন গ্রাহক</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>মূল তথ্য</Text>

            <View style={styles.fields}>
              <AppInput
                label="সিরিয়াল নম্বর"
                placeholder="যেমন: ০০১"
                value={form.serialNo}
                onChangeText={update('serialNo')}
                keyboardType="numeric"
                leftIcon={<Feather name="hash" size={16} color={colors.textMuted} />}
              />

              <AppInput
                label="গ্রাহকের নাম *"
                placeholder="পূর্ণ নাম লিখুন"
                value={form.name}
                onChangeText={update('name')}
                error={errors.name}
                leftIcon={<Feather name="user" size={16} color={colors.textMuted} />}
              />

              <AppInput
                label="ফোন নম্বর *"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChangeText={update('phone')}
                keyboardType="phone-pad"
                error={errors.phone}
                leftIcon={<Feather name="phone" size={16} color={colors.textMuted} />}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Section: Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ঠিকানা</Text>

            <View style={styles.fields}>
              <AppInput
                label="গ্রাম / এলাকা"
                placeholder="গ্রাম বা এলাকার নাম"
                value={form.village}
                onChangeText={update('village')}
                leftIcon={<Feather name="map-pin" size={16} color={colors.textMuted} />}
              />

              <AppInput
                label="পূর্ণ ঠিকানা"
                placeholder="বিস্তারিত ঠিকানা লিখুন"
                value={form.address}
                onChangeText={update('address')}
                multiline
                numberOfLines={3}
                leftIcon={<Feather name="home" size={16} color={colors.textMuted} />}
              />
            </View>
          </View>

          {/* Section: Financial */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>আর্থিক তথ্য</Text>

            <View style={styles.fields}>
              <AppInput
                label="প্রারম্ভিক বকেয়া"
                placeholder="০"
                value={form.openingBalance}
                onChangeText={update('openingBalance')}
                keyboardType="numeric"
                error={errors.openingBalance}
                leftIcon={<Text style={styles.tkSign}>৳</Text>}
              />
              <Text style={styles.hint}>
                গ্রাহকের আগে থেকে থাকা বকেয়া থাকলে এখানে লিখুন।
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.submitWrap}>
          <AppButton
          title="সংরক্ষণ করুন"
          onPress={handleSubmit}
          loading={createCustomerMutation.isPending}
          icon={!createCustomerMutation.isPending ? <Feather name="check" size={18} color={colors.surface} /> : undefined}
        />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: 16,
    paddingBottom: 20,
  },
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
  fields: {
    gap: 14,
  },
  tkSign: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  submitWrap: {
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});