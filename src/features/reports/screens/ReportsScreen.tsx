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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';

type Period = 'আজ' | '৭ দিন' | '৩০ দিন' | 'এই মাস';
const PERIODS: Period[] = ['আজ', '৭ দিন', '৩০ দিন', 'এই মাস'];

function getPeriodDates(period: Period): { from?: string; to?: string } {
  const now = new Date();
  const to = now.toISOString();

  if (period === 'আজ') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: today.toISOString(), to };
  } else if (period === '৭ দিন') {
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: d7.toISOString(), to };
  } else if (period === '৩০ দিন') {
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: d30.toISOString(), to };
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: monthStart.toISOString(), to };
  }
}

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

export const ReportsScreen = () => {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<Period>('আজ');
  const [exporting, setExporting] = useState(false);

  const dates = getPeriodDates(activePeriod);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reportSummary', activePeriod],
    queryFn: () => reportsApi.getSummary(dates),
  });

  const { data: dueAging } = useQuery({
    queryKey: ['dueAgingReport'],
    queryFn: () => reportsApi.getDueAgingReport(),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await reportsApi.exportReport({
        type: 'SUMMARY',
        format: 'CSV',
        from: dates.from,
        to: dates.to,
      });
      Alert.alert('রপ্তানি সম্পন্ন', 'রিপোর্ট সফলভাবে জেনারেট হয়েছে।');
    } catch (e: any) {
      Alert.alert('ত্রুটি', e.message || 'রিপোর্ট রপ্তানি করা সম্ভব হয়নি');
    } finally {
      setExporting(false);
    }
  };

  const totalSales = Number(summary?.totalSales || 0);
  const totalCollections = Number(summary?.totalCollections || 0);
  const totalDue = Number(summary?.totalDue || 0);
  const newCustomers = summary?.newCustomersCount || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>রিপোর্ট ও অ্যানালিটিক্স</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.7}>
          {exporting ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="download" size={18} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodTab, activePeriod === period && styles.periodTabActive]}
              onPress={() => setActivePeriod(period)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, activePeriod === period && styles.periodTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KPICard
            label="মোট বিক্রয়"
            value={`৳ ${totalSales.toLocaleString()}`}
            icon="trending-up"
            iconBg={colors.successSoft}
            iconColor={colors.success}
          />
          <KPICard
            label="মোট আদায়"
            value={`৳ ${totalCollections.toLocaleString()}`}
            icon="check-circle"
            iconBg={colors.infoSoft}
            iconColor={colors.info}
          />
          <KPICard
            label="মোট বকেয়া"
            value={`৳ ${totalDue.toLocaleString()}`}
            icon="alert-circle"
            iconBg={colors.dangerSoft}
            iconColor={colors.danger}
          />
          <KPICard
            label="নতুন গ্রাহক"
            value={`${newCustomers} জন`}
            icon="users"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
          />
        </View>

        {/* Due Aging Section */}
        {dueAging && dueAging.length > 0 && (
          <View style={styles.agingSection}>
            <SectionHeader title="বকেয়া মেয়াদের তালিকা (Due Aging)" />
            <View style={styles.agingCard}>
              {dueAging.map((b) => (
                <View key={b.bucket} style={styles.agingRow}>
                  <Text style={styles.agingBucket}>{b.bucket}</Text>
                  <Text style={styles.agingCount}>{b.customerCount} জন</Text>
                  <Text style={styles.agingAmount}>৳ {Number(b.totalDue).toLocaleString()}</Text>
                </View>
              ))}
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
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
    gap: 16,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.button,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.surface,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  kpiSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  agingSection: {
    gap: 10,
  },
  agingCard: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  agingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agingBucket: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  agingCount: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 60,
    textAlign: 'center',
  },
  agingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
    width: 100,
    textAlign: 'right',
  },
});
