import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FilterBar } from '@/components/ui/FilterChip';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  status: 'active' | 'low' | 'out';
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const ALL_PRODUCTS: Product[] = [
  { id: '1', name: 'ফ্লাই অ্যাশ সিমেন্ট', category: 'সিমেন্ট', unit: 'ব্যাগ', price: 480, stock: 250, status: 'active' },
  { id: '2', name: 'পোর্টল্যান্ড সিমেন্ট', category: 'সিমেন্ট', unit: 'ব্যাগ', price: 520, stock: 120, status: 'active' },
  { id: '3', name: 'রড — ১২mm', category: 'রড', unit: 'টন', price: 82000, stock: 15, status: 'low' },
  { id: '4', name: 'রড — ১৬mm', category: 'রড', unit: 'টন', price: 86000, stock: 8, status: 'low' },
  { id: '5', name: 'সিমেন্ট ব্লক', category: 'ব্লক', unit: 'পিস', price: 22, stock: 1500, status: 'active' },
  { id: '6', name: 'হলো ব্লক', category: 'ব্লক', unit: 'পিস', price: 28, stock: 800, status: 'active' },
  { id: '7', name: 'ইট (প্রথম শ্রেণী)', category: 'ইট', unit: 'হাজার', price: 9500, stock: 0, status: 'out' },
  { id: '8', name: 'বালি (মোটা)', category: 'বালি', unit: 'ঘনফুট', price: 35, stock: 500, status: 'active' },
  { id: '9', name: 'খোয়া — ৩/৪"', category: 'খোয়া', unit: 'ঘনফুট', price: 55, stock: 300, status: 'active' },
];

const CATEGORIES = ['সব', 'সিমেন্ট', 'রড', 'ব্লক', 'ইট', 'বালি', 'খোয়া'] as const;
type CategoryKey = typeof CATEGORIES[number];

const statusConfig = {
  active: { label: 'মজুদ আছে', variant: 'success' as const },
  low: { label: 'কম মজুদ', variant: 'warning' as const },
  out: { label: 'মজুদ নেই', variant: 'danger' as const },
};

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const cfg = statusConfig[product.status];
  const isLow = product.status === 'low';
  const isOut = product.status === 'out';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={[styles.cardAccent, {
        backgroundColor: isOut ? colors.danger : isLow ? colors.warning : colors.success,
      }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.productIcon}>
            <Feather name="package" size={18} color={colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.category}>{product.category} · {product.unit}</Text>
          </View>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.priceLabel}>মূল্য</Text>
            <Text style={styles.price}>৳ {product.price.toLocaleString()} / {product.unit}</Text>
          </View>
          <View style={styles.stockWrap}>
            <Text style={styles.stockLabel}>মজুদ</Text>
            <Text style={[
              styles.stockValue,
              isOut && { color: colors.danger },
              isLow && { color: colors.warning },
            ]}>
              {product.stock} {product.unit}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const ProductsScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('সব');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const matchSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.includes(search);
      const matchCat = activeCategory === 'সব' || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  const totalProducts = ALL_PRODUCTS.length;
  const outOfStock = ALL_PRODUCTS.filter((p) => p.status === 'out').length;
  const lowStock = ALL_PRODUCTS.filter((p) => p.status === 'low').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>পণ্য তালিকা</Text>
          <Text style={styles.headerSub}>{totalProducts} টি পণ্য</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.sumItem}>
          <Text style={styles.sumValue}>{totalProducts}</Text>
          <Text style={styles.sumLabel}>মোট পণ্য</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.warning }]}>{lowStock}</Text>
          <Text style={styles.sumLabel}>কম মজুদ</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumValue, { color: colors.danger }]}>{outOfStock}</Text>
          <Text style={styles.sumLabel}>মজুদ নেই</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="পণ্যের নাম বা ক্যাটাগরি" />
      </View>

      {/* Category filter */}
      <FilterBar
        options={[...CATEGORIES]}
        active={activeCategory}
        onSelect={setActiveCategory}
        variant="primary"
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => {}} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title="কোনো পণ্য পাওয়া যায়নি"
            description="অনুসন্ধান পরিবর্তন করুন বা নতুন পণ্য যোগ করুন।"
          />
        }
      />
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
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primarySoft,
    borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sumItem: { flex: 1, alignItems: 'center' },
  sumValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  sumLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sumDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  searchWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: { padding: theme.spacing.md, gap: 10, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 13, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  productIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.primarySoft,
    borderWidth: 1, borderColor: colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, lineHeight: 19 },
  category: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  price: { fontSize: 13, fontWeight: '700', color: colors.primary },
  stockWrap: { alignItems: 'flex-end' },
  stockLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  stockValue: { fontSize: 13, fontWeight: '700', color: colors.success },
});
