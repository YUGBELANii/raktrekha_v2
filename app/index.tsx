import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.hero}>
          <View style={[styles.logoWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>RAKT REKHA</Text>
          <Text style={[styles.title, { color: colors.text }]}>Donate blood.{'\n'}Save lives with confidence.</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            A trusted platform connecting donors and recipients when every minute matters.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>Fast</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Request matching</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>Safe</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Trusted connections</Text>
            </View>
          </View>

          <AppButton label="Log In" onPress={() => router.push('/signin')} />
          <AppButton label="Create Account" onPress={() => router.push('/signup')} variant="outline" style={styles.secondary} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 84,
    height: 84,
  },
  eyebrow: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: 340,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
  },
  statValue: {
    ...typography.h3,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
  },
  secondary: {
    marginTop: spacing.md,
  },
});
