import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BookListItemDto, CategoryDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';
import { BookCard } from '@/components/BookCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.books.list({ pageSize: 20, sort: 'rating' }),
      api.categories.list(),
    ])
      .then(([list, cats]) => {
        setBooks(list.data);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = selected
    ? books.filter((b) => b.categories.some((c) => c.slug === selected))
    : books;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi, {user?.firstName ?? 'Reader'} 👋
        </Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <Pressable
        style={styles.search}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.searchText}>Search books, authors or ISBN.</Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => setSelected(null)}
          style={[styles.chip, !selected && styles.chipActive]}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextActive]}>
            All
          </Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelected(c.slug)}
            style={[styles.chip, selected === c.slug && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                selected === c.slug && styles.chipTextActive,
              ]}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Your next escape is waiting</Text>
        <Text style={styles.heroSub}>
          Curated physical and ebook picks for this week
        </Text>
        <Pressable
          style={styles.heroBtn}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Text style={styles.heroBtnText}>Explore picks</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Recommended for you</Text>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <FlatList
          horizontal
          data={filtered}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => <BookCard book={item} />}
        />
      )}

      <Text style={[styles.section, { marginTop: 24 }]}>Trending now</Text>
      <FlatList
        horizontal
        data={books.slice(0, 6)}
        keyExtractor={(item) => `t-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        renderItem={({ item, index }) => (
          <BookCard book={item} rank={index + 1} />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 26, fontWeight: '700', color: theme.colors.text },
  bell: { fontSize: 20 },
  search: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchText: { color: theme.colors.textSecondary },
  chips: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  hero: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    padding: 22,
    marginBottom: 20,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: theme.radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroBtnText: { color: theme.colors.primary, fontWeight: '700' },
  section: {
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
