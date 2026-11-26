import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from '../lib/supabase';
import { doc, getDoc } from '../lib/supabase';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppInput } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCred.user?.uid;
      if (!uid) { alert("Login failed. Please try again."); return; }
      const docSnap = await getDoc(doc(db, 'users', uid));
      const userData = docSnap.data();

      if (userData?.role === 'donor') {
        router.replace('/donor/home');
      } else if (userData?.role === 'patient') {
        router.replace('/receiver/home');
      } else {
        alert('User role not found.');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>

          <Text style={[styles.eyebrow, { color: colors.primary }]}>WELCOME BACK</Text>
          <Text style={[styles.title, { color: colors.text }]}>Log in to your account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Access your requests, donor connections, and account settings.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              right={
                <Pressable onPress={() => setSecure((s) => !s)} hitSlop={8}>
                  <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </Pressable>
              }
            />
            <AppButton label="Log In" onPress={handleLogin} loading={loading} />
          </View>

          <Pressable onPress={() => router.push('/signup')} style={styles.linkWrap}>
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Don&apos;t have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xxl,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.xl,
  },
  linkWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  linkText: {
    ...typography.bodySm,
  },
});
