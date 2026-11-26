import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, AppHeader, AppInput } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../../lib/supabase';

export default function DonorProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    bio: '',
    city: '',
    emergencyContact: '',
    preferredHospital: '',
    age: '',
    bloodGroup: '',
  });
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData((prev) => ({ ...prev, ...data }));
          setOriginalData(data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: string, value: string) => setUserData((prev) => ({ ...prev, [field]: value }));

  const handleUpdate = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      if (JSON.stringify(userData) === JSON.stringify(originalData)) {
        Alert.alert('No changes made');
        return;
      }
      setSaving(true);
      await setDoc(doc(db, 'users', uid), userData, { merge: true });
      setOriginalData(userData);
      Alert.alert('Profile Updated');
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Donor Profile" subtitle="Manage your personal information" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{userData.fullName || 'Your Name'}</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>Blood Group: {userData.bloodGroup || '—'} · Age: {userData.age || '—'}</Text>
        </AppCard>

        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal details</Text>
          <AppInput label="Full Name" value={userData.fullName} onChangeText={(v) => handleChange('fullName', v)} />
          <AppInput label="Bio" value={userData.bio} onChangeText={(v) => handleChange('bio', v)} multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />
          <AppInput label="City" value={userData.city} onChangeText={(v) => handleChange('city', v)} />
          <AppInput label="Emergency Contact" value={userData.emergencyContact} onChangeText={(v) => handleChange('emergencyContact', v)} keyboardType="phone-pad" />
          <AppInput label="Preferred Hospital" value={userData.preferredHospital} onChangeText={(v) => handleChange('preferredHospital', v)} />
          <AppInput label="Age" value={String(userData.age || '')} editable={false} />
          <AppInput label="Blood Group" value={userData.bloodGroup} editable={false} />
          <AppButton label="Save Changes" onPress={handleUpdate} loading={saving} />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  profileCard: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  name: { ...typography.h3 },
  muted: { ...typography.bodySm, marginTop: 4 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.lg },
});
