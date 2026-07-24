import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BookListItemDto } from '@boks/shared-types';
import { theme } from '@/lib/theme';

export function BookCard({
  book,
  rank,
}: {
  book: BookListItemDto;
  rank?: number;
}) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/book/${book.slug}`)}
    >
      <View style={styles.cover}>
        {rank ? <Text style={styles.rank}>{rank}</Text> : null}
        <Text style={styles.coverLetter}>{book.title.charAt(0)}</Text>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {book.title}
      </Text>
      <Text style={styles.rating}>★ {book.averageRating.toFixed(1)}</Text>
      <Text style={styles.price}>
        from ${book.lowestPrice?.toFixed(2) ?? '—'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 130 },
  cover: {
    height: 170,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  rank: {
    position: 'absolute',
    top: 8,
    left: 8,
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  coverLetter: { color: '#fff', fontSize: 42, fontWeight: '700' },
  title: { fontWeight: '600', color: theme.colors.text, minHeight: 36 },
  rating: { color: theme.colors.star, marginTop: 2, fontSize: 12 },
  price: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
});
