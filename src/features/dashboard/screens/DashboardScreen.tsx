import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CustomerCard, Customer } from '@/components/ui/CustomerCard';

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    serialNo: '০০১',
    name: 'রহিম উদ্দিন',
    phone: '01711-223344',
    village: 'মিরপুর, ঢাকা',
    totalDue: 15500,
    lastTransactionDate: '২৭ আগ ২০২৬',
    status: 'overdue',
  },
  {
    id: '2',
    serialNo: '০০২',
    name: 'করিম মিয়া',
    phone: '01812-334455',
    village: 'মতিঝিল, ঢাকা',
    totalDue: 8200,
    lastTransactionDate: '২৬ আগ ২০২৬',
    status: 'overdue',
  },
  {
    id: '3',
    serialNo: '০০৩',
    name: 'মোঃ সালাউদ্দিন',
    phone: '01912-445566',
    village: 'নারায়ণগঞ্জ',
    totalDue: 0,
    lastTransactionDate: '২৫ আগ ২০২৬',
    status: 'active',
  },
];

// ─── Greeting ────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'শুভ সকাল';
  if (hour < 17) return 'শুভ অপরাহ্ন';
  if (hour < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
}

function formatDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('bn-BD', options);
}

// ─── Quick Action item ────────────────────────────────────────────────────────
interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

const QuickAction = ({ icon, label, onPress, primary }: QuickActionProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.quickAction, primary && styles.quickActionPrimary]}
  >
    <View style={[styles.qaIcon, primary && styles.qaIconPrimary]}>
      <Feather
        name={icon as any}
        size={20}
        color={primary ? colors.surface : colors.primary}
      />
    </View>
    <Text style={[styles.qaLabel, primary && styles.qaLabelPrimary]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Main screen ─────────────────────────────────────────────────────────────
export const DashboardScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo mark */}
            <View style={styles.logoMark}>
              <Feather name="book-open" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, আহমেদ 👋
              </Text>
              <Text style={styles.date}>{formatDate()}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Feather name="bell" size={20} color={colors.textSecondary} />
              {/* Notification dot */}
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
              <Text style={styles.avatarText}>আ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          আজকের ব্যবসার গুরুত্বপূর্ণ তথ্যগুলো এক নজরে দেখুন।
        </Text>

        {/* ── Summary Stats ──────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="মোট গ্রাহক"
              value="২৪৭"
              icon={<Feather name="users" size={18} color={colors.primary} />}
              iconBg={colors.primarySoft}
              trend="১২% এই মাসে"
              trendUp
            />
            <View style={styles.statGap} />
            <StatCard
              label="আজকের বিক্রয়"
              value="৳ ৩৮,৫০০"
              icon={<Feather name="trending-up" size={18} color={colors.success} />}
              iconBg={colors.successSoft}
              trend="৮% বৃদ্ধি"
              trendUp
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="মোট বকেয়া"
              value="৳ ১,২৪,৭৫০"
              icon={<Feather name="alert-circle" size={18} color={colors.danger} />}
              iconBg={colors.dangerSoft}
              trend="৫ গ্রাহক"
              trendUp={false}
            />
            <View style={styles.statGap} />
            <StatCard
              label="মোট আদায়"
              value="৳ ৮৫,২০০"
              icon={<Feather name="check-circle" size={18} color={colors.warning} />}
              iconBg={colors.warningSoft}
              trend="এই মাসে"
              trendUp
            />
          </View>
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <SectionHeader title="দ্রুত কাজ" />
        <View style={styles.quickActionsRow}>
          <QuickAction
            icon="user-plus"
            label="নতুন গ্রাহক"
            onPress={() => router.push('/customers/add')}
            primary
          />
          <QuickAction
            icon="file-plus"
            label="নতুন ইনভয়েস"
            onPress={() => router.push('/invoices/create')}
          />
          <QuickAction
            icon="credit-card"
            label="পেমেন্ট নিন"
            onPress={() => router.push('/payments')}
          />
          <QuickAction
            icon="clock"
            label="বকেয়া দেখুন"
            onPress={() => router.push('/dues')}
          />
        </View>

        {/* ── Recent Customers ───────────────────────────────────────── */}
        <SectionHeader
          title="সাম্প্রতিক গ্রাহক"
          actionLabel="সব দেখুন"
          onAction={() => router.push('/(tabs)/customers')}
        />

        {MOCK_CUSTOMERS.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onPress={() => router.push(`/customers/${customer.id}`)}
          />
        ))}

        {/* Bottom padding for FAB clearance */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },

  // Subtitle
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: theme.spacing.lg,
  },

  // Stats grid
  statsGrid: {
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statGap: {
    width: 10,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  qaIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  qaIconPrimary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  qaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  qaLabelPrimary: {
    color: colors.surface,
  },

  bottomSpacer: {
    height: 80,
  },
});