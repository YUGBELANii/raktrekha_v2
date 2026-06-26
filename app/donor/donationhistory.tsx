import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText, ThemedView, useThemeColor } from '../../components/Themed';
import { db } from '../../firebase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

type Donation = {
  id: string;
  location?: string;
  type?: string;
  receiver?: string;
  status?: string;
  date?: Timestamp | string;
};

export default function DonationHistoryScreen() {
  const user = getAuth().currentUser;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationCount, setDonationCount] = useState(0);

  const fetchHistory = async () => {
    try {
      if (!user) return;

      // ✅ Fetch completed requests where donor is the logged-in user
      const q = query(
        collection(db, 'requests'),
        where('acceptedBy', '==', user.uid),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);

      const data: Donation[] = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          location: d.hospital || d.location || 'Unknown Hospital',
          type: d.bloodType || d.type || 'Blood Donation',
          receiver: d.name || 'Patient',
          status: d.status || 'Completed',
          date: d.completedAt || d.createdAt || '',
        };
      });

      // ✅ Sort by date
      const sorted = data.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date || '');
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date || '');
        return dateB.getTime() - dateA.getTime();
      });

      setDonations(sorted);
      setDonationCount(sorted.length);
    } catch (err) {
      console.error('Failed to fetch donation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const date =
        timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' at ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Date';
    }
  };

  const background = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemedText style={styles.header}>Your Donation History</ThemedText>

        {!loading && (
          <ThemedText style={styles.countText}>
            🩸 You have donated blood <ThemedText style={{ fontWeight: '700' }}>{donationCount}</ThemedText> time(s)
          </ThemedText>
        )}

        {loading ? (
          <ThemedText style={styles.infoText}>Loading...</ThemedText>
        ) : donations.length === 0 ? (
          <ThemedText style={styles.infoText}>No donations recorded yet.</ThemedText>
        ) : (
          donations.map((donation, index) => (
            <View key={donation.id || index} style={[styles.card, { backgroundColor: cardBg, borderColor: text }]}>
              <ThemedText style={styles.label}>🏥 Location:</ThemedText>
              <ThemedText style={styles.value}>{donation.location}</ThemedText>

              <ThemedText style={styles.label}>📅 Date & Time:</ThemedText>
              <ThemedText style={styles.value}>{formatDate(donation.date)}</ThemedText>

              <ThemedText style={styles.label}>💉 Type:</ThemedText>
              <ThemedText style={styles.value}>{donation.type}</ThemedText>

              <ThemedText style={styles.label}>👤 Receiver:</ThemedText>
              <ThemedText style={styles.value}>{donation.receiver}</ThemedText>

              <ThemedText style={[styles.label, { marginTop: 10 }]}>✅ Status:</ThemedText>
              <ThemedText style={[styles.value, { color: 'green' }]}>
                Completed
              </ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 4, textAlign: 'center' },
  countText: { textAlign: 'center', fontSize: 15, marginBottom: 10, color: '#e53935' },
  infoText: { textAlign: 'center', marginTop: 30, opacity: 0.6 },
  card: { padding: 14, margin: 16, borderRadius: 12, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  value: { fontSize: 14, marginTop: 2 },
});
