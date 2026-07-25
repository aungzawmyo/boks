import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BookDetailDto, BookListItemDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { theme } from '@/lib/theme';
import { BookCard } from '@/components/BookCard';
import { BookCover } from '@/components/BookCover';

export default function BookDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [related, setRelated] = useState<BookListItemDto[]>([]);
  const [format, setFormat] = useState<'PHYSICAL' | 'EBOOK'>('PHYSICAL');
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.books
      .get(slug)
      .then((b) => {
        setBook(b);
        if (b.formats[0]) setFormat(b.formats[0].format);
        const cat = b.categories[0]?.slug;
        return api.books.list({ category: cat, pageSize: 8 });
      })
      .then((res) => setRelated(res.data.filter((r) => r.slug !== slug)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !book) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const selected = book.formats.find((f) => f.format === format);

  async function addToCart(navigate: boolean) {
    if (!selected) return;
    setAdding(true);
    try {
      await add(selected.id);
      if (navigate) {
        router.push('/checkout');
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      Alert.alert('Could not add to cart', err instanceof Error ? err.message : '');
    } finally {
      setAdding(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="share-outline" size={21} color={theme.colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setLiked(!liked)}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={21}
              color={liked ? theme.colors.danger : theme.colors.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Cover + title */}
      <View style={styles.top}>
        <BookCover seed={book.slug} radius={18} style={styles.cover} />
        <View style={styles.topInfo}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>
            {book.authors.map((a) => a.name).join(', ')}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.colors.star} />
            <Text style={styles.rating}>
              {book.averageRating.toFixed(1)}{' '}
              <Text style={styles.ratingCount}>
                ({book.reviewCount.toLocaleString()})
              </Text>
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bestseller</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Format selector */}
        <View style={styles.formats}>
          {book.formats.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFormat(f.format)}
              style={[styles.formatBtn, format === f.format && styles.formatBtnActive]}
            >
              <View style={styles.formatLabelRow}>
                <Ionicons
                  name={f.format === 'PHYSICAL' ? 'book-outline' : 'tablet-portrait-outline'}
                  size={15}
                  color={format === f.format ? theme.colors.primary : theme.colors.text}
                />
                <Text
                  style={[
                    styles.formatLabel,
                    format === f.format && styles.formatLabelActive,
                  ]}
                >
                  {f.format === 'PHYSICAL' ? 'Physical Book' : 'Ebook'}
                </Text>
              </View>
              <Text
                style={[
                  styles.formatPrice,
                  format === f.format && styles.formatPriceActive,
                ]}
              >
                ${f.price.toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* CTAs */}
        <Pressable
          style={[styles.buy, adding && { opacity: 0.6 }]}
          disabled={adding}
          onPress={() => addToCart(true)}
        >
          <Text style={styles.buyText}>Buy now</Text>
        </Pressable>
        <Pressable
          style={[styles.cart, adding && { opacity: 0.6 }]}
          disabled={adding}
          onPress={() => addToCart(false)}
        >
          <Ionicons
            name={added ? 'checkmark' : 'cart-outline'}
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.cartText}>{added ? 'Added to cart' : 'Add to cart'}</Text>
        </Pressable>

        {/* Perks */}
        <View style={styles.perks}>
          <View style={styles.perk}>
            <Ionicons name="cube-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.perkText}>Free delivery on orders $25+</Text>
          </View>
          <View style={styles.perkDivider} />
          <View style={styles.perk}>
            <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.perkText}>Ships in 1–2 days</Text>
          </View>
          <View style={styles.perkDivider} />
          <View style={styles.perk}>
            <Ionicons
              name="return-down-back-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.perkText}>Easy returns within 30 days</Text>
          </View>
        </View>

        {/* Synopsis */}
        <Text style={styles.section}>Synopsis</Text>
        <Text style={styles.synopsis} numberOfLines={expanded ? undefined : 4}>
          {book.description}
        </Text>
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.readMore}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Read less' : 'Read more'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      {/* Related */}
      {related.length > 0 && (
        <>
          <View style={styles.relatedHeader}>
            <Text style={styles.section}>You may also like</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={related}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => <BookCard book={item} width={110} />}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  top: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 18,
  },
  cover: { width: 150, height: 210 },
  topInfo: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, lineHeight: 30 },
  author: { marginTop: 6, color: theme.colors.textSecondary, fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  rating: { fontWeight: '700', color: theme.colors.text, fontSize: 14 },
  ratingCount: { color: theme.colors.textSecondary, fontWeight: '400' },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.accentOrange,
    borderRadius: theme.radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: theme.colors.accentOrange, fontWeight: '700', fontSize: 11 },
  body: { paddingHorizontal: 20 },
  formats: { flexDirection: 'row', gap: 12, marginTop: 24 },
  formatBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 13,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  formatBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F5F2',
  },
  formatLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formatLabel: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  formatLabelActive: { color: theme.colors.primary },
  formatPrice: { marginTop: 6, color: theme.colors.textSecondary, fontWeight: '700' },
  formatPriceActive: { color: theme.colors.primary },
  buy: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cart: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.surface,
  },
  cartText: { color: theme.colors.primary, fontWeight: '700', fontSize: 15 },
  perks: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  perk: { flex: 1, alignItems: 'center', gap: 5, paddingHorizontal: 4 },
  perkText: {
    fontSize: 10.5,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  perkDivider: { width: 1, height: 32, backgroundColor: theme.colors.border },
  section: {
    marginTop: 26,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  synopsis: { marginTop: 8, lineHeight: 22, color: theme.colors.textSecondary },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  readMoreText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  relatedHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  seeAll: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
});
