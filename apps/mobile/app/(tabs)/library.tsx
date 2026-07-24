import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/lib/theme';

export default function LibraryScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Library</Text>
      <Text style={styles.sub}>
        Owned ebooks, reading progress, and orders arrive in Phase 4.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continue reading</Text>
        <Text style={styles.cardBody}>No downloads yet — purchase an ebook to start.</Text>
      </View>
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
  sub: { marginTop: 8, color: theme.colors.textSecondary, marginBottom: 20 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  cardBody: { color: theme.colors.textSecondary },
});
