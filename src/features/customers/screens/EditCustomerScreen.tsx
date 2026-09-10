import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { customersApi } from '@/api/customers.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const EditCustomerScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [creditLimit, setCreditLimit] = useState('0');
  const [loading, setLoading] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomer(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setBusinessName(customer.businessName || '');
      setAddress(customer.address || '');
      setArea(customer.area || '');
      setCreditLimit(customer.creditLimit || '0');
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!id) return;
    if (!name.trim()) {
      Alert.alert('ত্রুটি', 'গ্রাহকের নাম প্রদান করুন');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('ত্রুটি', 'ফোন নম্বর প্রদান করুন');
      return;
    }

    setLoading(true);
    try {
      await customersApi.updateCustomer(id, {
        name: name.trim(),
        phone: phone.trim(),
        businessName: businessName.trim() || undefined,
        address: address.trim() || undefined,
        area: area.trim() || undefined,
        creditLimit: creditLimit.trim() || '0',
      });

      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      Alert.alert('সফল', 'গ্রাহকের তথ্য সফলভাবে পরিবর্তন করা হয়েছে');
      router.back();
    } catch (e: any) {
      const msg = e.response?.data?.error?.message || e.message || 'গ্রাহকের তথ্য পরিবর্তন করা সম্ভব হয়নি';
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>গ্রাহকের তথ্য সম্পাদনা</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>গ্রাহকের নাম *</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: রহিম উদ্দিন"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ফোন নম্বর *</Text>
          <TextInput
            style={styles.input}
            placeholder="01711223344"
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>প্রতিষ্ঠানের নাম</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: রহিম মেসার্স"
            placeholderTextColor={colors.textMuted}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>এলাকা / গ্রাম</Text>
            <TextInput
              style={styles.input}
              placeholder="মিরপুর"
              placeholderTextColor={colors.textMuted}
              value={area}
              onChangeText={setArea}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>বাকির সীমা (৳)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              placeholderTextColor={colors.textMuted}
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ঠিকানা</Text>
          <TextInput
            style={styles.input}
            placeholder="সম্পূর্ণ ঠিকানা"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitBtnText}>সংরক্ষণ করুন</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: theme.spacing.lg,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    height: theme.sizes.inputHeight,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.radius.input,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  submitBtn: {
    height: theme.sizes.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
