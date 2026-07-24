import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BookDetailDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function BookDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [format, setFormat] = useState<'PHYSICAL' | 'EBOOK'>('PHYSICAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.books
      .get(slug)
      .then((b) => {
        setBook(b);
        if (b.formats[0]) setFormat(b.formats[0].format);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !book) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const selected = book.formats.find((f) => f.format === format);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <View style={styles.cover}>
        <Text style={styles.coverLetter}>{book.title.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.badge}>Bestseller</Text>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>
          {book.authors.map((a) => a.name).join(', ')}
        </Text>
        <Text style={styles.rating}>
          ★ {book.averageRating.toFixed(1)} · {book.reviewCount.toLocaleString()} reviews
        </Text>

        <View style={styles.formats}>
          {book.formats.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFormat(f.format)}
              style={[
                styles.formatBtn,
                format === f.format && styles.formatBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.formatLabel,
                  format === f.format && styles.formatLabelActive,
                ]}
              >
                {f.format === 'PHYSICAL' ? 'Physical Book' : 'Ebook'}
              </Text>
              <Text
                style={[
                  styles.formatPrice,
                  format === f.format && styles.formatLabelActive,
                ]}
              >
                ${f.price.toFixed(2)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.buy}
          onPress={() =>
            Alert.alert(
              'Coming soon',
              `Checkout for ${selected?.format} at $${selected?.price.toFixed(2)} arrives in Phase 2.`,
            )
          }
        >
          <Text style={styles.buyText}>Buy now</Text>
        </Pressable>
        <Pressable
          style={styles.cart}
          onPress={() => Alert.alert('Coming soon', 'Cart arrives in Phase 2.')}
        >
          <Text style={styles.cartText}>Add to cart</Text>
        </Pressable>

        <View style={styles.perks}>
          <Text style={styles.perk}>Free delivery on orders $25+</Text>
          <Text style={styles.perk}>Ships in 1–2 days</Text>
          <Text style={styles.perk}>Easy returns within 30 days</Text>
        </View>

        <Text style={styles.section}>Synopsis</Text>
        <Text style={styles.synopsis}>{book.description}</Text>
      </View>
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
  cover: {
    height: 280,
    margin: 20,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLetter: { color: '#fff', fontSize: 72, fontWeight: '700' },
  body: { paddingHorizontal: 20 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentOrange,
    color: '#fff',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  author: { marginTop: 6, color: theme.colors.textSecondary, fontSize: 16 },
  rating: { marginTop: 8, color: theme.colors.star, fontWeight: '600' },
  formats: { flexDirection: 'row', gap: 12, marginTop: 20 },
  formatBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
  },
  formatBtnActive: { borderColor: theme.colors.primary },
  formatLabel: { fontWeight: '700', color: theme.colors.text },
  formatLabelActive: { color: theme.colors.primary },
  formatPrice: { marginTop: 6, color: theme.colors.textSecondary },
  buy: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cart: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cartText: { color: theme.colors.primary, fontWeight: '700', fontSize: 16 },
  perks: { marginTop: 18, gap: 6 },
  perk: { color: theme.colors.textSecondary, fontSize: 13 },
  section: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  synopsis: {
    marginTop: 8,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
});
