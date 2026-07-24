import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default function AccountScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.name}>
        {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
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
  name: { marginTop: 16, fontSize: 20, fontWeight: '600', color: theme.colors.text },
  email: { marginTop: 4, color: theme.colors.textSecondary, marginBottom: 24 },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
