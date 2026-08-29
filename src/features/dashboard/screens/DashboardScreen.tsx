import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { CustomerCard, Customer } from '@/components/ui/CustomerCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', serialNo: '০০১', name: 'রহিম উদ্দিন', phone: '01711-223344', village: 'মিরপুর, ঢাকা', totalDue: 15500, lastTransactionDate: '২৭ আগ ২০২৬', status: 'overdue' },
  { id: '2', serialNo: '০০২', name: 'করিম মিয়া', phone: '01812-334455', village: 'মতিঝিল, ঢাকা', totalDue: 8200, lastTransactionDate: '২৬ আগ ২০২৬', status: 'overdue' },
  { id: '3', serialNo: '০০৩', name: 'মোঃ সালাউদ্দিন', phone: '01912-445566', village: 'নারায়ণগঞ্জ', totalDue: 0, lastTransactionDate: '২৫ আগ ২০২৬', status: 'active' },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'sale', customer: 'রহিম উদ্দিন', desc: 'INV-০০১৫ · ফ্লাই অ্যাশ সিমেন্ট', amount: 25000, time: '২ ঘণ্টা আগে', positive: false },
  { id: 't2', type: 'payment', customer: 'করিম মিয়া', desc: 'PMT-০০৩২ · নগদ', amount: 5000, time: '৪ ঘণ্টা আগে', positive: true },
  { id: 't3', type: 'sale', customer: 'মোঃ সালাউদ্দিন', desc: 'INV-০০১৩ · সিমেন্ট ব্লক', amount: 12000, time: 'গতকাল', positive: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'শুভ সকাল';
  if (h < 17) return 'শুভ অপরাহ্ন';
  if (h < 20) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
}

function formatDate(): string {
  return new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
}

const KPICard = ({ label, value, icon, iconBg, iconColor, trend, trendUp }: KPICardProps) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
      <Feather name={icon as any} size={18} color={iconColor} />
    </View>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
    {trend && (
      <View style={styles.trendRow}>
        <Feather
          name={trendUp ? 'trending-up' : 'trending-down'}
          size={11}
          color={trendUp ? colors.success : colors.danger}
        />
        <Text style={[styles.trendText, { color: trendUp ? colors.success : colors.danger }]}>
          {trend}
        </Text>
      </View>
    )}
  </View>
);

// ─── Quick Action ─────────────────────────────────────────────────────────────
interface QAProps {
  icon: string;
  label: string;
  onPress: () => void;
  primary?: boolean;
  iconBg?: string;
  iconColor?: string;
}

const QuickAction = ({ icon, label, onPress, primary, iconBg, iconColor }: QAProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.qa, primary && styles.qaPrimary]}
  >
    <View
      style={[
        styles.qaIcon,
        primary
          ? styles.qaIconPrimary
          : { backgroundColor: iconBg ?? colors.primarySoft },
      ]}
    >
      <Feather
        name={icon as any}
        size={20}
        color={primary ? colors.surface : (iconColor ?? colors.primary)}
      />
    </View>
    <Text style={[styles.qaLabel, primary && styles.qaLabelPrimary]} numberOfLines={2}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Activity Row ─────────────────────────────────────────────────────────────
const ActivityRow = ({ tx }: { tx: typeof MOCK_TRANSACTIONS[0] }) => (
  <View style={styles.actRow}>
    <View
      style={[
        styles.actIcon,
        { backgroundColor: tx.type === 'payment' ? colors.successSoft : colors.primarySoft },
      ]}
    >
      <Feather
        name={tx.type === 'payment' ? 'credit-card' : 'file-text'}
        size={15}
        color={tx.type === 'payment' ? colors.success : colors.primary}
      />
    </View>
    <View style={styles.actInfo}>
      <Text style={styles.actCustomer}>{tx.customer}</Text>
      <Text style={styles.actDesc} numberOfLines={1}>{tx.desc}</Text>
    </View>
    <View style={styles.actRight}>
      <Text style={[styles.actAmount, { color: tx.positive ? colors.success : colors.textPrimary }]}>
        {tx.positive ? '+' : '−'}৳ {tx.amount.toLocaleString()}
      </Text>
      <Text style={styles.actTime}>{tx.time}</Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const DashboardScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.surface}
            colors={[colors.primary]}
          />
        }
      >
        {/* ─── Hero / Welcome Banner ───────────────────────────────────── */}
        <LinearGradient
          colors={['#1D4ED8', '#2563EB', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Top row */}
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={styles.logoMark}>
                <Feather name="book-open" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.greeting}>
                  {getGreeting()}, আহমেদ
                </Text>
                <Text style={styles.heroDate}>{formatDate()}</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.heroBell} activeOpacity={0.7}>
                <Feather name="bell" size={19} color={colors.surface} />
                <View style={styles.heroBellDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroAvatar} activeOpacity={0.7}>
                <Text style={styles.heroAvatarText}>আ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Business name */}
          <Text style={styles.bizName}>মেসার্স আহমেদ ট্রেডার্স</Text>

          {/* Hero KPI row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>৳ ১,২৪,৭৫০</Text>
              <Text style={styles.heroStatLabel}>মোট বকেয়া</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>৳ ৩৮,৫০০</Text>
              <Text style={styles.heroStatLabel}>আজকের বিক্রয়</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>২৪৭</Text>
              <Text style={styles.heroStatLabel}>মোট গ্রাহক</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body content with padding */}
        <View style={styles.body}>
          {/* ─── KPI Grid ───────────────────────────────────────────────── */}
          <View style={styles.kpiGrid}>
            <KPICard
              label="মোট গ্রাহক"
              value="২৪৭"
              icon="users"
              iconBg={colors.primarySoft}
              iconColor={colors.primary}
              trend="১২% এই মাসে"
              trendUp
            />
            <KPICard
              label="আজকের বিক্রয়"
              value="৳ ৩৮,৫০০"
              icon="trending-up"
              iconBg={colors.successSoft}
              iconColor={colors.success}
              trend="৮% বৃদ্ধি"
              trendUp
            />
            <KPICard
              label="মোট বকেয়া"
              value="৳ ১,২৪,৭৫০"
              icon="alert-circle"
              iconBg={colors.dangerSoft}
              iconColor={colors.danger}
              trend="৫ গ্রাহক"
              trendUp={false}
            />
            <KPICard
              label="মোট আদায়"
              value="৳ ৮৫,২০০"
              icon="check-circle"
              iconBg={colors.warningSoft}
              iconColor={colors.warning}
              trend="এই মাসে"
              trendUp
            />
          </View>

          {/* ─── Quick Actions ────────────────────────────────────────── */}
          <SectionHeader title="দ্রুত কাজ" />
          <View style={styles.qaGrid}>
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
              iconBg={colors.primarySoft}
              iconColor={colors.primary}
            />
            <QuickAction
              icon="credit-card"
              label="পেমেন্ট নিন"
              onPress={() => router.push('/payments/receive')}
              iconBg={colors.successSoft}
              iconColor={colors.success}
            />
            <QuickAction
              icon="clock"
              label="বকেয়া দেখুন"
              onPress={() => router.push('/dues')}
              iconBg={colors.dangerSoft}
              iconColor={colors.danger}
            />
          </View>

          {/* ─── Due Summary strip ───────────────────────────────────── */}
          <TouchableOpacity
            style={styles.dueAlert}
            activeOpacity={0.8}
            onPress={() => router.push('/dues')}
          >
            <View style={styles.dueAlertLeft}>
              <View style={styles.dueAlertIcon}>
                <Feather name="alert-triangle" size={16} color={colors.danger} />
              </View>
              <View>
                <Text style={styles.dueAlertTitle}>৫ জন গ্রাহকের বকেয়া মেটানো নেই</Text>
                <Text style={styles.dueAlertSub}>মোট: ৳ ১,২৪,৭৫০ — আদায় করুন</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={colors.danger} />
          </TouchableOpacity>

          {/* ─── Recent Customers ────────────────────────────────────── */}
          <SectionHeader
            title="সাম্প্রতিক গ্রাহক"
            actionLabel="সব দেখুন"
            onAction={() => router.push('/(tabs)/customers')}
          />
          {MOCK_CUSTOMERS.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onPress={() => router.push(`/customers/${c.id}`)}
            />
          ))}

          {/* ─── Recent Activity ─────────────────────────────────────── */}
          <SectionHeader title="সাম্প্রতিক লেনদেন" />
          <View style={styles.activityCard}>
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <ActivityRow tx={tx} />
                {i < MOCK_TRANSACTIONS.length - 1 && <View style={styles.actDivider} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 0 },

  // ── Hero ──
  hero: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 15, fontWeight: '700', color: colors.surface },
  heroDate: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroBell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBellDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  heroAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  bizName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    marginTop: 2,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 15, fontWeight: '700', color: colors.surface },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // ── Body ──
  body: {
    padding: theme.spacing.md,
    paddingTop: 18,
    gap: 4,
    backgroundColor: colors.background,
  },

  // ── KPI ──
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  trendText: { fontSize: 11, fontWeight: '600' },

  // ── Quick Actions ──
  qaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  qa: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
    gap: 6,
  },
  qaPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  qaIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  qaLabelPrimary: { color: colors.surface },

  // ── Due Alert ──
  dueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dangerSoft,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginBottom: 20,
  },
  dueAlertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dueAlertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueAlertTitle: { fontSize: 13, fontWeight: '700', color: colors.danger },
  dueAlertSub: { fontSize: 11, color: colors.danger, opacity: 0.7, marginTop: 2 },

  // ── Activity ──
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 8,
    ...theme.shadows.card,
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    gap: 12,
  },
  actIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actInfo: { flex: 1 },
  actCustomer: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  actDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actRight: { alignItems: 'flex-end', gap: 3 },
  actAmount: { fontSize: 14, fontWeight: '700' },
  actTime: { fontSize: 11, color: colors.textMuted },
  actDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 13 },

  bottomSpacer: { height: 80 },
});