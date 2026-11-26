import { useLocalSearchParams, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from '../lib/supabase';
import { doc, setDoc } from '../lib/supabase';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppInput } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../lib/supabase';

export default function ReceiverSignUp() {
  const router = useRouter();
  const { name, email, password, number } = useLocalSearchParams();
  const { colors } = useAppTheme();

  const [bloodGroup, setBloodGroup] = useState('');
  const [condition, setCondition] = useState('');
  const [urgency, setUrgency] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReceiverSignUp = async () => {
    if (!bloodGroup || !condition || !urgency || !age) {
      alert('Please fill all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 1) {
      alert('Please enter a valid age');
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, String(email), String(password));
      const uid = userCred.user?.uid;
      if (!uid) { alert("Account created, but no session was returned. Please sign in."); return; }

      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'patient',
        name,
        email,
        number,
        age,
        bloodGroup,
        condition,
        urgency,
        createdAt: new Date(),
      });

      alert('Receiver account created successfully!');
      router.replace('/receiver/home');
    } catch (error: any) {
      console.error('Receiver Sign Up Error:', error);
      alert(error.message);
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
          <Text style={[styles.eyebrow, { color: colors.primary }]}>RECEIVER PROFILE</Text>
          <Text style={[styles.title, { color: colors.text }]}>Complete your receiver details</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>This information helps donors understand your needs quickly.</Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppInput label="Age" placeholder="Enter your age" keyboardType="numeric" value={age} onChangeText={setAge} />
            <AppInput label="Blood Group" placeholder="e.g. A+, B-, AB+" value={bloodGroup} onChangeText={setBloodGroup} autoCapitalize="characters" />
            <AppInput label="Medical Condition" placeholder="e.g. Surgery, Thalassemia" value={condition} onChangeText={setCondition} />
            <AppInput label="Urgency" placeholder="e.g. Immediate, Within 2 days" value={urgency} onChangeText={setUrgency} />
            <AppButton label="Create Receiver Account" onPress={handleReceiverSignUp} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  back: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.sm },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  card: { borderWidth: 1, borderRadius: 20, padding: spacing.xl },
});
