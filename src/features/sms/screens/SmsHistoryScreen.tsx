import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { smsApi, SmsLogItem } from '@/api/sms.api';

const statusCfg: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  DELIVERED: { label: 'ডেলিভার্ড', variant: 'success' },
  SENT: { label: 'প্রেরিত', variant: 'info' },
  PENDING: { label: 'অপেক্ষমাণ', variant: 'warning' },
  FAILED: { label: 'ব্যর্থ', variant: 'danger' },
};

const SmsCard = ({ sms, onResend }: { sms: SmsLogItem; onResend: () => void }) => {
  const cfg = statusCfg[sms.status] || { label: sms.status, variant: 'info' };
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Feather name="message-square" size={16} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.recipient}>{sms.recipientName || sms.phone}</Text>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
          <Text style={styles.phone}>{sms.phone}</Text>
        </View>
      </View>

      <Text style={styles.messageText} numberOfLines={expanded ? undefined : 2}>
        {sms.message}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{new Date(sms.createdAt).toLocaleString('bn-BD')}</Text>
        {sms.status === 'FAILED' && (
          <TouchableOpacity style={styles.resendBtn} onPress={onResend} activeOpacity={0.7}>
            <Feather name="rotate-cw" size={12} color={colors.danger} />
            <Text style={styles.resendText}>পুনরায় পাঠান</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SmsHistoryScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['smsHistory', { search }],
    queryFn: () => smsApi.getSmsHistory({ search: search || undefined, limit: 100 }),
  });

  const smsList = data?.items || [];

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      await smsApi.resendSms(id);
      queryClient.invalidateQueries({ queryKey: ['smsHistory'] });
      Alert.alert('সফল', 'এসএমএস পুনরায় পাঠানো হয়েছে।');
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'পুনরায় পাঠানো সম্ভব হয়নি');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>এসএমএস হিস্ট্রি</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন" />
      </View>

      <FlatList
        data={smsList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="message-square"
              title="কোনো এসএমএস হিস্ট্রি পাওয়া যায়নি"
              description="কোনো প্রেরিত মেসেজের তথ্য পাওয়া যায়নি।"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <SmsCard sms={item} onResend={() => handleResend(item.id)} />
        )}
      />
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
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.md,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipient: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phone: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
});
