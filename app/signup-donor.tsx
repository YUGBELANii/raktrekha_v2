import { useLocalSearchParams, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from '../lib/supabase';
import { doc, setDoc } from '../lib/supabase';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { auth, db } from '../lib/supabase';

export default function DonorSignUp() {
  const router = useRouter();
  const { name, email, password , number } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');

  const handleDonorSignUp = async () => {
    if (!bloodGroup || !location || !availability || !age) {
      alert('Please fill all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 1) {
      alert('Please enter a valid age');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, String(email), String(password), { role: 'donor', name: String(name), age: Number(age), bloodGroup, location, availability, number: String(number) });
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'donor',
        name,
        email,
        number,
        age,
        bloodGroup,
        location,
        availability,
        createdAt: new Date(),
      });

      alert('Donor account created successfully!');
      router.push('/donor/home');
    } catch (error: any) {
      console.error('Donor Sign Up Error:', error);
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? '#121212' : '#fff' },
        ]}
      >
        <Text style={[styles.title, { color: '#e53935' }]}>Donor Details</Text>

        <TextInput
          placeholder="Age"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={age}
          onChangeText={setAge}
        />
        <TextInput
          placeholder="Blood Group (e.g. A+, O-, AB+)"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />
        <TextInput
          placeholder="City or Location"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          placeholder="Availability (e.g. Weekends, Anytime)"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={availability}
          onChangeText={setAvailability}
        />

        <TouchableOpacity style={styles.button} onPress={handleDonorSignUp}>
          <Text style={styles.buttonText}>Finish Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
