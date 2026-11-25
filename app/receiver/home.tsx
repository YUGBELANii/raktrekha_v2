import MessageButton from '@/components/MessageBtn';
import { Stack, useRouter } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, updateDoc, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';
import { ThemedCard, ThemedText, ThemedView } from '../../components/Themed';
import { auth, db } from '../../lib/supabase';

type Request = {
  id?: string;
  bloodGroup: string;
  donorName?: string;
  donorId?: string;
  acceptedBy?: string;
  number?: string;
  location?: string;
  status: string;
  createdAt?: any;
};

export default function ReceiverHome() {   // ✅ renamed to avoid tab root behavior
  const router = useRouter();
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'requests'),
      where('patientId', '==', user.uid),
      where('status', 'in', ['pending', 'accepted']),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const requestData = { id: docSnap.id, ...(docSnap.data() as Request) };

        const donorUid = requestData.donorId || requestData.acceptedBy;
        if (donorUid) {
          try {
            const donorDoc = await getDoc(doc(db, 'users', donorUid));
            if (donorDoc.exists()) {
              const donorData = donorDoc.data();
              requestData.donorName = donorData.name || 'Unknown Donor';
              requestData.number = donorData.number || '';
            }
          } catch (err) {
            console.error('Error fetching donor data:', err);
          }
        }
        setActiveRequest(requestData);
      } else {
        setActiveRequest(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = async () => {
    if (!activeRequest?.id) return;
    try {
      await updateDoc(doc(db, 'requests', activeRequest.id), { status: 'cancelled' });
      Alert.alert('Cancelled', 'Your request has been cancelled.');
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ✅ Outer container with paddingTop ensures content starts lower */}
        <ThemedView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >

            {/* Awareness Board */}
            <ThemedCard style={styles.card}>
              <ThemedText type="title" style={styles.title}>🧠 Awareness Board</ThemedText>

              <ThemedText type="subtitle" style={styles.subHeading}>🔴 After Blood Transfusion:</ThemedText>
              <ThemedText style={styles.text}>• Rest for 24–48 hours.</ThemedText>
              <ThemedText style={styles.text}>• Drink plenty of fluids.</ThemedText>
              <ThemedText style={styles.text}>• Watch for fever, chills, or rash.</ThemedText>
              <ThemedText style={styles.text}>• Report any unusual symptoms to your doctor.</ThemedText>

              <ThemedText type="subtitle" style={styles.subHeading}>🧬 Signs of Anemia:</ThemedText>
              <ThemedText style={styles.text}>• Constant fatigue or weakness</ThemedText>
              <ThemedText style={styles.text}>• Pale skin or lips</ThemedText>
              <ThemedText style={styles.text}>• Shortness of breath</ThemedText>
              <ThemedText style={styles.text}>• Dizziness or rapid heartbeat</ThemedText>
            </ThemedCard>

            {/* Request Status */}
            <ThemedCard style={styles.requestCard}>
              {activeRequest ? (
                activeRequest.status === 'accepted' ? (
                  <>
                    <ThemedText style={styles.requestTitle}>✅ Request Accepted</ThemedText>
                    <ThemedText style={styles.requestStatus}>Donor: {activeRequest.donorName}</ThemedText>
                    <ThemedText style={styles.requestStatus}>Blood Group: {activeRequest.bloodGroup}</ThemedText>

                    <View style={styles.requestActions}>
                      <MessageButton type="whatsapp" phone={activeRequest.number || ''} message="Hello, contacting via Rakth Rekha." />
                      <MessageButton type="sms" phone={activeRequest.number || ''} message="Hello, contacting via Rakth Rekha." />
                      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                        <ThemedText style={styles.btnText}>Cancel</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.requestTitle}>🩸 Active Request</ThemedText>
                    <ThemedText style={styles.requestStatus}>Blood Group: {activeRequest.bloodGroup}</ThemedText>
                    <ThemedText style={styles.requestStatus}>📍 {activeRequest.location}</ThemedText>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => router.push('/receiver/request')}>
                        <ThemedText style={styles.btnText}>View</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                        <ThemedText style={styles.btnText}>Cancel</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </>
                )
              ) : (
                <ThemedText style={{ fontStyle: 'italic', color: '#777' }}>No active request found.</ThemedText>
              )}
            </ThemedCard>

          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: vs(20) },  // ✅ added paddingTop
  scrollContent: { flexGrow: 1, padding: s(16), paddingBottom: vs(120) },

  card: { borderRadius: ms(12), padding: ms(16), marginBottom: vs(20) },
  title: { fontSize: ms(18), fontWeight: '700', marginBottom: vs(12) },
  subHeading: { fontSize: ms(15), fontWeight: '600', marginTop: vs(10), marginBottom: vs(4) },
  text: { fontSize: ms(13), marginBottom: vs(4) },

  requestCard: { borderRadius: ms(12), padding: ms(16), marginBottom: vs(30) },
  requestTitle: { fontSize: ms(16), fontWeight: '600', marginBottom: vs(6) },
  requestStatus: { fontSize: ms(13), marginBottom: vs(6) },

  requestActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: vs(12) },
  viewBtn: { flex: 1, backgroundColor: '#43a047', paddingVertical: vs(10), borderRadius: ms(8), alignItems: 'center', marginRight: s(8) },
  cancelBtn: { flex: 1, backgroundColor: '#d32f2f', paddingVertical: vs(10), borderRadius: ms(8), alignItems: 'center', marginLeft: s(4) },
  btnText: { color: '#fff', fontWeight: '600', fontSize: ms(13) },
});
