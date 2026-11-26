import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, AppCard } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export default function TermsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Terms & Conditions" subtitle="How to use Rakt Rekha responsibly" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            By using Rakt Rekha, you agree to comply with our terms and use the app responsibly to save lives.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>Usage Policy</Text>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            Users must provide accurate information and avoid misuse of the platform. Any malicious use may lead to account suspension.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>Liability</Text>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            Rakt Rekha serves as a bridge between donors and recipients. We do not guarantee outcomes of individual donations.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>Changes to Terms</Text>
          <Text style={[styles.p, { color: colors.textMuted, marginBottom: 0 }]}>
            We may update these terms as required. Continued use of the app implies agreement with updated terms.
          </Text>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  h: { ...typography.h3, fontSize: 17, marginTop: spacing.lg, marginBottom: spacing.sm },
  p: { ...typography.bodySm, marginBottom: spacing.md },
});
