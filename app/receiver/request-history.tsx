import { useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet } from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../../components/Themed';
import { auth, db } from '../../lib/supabase';

type RequestItem = {
  id: string;
  bloodGroup: string;
  units: number;
  status: string;
  createdAt: Timestamp;
  notes?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');

export default function RequestHistoryScreen() {
  const [history, setHistory] = useState<RequestItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ No user logged in");
      return;
    }

    // ✅ Now includes 'completed' in history
    const q = query(
      collection(db, 'requests'),
      where('patientId', '==', user.uid),
      where('status', 'in', ['completed', 'cancelled']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("⚠️ No matching requests found for user");
          setHistory([]);
          return;
        }

        const requests: RequestItem[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("📄 Request Loaded:", data);
          return {
            id: doc.id,
            bloodGroup: data.bloodGroup || 'N/A',
            units: data.units || 0,
            status: data.status || 'unknown',
            createdAt: data.createdAt,
            notes: data.notes || '',
          };
        });

        setHistory(requests);
      },
      (error) => console.error("🔥 Firestore Query Error:", error)
    );

    return () => unsubscribe();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Your Request History
      </ThemedText>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <ThemedCard style={styles.card}>
            <ThemedText style={styles.group}>
              🩸 {item.bloodGroup} • {item.units} Units
            </ThemedText>
            <ThemedText style={styles.status}>
              Status:{' '}
              <ThemedText
                style={{
                  fontWeight: '600',
                  color:
                    item.status === 'cancelled'
                      ? '#e53935'
                      : item.status === 'completed'
                      ? '#43a047'
                      : '#3366cc',
                }}
              >
                {item.status}
              </ThemedText>
            </ThemedText>

            <ThemedText style={styles.date}>
              {item.createdAt?.toDate
                ? item.createdAt.toDate().toDateString()
                : 'Unknown Date'}
            </ThemedText>

            {item.notes ? (
              <ThemedText style={styles.note}>📝 {item.notes}</ThemedText>
            ) : null}
          </ThemedCard>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No requests yet</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  group: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  note: {
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 14,
    opacity: 0.6,
  },
});
