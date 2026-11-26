import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, setDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader, AppInput } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../../lib/supabase';

export default function ReceiverProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const user = auth.currentUser;
  const [editable, setEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    city: '',
    location: '',
    emergencyContact: '',
    preferredHospital: '',
    bloodGroup: 'A+',
    age: '22',
  });

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) setProfile((prev) => ({ ...prev, ...docSnap.data() }));
    });
    return unsub;
  }, []);

  const handleUpdate = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      setEditable(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Receiver Profile" subtitle="Manage your personal information" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{profile.name || 'Your Name'}</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>Blood Group: {profile.bloodGroup || '—'} · Age: {profile.age || '—'}</Text>
        </AppCard>

        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal details</Text>
          <AppInput label="Full Name" value={profile.name} onChangeText={(v) => setProfile({ ...profile, name: v })} editable={editable} />
          <AppInput label="Bio" value={profile.bio} onChangeText={(v) => setProfile({ ...profile, bio: v })} editable={editable} multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />
          <AppInput label="City" value={profile.city || profile.location} onChangeText={(v) => setProfile({ ...profile, city: v, location: v })} editable={editable} />
          <AppInput label="Emergency Contact" value={profile.emergencyContact} onChangeText={(v) => setProfile({ ...profile, emergencyContact: v })} editable={editable} keyboardType="phone-pad" />
          <AppInput label="Preferred Hospital" value={profile.preferredHospital} onChangeText={(v) => setProfile({ ...profile, preferredHospital: v })} editable={editable} />
          <AppButton
            label={editable ? 'Save Changes' : 'Edit Profile'}
            onPress={() => (editable ? handleUpdate() : setEditable(true))}
            loading={saving}
            variant={editable ? 'primary' : 'outline'}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  profileCard: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  name: { ...typography.h3 },
  muted: { ...typography.bodySm, marginTop: 4 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.lg },
});
