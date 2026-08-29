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

export const NewDeliveryScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState('');
  const [destination, setDestination] = useState('');
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('আজ');
  const [items, setItems] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!customer.trim() || !destination.trim() || !driver.trim()) {
      Alert.alert('সতর্কতা', 'অনুগ্রহ করে গ্রাহক, গন্তব্য এবং চালকের নাম লিখুন।');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Alert.alert('সফল', 'নতুন ডেলিভারি যোগ করা হয়েছে!', [
      { text: 'ঠিক আছে', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নতুন ডেলিভারি</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ডেলিভারি তথ্য</Text>
            <AppInput label="গ্রাহকের নাম *" placeholder="গ্রাহক নির্বাচন করুন বা লিখুন" value={customer} onChangeText={setCustomer} />
            <AppInput label="গন্তব্য (ঠিকানা) *" placeholder="ঠিকানা লিখুন" value={destination} onChangeText={setDestination} />
            <AppInput label="তারিখ" value={date} onChangeText={setDate} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পরিবহন</Text>
            <AppInput label="চালকের নাম *" placeholder="চালক নির্বাচন করুন" value={driver} onChangeText={setDriver} />
            <AppInput label="গাড়ির নম্বর" placeholder="ঢাকা-মেট্রো-..." value={vehicle} onChangeText={setVehicle} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পণ্যের বিবরণ</Text>
            <AppInput label="পণ্য" placeholder="যেমন: সিমেন্ট ৫০ ব্যাগ" value={items} onChangeText={setItems} multiline numberOfLines={3} />
            <AppInput label="নোট (ঐচ্ছিক)" placeholder="অতিরিক্ত তথ্য..." value={note} onChangeText={setNote} multiline numberOfLines={2} />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <AppButton title="ডেলিভারি সেভ করুন" onPress={handleSubmit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 14, paddingBottom: 20 },
  section: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card, padding: theme.spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 12, ...theme.shadows.card,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  footer: { padding: theme.spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
