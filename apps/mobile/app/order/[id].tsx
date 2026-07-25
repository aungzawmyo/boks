import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
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
import { ORDER_STATUS_LABELS, SHIPPING_METHODS } from '@boks/configuration';
import type { OrderDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';
import { BookCover } from '@/components/BookCover';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING_PAYMENT: { bg: '#FDF3E1', fg: '#B07B24' },
  PAID: { bg: '#E7F2EA', fg: '#1A6B3C' },
  PROCESSING: { bg: '#FDF3E1', fg: '#B07B24' },
  SHIPPED: { bg: '#EAEFF7', fg: '#4A6FA5' },
  DELIVERED: { bg: '#E7F2EA', fg: '#1A6B3C' },
  CANCELLED: { bg: '#FBEAEA', fg: '#A54242' },
  REFUNDED: { bg: '#F0EAF7', fg: '#6B4AA5' },
};

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    if (id) api.orders.get(id).then(setOrder);
  }, [id]);

  if (!order) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const status = STATUS_COLORS[order.status] ?? STATUS_COLORS.PAID;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)')
          }
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Order {order.number}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {placed === '1' && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={40} color={theme.colors.primary} />
            <Text style={styles.successTitle}>Thank you for your order!</Text>
            <Text style={styles.successSub}>
              A confirmation was sent to your email.
            </Text>
          </View>
        )}

        <View style={styles.statusRow}>
          <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.fg }]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
          </View>
          {order.trackingNumber && (
            <Text style={styles.tracking}>Tracking: {order.trackingNumber}</Text>
          )}
        </View>

        <Text style={styles.section}>Items</Text>
        {order.items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.itemCard}
            onPress={() => router.push(`/book/${item.slug}`)}
          >
            <BookCover seed={item.slug} radius={8} style={{ width: 44, height: 62 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text style={styles.itemMeta}>
                {item.format === 'PHYSICAL' ? 'Physical Book' : 'Ebook'} · Qty{' '}
                {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${item.lineTotal.toFixed(2)}</Text>
          </Pressable>
        ))}

        {order.address && (
          <>
            <Text style={styles.section}>Shipping</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{order.address.fullName}</Text>
              <Text style={styles.infoSub}>
                {order.address.line1}, {order.address.city}
                {order.address.state ? `, ${order.address.state}` : ''}{' '}
                {order.address.postalCode}
              </Text>
              {order.shippingMethod && (
                <Text style={styles.infoSub}>
                  {SHIPPING_METHODS[order.shippingMethod].label} —{' '}
                  {SHIPPING_METHODS[order.shippingMethod].description}
                </Text>
              )}
            </View>
          </>
        )}

        <Text style={styles.section}>Summary</Text>
        <View style={styles.infoCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {(order.status === 'PENDING_PAYMENT' || order.status === 'PAID') && (
          <Pressable
            style={styles.cancelBtn}
            onPress={async () => {
              const updated = await api.orders.cancel(order.id);
              setOrder(updated);
            }}
          >
            <Text style={styles.cancelText}>Cancel order</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
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
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  successCard: {
    margin: 20,
    marginBottom: 4,
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    borderRadius: theme.radii.lg,
    padding: 24,
  },
  successTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  successSub: { marginTop: 4, color: theme.colors.textSecondary, fontSize: 13 },
  statusRow: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusChip: {
    borderRadius: theme.radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: { fontWeight: '700', fontSize: 12 },
  tracking: { color: theme.colors.textSecondary, fontSize: 12 },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 10,
  },
  itemTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  itemMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  itemPrice: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 14,
  },
  infoTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  infoSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: theme.colors.textSecondary, fontSize: 13 },
  summaryValue: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  totalLabel: { color: theme.colors.text, fontWeight: '800', fontSize: 14 },
  totalValue: { color: theme.colors.text, fontWeight: '800', fontSize: 14 },
  cancelBtn: {
    margin: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    borderRadius: theme.radii.full,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: { color: theme.colors.danger, fontWeight: '700' },
});
