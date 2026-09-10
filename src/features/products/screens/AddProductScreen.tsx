import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { productsApi } from '@/api/products.api';
import { useQueryClient } from '@tanstack/react-query';

export const AddProductScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('পিস');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('ত্রুটি', 'পণ্যের নাম প্রদান করুন');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('ত্রুটি', 'সঠিক বিক্রয় মূল্য প্রদান করুন');
      return;
    }

    setLoading(true);
    try {
      await productsApi.createProduct({
        name: name.trim(),
        unit: unit.trim() || 'পিস',
        price: price.trim(),
        costPrice: costPrice.trim() || undefined,
        stockQuantity: stockQuantity.trim() || '0',
        minStockAlert: minStockAlert.trim() || '10',
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      Alert.alert('সফল', 'নতুন পণ্য সফলভাবে যুক্ত হয়েছে');
      router.back();
    } catch (e: any) {
      const msg = e.response?.data?.error?.message || e.message || 'পণ্য যুক্ত করা সম্ভব হয়নি';
      Alert.alert('ত্রুটি', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নতুন পণ্য যোগ করুন</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>পণ্যের নাম *</Text>
          <TextInput
            style={styles.input}
            placeholder="যেমন: ফ্লাই অ্যাশ সিমেন্ট"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>একক (Unit) *</Text>
            <TextInput
              style={styles.input}
              placeholder="ব্যাগ / টন / পিস"
              placeholderTextColor={colors.textMuted}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>বিক্রয় মূল্য (৳) *</Text>
            <TextInput
              style={styles.input}
              placeholder="500"
              placeholderTextColor={colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>ক্রয় মূল্য (৳)</Text>
            <TextInput
              style={styles.input}
              placeholder="450"
              placeholderTextColor={colors.textMuted}
              value={costPrice}
              onChangeText={setCostPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>প্রাথমিক মজুদ</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>সর্বনিম্ন মজুদ সতর্কবার্তা (Alert Limit)</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={minStockAlert}
            onChangeText={setMinStockAlert}
            keyboardType="number-pad"
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
            <Text style={styles.submitBtnText}>পণ্য সংরক্ষণ করুন</Text>
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
