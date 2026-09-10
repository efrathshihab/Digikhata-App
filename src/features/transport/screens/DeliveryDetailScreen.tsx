import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi } from '@/api/deliveries.api';

const statusCfg: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  PENDING: { label: 'অপেক্ষমাণ', variant: 'warning' },
  ASSIGNED: { label: 'বরাদ্দকৃত', variant: 'info' },
  IN_TRANSIT: { label: 'চলমান', variant: 'info' },
  DELIVERED: { label: 'সম্পন্ন', variant: 'success' },
  CANCELLED: { label: 'বাতিল', variant: 'danger' },
};

export const DeliveryDetailScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [updating, setUpdating] = useState(false);

  const { data: delivery, isLoading, refetch } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => deliveriesApi.getDelivery(id as string),
    enabled: !!id,
  });

  const handleUpdateStatus = async (newStatus: 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED') => {
    if (!id) return;
    setUpdating(true);
    try {
      await deliveriesApi.updateDeliveryStatus(id, newStatus);
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      Alert.alert('সফল', 'ডেলিভারি স্ট্যাটাস আপডেট করা হয়েছে');
      refetch();
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !delivery) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const cfg = statusCfg[delivery.status] || { label: delivery.status, variant: 'info' };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ডেলিভারি বিবরণ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.topCardRow}>
            <View>
              <Text style={styles.noLabel}>ডেলিভারি নম্বর</Text>
              <Text style={styles.noValue}>{delivery.deliveryNumber}</Text>
            </View>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
        </View>

        {/* Customer & Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>গ্রাহক ও গন্তব্য</Text>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.customer?.name || 'গ্রাহকের নাম'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="phone" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.contactSnapshot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{delivery.addressSnapshot}</Text>
          </View>
        </View>

        {/* Transport Charge */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>পরিবহন খরচ</Text>
          <Text style={styles.chargeText}>৳ {Number(delivery.transportCharge || 0).toLocaleString()}</Text>
        </View>

        {/* Update Actions */}
        {delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && (
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>স্ট্যাটাস পরিবর্তন করুন</Text>
            <View style={styles.actionButtons}>
              {delivery.status !== 'IN_TRANSIT' && (
                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: colors.info }]}
                  onPress={() => handleUpdateStatus('IN_TRANSIT')}
                  disabled={updating}
                >
                  <Text style={styles.statusBtnText}>চলমান (In Transit)</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.statusBtn, { backgroundColor: colors.success }]}
                onPress={() => handleUpdateStatus('DELIVERED')}
                disabled={updating}
              >
                <Text style={styles.statusBtnText}>সম্পন্ন করুন (Delivered)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusBtn, { backgroundColor: colors.danger }]}
                onPress={() => handleUpdateStatus('CANCELLED')}
                disabled={updating}
              >
                <Text style={styles.statusBtnText}>বাতিল করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.lg,
    gap: 16,
  },
  topCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  noValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  chargeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  actionButtons: {
    gap: 8,
  },
  statusBtn: {
    paddingVertical: 12,
    borderRadius: theme.radius.button,
    alignItems: 'center',
  },
  statusBtnText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
});
