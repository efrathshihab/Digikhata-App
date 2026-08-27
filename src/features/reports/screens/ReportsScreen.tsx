import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';

type Period = 'আজ' | '৭ দিন' | '৩০ দিন' | 'এই মাস';
const PERIODS: Period[] = ['আজ', '৭ দিন', '৩০ দিন', 'এই মাস'];

const DATA: Record<Period, { sales: number; collected: number; due: number; newCustomers: number }> = {
  'আজ': { sales: 38500, collected: 28200, due: 10300, newCustomers: 3 },
  '৭ দিন': { sales: 215000, collected: 178000, due: 37000, newCustomers: 14 },
  '৩০ দিন': { sales: 842000, collected: 720000, due: 122000, newCustomers: 47 },
  'এই মাস': { sales: 1124000, collected: 965000, due: 159000, newCustomers: 62 },
};

interface KPICardProps {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  subLabel?: string;
}

const KPICard = ({ label, value, icon, iconBg, iconColor, subLabel }: KPICardProps) => (
  <View style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
      <Feather name={icon as any} size={18} color={iconColor} />
    </View>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
    {subLabel && <Text style={styles.kpiSub}>{subLabel}</Text>}
  </View>
);

// Simple bar chart using View widths
interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
}

const BarChart = ({ data, maxValue }: BarChartProps) => (
  <View style={chartStyles.container}>
    {data.map((item) => (
      <View key={item.label} style={chartStyles.row}>
        <Text style={chartStyles.label}>{item.label}</Text>
        <View style={chartStyles.barBg}>
          <View
            style={[
              chartStyles.bar,
              {
                width: `${Math.round((item.value / maxValue) * 100)}%`,
                backgroundColor: item.color,
              },
            ]}
          />
        </View>
        <Text style={chartStyles.value}>৳ {item.value.toLocaleString()}</Text>
      </View>
    ))}
  </View>
);

export const ReportsScreen = () => {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('৭ দিন');
  const d = DATA[period];

  const chartData = [
    { label: 'বিক্রয়', value: d.sales, color: colors.primary },
    { label: 'আদায়', value: d.collected, color: colors.success },
    { label: 'বকেয়া', value: d.due, color: colors.danger },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>রিপোর্ট</Text>
        <TouchableOpacity style={styles.exportBtn} activeOpacity={0.7}>
          <Feather name="download" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Period filters */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
            >
              <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KPICard
              label="মোট বিক্রয়"
              value={`৳ ${d.sales.toLocaleString()}`}
              icon="trending-up"
              iconBg={colors.primarySoft}
              iconColor={colors.primary}
            />
            <KPICard
              label="মোট আদায়"
              value={`৳ ${d.collected.toLocaleString()}`}
              icon="check-circle"
              iconBg={colors.successSoft}
              iconColor={colors.success}
            />
          </View>
          <View style={styles.kpiRow}>
            <KPICard
              label="মোট বকেয়া"
              value={`৳ ${d.due.toLocaleString()}`}
              icon="alert-circle"
              iconBg={colors.dangerSoft}
              iconColor={colors.danger}
            />
            <KPICard
              label="নতুন গ্রাহক"
              value={`${d.newCustomers} জন`}
              icon="user-plus"
              iconBg={colors.warningSoft}
              iconColor={colors.warning}
            />
          </View>
        </View>

        {/* Chart */}
        <SectionHeader title="তুলনামূলক বিশ্লেষণ" />
        <View style={styles.chartCard}>
          <BarChart data={chartData} maxValue={d.sales} />
        </View>

        {/* Insights */}
        <SectionHeader title="মূল তথ্য" />
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <View style={[styles.insightDot, { backgroundColor: colors.success }]} />
            <Text style={styles.insightText}>
              আদায়ের হার: <Text style={styles.insightBold}>
                {Math.round((d.collected / d.sales) * 100)}%
              </Text>
            </Text>
          </View>
          <View style={styles.insightRow}>
            <View style={[styles.insightDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.insightText}>
              বকেয়ার হার: <Text style={styles.insightBold}>
                {Math.round((d.due / d.sales) * 100)}%
              </Text>
            </Text>
          </View>
          <View style={styles.insightRow}>
            <View style={[styles.insightDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.insightText}>
              গড় লেনদেন: <Text style={styles.insightBold}>
                ৳ {Math.round(d.sales / Math.max(d.newCustomers, 1)).toLocaleString()}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, gap: 16, paddingBottom: 32 },

  periodRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  periodChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  periodLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  periodLabelActive: { color: colors.primary, fontWeight: '700' },

  kpiGrid: { gap: 10 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  kpiValue: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  kpiSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    ...theme.shadows.card,
  },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightDot: { width: 8, height: 8, borderRadius: 4 },
  insightText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  insightBold: { fontWeight: '700', color: colors.textPrimary },
});

const chartStyles = StyleSheet.create({
  container: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 42, fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 5 },
  value: { width: 80, fontSize: 12, fontWeight: '600', color: colors.textPrimary, textAlign: 'right' },
});
