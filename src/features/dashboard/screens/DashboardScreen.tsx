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
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { CustomerCard } from '@/components/ui/CustomerCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import { useAuthStore } from '@/stores/authStore';

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

const QuickAction = ({ icon, label, onPress, primary, iconBg, iconColor }: QAProps) => {
  const lastPressRef = React.useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPressRef.current < 800) return;
    lastPressRef.current = now;
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
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
};

// ─── Activity Row ─────────────────────────────────────────────────────────────
const ActivityRow = ({ type, customerName, amount, time, desc }: { type: 'payment' | 'purchase'; customerName: string; amount: string; time: string; desc: string }) => (
  <View style={styles.actRow}>
    <View
      style={[
        styles.actIcon,
        { backgroundColor: type === 'payment' ? colors.successSoft : colors.primarySoft },
      ]}
    >
      <Feather
        name={type === 'payment' ? 'credit-card' : 'file-text'}
        size={15}
        color={type === 'payment' ? colors.success : colors.primary}
      />
    </View>
    <View style={styles.actInfo}>
      <Text style={styles.actCustomer}>{customerName}</Text>
      <Text style={styles.actDesc} numberOfLines={1}>{desc}</Text>
    </View>
    <View style={styles.actRight}>
      <Text style={[styles.actAmount, { color: type === 'payment' ? colors.success : colors.textPrimary }]}>
        {type === 'payment' ? '+' : '−'}৳ {Number(amount).toLocaleString('en-IN')}
      </Text>
      <Text style={styles.actTime}>{time}</Text>
    </View>
  </View>
);


// ─── Main Screen ──────────────────────────────────────────────────────────────
export const DashboardScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: summary, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
  });

  const totalDue = Number(summary?.totalDue || 0);
  const totalCustomers = summary?.activeCustomers || 0;
  const todaySales = Number(summary?.todaySales || 0);
  const monthSales = Number(summary?.monthSales || 0);
  const todayCollections = Number(summary?.todayCollections || 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
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
                  {getGreeting()}, {user?.name || 'ব্যবহারকারী'}
                </Text>
                <Text style={styles.heroDate}>{formatDate()}</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity
                style={styles.heroBell}
                activeOpacity={0.7}
                onPress={() => router.push('/notifications')}
              >
                <Feather name="bell" size={19} color={colors.surface} />
                <View style={styles.heroBellDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroAvatar}
                activeOpacity={0.7}
                onPress={() => router.push('/settings')}
              >
                <Text style={styles.heroAvatarText}>আ</Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* Business name */}
          <Text style={styles.bizName}>{user?.shopId ? 'আপনার দোকান' : 'লোড হচ্ছে...'}</Text>

          {/* Hero KPI row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>৳ {totalDue.toLocaleString('en-IN')}</Text>
              <Text style={styles.heroStatLabel}>মোট বকেয়া</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>৳ {todaySales.toLocaleString('en-IN')}</Text>
              <Text style={styles.heroStatLabel}>আজকের বিক্রয়</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalCustomers.toLocaleString('en-IN')}</Text>
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
              value={totalCustomers.toLocaleString('en-IN')}
              icon="users"
              iconBg={colors.primarySoft}
              iconColor={colors.primary}
            />
            <KPICard
              label="আজকের বিক্রয়"
              value={`৳ ${todaySales.toLocaleString('en-IN')}`}
              icon="trending-up"
              iconBg={colors.successSoft}
              iconColor={colors.success}
            />
            <KPICard
              label="মোট বকেয়া"
              value={`৳ ${totalDue.toLocaleString('en-IN')}`}
              icon="alert-circle"
              iconBg={colors.dangerSoft}
              iconColor={colors.danger}
            />
            <KPICard
              label="আজকের আদায়"
              value={`৳ ${todayCollections.toLocaleString('en-IN')}`}
              icon="check-circle"
              iconBg={colors.warningSoft}
              iconColor={colors.warning}
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



          {/* ─── Recent Activity ─────────────────────────────────────── */}
          <SectionHeader title="সাম্প্রতিক লেনদেন" />
          <View style={styles.activityCard}>
            {summary?.recentPayments.slice(0, 3).map((p, i) => (
              <React.Fragment key={p.id}>
                <ActivityRow 
                  type="payment" 
                  customerName={p.customer.name} 
                  amount={p.amount} 
                  time={new Date(p.paymentDate).toLocaleDateString('bn-BD')} 
                  desc={`পেমেন্ট গ্রহণ (${p.method})`}
                />
                <View style={styles.actDivider} />
              </React.Fragment>
            ))}
            {summary?.recentPurchases.slice(0, 3).map((p, i) => (
              <React.Fragment key={p.id}>
                <ActivityRow 
                  type="purchase" 
                  customerName={p.customer.name} 
                  amount={p.netAmount} 
                  time={new Date(p.purchaseDate).toLocaleDateString('bn-BD')} 
                  desc={p.invoice ? `ইনভয়েস #${p.invoice.invoiceNumber}` : 'পণ্য বিক্রয়'}
                />
                {i < Math.min(2, summary.recentPurchases.length - 1) && <View style={styles.actDivider} />}
              </React.Fragment>
            ))}
            {(!summary?.recentPayments?.length && !summary?.recentPurchases?.length) && (
              <Text style={{ padding: 16, textAlign: 'center', color: colors.textSecondary }}>কোনো লেনদেন পাওয়া যায়নি</Text>
            )}
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
    borderRadius: theme.radius.button,
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
    borderRadius: theme.radius.button,
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
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48.5%',
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
    borderRadius: theme.radius.button,
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
    borderRadius: theme.radius.card,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 96,
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
    borderRadius: theme.radius.button,
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
    lineHeight: 15, // Better line height for Bengali characters
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
    borderRadius: theme.radius.button,
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
    borderRadius: theme.radius.button,
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

  bottomSpacer: { height: 0 },
});