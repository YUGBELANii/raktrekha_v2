import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from '../../lib/supabase';
import { doc, getDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { ThemedText, ThemedView } from '../../components/Themed';
import { auth, db } from '../../lib/supabase';

export default function ReceiverSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [userData, setUserData] = useState({ name: '' });
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [notifDonors, setNotifDonors] = useState(true);
  const [notifCamps, setNotifCamps] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [language, setLanguage] = useState('English');

  // ✅ Fetch user name from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // ✅ First try to get user from `users` collection
        let docRef = doc(db, 'users', uid);
        let docSnap = await getDoc(docRef);

        // ✅ If not found, fallback to `receivers`
        if (!docSnap.exists()) {
          docRef = doc(db, 'receivers', uid);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({ name: data?.name || 'Receiver' });
        } else {
          setUserData({ name: 'Receiver' });
        }
      } catch (err) {
        console.log('Error fetching userData:', err);
        setUserData({ name: 'Receiver' });
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
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Profile Section */}
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: '#e53935' }]}
          onPress={() => router.push('/receiver/profile')}
        >
          <Ionicons name="person-circle-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <ThemedText style={styles.profileText}>{userData.name || 'Your Name'}</ThemedText>
          <Ionicons name="pencil-outline" size={16} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        {/* Notification Preferences */}
        <MenuButton icon="notifications-outline" label="Notification Preferences" onPress={() => setShowNotifMenu(!showNotifMenu)} />
        {showNotifMenu && (
          <ThemedView style={[styles.dropdown, { backgroundColor: isDark ? '#333' : '#fff' }]}>
            <DropdownRow label="New Donors Nearby" value={notifDonors} onValueChange={setNotifDonors} />
            <DropdownRow label="Nearby Camps" value={notifCamps} onValueChange={setNotifCamps} />
            <DropdownRow label="Emergency Alerts" value={notifAlerts} onValueChange={setNotifAlerts} />
          </ThemedView>
        )}

        {/* Request History */}
        <MenuButton icon="document-text-outline" label="Your Request History" onPress={() => router.push('/receiver/request-history')} />

        {/* Language & Theme */}
        <MenuButton icon="globe-outline" label="Language/Theme" onPress={() => setShowLangMenu(!showLangMenu)} />
        {showLangMenu && (
          <ThemedView style={[styles.dropdown, { backgroundColor: isDark ? '#333' : '#fff' }]}>
            <ThemedView style={styles.languageRow}>
              <ThemedText style={styles.languageLabel}>Dark Mode:</ThemedText>
              <ThemedText style={styles.languageValue}>Auto</ThemedText>
            </ThemedView>
            <ThemedView style={styles.languageRow}>
              <ThemedText style={styles.languageLabel}>Language:</ThemedText>
              <ThemedText style={styles.languageValue}>{language}</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Privacy */}
        <MenuButton icon="lock-closed-outline" label="Privacy & Security" onPress={() => router.push('/receiver/privacy')} />

        {/* Help & Feedback */}
        <MenuButton icon="help-circle-outline" label="Help & Feedback" onPress={() => setShowHelpMenu(!showHelpMenu)} />
        {showHelpMenu && (
          <ThemedView style={{ marginLeft: 10 }}>
            <MenuButton icon="mail-outline" label="Contact Support" onPress={handleSupport} small />
            <MenuButton icon="bug-outline" label="Report a Bug" onPress={handleBugReport} small />
            <MenuButton icon="chatbubble-ellipses-outline" label="Send Feedback" onPress={handleFeedback} small />
          </ThemedView>
        )}

        {/* Logout */}
        <MenuButton icon="log-out-outline" label="Logout" onPress={handleLogout} />

      </ScrollView>
    </ThemedView>
  );
}

// ✅ Reusable Menu Button
function MenuButton({ icon, label, onPress, small }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuButton, small && { paddingLeft: 30 }]}>
      <Ionicons name={icon} size={20} color="#fff" style={{ marginRight: 10 }} />
      <ThemedText style={[styles.label, small && { fontSize: 13 }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

// ✅ Toggle Switch Row
function DropdownRow({ label, value, onValueChange }: any) {
  return (
    <ThemedView style={styles.dropdownRow}>
      <ThemedText>{label}</ThemedText>
      <Switch value={value} onValueChange={onValueChange} />
    </ThemedView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  profileText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  menuButton: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { fontSize: 14, color: '#fff', fontWeight: '600' },
  dropdown: { borderRadius: 12, padding: 12, marginVertical: 8, marginHorizontal: 10 },
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  languageRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  languageLabel: { fontSize: 14, fontWeight: '600' },
  languageValue: { fontSize: 14 },
});
