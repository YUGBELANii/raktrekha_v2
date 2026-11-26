import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader, AppCard } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export default function PrivacyPolicyScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Privacy Policy" subtitle="How we handle your information" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            At Rakt Rekha, we value your privacy. We only collect information necessary to connect donors with recipients in emergencies and ensure the safety of our users.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>Data We Collect</Text>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            We collect basic details like your name, contact information, and location to facilitate matching with nearby donors or recipients.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>How We Use Data</Text>
          <Text style={[styles.p, { color: colors.textMuted }]}>
            The information is strictly used to provide lifesaving connections. We do not sell or share data with third parties without your consent.
          </Text>
          <Text style={[styles.h, { color: colors.text }]}>Contact Us</Text>
          <Text style={[styles.p, { color: colors.textMuted, marginBottom: 0 }]}>
            For questions about this policy, reach out at: raktrekha@gmail.com
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
