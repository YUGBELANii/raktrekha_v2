import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { ms, vs } from '../constants/Layout';

export default function PrivacyPolicyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.header}>Privacy Policy</ThemedText>

        <ThemedText style={styles.paragraph}>
          At Rakt Rekha, we value your privacy. We only collect information necessary to connect 
          donors with recipients in emergencies and ensure the safety of our users.
        </ThemedText>

        <ThemedText style={styles.subheader}>Data We Collect</ThemedText>
        <ThemedText style={styles.paragraph}>
          We collect basic details like your name, contact information, and location to facilitate 
          matching with nearby donors or recipients.
        </ThemedText>

        <ThemedText style={styles.subheader}>How We Use Data</ThemedText>
        <ThemedText style={styles.paragraph}>
          The information is strictly used to provide lifesaving connections. We do not sell or 
          share data with third parties without your consent.
        </ThemedText>

        <ThemedText style={styles.subheader}>Contact Us</ThemedText>
        <ThemedText style={styles.paragraph}>
          For questions about this policy, reach out at: raktrekha@gmail.com
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
