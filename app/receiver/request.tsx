import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';
import CompleteButton from '../../components/completeButton';
import { ThemedCard, ThemedText, ThemedView } from '../../components/Themed';
import { auth, db } from '../../firebase';
type Request = {
  id: string;
  bloodGroup: string;
  location?: string;
  status: string;
  createdAt?: any;
};

export default function RequestBloodScreen() {
  const insets = useSafeAreaInsets();   // ✅ Safe area insets
  const router = useRouter();
const colorScheme = useColorScheme() ?? 'light'; // fallback to 'light' if undefined

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [units, setUnits] = useState('1');
  const [urgency, setUrgency] = useState('ASAP');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [bgOpen, setBgOpen] = useState(false);
  const [urgencyOpen, setUrgencyOpen] = useState(false);

  const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => ({ label: bg, value: bg }));
  const urgencyOptions = [
    { label: 'ASAP', value: 'ASAP' },
    { label: 'Within 24 hours', value: '24hrs' },
    { label: 'Later', value: 'later' },
  ];

  const [activeRequest, setActiveRequest] = useState<Request | null>(null);

  // ✅ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else {
        Alert.alert('Login Required', 'You are not logged in.');
        router.replace('/signin');
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch latest active request
  const fetchActiveRequest = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'requests'),
        where('patientId', '==', user.uid),
        where('status', 'in', ['pending', 'accepted']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setActiveRequest({ id: docSnap.id, ...(docSnap.data() as Omit<Request, 'id'>) });
      } else {
        setActiveRequest(null);
      }
    } catch (err) {
      console.error('Error fetching active request:', err);
    }
  };

  useEffect(() => {
    fetchActiveRequest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ Submit new request
  const handleSubmit = async () => {
    if (!name || !bloodGroup || !units || !location) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to make a request.');
      return;
    }
    try {
      const requestData = {
        requestId: `${user.uid}_${Date.now()}`,
        patientId: user.uid,
        name,
        bloodGroup,
        units,
        urgency,
        location,
        notes,
        status: 'pending',
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'requests'), requestData);
      Alert.alert('Request Submitted', 'Your request has been created successfully.');
      fetchActiveRequest();
    } catch (error) {
      console.error('Request submission failed:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // ✅ Cancel active request
  const handleCancelRequest = async () => {
    if (!activeRequest?.id) return;
    try {
      const docRef = doc(db, 'requests', activeRequest.id);
      await updateDoc(docRef, { status: 'cancelled' });
      setActiveRequest(null);
      Alert.alert('Request Cancelled', 'Your active request has been cancelled.');
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.header}>Request Blood</ThemedText>

          {/* --- Request Form --- */}
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput style={[styles.input, getInputStyle(colorScheme)]} value={name} onChangeText={setName} placeholder="Enter patient's full name" placeholderTextColor="#888" />

          <ThemedText style={styles.label}>Blood Group</ThemedText>
          <DropDownPicker
            open={bgOpen}
            value={bloodGroup}
            items={bloodOptions}
            setOpen={setBgOpen}
            setValue={setBloodGroup}
            setItems={() => {}}
            style={getDropdownStyle(colorScheme)}
            textStyle={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: ms(14) }}
            dropDownContainerStyle={getDropdownContainer(colorScheme)}
          />

          <ThemedText style={styles.label}>Units Needed</ThemedText>
          <TextInput style={[styles.input, getInputStyle(colorScheme)]} keyboardType="number-pad" value={units} onChangeText={setUnits} placeholder="e.g., 1 or 2" placeholderTextColor="#888" />

          <ThemedText style={styles.label}>Urgency</ThemedText>
          <DropDownPicker
            open={urgencyOpen}
            value={urgency}
            items={urgencyOptions}
            setOpen={setUrgencyOpen}
            setValue={setUrgency}
            setItems={() => {}}
            style={getDropdownStyle(colorScheme)}
            textStyle={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: ms(14) }}
            dropDownContainerStyle={getDropdownContainer(colorScheme)}
          />

          <ThemedText style={styles.label}>Location</ThemedText>
          <TextInput style={[styles.input, getInputStyle(colorScheme)]} value={location} onChangeText={setLocation} placeholder="City, Area, or Hospital" placeholderTextColor="#888" />

          <ThemedText style={styles.label}>Additional Notes</ThemedText>
          <TextInput style={[styles.input, { height: vs(80) }, getInputStyle(colorScheme)]} multiline value={notes} onChangeText={setNotes} placeholder="Any more details" placeholderTextColor="#888" />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <ThemedText style={styles.buttonText}>Request Now</ThemedText>
          </TouchableOpacity>

          {/* ✅ Active Request Card */}
          {activeRequest && (
            <ThemedCard style={styles.activeCard}>
              <ThemedText style={styles.activeTitle}>Active Request</ThemedText>
              <ThemedText style={styles.activeInfo}>📍 Hospital: {activeRequest.location || 'Unknown Hospital'}</ThemedText>
              <ThemedText style={styles.activeInfo}>🩸 Blood Group: {activeRequest.bloodGroup}</ThemedText>
              <ThemedText style={styles.activeStatus}>Status: {activeRequest.status}</ThemedText>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRequest}>
                <ThemedText style={styles.cancelText}>Cancel Request</ThemedText>

              </TouchableOpacity>
                  <CompleteButton
                requestId={activeRequest.id}
                currentStatus={activeRequest.status as 'pending' | 'completed' | 'cancelled'}
                onCompleted={fetchActiveRequest}
              />
            </ThemedCard>
          )}

          {/* --- Plan Future Request / History --- */}
          <View style={styles.extraActionsContainer}>
            <TouchableOpacity style={styles.extraAction} onPress={() => router.push('/receiver/advance-request')}>
              <Ionicons name="calendar-outline" size={ms(22)} color="#e53935" />
              <ThemedText style={styles.extraActionText}>Plan Future Request</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.extraAction} onPress={() => router.push('/receiver/request-history')}>
              <Ionicons name="time-outline" size={ms(22)} color="#e53935" />
              <ThemedText style={styles.extraActionText}>View Request History</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: s(16), paddingBottom: vs(100) },
  header: { fontSize: ms(20), fontWeight: '700', marginBottom: vs(10) },
  label: { fontSize: ms(15), fontWeight: '500', marginTop: vs(12) },
  input: { borderWidth: 1, borderRadius: ms(8), marginTop: vs(6), paddingHorizontal: s(10), paddingVertical: vs(8), fontSize: ms(14) },
  button: { backgroundColor: '#e53935', paddingVertical: vs(12), borderRadius: ms(10), alignItems: 'center', marginTop: vs(18) },
  buttonText: { color: '#fff', fontSize: ms(16), fontWeight: '600' },

  activeCard: { borderRadius: ms(12), padding: ms(14), marginTop: vs(18) },
  activeTitle: { fontSize: ms(16), fontWeight: '700', marginBottom: vs(6) },
  activeInfo: { fontSize: ms(14), marginBottom: vs(4) },
  activeStatus: { fontSize: ms(14), marginTop: vs(4), fontWeight: '600', color: '#6a1b9a' },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e53935', paddingVertical: vs(8), borderRadius: 50, alignItems: 'center', marginTop: vs(10) },
  cancelText: { color: '#e53935', fontWeight: '600', fontSize: ms(13) },

  extraActionsContainer: { marginTop: vs(24) },
  extraAction: { flexDirection: 'row', alignItems: 'center', padding: ms(12), borderRadius: ms(10), backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', marginBottom: vs(10) },
  extraActionText: { fontSize: ms(14), fontWeight: '500', color: '#444', marginLeft: s(10) },
});

// ✅ Helper Styles
const getInputStyle = (theme: string | null) => ({
  backgroundColor: theme === 'dark' ? '#222' : '#fff',
  color: theme === 'dark' ? '#fff' : '#000',
  borderColor: '#ccc',
});

const getDropdownStyle = (theme: string | null) => ({
  backgroundColor: theme === 'dark' ? '#333' : '#fff',
  borderColor: '#ccc',
  borderRadius: ms(8),
});

const getDropdownContainer = (theme: string | null) => ({
  backgroundColor: theme === 'dark' ? '#333' : '#fff',
  borderColor: '#ccc',
});
