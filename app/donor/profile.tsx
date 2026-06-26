import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';
import { auth, db } from '../../firebase';

export default function DonorProfileScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
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

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

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

  const handleChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (JSON.stringify(userData) === JSON.stringify(originalData)) {
        Alert.alert('No changes made');
        return;
      }

      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, userData, { merge: true });
      Alert.alert('Profile Updated');
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#000' : '#f3f3f3' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text style={{ marginTop: vs(10), color: isDark ? '#fff' : '#000', fontSize: ms(13) }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000' : '#f3f3f3',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: vs(120) }}>
        <View
          style={[
            styles.coverBox,
            {
              backgroundColor: isDark ? '#111' : '#eee',
              borderWidth: ms(2),
              borderColor: isDark ? '#333' : '#ccc',
            },
          ]}
        >
          <Text style={[styles.coverText, { color: isDark ? '#fff' : '#444' }]}>
            Profile Cover
          </Text>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderWidth: ms(2),
                borderColor: isDark ? '#666' : '#ddd',
              },
            ]}
          >
            <Ionicons name="person-circle-outline" size={ms(64)} color={isDark ? '#888' : '#aaa'} />
          </View>
        </View>

        <View
          style={[
            styles.form,
            {
              backgroundColor: isDark ? '#111' : '#fff',
              borderColor: isDark ? '#333' : '#ddd',
            },
          ]}
        >
          {/* Non-editable Fields */}
          <LabelInput label="Age" value={userData.age} isDark={isDark} editable={false} />
          <LabelInput label="Blood Group" value={userData.bloodGroup} isDark={isDark} editable={false} />

          {/* Editable Fields */}
          <LabelInput label="Full Name" value={userData.fullName} onChangeText={(v: string) => handleChange('fullName', v)} isDark={isDark} />
          <LabelInput label="Bio" value={userData.bio} onChangeText={(v: string) => handleChange('bio', v)} multiline isDark={isDark} />
          <LabelInput label="City" value={userData.city} onChangeText={(v: string) => handleChange('city', v)} isDark={isDark} />
          <LabelInput label="Emergency Contact" value={userData.emergencyContact} onChangeText={(v: string) => handleChange('emergencyContact', v)} isDark={isDark} />
          <LabelInput label="Preferred Hospital" value={userData.preferredHospital} onChangeText={(v: string) => handleChange('preferredHospital', v)} isDark={isDark} />

          <TouchableOpacity
            style={[styles.saveButton, (!userData.fullName || loading) && { backgroundColor: '#888' }]}
            onPress={handleUpdate}
            disabled={!userData.fullName || loading}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: ms(14) }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LabelInput({
  label,
  isDark,
  ...props
}: {
  label: string;
  isDark: boolean;
  [key: string]: any;
}) {
  return (
    <View style={{ marginBottom: vs(14) }}>
      <Text style={[styles.label, { color: isDark ? '#ccc' : '#444' }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ccc',
          },
          props.multiline && { height: vs(80), textAlignVertical: 'top' },
          props.editable === false && { opacity: 0.6 },
        ]}
        editable={props.editable !== false}
        autoCapitalize="sentences"
        placeholderTextColor={isDark ? '#888' : '#aaa'}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverBox: {
    height: vs(120),
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: s(16),
    marginTop: vs(16),
  },
  coverText: { fontWeight: '600', fontSize: ms(14) },
  avatar: {
    marginTop: -vs(30),
    alignItems: 'center',
    borderRadius: ms(50),
    padding: s(4),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  form: {
    marginHorizontal: s(16),
    marginTop: vs(16),
    borderRadius: ms(14),
    padding: ms(16),
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: ms(13),
    marginBottom: vs(4),
  },
  input: {
    borderWidth: 1,
    borderRadius: ms(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    fontSize: ms(14),
  },
  saveButton: {
    backgroundColor: '#EF4444',
    marginTop: vs(16),
    paddingVertical: vs(12),
    alignItems: 'center',
    borderRadius: ms(10),
  },
});
