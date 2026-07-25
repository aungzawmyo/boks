import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ORDER_STATUS_LABELS } from '@boks/configuration';
import type { BookListItemDto, OrderDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';
import { BookCover } from '@/components/BookCover';

const TABS = ['All', 'Ebooks', 'Physical'] as const;

/** Demo reading progress until the digital library arrives in Phase 4. */
const PROGRESS = [72, 38];

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING_PAYMENT: { bg: '#FDF3E1', fg: '#B07B24' },
  PAID: { bg: '#E7F2EA', fg: '#1A6B3C' },
  PROCESSING: { bg: '#FDF3E1', fg: '#B07B24' },
  SHIPPED: { bg: '#EAEFF7', fg: '#4A6FA5' },
  DELIVERED: { bg: '#E7F2EA', fg: '#1A6B3C' },
  CANCELLED: { bg: '#FBEAEA', fg: '#A54242' },
  REFUNDED: { bg: '#F0EAF7', fg: '#6B4AA5' },
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.books.list({ pageSize: 8, sort: 'rating' }),
      api.orders.list().catch(() => [] as OrderDto[]),
    ])
      .then(([res, orderRows]) => {
        setBooks(res.data);
        setOrders(orderRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const reading = books.slice(0, 2);
  const downloads = books.slice(2, 4);
  const showEbooks = tab !== 'Physical';
  const showPhysical = tab !== 'Ebooks';

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>My Library</Text>
        <Pressable style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} style={styles.tabItem} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Continue reading */}
          {showEbooks && reading.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>Continue reading</Text>
                <Text style={styles.seeAll}>See all</Text>
              </View>
              {reading.map((b, i) => (
                <Pressable
                  key={b.id}
                  style={styles.card}
                  onPress={() => router.push(`/book/${b.slug}`)}
                >
                  <BookCover seed={b.slug} radius={10} style={styles.cardCover} />
                  <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {b.title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {b.authors[0]?.name ?? 'Unknown author'}
                    </Text>
                    <Text style={styles.cardProgressLabel}>
                      {PROGRESS[i] ?? 50}% complete
                    </Text>
                    <View style={styles.progressTrack}>
                      <View
                        style={[styles.progressFill, { width: `${PROGRESS[i] ?? 50}%` }]}
                      />
                    </View>
                  </View>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              ))}
            </>
          )}

          {/* Downloads */}
          {showEbooks && downloads.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>Downloads</Text>
                <Text style={styles.seeAll}>See all</Text>
              </View>
              {downloads.map((b) => (
                <Pressable
                  key={b.id}
                  style={styles.card}
                  onPress={() => router.push(`/book/${b.slug}`)}
                >
                  <BookCover seed={b.slug} radius={10} style={styles.cardCover} />
                  <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {b.title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {b.authors[0]?.name ?? 'Unknown author'}
                    </Text>
                    <View style={styles.downloadedRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={theme.colors.success}
                      />
                      <Text style={styles.downloadedText}>Downloaded</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              ))}
            </>
          )}

          {/* Orders */}
          {showPhysical && orders.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.section}>Orders</Text>
              </View>
              {orders.slice(0, 5).map((o) => {
                const status = STATUS_COLORS[o.status] ?? STATUS_COLORS.PAID;
                const first = o.items[0];
                return (
                  <Pressable
                    key={o.id}
                    style={styles.card}
                    onPress={() => router.push(`/order/${o.id}`)}
                  >
                    <BookCover
                      seed={first?.slug ?? o.number}
                      radius={10}
                      style={styles.cardCover}
                    />
                    <View style={styles.cardBody}>
                      <View
                        style={[styles.statusChip, { backgroundColor: status.bg }]}
                      >
                        <Text style={[styles.statusText, { color: status.fg }]}>
                          {ORDER_STATUS_LABELS[o.status]}
                        </Text>
                      </View>
                      <Text numberOfLines={1} style={styles.cardTitle}>
                        {first
                          ? first.title +
                            (o.items.length > 1
                              ? ` +${o.items.length - 1} more`
                              : '')
                          : o.number}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {o.number} · ${o.total.toFixed(2)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                );
              })}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  bellBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 24,
  },
  tabItem: { paddingBottom: 10, alignItems: 'center' },
  tabText: { color: theme.colors.textSecondary, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: theme.colors.text, fontWeight: '700' },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
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
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  cardCover: { width: 54, height: 76 },
  cardBody: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 14 },
  cardMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardProgressLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 8,
    marginBottom: 5,
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
  downloadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  downloadedText: { color: theme.colors.success, fontSize: 12, fontWeight: '600' },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
});
