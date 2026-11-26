import MessageButton from '@/components/MessageBtn';
import { AppCard, BloodGroupBadge, EmptyState, StatusBadge } from '@/components/ui';
import { useAppTheme } from '@/components/Themed';
import { spacing, typography, radii } from '@/constants/theme';
import { auth, db } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, updateDoc, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function ReceiverHome() {
  const router = useRouter();
  const { colors } = useAppTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>RECEIVER DASHBOARD</Text>
        <Text style={[styles.title, { color: colors.text }]}>Get help when you need it</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Track your active blood request and important care information.</Text>

        <AppCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active request</Text>
            {activeRequest ? <StatusBadge status={activeRequest.status} /> : null}
          </View>

          {activeRequest ? (
            <View>
              <View style={styles.requestTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestName, { color: colors.text }]}>
                    {activeRequest.status === 'accepted' ? `Donor: ${activeRequest.donorName || 'Assigned'}` : 'Blood request in progress'}
                  </Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {activeRequest.location ? `📍 ${activeRequest.location}` : 'We will notify you when a donor responds.'}
                  </Text>
                </View>
                <BloodGroupBadge group={activeRequest.bloodGroup} />
              </View>

              {activeRequest.status === 'accepted' ? (
                <View style={styles.actions}>
                  <MessageButton type="whatsapp" phone={activeRequest.number || ''} message="Hello, contacting via Rakth Rekha." />
                  <MessageButton type="sms" phone={activeRequest.number || ''} message="Hello, contacting via Rakth Rekha." />
                </View>
              ) : (
                <Pressable style={[styles.viewBtn, { backgroundColor: colors.primarySoft }]} onPress={() => router.push('/receiver/request')}>
                  <Text style={[styles.viewBtnText, { color: colors.primary }]}>View request details</Text>
                </Pressable>
              )}

              <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel request</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState icon="medkit-outline" title="No active request" message="Create a blood request when you need help. Your active request status will appear here." actionLabel="Create Request" onAction={() => router.push('/receiver/request')} />
          )}
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Care awareness</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            <InfoRow title="After transfusion" text="Rest for 24–48 hours, hydrate well, and watch for fever, chills, or rash." colors={colors} />
            <InfoRow title="Signs of anemia" text="Fatigue, pale skin, shortness of breath, dizziness, or rapid heartbeat." colors={colors} />
            <InfoRow title="When to seek help" text="Contact your doctor immediately if you notice unusual symptoms after transfusion." colors={colors} />
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ title, text, colors }: any) {
  return (
    <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
      <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.infoText, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.xs },
  title: { ...typography.title, fontSize: 30, lineHeight: 36, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.h3 },
  requestTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  requestName: { ...typography.h3, fontSize: 18, marginBottom: 2 },
  meta: { ...typography.bodySm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  viewBtn: { minHeight: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { ...typography.button, fontSize: 14 },
  cancelBtn: { marginTop: spacing.md, minHeight: 44, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.button, fontSize: 14 },
  infoRow: { paddingTop: spacing.md, borderTopWidth: 1 },
  infoTitle: { ...typography.bodySm, fontWeight: '700', marginBottom: 2 },
  infoText: { ...typography.bodySm },
});
