import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { auth, db } from '../firebase';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const docSnap = await getDoc(doc(db, 'users', uid));
      const userData = docSnap.data();

      if (userData?.role === 'donor') {
        router.push('/donor/home');
      } else if (userData?.role === 'patient') {
        router.push('/receiver/home');
      } else {
        alert('User role not found.');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      alert(err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.title, { color: '#e53935' }]}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ddd',
          },
        ]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#444' : '#ddd',
          },
        ]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={[styles.linkText, { color: isDark ? '#90caf9' : '#1e88e5' }]}>
          Don’t have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
