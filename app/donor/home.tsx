import MessageButton from '@/components/MessageBtn';
import { AppCard, BloodGroupBadge, EmptyState, StatusBadge } from '@/components/ui';
import { useAppTheme } from '@/components/Themed';
import { spacing, typography, radii } from '@/constants/theme';
import { auth, db } from '../../lib/supabase';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, updateDoc, where } from '../../lib/supabase';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AcceptedRequest {
  id: string;
  name: string;
  bloodGroup: string;
  urgency: string;
  status: string;
  acceptedBy: string;
  patientId?: string;
  number?: string;
  createdAt?: any;
}

export default function DonorHome() {
  const { colors } = useAppTheme();
  const [acceptedRequest, setAcceptedRequest] = React.useState<AcceptedRequest | null>(null);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>DONOR DASHBOARD</Text>
          <Text style={[styles.title, { color: colors.text }]}>Ready to make an impact</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Track your accepted request and stay informed about safe donation.
          </Text>
        </View>

        <AppCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active accepted request</Text>
            {acceptedRequest ? <StatusBadge status="accepted" /> : null}
          </View>

          {acceptedRequest ? (
            <View>
              <View style={styles.requestTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patientName, { color: colors.text }]}>{acceptedRequest.name}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>Urgency: {acceptedRequest.urgency}</Text>
                </View>
                <BloodGroupBadge group={acceptedRequest.bloodGroup} />
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Status</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>You have accepted this request. Reach out to coordinate donation.</Text>
              </View>

              <View style={styles.actions}>
                <MessageButton type="whatsapp" phone={acceptedRequest?.number || ''} message="Hello, I’m your donor from Rakth Rekha." />
                <MessageButton type="sms" phone={acceptedRequest?.number || ''} message="Hello, contacting you as your donor." />
              </View>
              <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel acceptance</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState
              icon="heart-outline"
              title="No active accepted request"
              message="When you accept a nearby request, it will appear here with contact actions."
            />
          )}
        </AppCard>

        <AppCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Donation awareness</Text>
          <View style={styles.tipList}>
            <Tip title="Why donate?" text="Every donation can help save up to three lives." colors={colors} />
            <Tip title="Who you help" text="Supports accident victims, cancer and thalassemia patients, and mothers in need." colors={colors} />
            <Tip title="Before you donate" text="Age 18–65, 50kg+, healthy and not on strong medications." colors={colors} />
            <Tip title="Common myth" text="Feeling weak after donation is usually temporary — your body recovers quickly." colors={colors} />
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tip({ title, text, colors }: { title: string; text: string; colors: any }) {
  return (
    <View style={[styles.tip, { borderColor: colors.border }]}>
      <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.tipText, { color: colors.textMuted }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { marginBottom: spacing.xl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.xs },
  title: { ...typography.title, fontSize: 30, lineHeight: 36, marginBottom: spacing.sm },
  subtitle: { ...typography.body },
  sectionCard: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.h3 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  patientName: { ...typography.h3, fontSize: 20, marginBottom: 2 },
  meta: { ...typography.bodySm },
  infoBox: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  infoLabel: { ...typography.caption, marginBottom: 2 },
  infoValue: { ...typography.bodySm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: { marginTop: spacing.md, minHeight: 44, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.button, fontSize: 14 },
  tipList: { marginTop: spacing.md, gap: spacing.md },
  tip: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  tipDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  tipTitle: { ...typography.bodySm, fontWeight: '700', marginBottom: 2 },
  tipText: { ...typography.bodySm },
});
