import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from '../../lib/supabase';
import { doc, getDoc, getFirestore, setDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader, AppInput } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export default function DonorPrivacySecurityScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  const [shareLocation, setShareLocation] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showDonationHistory, setShowDonationHistory] = useState(false);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      const settingsRef = doc(db, 'users', user.uid, 'privacy', 'donorSettings');
      const snapshot = await getDoc(settingsRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setShareLocation(data.shareLocation ?? true);
        setShowAvailability(data.showAvailability ?? false);
        setShowDonationHistory(data.showDonationHistory ?? false);
        setShowEmergencyContact(data.showEmergencyContact ?? false);
      }
    };
    fetchSettings();
  }, [user]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'privacy', 'donorSettings'), { [key]: value }, { merge: true });
    } catch {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { Alert.alert('Error', 'Please enter both current and new password'); return; }
    if (!user?.email) { Alert.alert('Error', 'User email not found.'); return; }
    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Privacy & Security" subtitle="Control your data and account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          <SectionTitle icon="location-outline" title="Location" colors={colors} />
          <ToggleRow label="Share location for nearby matching" value={shareLocation} onChange={(v: boolean) => { setShareLocation(v); updateSetting('shareLocation', v); }} colors={colors} />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle icon="eye-outline" title="Visibility" colors={colors} />
          <ToggleRow label="Show availability to receivers" value={showAvailability} onChange={(v: boolean) => { setShowAvailability(v); updateSetting('showAvailability', v); }} colors={colors} />
          <ToggleRow label="Show donation history" value={showDonationHistory} onChange={(v: boolean) => { setShowDonationHistory(v); updateSetting('showDonationHistory', v); }} colors={colors} />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle icon="alert-circle-outline" title="Emergency Contact" colors={colors} />
          <ToggleRow label="Show details for emergency contact" value={showEmergencyContact} onChange={(v: boolean) => { setShowEmergencyContact(v); updateSetting('showEmergencyContact', v); }} colors={colors} />
        </AppCard>

        <AppCard style={styles.card}>
          <SectionTitle icon="key-outline" title="Password & Credentials" colors={colors} />
          <ActionRow label="Change Password" onPress={() => setShowChangePassword(!showChangePassword)} colors={colors} />
          {showChangePassword ? (
            <View style={{ marginTop: spacing.md }}>
              {user?.providerData[0]?.providerId !== 'password' ? (
                <Text style={{ ...typography.bodySm, color: colors.danger }}>Your account is linked via {user?.providerData[0]?.providerId}. Please use web version to update password.</Text>
              ) : (
                <>
                  <AppInput label="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
                  <AppInput label="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                  <AppButton label="Update Password" onPress={handleChangePassword} loading={loading} />
                </>
              )}
            </View>
          ) : null}
          <ActionRow label="Change Number/Email" onPress={() => Alert.alert('Action Blocked', 'Use web version to change number/email')} colors={colors} />
          <ActionRow label="Delete My Account" onPress={() => Alert.alert('Action Blocked', 'Use web version to delete your account')} colors={colors} danger />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title, colors }: any) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function ToggleRow({ label, value, onChange, colors }: any) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={value ? colors.primary : '#f4f3f4'} />
    </View>
  );
}

function ActionRow({ label, onPress, colors, danger }: any) {
  return (
    <Pressable style={[styles.actionRow, { borderTopColor: colors.border }]} onPress={onPress}>
      <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, fontSize: 17 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, gap: spacing.md },
  rowLabel: { ...typography.bodySm, flex: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
});
