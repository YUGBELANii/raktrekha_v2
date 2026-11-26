import { useRouter } from 'expo-router';
import { getAuth } from '../../lib/supabase';
import { Timestamp, collection, getDocs, query, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, AppHeader, EmptyState, LoadingState, StatusBadge } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { db } from '../../lib/supabase';

type Donation = { id: string; location?: string; type?: string; receiver?: string; status?: string; date?: Timestamp | string };

export default function DonationHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const user = getAuth().currentUser;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      if (!user) return;
      const q = query(collection(db, 'requests'), where('acceptedBy', '==', user.uid), where('status', '==', 'completed'));
      const snapshot = await getDocs(q);
      const data: Donation[] = snapshot.docs.map((d: any) => {
        const raw = d.data();
        return {
          id: d.id,
          location: raw.hospital || raw.location || 'Unknown Hospital',
          type: raw.bloodType || raw.type || 'Blood Donation',
          receiver: raw.name || 'Patient',
          status: raw.status || 'Completed',
          date: raw.completedAt || raw.createdAt || '',
        };
      });
      const sorted = data.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date || '');
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date || '');
        return dateB.getTime() - dateA.getTime();
      });
      setDonations(sorted);
    } catch (err) {
      console.error('Failed to fetch donation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const formatDate = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Donation History" subtitle="Your completed donations" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.summary}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total completed donations</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{donations.length}</Text>
        </AppCard>

        {loading ? (
          <LoadingState message="Loading donation history..." />
        ) : donations.length === 0 ? (
          <AppCard><EmptyState icon="time-outline" title="No donations yet" message="Your completed donations will appear here." /></AppCard>
        ) : (
          donations.map((donation) => (
            <AppCard key={donation.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{donation.receiver}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>{donation.location}</Text>
                </View>
                <StatusBadge status="completed" />
              </View>
              <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
                <Detail label="Date" value={formatDate(donation.date)} colors={colors} />
                <Detail label="Type" value={donation.type || 'Blood Donation'} colors={colors} />
              </View>
            </AppCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value, colors }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  summary: { marginBottom: spacing.lg, alignItems: 'center' },
  summaryLabel: { ...typography.bodySm, marginBottom: spacing.xs },
  summaryValue: { fontSize: 36, fontWeight: '700' },
  card: { marginBottom: spacing.lg },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  cardTitle: { ...typography.h3, fontSize: 18 },
  cardMeta: { ...typography.bodySm, marginTop: 2 },
  detailRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1 },
  detailLabel: { ...typography.caption, marginBottom: 2 },
  detailValue: { ...typography.bodySm, fontWeight: '600' },
});
