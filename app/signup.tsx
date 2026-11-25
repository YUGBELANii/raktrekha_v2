import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [role, setRole] = useState<'donor' | 'patient' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure, setSecure] = useState(true);
  const [number, setNumber] = useState('');
  const [agree, setAgree] = useState(false); // ✅ Checkbox state

  const handleContinue = () => {
    if (!role || !name || !email || !password || !confirm || !number) {
      alert('Please fill all fields and select a role.');
      return;
    }
    if (!agree) {
      alert('You must agree to our Terms & Privacy Policy.');
      return;
    }

    const route =
      role === 'donor'
        ? `/signup-donor?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&number=${encodeURIComponent(number)}`
        : `/signup-receiver?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&number=${encodeURIComponent(number)}`;
    router.push(route as any);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? '#000' : '#fff' },
        ]}
      >
        <Text style={[styles.title, { color: '#e53935' }]}>Create Account</Text>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          {['donor', 'patient'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleButton,
                { borderColor: isDark ? '#555' : '#ccc' },
                role === r && { backgroundColor: '#e53935', borderColor: '#e53935' },
              ]}
              onPress={() => setRole(r as 'donor' | 'patient')}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: isDark ? '#ccc' : '#555' },
                  role === r && { color: '#fff' },
                ]}
              >
                {r === 'donor' ? "I'm a Donor" : 'I Need Blood'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Mobile Number */}
        <TextInput
          placeholder="Mobile Number"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          value={number}
          onChangeText={setNumber}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <View style={[styles.passwordContainer, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2' }]}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={isDark ? '#888' : '#aaa'}
            style={[styles.passwordInput, { color: isDark ? '#fff' : '#000' }]}
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setSecure(!secure)}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={22} color={isDark ? '#aaa' : '#888'} />
          </Pressable>
        </View>

        {/* Confirm Password */}
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f2f2f2', color: isDark ? '#fff' : '#000' }]}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        {/* ✅ Terms & Privacy Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgree(!agree)}
        >
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color="#e53935" />
          <Text style={[styles.checkboxText, { color: isDark ? '#ccc' : '#555' }]}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => router.push('./terms')}>Terms & Conditions</Text> and{' '}
            <Text style={styles.link} onPress={() => router.push('./privacy-policy')}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* Login Redirect */}
        <TouchableOpacity onPress={() => router.push('/signin')}>
          <Text style={[styles.linkText, { color: isDark ? '#ccc' : '#555' }]}>
            Already have an account? Log In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 32 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleButton: { flex: 1, paddingVertical: 12, marginHorizontal: 5, borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  roleText: { fontSize: 16, fontWeight: '500' },
  input: { padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 10, marginBottom: 14 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkboxText: { fontSize: 14, marginLeft: 8, flex: 1 },
  link: { color: '#e53935', textDecorationLine: 'underline' },
  button: { backgroundColor: '#e53935', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkText: { fontSize: 14, textAlign: 'center', marginTop: 16 },
});
