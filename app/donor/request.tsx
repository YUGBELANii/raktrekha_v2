/* eslint-disable react-hooks/exhaustive-deps */
import MessageButton from '@/components/MessageBtn';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CompleteButton from '../../components/completeButton';
import { ThemedText, ThemedView } from '../../components/Themed';
import { ms, vs } from '../../constants/Layout';
import { auth, db } from '../../firebase';

// ✅ Fixed interface
interface Request {
  id: string;
  name: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  acceptedBy?: string;
  number?: string; // ✅ Added to fix error
  createdAt?: any;
}

export default function DonorNearbyRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  const cardStyles = {
    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
    borderColor: '#e53935',
  };

  const fetchNearbyRequests = useCallback(async (currentUser: any) => {
    try {
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      if (!userData?.bloodGroup) {
        Alert.alert('Missing Info', 'Please update your blood group in settings.');
        return;
      }

      const q = query(
        collection(db, 'requests'),
        where('bloodGroup', '==', userData.bloodGroup),
        where('status', 'in', ['pending', 'accepted']),
        limit(3)
      );

      const querySnap = await getDocs(q);
      const fetched = querySnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Request[]; // ✅ Cast to fix type

      setRequests(fetched);
      const accepted = fetched.find(r => r.acceptedBy === currentUser.uid);
      if (accepted) setAcceptedId(accepted.id);
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchNearbyRequests(currentUser);
      } else {
        Alert.alert("Not Logged In", "Please log in first.");
        router.replace('/signin');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchNearbyRequests]);

  const handleDonate = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'requests', id), {
        status: 'accepted',
        acceptedBy: user.uid,
      });
      Alert.alert('Thank You!', 'You have accepted this donation request.');
      setAcceptedId(id);
    } catch (error) {
      console.error('Error accepting donation:', error);
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status: 'skipped' });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error skipping request:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status: 'pending', acceptedBy: '' });
      setAcceptedId(null);
      fetchNearbyRequests(user);
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView>
        <ThemedText style={{ textAlign: 'center', marginTop: vs(100) }}>
          Loading nearby requests...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, paddingTop: insets.top + vs(10) }}>
        <ScrollView contentContainerStyle={{ paddingBottom: vs(120) }}>
          {requests.length > 0 ? (
            requests.map((req) => (
              <View key={req.id} style={[styles.card, cardStyles]}>
                {acceptedId === req.id ? (
                  <>
                    <ThemedText type="title" style={styles.acceptedTitle}>Request Accepted</ThemedText>
                    <ThemedText>Name: {req.name}</ThemedText>
                    <ThemedText>Blood Group: {req.bloodGroup}</ThemedText>
                    <ThemedText>Urgency: {req.urgency}</ThemedText>

                    <View style={styles.acceptBtnRow}>
                      <MessageButton type="whatsapp" phone={req.number || ''} message="Hello, I am your donor from Rakth Rekha." />
                      <MessageButton type="sms" phone={req.number || ''} message="Hello, contacting you regarding your blood request via Rakth Rekha." />
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(req.id)}>
                        <ThemedText type="button">✖ Cancel</ThemedText>
                      </TouchableOpacity>                   
                    </View>

                    <CompleteButton
                      requestId={req.id}
                      currentStatus={req.status as 'pending' | 'completed' | 'cancelled'}
                      onCompleted={() => fetchNearbyRequests(user)}
                    />
                  </>
                ) : (
                  <>
                    <ThemedText type="subtitle">Patient’s Details</ThemedText>
                    <ThemedText>{req.name}</ThemedText>
                    <ThemedText>Blood Group : {req.bloodGroup}</ThemedText>
                    <ThemedText>Requirement : {req.urgency}</ThemedText>

                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.donateBtn} onPress={() => handleDonate(req.id)}>
                        <ThemedText type="button" style={styles.donateText}>I’ll Donate</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(req.id)}>
                        <ThemedText type="button" style={styles.skipText}>I’ll Skip</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <ThemedText style={styles.noRequest}>No nearby requests right now.</ThemedText>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: ms(14),
    marginTop: vs(20),
    padding: ms(14),
    borderRadius: ms(16),
    borderWidth: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(14),
  },
  donateBtn: {
    backgroundColor: '#e53935',
    flex: 1,
    marginRight: ms(6),
    padding: ms(12),
    borderRadius: 999,
    alignItems: 'center',
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    flex: 1,
    marginLeft: ms(6),
    padding: ms(12),
    borderRadius: 999,
    alignItems: 'center',
  },
  donateText: { color: '#fff' },
  skipText: { color: '#e53935' },
  noRequest: {
    textAlign: 'center',
    fontSize: ms(15),
    marginTop: vs(20),
  },
  acceptedTitle: {
    fontWeight: 'bold',
    fontSize: ms(18),
    marginBottom: vs(8),
    textAlign: 'center',
  },
  acceptBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(18),
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e53935',
    padding: ms(12),
    borderRadius: 999,
    alignItems: 'center',
    marginLeft: ms(6),
  },
});
