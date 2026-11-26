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

export default function DonorSignUp() {
  const router = useRouter();
  const { name, email, password, number } = useLocalSearchParams();
  const { colors } = useAppTheme();

  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonorSignUp = async () => {
    if (!bloodGroup || !location || !availability || !age) {
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
        role: 'donor',
        name,
        email,
        number,
        age,
        bloodGroup,
        location,
        availability,
        createdAt: new Date(),
      });

      alert('Donor account created successfully!');
      router.replace('/donor/home');
    } catch (error: any) {
      console.error('Donor Sign Up Error:', error);
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
          <Text style={[styles.eyebrow, { color: colors.primary }]}>DONOR PROFILE</Text>
          <Text style={[styles.title, { color: colors.text }]}>Complete your donor details</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Help us match you with people who need your blood type.</Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppInput label="Age" placeholder="Enter your age" keyboardType="numeric" value={age} onChangeText={setAge} />
            <AppInput label="Blood Group" placeholder="e.g. A+, O-, AB+" value={bloodGroup} onChangeText={setBloodGroup} autoCapitalize="characters" />
            <AppInput label="City or Location" placeholder="Where are you located?" value={location} onChangeText={setLocation} />
            <AppInput label="Availability" placeholder="e.g. Weekends, Anytime" value={availability} onChangeText={setAvailability} />
            <AppButton label="Create Donor Account" onPress={handleDonorSignUp} loading={loading} />
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
