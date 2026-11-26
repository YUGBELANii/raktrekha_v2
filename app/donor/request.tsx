/* eslint-disable react-hooks/exhaustive-deps */
import MessageButton from '@/components/MessageBtn';
import CompleteButton from '@/components/completeButton';
import { AppCard, BloodGroupBadge, EmptyState, LoadingState, StatusBadge } from '@/components/ui';
import { useAppTheme } from '@/components/Themed';
import { spacing, typography, radii } from '@/constants/theme';
import { auth, db } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from '../../lib/supabase';
import { collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from '../../lib/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Request {
  id: string;
  name: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  acceptedBy?: string;
  number?: string;
  createdAt?: any;
}

export default function DonorNearbyRequest() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const fetched = querySnap.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() })) as Request[];
      setRequests(fetched);
      const accepted = fetched.find((r) => r.acceptedBy === currentUser.uid);
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
        Alert.alert('Not Logged In', 'Please log in first.');
        router.replace('/signin');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchNearbyRequests]);

  const handleDonate = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'requests', id), { status: 'accepted', acceptedBy: user.uid });
      Alert.alert('Thank You!', 'You have accepted this donation request.');
      setAcceptedId(id);
      fetchNearbyRequests(user);
    } catch (error) {
      console.error('Error accepting donation:', error);
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status: 'skipped' });
      setRequests((prev) => prev.filter((r) => r.id !== id));
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>NEARBY REQUESTS</Text>
        <Text style={[styles.title, { color: colors.text }]}>People who need your help</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Review matching requests and respond quickly when you can donate.</Text>

        {loading ? (
          <LoadingState message="Loading nearby requests..." />
        ) : requests.length > 0 ? (
          requests.map((req) => {
            const isAccepted = acceptedId === req.id;
            return (
              <AppCard key={req.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{req.name}</Text>
                    <Text style={[styles.meta, { color: colors.textMuted }]}>Urgency: {req.urgency}</Text>
                  </View>
                  <View style={styles.badges}>
                    <BloodGroupBadge group={req.bloodGroup} size="sm" />
                    <StatusBadge status={req.status} />
                  </View>
                </View>

                {isAccepted ? (
                  <View>
                    <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.infoText, { color: colors.textMuted }]}>You&apos;ve accepted this request. Contact the recipient to coordinate.</Text>
                    </View>
                    <View style={styles.rowActions}>
                      <MessageButton type="whatsapp" phone={req.number || ''} message="Hello, I am your donor from Rakth Rekha." />
                      <MessageButton type="sms" phone={req.number || ''} message="Hello, contacting you regarding your blood request via Rakth Rekha." />
                    </View>
                    <View style={styles.rowActions}>
                      <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => handleCancel(req.id)}>
                        <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>Cancel</Text>
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <CompleteButton
                          requestId={req.id}
                          currentStatus={req.status as 'pending' | 'completed' | 'cancelled'}
                          onCompleted={() => fetchNearbyRequests(user)}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.rowActions}>
                    <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => handleDonate(req.id)}>
                      <Text style={styles.primaryBtnText}>I&apos;ll Donate</Text>
                    </Pressable>
                    <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => handleSkip(req.id)}>
                      <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Skip</Text>
                    </Pressable>
                  </View>
                )}
              </AppCard>
            );
          })
        ) : (
          <AppCard>
            <EmptyState icon="heart-outline" title="No nearby requests" message="There are no matching blood requests right now. Check back soon." />
          </AppCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.xs },
  title: { ...typography.title, fontSize: 30, lineHeight: 36, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  name: { ...typography.h3, marginBottom: 2 },
  meta: { ...typography.bodySm },
  badges: { alignItems: 'flex-end', gap: spacing.sm },
  infoBox: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  infoText: { ...typography.bodySm },
  rowActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  primaryBtn: { flex: 1, minHeight: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', ...typography.button, fontSize: 14 },
  secondaryBtn: { flex: 1, minHeight: 44, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { ...typography.button, fontSize: 14 },
});
