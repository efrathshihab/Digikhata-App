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
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product as ApiProduct } from '@/api/products.api';

const statusConfig = {
  active: { label: 'মজুদ আছে', variant: 'success' as const },
  low: { label: 'কম মজুদ', variant: 'warning' as const },
  out: { label: 'মজুদ নেই', variant: 'danger' as const },
};

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onPress }: { product: ApiProduct; onPress: () => void }) => {
  const stock = Number(product.stockQuantity || 0);
  const alertLimit = Number(product.minStockAlert || 10);
  
  let statusKey: 'active' | 'low' | 'out' = 'active';
  if (stock <= 0) statusKey = 'out';
  else if (stock <= alertLimit) statusKey = 'low';

  const cfg = statusConfig[statusKey];
  const isLow = statusKey === 'low';
  const isOut = statusKey === 'out';

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
            <Text style={styles.category}>{product.productCode} · {product.unit}</Text>
          </View>
          <StatusBadge label={cfg.label} variant={cfg.variant} />
        </View>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.priceLabel}>মূল্য</Text>
            <Text style={styles.price}>৳ {Number(product.price).toLocaleString()} / {product.unit}</Text>
          </View>
          <View style={styles.stockWrap}>
            <Text style={styles.stockLabel}>মজুদ</Text>
            <Text style={[
              styles.stockValue,
              isOut && { color: colors.danger },
              isLow && { color: colors.warning },
            ]}>
              {stock} {product.unit}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const ProductsScreen = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products', { search }],
    queryFn: () => productsApi.getProducts({ search: search || undefined, limit: 100 }),
  });

  const productsList = data?.items || [];

  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.productCode.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [productsList, search]);

  const totalProducts = productsList.length;
  const outOfStock = productsList.filter((p) => Number(p.stockQuantity) <= 0).length;
  const lowStock = productsList.filter((p) => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= Number(p.minStockAlert || 10)).length;

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
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7} onPress={() => router.push('/products/add' as any)}>
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
        <SearchInput value={search} onChangeText={setSearch} placeholder="পণ্যের নাম বা কোড দিয়ে খুঁজুন" />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="package"
              title="কোনো পণ্য পাওয়া যায়নি"
              description="পণ্য তালিকা খালি অথবা অনুসন্ধানে কোনো পণ্য মেলেনি।"
            />
          ) : null
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => {}} />
        )}
      />

      <FloatingActionButton
        onPress={() => router.push('/products/add' as any)}
        label="নতুন পণ্য"
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sumItem: {
    flex: 1,
    alignItems: 'center',
  },
  sumValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sumLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sumDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: theme.spacing.md,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stockWrap: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
});
