import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#fff' },
      ]}
    >
      <Image
        source={
          isDark
            ? require('../assets/images/logo-dark.png') // make sure this exists
            : require('../assets/images/logo.png')
        }
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: '#e53935' }]}>
        Welcome to Rakth Rekha
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: isDark ? '#aaa' : '#555' },
        ]}
      >
        Donating Blood Doesn&apos;t Require You To Be A Specific Type — Just Human.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/signin')}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
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
  logo: {
    height: 160,
    width: 160,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#43a047',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
