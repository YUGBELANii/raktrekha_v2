import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { ms, vs } from '../constants/Layout';

export default function TermsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.header}>Terms & Conditions</ThemedText>

        <ThemedText style={styles.paragraph}>
          By using Rakt Rekha, you agree to comply with our terms and use the app responsibly to 
          save lives.
        </ThemedText>

        <ThemedText style={styles.subheader}>Usage Policy</ThemedText>
        <ThemedText style={styles.paragraph}>
          Users must provide accurate information and avoid misuse of the platform. Any malicious 
          use may lead to account suspension.
        </ThemedText>

        <ThemedText style={styles.subheader}>Liability</ThemedText>
        <ThemedText style={styles.paragraph}>
          Rakt Rekha serves as a bridge between donors and recipients. We do not guarantee outcomes 
          of individual donations.
        </ThemedText>

        <ThemedText style={styles.subheader}>Changes to Terms</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may update these terms as required. Continued use of the app implies agreement with 
          updated terms.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: ms(14), paddingTop: vs(20) },
  content: { paddingBottom: vs(40) },
  header: { fontSize: ms(20), fontWeight: '700', marginBottom: vs(12), textAlign: 'center' },
  subheader: { fontSize: ms(16), fontWeight: '600', marginTop: vs(10), marginBottom: vs(4) },
  paragraph: { fontSize: ms(13), lineHeight: vs(18), marginBottom: vs(8) },
});
