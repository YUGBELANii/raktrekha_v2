import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, AppInput, BloodGroupBadge, EmptyState, LoadingState } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { db } from '../../lib/supabase';

const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NearbyDonorsScreen() {
  const { colors } = useAppTheme();
  const [donors, setDonors] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'donor'));
        const querySnapshot = await getDocs(q);
        const donorList = querySnapshot.docs.map((d: any) => d.data());
        setDonors(donorList);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const filteredDonors = donors.filter((donor) => {
    const matchGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;
    const q = searchQuery.toLowerCase();
    const matchSearch = donor.name?.toLowerCase().includes(q) || donor.city?.toLowerCase().includes(q) || donor.location?.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.eyebrow, { color: colors.primary }]}>FIND DONORS</Text>
        <Text style={[styles.title, { color: colors.text }]}>Nearby donors</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Search by name, city, or blood group.</Text>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <AppInput label="Search" placeholder="Name or city" value={searchQuery} onChangeText={setSearchQuery} containerStyle={{ marginBottom: 0 }} />
          </View>
          <Pressable style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.filterSummary}>
          <Text style={[styles.filterText, { color: colors.textMuted }]}>Blood group: <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedGroup}</Text></Text>
        </View>

        {loading ? (
          <LoadingState message="Loading donors..." />
        ) : filteredDonors.length === 0 ? (
          <AppCard><EmptyState icon="people-outline" title="No donors found" message="Try adjusting your search or blood group filter." /></AppCard>
        ) : (
          filteredDonors.map((donor, index) => (
            <AppCard key={index} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{donor.name || 'Donor'}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>{donor.location || donor.city || 'Location not specified'}</Text>
                </View>
                <BloodGroupBadge group={donor.bloodGroup || '—'} size="sm" />
              </View>
              <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
                <View style={styles.detail}><Ionicons name="location-outline" size={15} color={colors.textMuted} /><Text style={[styles.detailText, { color: colors.text }]}>{donor.city || donor.location || 'Location not specified'}</Text></View>
              </View>
            </AppCard>
          ))
        )}

        <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setFilterOpen(false)}>
            <Pressable style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Blood group</Text>
              <View style={styles.chips}>
                {bloodGroups.map((group) => {
                  const active = selectedGroup === group;
                  return (
                    <Pressable key={group} onPress={() => { setSelectedGroup(group); setFilterOpen(false); }} style={[styles.chip, { backgroundColor: active ? colors.primarySoft : colors.background, borderColor: active ? colors.primary : colors.border }]}>
                      <Text style={[styles.chipText, { color: active ? colors.primary : colors.text }]}>{group}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  searchRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end' },
  filterBtn: { width: 52, height: 52, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  filterSummary: { marginBottom: spacing.lg },
  filterText: { ...typography.bodySm },
  card: { marginBottom: spacing.lg },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  name: { ...typography.h3, fontSize: 18 },
  meta: { ...typography.bodySm, marginTop: 2 },
  detailRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailText: { ...typography.bodySm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(32,33,36,0.45)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.xl },
  modalTitle: { ...typography.h3, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radii.pill, borderWidth: 1 },
  chipText: { ...typography.bodySm, fontWeight: '600' },
});
