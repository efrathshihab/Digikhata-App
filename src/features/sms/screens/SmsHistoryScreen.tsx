import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface SmsLog {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  date: string;
  status: 'delivered' | 'failed' | 'pending';
}

const SMS_DATA: SmsLog[] = [
  { id: '1', recipient: 'রহিম উদ্দিন', phone: '01711-223344', message: 'আপনার ২৫,০০০ টাকার ইনভয়েসটি তৈরি হয়েছে। ধন্যবাদ!', date: '২৭ আগ ২০২৬, ১০:৩০ এএম', status: 'delivered' },
  { id: '2', recipient: 'করিম মিয়া', phone: '01811-334455', message: 'আপনার ৫,০০০ টাকা জমা হয়েছে। বর্তমান ব্যালেন্স: ০ টাকা।', date: '২৬ আগ ২০২৬, ০৪:১৫ পিএম', status: 'delivered' },
  { id: '3', recipient: 'মোঃ সালাউদ্দিন', phone: '01911-445566', message: 'আগামীকাল আপনার ডেলিভারি পৌঁছাবে।', date: '২৫ আগ ২০২৬, ০৯:০০ এএম', status: 'pending' },
  { id: '4', recipient: 'অজ্ঞাত', phone: '01611-000000', message: 'টেস্ট মেসেজ', date: '২৪ আগ ২০২৬, ১১:২০ এএম', status: 'failed' },
];

const statusCfg = {
  delivered: { label: 'ডেলিভার্ড', variant: 'success' as const },
  pending: { label: 'অপেক্ষমাণ', variant: 'warning' as const },
  failed: { label: 'ব্যর্থ', variant: 'danger' as const },
};

const SmsCard = ({ sms }: { sms: SmsLog }) => {
  const cfg = statusCfg[sms.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setExpanded(!expanded)} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Feather name="message-circle" size={18} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.recipient}>{sms.recipient}</Text>
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </View>
          <Text style={styles.phone}>{sms.phone}</Text>
        </View>
      </View>
      <View style={styles.messageWrap}>
        <Text style={styles.message} numberOfLines={expanded ? undefined : 2}>
          {sms.message}
        </Text>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.date}>{sms.date}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

export const SmsHistoryScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = SMS_DATA.filter((s) =>
    !search.trim() || s.recipient.includes(search) || s.phone.includes(search)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMS ইতিহাস</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="নাম বা নম্বর খুঁজুন" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <SmsCard sms={item} />}
        ListEmptyComponent={<EmptyState icon="message-square" title="কোনো SMS নেই" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  searchWrap: {
    paddingHorizontal: theme.spacing.md, paddingVertical: 10,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface, borderRadius: theme.radius.card,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...theme.shadows.card,
  },
  cardTop: { flexDirection: 'row', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.background },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recipient: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  phone: { fontSize: 13, color: colors.textSecondary },
  messageWrap: { padding: 14, backgroundColor: colors.background },
  message: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  date: { fontSize: 11, color: colors.textMuted },
});
