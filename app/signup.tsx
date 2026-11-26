import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppInput } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [role, setRole] = useState<'donor' | 'patient' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure, setSecure] = useState(true);
  const [number, setNumber] = useState('');
  const [agree, setAgree] = useState(false);

  const handleContinue = () => {
    if (!role || !name || !email || !password || !confirm || !number) {
      alert('Please fill all fields and select a role.');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    if (!agree) {
      alert('You must agree to our Terms & Privacy Policy.');
      return;
    }

    const route =
      role === 'donor'
        ? `/signup-donor?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&number=${encodeURIComponent(number)}`
        : `/signup-receiver?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&number=${encodeURIComponent(number)}`;
    router.push(route as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>

          <Text style={[styles.eyebrow, { color: colors.primary }]}>GET STARTED</Text>
          <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose your role and enter your details to continue.</Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>I am signing up as</Text>
            <View style={styles.roleContainer}>
              {(['donor', 'patient'] as const).map((r) => {
                const selected = role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    style={[
                      styles.roleButton,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primarySoft : colors.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={r === 'donor' ? 'heart-outline' : 'medkit-outline'}
                      size={18}
                      color={selected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.roleText, { color: selected ? colors.primary : colors.text }]}>
                      {r === 'donor' ? 'Donor' : 'Receiver'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <AppInput label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} />
            <AppInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AppInput
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={number}
              onChangeText={setNumber}
              keyboardType="phone-pad"
            />
            <AppInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              right={
                <Pressable onPress={() => setSecure(!secure)} hitSlop={8}>
                  <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </Pressable>
              }
            />
            <AppInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            <Pressable style={styles.checkboxContainer} onPress={() => setAgree(!agree)}>
              <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={agree ? colors.primary : colors.textMuted} />
              <Text style={[styles.checkboxText, { color: colors.textMuted }]}>
                I agree to the{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => router.push('./terms')}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => router.push('./privacy-policy')}>
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            <AppButton label="Continue" onPress={handleContinue} />
          </View>

          <Pressable onPress={() => router.push('/signin')} style={styles.linkWrap}>
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log In</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.sm },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  card: { borderWidth: 1, borderRadius: 20, padding: spacing.xl },
  sectionLabel: { ...typography.caption, fontSize: 13, marginBottom: spacing.sm },
  roleContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  roleButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleText: { ...typography.button, fontSize: 15 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.lg },
  checkboxText: { ...typography.bodySm, flex: 1, lineHeight: 20 },
  linkWrap: { alignItems: 'center', marginTop: spacing.xl },
  linkText: { ...typography.bodySm },
});
