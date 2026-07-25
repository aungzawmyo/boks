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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BookListItemDto, CategoryDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';
import { BookCard } from '@/components/BookCard';
import { BookCover } from '@/components/BookCover';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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
  const continueBook = books[0];

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.firstName ?? 'Reader'} 👋</Text>
          <Text style={styles.tagline}>Discover your next story</Text>
        </View>
        <Pressable style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Search */}
      <Pressable style={styles.search} onPress={() => router.push('/(tabs)/explore')}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
        <Text style={styles.searchText}>Search books, authors or ISBN</Text>
      </Pressable>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => setSelected(null)}
          style={[styles.chip, !selected && styles.chipActive]}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextActive]}>All</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelected(selected === c.slug ? null : c.slug)}
            style={[styles.chip, selected === c.slug && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, selected === c.slug && styles.chipTextActive]}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Hero card */}
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Your next escape{'\n'}is waiting</Text>
          <Text style={styles.heroSub}>Curated picks{'\n'}just for you</Text>
          <Pressable
            style={styles.heroBtn}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.heroBtnText}>Explore picks</Text>
          </Pressable>
        </View>
        {/* Arch illustration */}
        <View style={styles.heroArt}>
          <View style={styles.heroArch}>
            <View style={styles.heroSun} />
          </View>
        </View>
      </View>

      {/* Continue reading */}
      {continueBook && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Continue reading</Text>
            <Pressable onPress={() => router.push('/(tabs)/library')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.continueCard}
            onPress={() => router.push(`/book/${continueBook.slug}`)}
          >
            <BookCover
              seed={continueBook.slug}
              radius={10}
              style={{ width: 52, height: 72 }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={styles.continueTitle}>
                {continueBook.title}
              </Text>
              <Text style={styles.continueMeta}>Ch. 8 · 65%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
            </View>
            <Ionicons
              name="ellipsis-vertical"
              size={16}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </>
      )}

      {/* Recommended */}
      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recommended for you</Text>
        <Pressable onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <FlatList
          horizontal
          data={filtered}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          renderItem={({ item }) => <BookCard book={item} width={116} />}
        />
      )}

      {/* Trending */}
      <View style={styles.sectionRow}>
        <Text style={styles.section}>Trending now</Text>
        <Pressable onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={books.slice(0, 6)}
        keyExtractor={(item) => `t-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        renderItem={({ item, index }) => (
          <BookCard book={item} rank={index + 1} width={116} />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  tagline: { marginTop: 2, color: theme.colors.textSecondary, fontSize: 13 },
  bellBtn: { padding: 4 },
  search: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchText: { color: theme.colors.textSecondary, fontSize: 14 },
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
  hero: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F9F8F3',
    borderRadius: theme.radii.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },
  heroBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  heroArt: {
    width: 110,
    height: 130,
    borderRadius: 16,
    backgroundColor: '#2A5C48',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroArch: {
    width: 74,
    height: 104,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: '#EFE3D3',
    alignItems: 'center',
    paddingTop: 18,
  },
  heroSun: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#E4B363',
  },
  sectionRow: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  seeAll: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
  continueCard: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  continueTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 14 },
  continueMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
});
