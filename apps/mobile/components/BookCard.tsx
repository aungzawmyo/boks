import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BookListItemDto } from '@boks/shared-types';
import { theme } from '@/lib/theme';
import { BookCover } from '@/components/BookCover';

export function BookCard({
  book,
  rank,
  width = 128,
}: {
  book: BookListItemDto;
  rank?: number;
  width?: number;
}) {
  return (
    <Pressable
      style={[styles.card, { width }]}
      onPress={() => router.push(`/book/${book.slug}`)}
    >
      <View>
        <BookCover seed={book.slug} style={{ width: '100%', height: width * 1.35 }} />
        {rank ? (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {book.title}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.rating}>★ {book.averageRating.toFixed(1)}</Text>
        {book.lowestPrice != null && (
          <Text style={styles.price}>${book.lowestPrice.toFixed(2)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontWeight: '800', fontSize: 13, color: theme.colors.text },
  title: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 13,
    color: theme.colors.text,
  },
  metaRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: { color: theme.colors.textSecondary, fontSize: 12 },
  price: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
});
