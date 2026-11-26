import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from '../../lib/supabase';
import { doc, getDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/components/Themed';
import { AppCard } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { auth, db } from '../../lib/supabase';

export default function DonorSettingsScreen() {
  const router = useRouter();
  const { colors, scheme } = useAppTheme();
  const [userData, setUserData] = useState({ name: '' });
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifRequests, setNotifRequests] = useState(true);
  const [notifCamps, setNotifCamps] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(false);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) setUserData(docSnap.data() as any);
      } catch (err) {
        console.log('Error fetching userData:', err);
      }
    };
    fetchData();
  }, []);

  const handleSupport = () => Linking.openURL('mailto:rakthrekha@gmail.com');
  const handleBugReport = () => Linking.openURL('mailto:rakthrekha@gmail.com');
  const handleFeedback = () => Linking.openURL('mailto:rakthrekha@gmail.com');
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SETTINGS</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your account</Text>

        <Pressable onPress={() => router.push('/donor/profile')}>
          <AppCard style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>{userData.name || 'Your Name'}</Text>
              <Text style={[styles.profileSub, { color: colors.textMuted }]}>View and edit your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </AppCard>
        </Pressable>

        <Section title="Preferences" colors={colors}>
          <MenuRow icon="notifications-outline" label="Notification Preferences" onPress={() => setShowNotifMenu(!showNotifMenu)} colors={colors} />
          {showNotifMenu ? (
            <View style={[styles.dropdown, { borderColor: colors.border }]}>
              <ToggleRow label="Blood Requests" value={notifRequests} onValueChange={setNotifRequests} colors={colors} />
              <ToggleRow label="Nearby Camps" value={notifCamps} onValueChange={setNotifCamps} colors={colors} />
              <ToggleRow label="Emergency Alerts" value={notifAlerts} onValueChange={setNotifAlerts} colors={colors} />
            </View>
          ) : null}
          <MenuRow icon="calendar-outline" label="Schedule Your Availability" onPress={() => router.push('/donor/availabilty')} colors={colors} />
          <MenuRow icon="time-outline" label="Donation History" onPress={() => router.push('/donor/donationhistory')} colors={colors} />
          <MenuRow icon="globe-outline" label="Language & Theme" onPress={() => setShowLangMenu(!showLangMenu)} colors={colors} />
          {showLangMenu ? (
            <View style={[styles.dropdown, { borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.valueText, { color: colors.textMuted }]}>{scheme === 'dark' ? 'On' : 'Off'}</Text>
              </View>
              <Pressable onPress={() => setLanguage((p) => (p === 'English' ? 'Hindi' : 'English'))} style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Language</Text>
                <Text style={[styles.valueText, { color: colors.primary }]}>{language}</Text>
              </Pressable>
            </View>
          ) : null}
        </Section>

        <Section title="Security & Support" colors={colors}>
          <MenuRow icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => router.push('/donor/privacy')} colors={colors} />
          <MenuRow icon="help-circle-outline" label="Help & Feedback" onPress={() => setShowHelpMenu(!showHelpMenu)} colors={colors} />
          {showHelpMenu ? (
            <View style={[styles.dropdown, { borderColor: colors.border }]}>
              <MenuRow icon="mail-outline" label="Contact Support" onPress={handleSupport} colors={colors} compact />
              <MenuRow icon="bug-outline" label="Report a Bug" onPress={handleBugReport} colors={colors} compact />
              <MenuRow icon="chatbubble-ellipses-outline" label="Send Feedback" onPress={handleFeedback} colors={colors} compact />
            </View>
          ) : null}
        </Section>

        <Pressable style={[styles.logout, { borderColor: colors.dangerSoft, backgroundColor: colors.dangerSoft }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <AppCard style={{ padding: spacing.sm }}>{children}</AppCard>
    </View>
  );
}

function MenuRow({ icon, label, onPress, colors, compact }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.menuRow, compact && { paddingVertical: spacing.sm }]}>
      <View style={[styles.menuIcon, { backgroundColor: colors.background }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function ToggleRow({ label, value, onValueChange, colors }: any) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={value ? colors.primary : '#f4f3f4'} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.xs },
  title: { ...typography.title, fontSize: 30, lineHeight: 36, marginBottom: spacing.xl },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profileName: { ...typography.h3, fontSize: 18 },
  profileSub: { ...typography.bodySm },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.caption, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.sm, marginLeft: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, gap: spacing.md },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { ...typography.bodySm, fontWeight: '600', flex: 1 },
  dropdown: { borderTopWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  toggleLabel: { ...typography.bodySm },
  valueText: { ...typography.bodySm, fontWeight: '600' },
  logout: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  logoutText: { ...typography.button },
});
