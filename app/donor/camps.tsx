import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, EmptyState, LoadingState } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { db } from '../../lib/supabase';

export default function DonorNearbyCamps() {
  const { colors } = useAppTheme();
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const campCollection = collection(db, 'bloodCamps');
    const unsubscribe = onSnapshot(
      campCollection,
      (snapshot) => {
        const campList = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setCamps(campList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching camps:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const openGoogleMaps = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>BLOOD CAMPS</Text>
        <Text style={[styles.title, { color: colors.text }]}>Nearby donation camps</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Find active blood donation camps and get directions.</Text>

        {loading ? (
          <LoadingState message="Loading camps near you..." />
        ) : camps.length === 0 ? (
          <AppCard>
            <EmptyState icon="location-outline" title="No active camps" message="There are no active blood donation camps right now." />
          </AppCard>
        ) : (
          camps.map((camp) => (
            <AppCard key={camp.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="business-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.campName, { color: colors.text }]}>{camp.name || 'Unnamed Camp'}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>Hosted by {camp.hostedBy || 'N/A'}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderColor: colors.border }]}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.text }]}>{camp.location || 'Location not available'}</Text>
              </View>
              <View style={[styles.infoRow, { borderColor: colors.border }]}>
                <Ionicons name="navigate-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.text }]}>{camp.distance ? `${camp.distance} away` : 'Distance unknown'}</Text>
              </View>

              {camp.address ? (
                <Pressable style={[styles.dirBtn, { backgroundColor: colors.primarySoft }]} onPress={() => openGoogleMaps(camp.address)}>
                  <Ionicons name="map-outline" size={16} color={colors.primary} />
                  <Text style={[styles.dirText, { color: colors.primary }]}>Get directions</Text>
                </Pressable>
              ) : null}
            </AppCard>
          ))
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
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  campName: { ...typography.h3, fontSize: 18, marginBottom: 2 },
  meta: { ...typography.bodySm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  infoText: { ...typography.bodySm, flex: 1 },
  dirBtn: { marginTop: spacing.lg, minHeight: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  dirText: { ...typography.button, fontSize: 14 },
});
