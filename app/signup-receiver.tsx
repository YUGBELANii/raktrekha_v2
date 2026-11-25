import { useLocalSearchParams, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { auth, db } from '../firebase';

export default function ReceiverSignUp() {
  const router = useRouter();
  const { name, email, password , number} = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [bloodGroup, setBloodGroup] = useState('');
  const [condition, setCondition] = useState('');
  const [urgency, setUrgency] = useState('');
  const [age, setAge] = useState('');

  const handleReceiverSignUp = async () => {
    if (!bloodGroup || !condition || !urgency || !age) {
      alert('Please fill all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 1) {
      alert('Please enter a valid age');
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, String(email), String(password));
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'patient',
        name,
        email,
        number,
        age,
        bloodGroup,
        condition,
        urgency,
        createdAt: new Date(),
      });

      alert('Receiver account created successfully!');
      router.push('/receiver/home');
    } catch (error: any) {
      console.error('Receiver Sign Up Error:', error);
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <Text style={[styles.title, { color: '#e53935' }]}>Patient Details</Text>

        <TextInput
          placeholder="Age"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={age}
          onChangeText={setAge}
        />
        <TextInput
          placeholder="Blood Group (e.g. A+, B-, AB+)"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />
        <TextInput
          placeholder="Medical Condition (e.g. Thalassemia, Surgery, Accident)"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={condition}
          onChangeText={setCondition}
        />
        <TextInput
          placeholder="Urgency (e.g. Immediate, Within 2 Days)"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={urgency}
          onChangeText={setUrgency}
        />

        <TouchableOpacity style={styles.button} onPress={handleReceiverSignUp}>
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
