import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedCard, ThemedText, ThemedView } from '../../components/Themed';
import { ms, vs } from '../../constants/Layout';
import { db } from '../../firebase';

export default function DonorNearbyCamps() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const campCollection = collection(db, 'bloodCamps');

    // ✅ Real-time Firestore listener
    const unsubscribe = onSnapshot(
      campCollection,
      (snapshot) => {
        const campList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCamps(campList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching camps:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // ✅ Cleanup listener on unmount
  }, []);

  const openGoogleMaps = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + vs(10) }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: vs(120) }}>
        <ThemedText type="title" style={styles.header}>Active Blood Donation Camps</ThemedText>

        {loading ? (
          <ThemedText style={styles.infoText}>⏳ Loading camps near you...</ThemedText>
        ) : camps.length === 0 ? (
          <ThemedText style={styles.infoText}>🚫 No active camps found near your location.</ThemedText>
        ) : (
          camps.map((camp) => (
            <ThemedCard key={camp.id} style={styles.card}>
              <ThemedText type="subtitle" style={styles.title}>{camp.name || 'Unnamed Camp'}</ThemedText>
              <ThemedText style={styles.hosted}>
                Hosted by: {camp.hostedBy || 'N/A'}{"\n"}
                Location: {camp.location || 'N/A'}
              </ThemedText>

              <ThemedView style={styles.row}>
                <TouchableOpacity onPress={() => openGoogleMaps(camp.address)}>
                  <Ionicons name="location" size={ms(22)} color="#e53935" />
                </TouchableOpacity>
                <ThemedText style={styles.distance}>
                  {camp.distance ? `${camp.distance} away` : 'Distance unknown'}
                </ThemedText>
              </ThemedView>

              {camp.address && (
                <TouchableOpacity onPress={() => openGoogleMaps(camp.address)}>
                  <ThemedText style={styles.directions}>📍 Tap to get directions</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedCard>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: ms(14) },
  header: {
    fontSize: ms(18),
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: vs(12),
  },
  card: {
    marginBottom: vs(16),
    borderRadius: ms(12),
    padding: ms(14),
  },
  title: {
    fontSize: ms(15),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  hosted: {
    fontSize: ms(13),
    marginBottom: vs(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: vs(4),
  },
  distance: {
    fontSize: ms(12.5),
    fontWeight: '500',
  },
  directions: {
    fontSize: ms(13),
    color: '#1a73e8',
    textDecorationLine: 'underline',
    marginTop: vs(6),
  },
  infoText: {
    textAlign: 'center',
    fontSize: ms(14),
    marginTop: vs(20),
  },
});
