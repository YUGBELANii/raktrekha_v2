import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { auth, db } from '../../firebase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

export default function ReceiverProfileScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const user = auth.currentUser;
  const [editable, setEditable] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    city: '',
    number: '',
    location: '',
    bloodGroup: 'A+',
    age: '22',
  });

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) setProfile((prev) => ({ ...prev, ...docSnap.data() }));
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
    setEditable(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#f3f3f3' }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover */}
        <View
          style={[
            styles.coverBox,
            {
              backgroundColor: isDark ? '#111' : '#eee',
              borderColor: isDark ? '#333' : '#ccc',
            },
          ]}
        >
          <Text style={[styles.coverText, { color: isDark ? '#fff' : '#444' }]}>Profile Cover</Text>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderColor: isDark ? '#666' : '#ddd',
              },
            ]}
          >
            <Ionicons name="person-circle-outline" size={64} color={isDark ? '#888' : '#aaa'} />
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badges}>
          <Text style={[styles.badge, { backgroundColor: isDark ? '#333' : '#eee', color: isDark ? '#fff' : '#333' }]}>
            Age: {profile.age}
          </Text>
          <Text style={[styles.badge, { backgroundColor: isDark ? '#333' : '#eee', color: isDark ? '#fff' : '#333' }]}>
            Blood Group: {profile.bloodGroup}
          </Text>
        </View>

        {/* Form */}
        <View
          style={[
            styles.form,
            {
              backgroundColor: isDark ? '#111' : '#fff',
              borderColor: isDark ? '#333' : '#ddd',
            },
          ]}
        >
          <LabelInput
            label="Full Name"
            value={profile.name}
            onChangeText={(val: string) => setProfile({ ...profile, name: val })}
            editable={editable}
            isDark={isDark}
          />
          <LabelInput
            label="Bio"
            value={profile.bio}
            onChangeText={(val: string) => setProfile({ ...profile, bio: val })}
            editable={editable}
            isDark={isDark}
            multiline
          />
          <LabelInput
            label="City"
            value={profile.location}
            onChangeText={(val: string) => setProfile({ ...profile, city: val })}
            editable={editable}
            isDark={isDark}
          />
          <LabelInput
            label="Emergency Contact"
            value={profile.number}
            onChangeText={(val: string) => setProfile({ ...profile, number: val })}
            editable={editable}
            isDark={isDark}
            keyboardType="phone-pad"
          />
          <LabelInput
            label="Preferred Hospital"
            value={profile.location}
            onChangeText={(val: string) => setProfile({ ...profile, location: val })}
            editable={editable}
            isDark={isDark}
          />

          <TouchableOpacity
            style={[styles.saveButton, !editable && { backgroundColor: '#888' }]}
            onPress={() => (editable ? handleUpdate() : setEditable(true))}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {editable ? 'Save & Close' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LabelInput({
  label,
  isDark,
  editable = true,
  ...props
}: {
  label: string;
  isDark: boolean;
  editable?: boolean;
  [key: string]: any;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: isDark ? '#ccc' : '#444' }]}>{label}</Text>
      <TextInput
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ccc',
          },
          props.multiline && { height: 80, textAlignVertical: 'top' },
        ]}
        placeholderTextColor={isDark ? '#888' : '#aaa'}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverBox: {
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 2,
  },
  coverText: { fontWeight: '600' },
  avatar: {
    marginTop: -30,
    alignItems: 'center',
    borderRadius: 50,
    padding: 4,
    borderWidth: 2,
    elevation: 5,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  badge: {
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontWeight: '500',
  },
  form: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#EF4444',
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
});
