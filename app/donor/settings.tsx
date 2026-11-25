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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText, ThemedView } from '../../components/Themed';
import { ms, vs } from '../../constants/Layout';
import { auth, db } from '../../lib/supabase';

export default function DonorSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const [userData, setUserData] = useState({ name: '' });
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [notifRequests, setNotifRequests] = useState(true);
  const [notifCamps, setNotifCamps] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(false);
  const [language, setLanguage] = useState('English');

  type DonorData = {
    name: string;
    location?: string;
    phone?: string;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DonorData;
          setUserData(data);
        }
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

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'English' ? 'Hindi' : 'English'));
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + vs(10) }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: vs(80) }}>
        {/* Profile Info */}
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/donor/profile')}>
          <Ionicons name="person-circle-outline" size={ms(24)} color="#fff" style={{ marginRight: ms(8) }} />
          <ThemedText style={styles.profileName}>{userData.name || 'Your Name'}</ThemedText>
          <Ionicons name="pencil-outline" size={ms(16)} color="#fff" style={{ marginLeft: ms(6) }} />
        </TouchableOpacity>

        <MenuButton icon="notifications-outline" label="Notification Preferences" onPress={() => setShowNotifMenu(!showNotifMenu)} />
        {showNotifMenu && (
          <ThemedView style={styles.dropdown}>
            <DropdownRow label="Blood Requests" value={notifRequests} onValueChange={setNotifRequests} />
            <DropdownRow label="Nearby Camps" value={notifCamps} onValueChange={setNotifCamps} />
            <DropdownRow label="Emergency Alerts" value={notifAlerts} onValueChange={setNotifAlerts} />
          </ThemedView>
        )}

        <MenuButton icon="time-outline" label="Schedule Your Availability" onPress={() => router.push('/donor/availabilty')} />
        <MenuButton icon="document-text-outline" label="Your Donation History" onPress={() => router.push('/donor/donationhistory')} />

        <MenuButton icon="globe-outline" label="Language/Theme" onPress={() => setShowLangMenu(!showLangMenu)} />
        {showLangMenu && (
          <ThemedView style={styles.dropdown}>
            <ThemedView style={styles.languageRow}>
              <ThemedText style={styles.languageLabel}>Dark Mode:</ThemedText>
              <ThemedText style={styles.languageValue}>{colorScheme === 'dark' ? 'On' : 'Off'}</ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageRow}>
              <ThemedText style={styles.languageLabel}>Language:</ThemedText>
              <ThemedText style={[styles.languageValue, { textDecorationLine: 'underline' }]}>{language}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        <MenuButton icon="lock-closed-outline" label="Privacy & Security" onPress={() => router.push("/donor/privacy")} />

        <MenuButton icon="help-circle-outline" label="Help & Feedback" onPress={() => setShowHelpMenu(!showHelpMenu)} />
        {showHelpMenu && (
          <ThemedView style={{ marginLeft: ms(10) }}>
            <MenuButton icon="mail-outline" label="Contact Support" onPress={handleSupport} small />
            <MenuButton icon="bug-outline" label="Report a Bug" onPress={handleBugReport} small />
            <MenuButton icon="chatbubble-ellipses-outline" label="Send Feedback" onPress={handleFeedback} small />
          </ThemedView>
        )}

        <MenuButton icon="log-out-outline" label="Logout" onPress={handleLogout} />
      </ScrollView>
    </ThemedView>
  );
}

function MenuButton({ icon, label, onPress, small }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.menuButton,
        { paddingLeft: small ? ms(28) : ms(14) }
      ]}
    >
      <Ionicons name={icon} size={ms(20)} color="#fff" style={{ marginRight: ms(8) }} />
      <ThemedText style={[styles.menuText, { fontSize: small ? ms(13) : ms(15) }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function DropdownRow({ label, value, onValueChange }: any) {
  return (
    <ThemedView style={styles.dropdownRow}>
      <ThemedText style={{ fontSize: ms(13) }}>{label}</ThemedText>
      <Switch value={value} onValueChange={onValueChange} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: ms(14) },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    marginVertical: vs(10),
    padding: ms(14),
    borderRadius: ms(20),
  },
  profileName: { fontSize: ms(18), fontWeight: '700', color: 'white' },

  menuButton: {
    backgroundColor: '#e53935',
    marginVertical: vs(6),
    padding: ms(12),
    borderRadius: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: { fontWeight: '600', color: 'white' },

  dropdown: {
    marginHorizontal: ms(12),
    padding: ms(12),
    borderRadius: ms(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(6),
  },

  languageRow: {
    marginTop: vs(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageLabel: { fontSize: ms(14), fontWeight: '600' },
  languageValue: { fontSize: ms(14) },
});
