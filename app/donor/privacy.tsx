import { ThemedText, ThemedView, useThemeColor } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';

export default function DonorPrivacySecurityScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
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

  const borderColor = useThemeColor({}, 'border');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;
    const settingsRef = doc(db, 'users', user.uid, 'privacy', 'donorSettings');
    try {
      await setDoc(settingsRef, { [key]: value }, { merge: true });
    } catch {
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please enter both current and new password');
      return;
    }
    if (!user?.email) {
      Alert.alert('Error', 'User email not found.');
      return;
    }
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: useThemeColor({}, 'background'),
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* Location */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedView style={styles.rowBetween}>
              <ThemedView style={styles.row}>
                <Ionicons name="location" size={ms(18)} />
                <ThemedText style={styles.title}>Share Location</ThemedText>
              </ThemedView>
              <Switch
                value={shareLocation}
                onValueChange={(val) => {
                  setShareLocation(val);
                  updateSetting('shareLocation', val);
                }}
              />
            </ThemedView>
          </ThemedView>

          {/* Visibility */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedView style={styles.row}>
              <Ionicons name="person-circle" size={ms(18)} />
              <ThemedText style={styles.title}>Visibility Settings</ThemedText>
            </ThemedView>
            <ThemedView style={styles.rowBetween}>
              <ThemedText>Show My Availability To Receivers</ThemedText>
              <Switch
                value={showAvailability}
                onValueChange={(val) => {
                  setShowAvailability(val);
                  updateSetting('showAvailability', val);
                }}
              />
            </ThemedView>
            <ThemedView style={styles.rowBetween}>
              <ThemedText>Show My Donation History</ThemedText>
              <Switch
                value={showDonationHistory}
                onValueChange={(val) => {
                  setShowDonationHistory(val);
                  updateSetting('showDonationHistory', val);
                }}
              />
            </ThemedView>
          </ThemedView>

          {/* Emergency */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedView style={styles.row}>
              <Ionicons name="alert-circle" size={ms(18)} />
              <ThemedText style={styles.title}>Emergency Contact</ThemedText>
            </ThemedView>
            <ThemedView style={styles.rowBetween}>
              <ThemedText>Show Details For Emergency Contact</ThemedText>
              <Switch
                value={showEmergencyContact}
                onValueChange={(val) => {
                  setShowEmergencyContact(val);
                  updateSetting('showEmergencyContact', val);
                }}
              />
            </ThemedView>
          </ThemedView>

          {/* Password */}
          <ThemedView style={[styles.card, { borderColor }]}>
            <ThemedView style={styles.row}>
              <Ionicons name="key" size={ms(18)} />
              <ThemedText style={styles.title}>Password & Credentials</ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={styles.credRow}
              onPress={() => setShowChangePassword(!showChangePassword)}
            >
              <ThemedText>Change Password</ThemedText>
              <Ionicons name={showChangePassword ? 'chevron-up' : 'chevron-forward'} size={ms(18)} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.credRow}
              onPress={() => Alert.alert('Action Blocked', 'Use web version to change number/email')}
            >
              <ThemedText>Change Number/Email</ThemedText>
              <Ionicons name="chevron-forward" size={ms(18)} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.credRow}
              onPress={() => Alert.alert('Action Blocked', 'Use web version to delete your account')}
            >
              <ThemedText>Delete My Account</ThemedText>
              <Ionicons name="chevron-forward" size={ms(18)} />
            </TouchableOpacity>

            {showChangePassword && (
              <ThemedView style={{ marginTop: vs(10) }}>
                {user?.providerData[0]?.providerId !== 'password' ? (
                  <ThemedText style={{ fontSize: ms(13), color: 'red' }}>
                    Your account is linked via {user?.providerData[0]?.providerId}. Please use web version to update password.
                  </ThemedText>
                ) : (
                  <>
                    <TextInput
                      placeholder="Current Password"
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="New Password"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      style={[styles.updateBtn, loading && { opacity: 0.5 }]}
                      disabled={loading}
                      onPress={handleChangePassword}
                    >
                      <ThemedText style={styles.updateBtnText}>
                        {loading ? 'Updating...' : 'Update Password'}
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                )}
              </ThemedView>
            )}
          </ThemedView>

        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: ms(16), paddingBottom: vs(20) },
  card: {
    borderRadius: ms(12),
    padding: ms(14),
    marginBottom: vs(16),
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(10) },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(6),
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderTopColor: '#ccc',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: { fontWeight: '700', marginLeft: s(8), fontSize: ms(14) },
  input: {
    backgroundColor: '#f1f1f1',
    padding: ms(10),
    borderRadius: ms(8),
    marginTop: vs(10),
    fontSize: ms(13),
  },
  updateBtn: {
    marginTop: vs(14),
    backgroundColor: '#e53935',
    paddingVertical: vs(10),
    borderRadius: ms(8),
    alignItems: 'center',
  },
  updateBtnText: { color: '#fff', fontWeight: '600', fontSize: ms(13) },
});
