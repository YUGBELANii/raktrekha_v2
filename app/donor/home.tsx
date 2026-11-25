import MessageButton from '@/components/MessageBtn';
import { ThemedCard, ThemedText, ThemedView } from '@/components/Themed';
import { ms, vs } from '@/constants/Layout';
import { auth, db } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, updateDoc, where } from '../../lib/supabase';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AcceptedRequest {
  id: string;
  name: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  acceptedBy: string;
  patientId?: string; // made optional to avoid crash if not present
  number?: string;
  createdAt?: any;
}

export default function DonorHome() {
  const insets = useSafeAreaInsets();
  const [acceptedRequest, setAcceptedRequest] = React.useState<AcceptedRequest | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  React.useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, 'requests'),
      where('acceptedBy', '==', currentUser.uid),
      where('status', '==', 'accepted'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const rawData = docSnap.data();

        // Casting carefully to prevent runtime errors
        const data: AcceptedRequest = {
          id: docSnap.id,
          name: rawData.name || 'Unknown',
          bloodGroup: rawData.bloodGroup || 'N/A',
          urgency: rawData.urgency || 'N/A',
          status: rawData.status || 'pending',
          acceptedBy: rawData.acceptedBy || '',
          patientId: rawData.patientId,
          createdAt: rawData.createdAt,
        };

        if (data.patientId) {
          try {
            const patientDoc = await getDoc(doc(db, 'users', data.patientId));
            if (patientDoc.exists()) {
              data.number = patientDoc.data()?.number || '';
            } else {
              console.warn('Patient not found in users collection.');
            }
          } catch (err) {
            console.error('Error fetching patient doc:', err);
          }
        }

        setAcceptedRequest(data);
      } else {
        setAcceptedRequest(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = async () => {
    if (!acceptedRequest?.id) return;
    try {
      await updateDoc(doc(db, 'requests', acceptedRequest.id), {
        status: 'pending',
        acceptedBy: '',
      });
      setAcceptedRequest(null);
      alert('Cancelled');
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + vs(10) }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: vs(30) }}>
        {/* Awareness Board */}
        <ThemedCard style={[styles.card, { marginTop: vs(10) }]}>
          <ThemedText type="title" style={styles.title}>🧠 Awareness Board</ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>❤️ Why Donate?</ThemedText>
          <ThemedText style={styles.text}>• Every donation saves up to 3 lives</ThemedText>
          <ThemedText style={styles.text}>• Helps accident victims, cancer & thalassemia patients, and pregnant women</ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>✅ You Can Donate If:</ThemedText>
          <ThemedText style={styles.text}>• Age: 18–65 years</ThemedText>
          <ThemedText style={styles.text}>• Weight: 50 kg+</ThemedText>
          <ThemedText style={styles.text}>• Healthy & not on strong medications</ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>🧠 Busting Myths:</ThemedText>
          <ThemedText style={styles.text}>• Myth: I’ll feel weak{"\n"}Truth: Your body recovers quickly</ThemedText>
          <ThemedText style={styles.text}>• Myth: I need to know the patient{"\n"}Truth: Your blood helps anyone in urgent need</ThemedText>
        </ThemedCard>

        {/* Accepted Request */}
        {acceptedRequest && (
          <ThemedCard style={styles.requestCard}>
            <ThemedText style={styles.requestTitle}>Request Accepted</ThemedText>
            <ThemedText style={styles.info}>Patient: {acceptedRequest.name}</ThemedText>
            <ThemedText style={styles.info}>Blood Group: {acceptedRequest.bloodGroup}</ThemedText>
            <ThemedText style={styles.info}>Urgency: {acceptedRequest.urgency}</ThemedText>

            <View style={styles.actions}>
              <MessageButton type="whatsapp" phone={acceptedRequest?.number || ''} message="Hello, I’m your donor from Rakth Rekha." />
              <MessageButton type="sms" phone={acceptedRequest?.number || ''} message="Hello, contacting you as your donor." />
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <ThemedText style={styles.cancelText}>✖ Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedCard>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: ms(14) },
  card: { marginBottom: vs(16), borderRadius: ms(12), padding: ms(14) },
  title: { fontSize: ms(18), fontWeight: '700', marginBottom: vs(8) },
  subtitle: { fontSize: ms(15), fontWeight: '600', marginTop: vs(10), marginBottom: vs(4) },
  text: { fontSize: ms(13), marginBottom: vs(4) },

  requestCard: { borderRadius: ms(12), padding: ms(14), marginBottom: vs(16) },
  requestTitle: { fontSize: ms(16), fontWeight: '700', marginBottom: vs(6) },
  info: { fontSize: ms(13), marginBottom: vs(4) },

  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: vs(10) },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    paddingVertical: vs(8),
    borderRadius: ms(8),
    flex: 1,
    alignItems: 'center',
    marginLeft: ms(6),
  },
  cancelText: { color: '#e53935', fontWeight: '600' },
});
