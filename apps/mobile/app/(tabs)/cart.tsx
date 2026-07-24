import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/theme';

export default function CartScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cart</Text>
      <Text style={styles.sub}>
        Shopping cart, coupons, and Stripe checkout arrive in Phase 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  sub: { marginTop: 8, color: theme.colors.textSecondary },
});
