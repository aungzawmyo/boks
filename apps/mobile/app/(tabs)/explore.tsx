import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { BookListItemDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function ExploreScreen() {
  const [q, setQ] = useState('');
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'newest' | 'rating' | 'price_asc'>('newest');

  async function load(search = q, sortBy = sort) {
    setLoading(true);
    try {
      const res = await api.books.list({
        q: search || undefined,
        sort: sortBy,
        pageSize: 40,
      });
      setBooks(res.data);
      setTotal(res.meta.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Explore</Text>
      <TextInput
        style={styles.search}
        placeholder="Search books, authors or ISBN."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={() => load()}
        returnKeyType="search"
      />
      <View style={styles.filters}>
        {(['newest', 'rating', 'price_asc'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSort(s)}
            style={[styles.filter, sort === s && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                sort === s && styles.filterTextActive,
              ]}
            >
              {s === 'price_asc' ? 'Price' : s === 'rating' ? 'Rating' : 'Newest'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.count}>{total.toLocaleString()} results</Text>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/book/${item.slug}`)}
            >
              <View style={styles.cover}>
                <Text style={styles.coverLetter}>{item.title.charAt(0)}</Text>
              </View>
              <Text numberOfLines={2} style={styles.bookTitle}>
                {item.title}
              </Text>
              <Text style={styles.meta}>
                ${item.lowestPrice?.toFixed(2)} · ★ {item.averageRating.toFixed(1)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 56 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    color: theme.colors.text,
    marginBottom: 12,
  },
  search: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filter: {
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  filterActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
  filterTextActive: { color: '#fff' },
  count: {
    paddingHorizontal: 20,
    marginBottom: 12,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  card: { flex: 1, maxWidth: '48%' },
  cover: {
    height: 180,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.accentSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coverLetter: { fontSize: 40, fontWeight: '700', color: '#fff' },
  bookTitle: { fontWeight: '600', color: theme.colors.text, minHeight: 40 },
  meta: { color: theme.colors.textSecondary, fontSize: 12 },
});
