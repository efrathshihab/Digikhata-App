import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';

const mockDelivery = {
  id: '1',
  deliveryNo: 'DLV-০০২৩',
  customerName: 'রহিম উদ্দিন',
  customerPhone: '01711-223344',
  destination: 'বাড়ি ৩২, রোড ৭, মিরপুর-১২, ঢাকা-১২১৬',
  driverName: 'আলী হোসেন',
  driverPhone: '01711-111222',
  vehicle: 'ঢাকা-মেট্রো-১২৩৪',
  date: '২৭ আগ ২০২৬',
  items: 'সিমেন্ট ৫০ ব্যাগ\nরড ২ টন',
  status: 'delivered' as const,
};

const statusCfg = {
  pending: { label: 'অপেক্ষমাণ', variant: 'warning' as const },
  in_progress: { label: 'চলমান', variant: 'info' as const },
  delivered: { label: 'সম্পন্ন', variant: 'success' as const },
  cancelled: { label: 'বাতিল', variant: 'danger' as const },
};

export const DeliveryDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const delivery = mockDelivery;
  const cfg = statusCfg[delivery.status];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ডেলিভারি বিবরণ</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Feather name="edit-2" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.topCardRow}>
            <Text style={styles.deliveryNo}>{delivery.deliveryNo}</Text>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
          <Text style={styles.date}>{delivery.date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>গ্রাহক ও গন্তব্য</Text>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={colors.textMuted} />
            <View>
              <Text style={styles.infoTitle}>{delivery.customerName}</Text>
              <Text style={styles.infoSub}>{delivery.customerPhone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={colors.textMuted} />
            <Text style={styles.infoTitle}>{delivery.destination}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>পরিবহন তথ্য</Text>
          <View style={styles.infoRow}>
            <Feather name="truck" size={16} color={colors.textMuted} />
            <View>
              <Text style={styles.infoTitle}>{delivery.driverName}</Text>
              <Text style={styles.infoSub}>{delivery.driverPhone} · {delivery.vehicle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>পণ্যের বিবরণ</Text>
          <View style={styles.itemsBox}>
            <Text style={styles.itemsText}>{delivery.items}</Text>
          </View>
        </View>

      </ScrollView>
      <View style={styles.footer}>
        {delivery.status !== 'delivered' && (
          <AppButton title="ডেলিভারি সম্পন্ন করুন" onPress={() => {}} style={{ marginBottom: 10 }} />
        )}
        <AppButton title="প্রিন্ট চালান" variant="outline" onPress={() => {}} icon={<Feather name="printer" size={16} color={colors.primary} />} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 14, paddingBottom: 30 },
  topCard: {
    backgroundColor: colors.primarySoft, borderRadius: theme.radius.card, padding: theme.spacing.md,
    borderWidth: 1, borderColor: colors.primaryBorder,
  },
  topCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deliveryNo: { fontSize: 18, fontWeight: '700', color: colors.primary },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  section: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card, padding: theme.spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 14, ...theme.shadows.card,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoRow: { flexDirection: 'row', gap: 10 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  infoSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemsBox: { backgroundColor: colors.background, padding: 12, borderRadius: 8 },
  itemsText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
  footer: { padding: theme.spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
