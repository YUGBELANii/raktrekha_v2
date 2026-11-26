import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, Timestamp, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, AppHeader, BloodGroupBadge, EmptyState, StatusBadge } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../../lib/supabase';

type RequestItem = { id: string; bloodGroup: string; units: number; status: string; createdAt: Timestamp; notes?: string };

export default function RequestHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [history, setHistory] = useState<RequestItem[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'requests'), where('patientId', '==', user.uid), where('status', 'in', ['completed', 'cancelled']), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests: RequestItem[] = querySnapshot.docs.map((d: any) => {
        const data = d.data();
        return { id: d.id, bloodGroup: data.bloodGroup || 'N/A', units: data.units || 0, status: data.status || 'unknown', createdAt: data.createdAt, notes: data.notes || '' };
      });
      setHistory(requests);
    }, (error) => console.error('Firestore Query Error:', error));
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Request History" subtitle="Your past blood requests" onBack={() => router.back()} />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.top}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>{item.units} unit{Number(item.units) === 1 ? '' : 's'} requested</Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>{item.createdAt?.toDate ? item.createdAt.toDate().toDateString() : 'Unknown Date'}</Text>
              </View>
              <BloodGroupBadge group={item.bloodGroup} size="sm" />
            </View>
            <View style={styles.statusRow}>
              <StatusBadge status={item.status} />
            </View>
            {item.notes ? <Text style={[styles.note, { color: colors.textMuted }]}>{item.notes}</Text> : null}
          </AppCard>
        )}
        ListEmptyComponent={<AppCard><EmptyState icon="document-text-outline" title="No request history" message="Completed and cancelled requests will appear here." /></AppCard>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.lg },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  title: { ...typography.h3, fontSize: 18 },
  date: { ...typography.bodySm, marginTop: 2 },
  statusRow: { marginTop: spacing.md },
  note: { ...typography.bodySm, marginTop: spacing.md, fontStyle: 'italic' },
});
