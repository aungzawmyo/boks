import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SHIPPING_METHODS,
  ShippingMethodId,
  shippingFeeFor,
} from '@boks/configuration';
import type { AddressDto } from '@boks/shared-types';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';
import { useCart } from '@/lib/cart';

const EMPTY_FORM = {
  fullName: '',
  line1: '',
  city: '',
  state: '',
  postalCode: '',
};

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<ShippingMethodId>('standard');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const needsShipping = cart?.hasPhysicalItems ?? false;

  useEffect(() => {
    api.addresses
      .list()
      .then((rows) => {
        setAddresses(rows);
        const preferred = rows.find((a) => a.isDefault) ?? rows[0];
        setAddressId(preferred?.id ?? null);
        if (!rows.length) setShowForm(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const shippingFee = needsShipping ? shippingFeeFor(method, cart.subtotal) : 0;
  const total = Math.round((cart.subtotal + shippingFee) * 100) / 100;

  async function saveAddress() {
    if (!form.fullName || !form.line1 || !form.city || !form.postalCode) {
      Alert.alert('Missing details', 'Please fill in name, street, city and postal code.');
      return;
    }
    const created = await api.addresses.create({
      fullName: form.fullName,
      line1: form.line1,
      city: form.city,
      state: form.state || null,
      postalCode: form.postalCode,
      country: 'US',
      isDefault: addresses.length === 0,
    });
    setAddresses((prev) => [created, ...prev]);
    setAddressId(created.id);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function placeOrder() {
    if (needsShipping && !addressId) {
      Alert.alert('Address required', 'Please add a shipping address first.');
      return;
    }
    setPaying(true);
    try {
      const result = await api.checkout({
        addressId: needsShipping ? addressId : null,
        shippingMethod: needsShipping ? method : null,
      });
      // Mock provider settles immediately; Stripe flow would confirm the
      // PaymentIntent with the client secret before calling pay.
      const order = await api.orders.pay(result.order.id);
      await refresh();
      router.replace({ pathname: '/order/[id]', params: { id: order.id, placed: '1' } });
    } catch (err) {
      Alert.alert('Checkout failed', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Items summary */}
        <Text style={styles.section}>Order items</Text>
        {cart.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text numberOfLines={1} style={styles.itemTitle}>
              {item.quantity} × {item.title}
              <Text style={styles.itemFormat}>
                {'  '}
                {item.format === 'PHYSICAL' ? 'Physical' : 'Ebook'}
              </Text>
            </Text>
            <Text style={styles.itemPrice}>${item.lineTotal.toFixed(2)}</Text>
          </View>
        ))}

        {/* Shipping address */}
        {needsShipping && (
          <>
            <Text style={styles.section}>Shipping address</Text>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                {addresses.map((a) => (
                  <Pressable
                    key={a.id}
                    style={[styles.option, addressId === a.id && styles.optionActive]}
                    onPress={() => setAddressId(a.id)}
                  >
                    <Ionicons
                      name={addressId === a.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={
                        addressId === a.id
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>{a.fullName}</Text>
                      <Text style={styles.optionSub}>
                        {a.line1}, {a.city}
                        {a.state ? `, ${a.state}` : ''} {a.postalCode}
                      </Text>
                    </View>
                  </Pressable>
                ))}
                {showForm ? (
                  <View style={styles.form}>
                    <TextInput
                      style={styles.input}
                      placeholder="Full name"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={form.fullName}
                      onChangeText={(v) => setForm({ ...form, fullName: v })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Street address"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={form.line1}
                      onChangeText={(v) => setForm({ ...form, line1: v })}
                    />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="City"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={form.city}
                        onChangeText={(v) => setForm({ ...form, city: v })}
                      />
                      <TextInput
                        style={[styles.input, { width: 80 }]}
                        placeholder="State"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={form.state}
                        onChangeText={(v) => setForm({ ...form, state: v })}
                      />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Postal code"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={form.postalCode}
                      onChangeText={(v) => setForm({ ...form, postalCode: v })}
                    />
                    <Pressable style={styles.secondaryBtn} onPress={saveAddress}>
                      <Text style={styles.secondaryBtnText}>Save address</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.addLink} onPress={() => setShowForm(true)}>
                    <Ionicons name="add" size={16} color={theme.colors.primary} />
                    <Text style={styles.addLinkText}>Add new address</Text>
                  </Pressable>
                )}
              </>
            )}

            {/* Shipping method */}
            <Text style={styles.section}>Delivery</Text>
            {(Object.keys(SHIPPING_METHODS) as ShippingMethodId[]).map((id) => {
              const m = SHIPPING_METHODS[id];
              const fee = shippingFeeFor(id, cart.subtotal);
              return (
                <Pressable
                  key={id}
                  style={[styles.option, method === id && styles.optionActive]}
                  onPress={() => setMethod(id)}
                >
                  <Ionicons
                    name={method === id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={
                      method === id ? theme.colors.primary : theme.colors.textSecondary
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{m.label}</Text>
                    <Text style={styles.optionSub}>{m.description}</Text>
                  </View>
                  <Text style={styles.optionPrice}>
                    {fee === 0 ? 'Free' : `$${fee.toFixed(2)}`}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}

        {/* Payment */}
        <Text style={styles.section}>Payment</Text>
        <View style={[styles.option, styles.optionActive]}>
          <Ionicons name="card-outline" size={18} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>Test payment</Text>
            <Text style={styles.optionSub}>
              Development mode — payment succeeds instantly
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Total + pay */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[styles.primaryBtn, paying && { opacity: 0.6 }]}
          disabled={paying}
          onPress={placeOrder}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Pay ${total.toFixed(2)}</Text>
          )}
        </Pressable>
      </View>
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
    gap: 16,
  },
  emptyText: { color: theme.colors.textSecondary },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemRow: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 12,
  },
  itemTitle: { flex: 1, color: theme.colors.text, fontSize: 13 },
  itemFormat: { color: theme.colors.textSecondary, fontSize: 11 },
  itemPrice: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  option: {
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 14,
  },
  optionActive: { borderColor: theme.colors.primary },
  optionTitle: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  optionSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 1 },
  optionPrice: { fontWeight: '700', color: theme.colors.text, fontSize: 13 },
  addLink: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  addLinkText: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
  form: { marginHorizontal: 20, gap: 10 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: theme.colors.primary, fontWeight: '700' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: { color: theme.colors.textSecondary, fontSize: 13 },
  summaryValue: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  totalLabel: { color: theme.colors.text, fontWeight: '800', fontSize: 15 },
  totalValue: { color: theme.colors.text, fontWeight: '800', fontSize: 15 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
