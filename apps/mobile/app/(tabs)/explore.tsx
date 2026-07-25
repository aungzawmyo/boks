import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BookListItemDto, CategoryDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';
import { BookCover } from '@/components/BookCover';

const QUICK_CATEGORIES: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'New\nReleases', icon: 'sparkles-outline' },
  { label: 'Bestsellers', icon: 'ribbon-outline' },
  { label: 'Award\nWinners', icon: 'trophy-outline' },
  { label: 'Coming\nSoon', icon: 'calendar-outline' },
  { label: 'Young\nAdult', icon: 'people-outline' },
];

type SortKey = 'newest' | 'rating' | 'price_asc' | 'price_desc';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [format, setFormat] = useState<'PHYSICAL' | 'EBOOK' | null>(null);
  const [sort, setSort] = useState<SortKey>('newest');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load(search = q) {
    setLoading(true);
    try {
      const res = await api.books.list({
        q: search || undefined,
        category: category ?? undefined,
        format: format ?? undefined,
        sort,
        pageSize: 40,
      });
      setBooks(res.data);
      setTotal(res.meta.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category, format]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 18, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { paddingTop: insets.top + 12 }]}>Explore</Text>

            {/* Search */}
            <View style={styles.search}>
              <Ionicons
                name="search-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search books, authors or ISBN"
                placeholderTextColor={theme.colors.textSecondary}
                value={q}
                onChangeText={setQ}
                onSubmitEditing={() => load()}
                returnKeyType="search"
              />
            </View>

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Pressable
                onPress={() => setCategory(null)}
                style={[styles.chip, !category && styles.chipActive]}
              >
                <Text style={[styles.chipText, !category && styles.chipTextActive]}>
                  All
                </Text>
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(category === c.slug ? null : c.slug)}
                  style={[styles.chip, category === c.slug && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c.slug && styles.chipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Editor's picks banner */}
            <View style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Editor’s picks</Text>
                <Text style={styles.bannerSub}>Stories that stay{'\n'}with you</Text>
                <Pressable
                  style={styles.bannerBtn}
                  onPress={() => setSort('rating')}
                >
                  <Text style={styles.bannerBtnText}>See collection</Text>
                </Pressable>
              </View>
              <View style={styles.bannerArt}>
                <View style={styles.bannerArch}>
                  <View style={styles.bannerSun} />
                </View>
                <View style={styles.bannerSteps} />
              </View>
            </View>

            {/* Popular categories */}
            <Text style={styles.section}>Popular categories</Text>
            <View style={styles.quickRow}>
              {QUICK_CATEGORIES.map((c) => (
                <Pressable key={c.label} style={styles.quickItem}>
                  <View style={styles.quickIcon}>
                    <Ionicons name={c.icon} size={20} color={theme.colors.text} />
                  </View>
                  <Text style={styles.quickLabel}>{c.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              <Pressable style={styles.filterPill}>
                <Ionicons
                  name="options-outline"
                  size={14}
                  color={theme.colors.text}
                />
                <Text style={styles.filterText}>Filters</Text>
              </Pressable>
              <Pressable
                style={[styles.filterPill, format && styles.filterPillActive]}
                onPress={() =>
                  setFormat(
                    format === null
                      ? 'PHYSICAL'
                      : format === 'PHYSICAL'
                        ? 'EBOOK'
                        : null,
                  )
                }
              >
                <Text style={[styles.filterText, format && styles.filterTextActive]}>
                  {format === 'PHYSICAL'
                    ? 'Physical'
                    : format === 'EBOOK'
                      ? 'Ebook'
                      : 'Format'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={13}
                  color={format ? '#fff' : theme.colors.text}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.filterPill,
                  sort.startsWith('price') && styles.filterPillActive,
                ]}
                onPress={() =>
                  setSort(sort === 'price_asc' ? 'price_desc' : 'price_asc')
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    sort.startsWith('price') && styles.filterTextActive,
                  ]}
                >
                  Price
                </Text>
                <Ionicons
                  name={sort === 'price_desc' ? 'arrow-down' : 'arrow-up'}
                  size={13}
                  color={sort.startsWith('price') ? '#fff' : theme.colors.text}
                />
              </Pressable>
              <Pressable
                style={[styles.filterPill, sort === 'rating' && styles.filterPillActive]}
                onPress={() => setSort(sort === 'rating' ? 'newest' : 'rating')}
              >
                <Text
                  style={[
                    styles.filterText,
                    sort === 'rating' && styles.filterTextActive,
                  ]}
                >
                  Rating
                </Text>
              </Pressable>
              <Pressable
                style={styles.filterPill}
                onPress={() => setSort('newest')}
              >
                <Text style={styles.filterText}>Sort</Text>
                <Ionicons name="swap-vertical" size={13} color={theme.colors.text} />
              </Pressable>
            </ScrollView>

            <Text style={styles.count}>{total.toLocaleString()} results</Text>
            {loading && (
              <ActivityIndicator
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.gridCard}
            onPress={() => router.push(`/book/${item.slug}`)}
          >
            <BookCover seed={item.slug} style={{ width: '100%', aspectRatio: 0.74 }} />
            <View style={styles.gridMeta}>
              <Text style={styles.gridPrice}>
                ${item.lowestPrice?.toFixed(2) ?? '—'}
              </Text>
              <Text style={styles.gridRating}>★ {item.averageRating.toFixed(1)}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No books found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    color: theme.colors.text,
    marginBottom: 14,
  },
  search: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: theme.colors.text },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  banner: {
    marginHorizontal: 20,
    backgroundColor: '#EFE3D3',
    borderRadius: theme.radii.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#3D2C1E' },
  bannerSub: { marginTop: 4, color: '#7A6A57', fontSize: 13, lineHeight: 18 },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  bannerArt: {
    width: 96,
    height: 112,
    borderRadius: 14,
    backgroundColor: '#C4784A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bannerArch: {
    width: 58,
    height: 84,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: '#F2E3C6',
    alignItems: 'center',
    paddingTop: 14,
    marginBottom: -10,
  },
  bannerSun: { width: 26, height: 26, borderRadius: 999, backgroundColor: '#C4784A' },
  bannerSteps: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 26,
    backgroundColor: '#A65E38',
    borderTopLeftRadius: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickItem: { alignItems: 'center', width: 62 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 14,
  },
  filters: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  filterTextActive: { color: '#fff' },
  count: {
    paddingHorizontal: 20,
    marginBottom: 14,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  gridCard: { flex: 1 },
  gridMeta: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  gridRating: { color: theme.colors.textSecondary, fontSize: 12 },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingVertical: 40,
  },
});
