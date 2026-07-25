import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SHIPPING_METHODS } from '@boks/configuration';
import { theme } from '@/lib/theme';
import { useCart } from '@/lib/cart';
import { BookCover } from '@/components/BookCover';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, refresh, refreshing, updateItem, removeItem } = useCart();
  const [busyItem, setBusyItem] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function changeQty(itemId: string, quantity: number) {
    setBusyItem(itemId);
    try {
      await updateItem(itemId, quantity);
    } finally {
      setBusyItem(null);
    }
  }

  const freeShippingGap = cart
    ? SHIPPING_METHODS.standard.freeOver! - cart.subtotal
    : 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Cart</Text>
        {cart && cart.itemCount > 0 && (
          <Text style={styles.itemCount}>
            {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'}
          </Text>
        )}
      </View>

      {!cart && refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} />
      ) : !cart || cart.items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={56} color={theme.colors.border} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Browse the catalog and add books you love.
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.emptyBtnText}>Explore books</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {cart.items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Pressable onPress={() => router.push(`/book/${item.slug}`)}>
                  <BookCover seed={item.slug} radius={10} style={styles.cover} />
                </Pressable>
                <View style={styles.cardBody}>
                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.format === 'PHYSICAL' ? 'Physical Book' : 'Ebook'}
                    {item.authorName ? ` · ${item.authorName}` : ''}
                  </Text>
                  <Text style={styles.cardPrice}>${item.unitPrice.toFixed(2)}</Text>
                  <View style={styles.qtyRow}>
                    {item.format === 'PHYSICAL' ? (
                      <View style={styles.stepper}>
                        <Pressable
                          style={styles.stepBtn}
                          disabled={busyItem === item.id}
                          onPress={() => changeQty(item.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color={theme.colors.text} />
                        </Pressable>
                        <Text style={styles.qty}>{item.quantity}</Text>
                        <Pressable
                          style={styles.stepBtn}
                          disabled={busyItem === item.id}
                          onPress={() => changeQty(item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color={theme.colors.text} />
                        </Pressable>
                      </View>
                    ) : (
                      <View />
                    )}
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={theme.colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {cart.hasPhysicalItems && freeShippingGap > 0 && (
              <View style={styles.shippingHint}>
                <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.shippingHintText}>
                  Add ${freeShippingGap.toFixed(2)} more for free standard delivery
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.summary, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {cart.hasPhysicalItems ? 'Calculated at checkout' : 'Free'}
              </Text>
            </View>
            <Pressable style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
              <Text style={styles.checkoutText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  itemCount: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 4 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    marginTop: 6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  cover: { width: 64, height: 90 },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 14 },
  cardMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardPrice: { fontWeight: '700', color: theme.colors.text, marginTop: 6 },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.background,
  },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qty: { minWidth: 24, textAlign: 'center', fontWeight: '700', color: theme.colors.text },
  removeBtn: { padding: 6 },
  shippingHint: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F5F2',
    borderRadius: theme.radii.md,
    padding: 12,
  },
  shippingHintText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  summary: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: theme.colors.textSecondary, fontSize: 13 },
  summaryValue: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  checkoutBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
