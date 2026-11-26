import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from '../../lib/supabase';
import { addDoc, collection, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import CompleteButton from '@/components/completeButton';
import { AppButton, AppCard, AppHeader, AppInput, StatusBadge } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { auth, db } from '../../lib/supabase';

type Request = { id: string; bloodGroup: string; location?: string; status: string; createdAt?: any };

export default function RequestBloodScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [units, setUnits] = useState('1');
  const [urgency, setUrgency] = useState('ASAP');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [bgOpen, setBgOpen] = useState(false);
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => ({ label: bg, value: bg }));
  const urgencyOptions = [{ label: 'ASAP', value: 'ASAP' }, { label: 'Within 24 hours', value: '24hrs' }, { label: 'Later', value: 'later' }];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else { Alert.alert('Login Required', 'You are not logged in.'); router.replace('/signin'); }
    });
    return () => unsubscribe();
  }, []);

  const fetchActiveRequest = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'requests'), where('patientId', '==', user.uid), where('status', 'in', ['pending', 'accepted']), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setActiveRequest({ id: docSnap.id, ...(docSnap.data() as Omit<Request, 'id'>) });
      } else setActiveRequest(null);
    } catch (err) { console.error('Error fetching active request:', err); }
  };

  useEffect(() => { fetchActiveRequest(); }, [user]);

  const handleSubmit = async () => {
    if (!name || !bloodGroup || !units || !location) { Alert.alert('Missing Fields', 'Please fill all required fields.'); return; }
    if (!user) { Alert.alert('Authentication Error', 'You must be logged in to make a request.'); return; }
    try {
      setSubmitting(true);
      await addDoc(collection(db, 'requests'), {
        requestId: `${user.uid}_${Date.now()}`,
        patientId: user.uid,
        name, bloodGroup, units, urgency, location, notes,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      Alert.alert('Request Submitted', 'Your request has been created successfully.');
      fetchActiveRequest();
    } catch (error) {
      console.error('Request submission failed:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest?.id) return;
    try {
      await updateDoc(doc(db, 'requests', activeRequest.id), { status: 'cancelled' });
      setActiveRequest(null);
      Alert.alert('Request Cancelled', 'Your active request has been cancelled.');
    } catch (err) { console.error('Cancel error:', err); }
  };

  const ddStyle = { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, minHeight: 52 };
  const ddText = { color: colors.text, fontSize: 15 };
  const ddContainer = { backgroundColor: colors.surface, borderColor: colors.border };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.eyebrow, { color: colors.primary }]}>BLOOD REQUEST</Text>
        <Text style={[styles.title, { color: colors.text }]}>Request blood support</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Share clear details so donors can respond quickly.</Text>

        <AppCard style={styles.card}>
          <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Patient's full name" />
          <Text style={[styles.label, { color: colors.text }]}>Blood Group</Text>
          <View style={{ zIndex: 2000, marginBottom: spacing.lg }}>
            <DropDownPicker open={bgOpen} value={bloodGroup} items={bloodOptions} setOpen={setBgOpen} setValue={setBloodGroup} setItems={() => {}} style={ddStyle} textStyle={ddText} dropDownContainerStyle={ddContainer} />
          </View>
          <AppInput label="Units Needed" keyboardType="number-pad" value={units} onChangeText={setUnits} placeholder="e.g. 1 or 2" />
          <Text style={[styles.label, { color: colors.text }]}>Urgency</Text>
          <View style={{ zIndex: 1000, marginBottom: spacing.lg }}>
            <DropDownPicker open={urgencyOpen} value={urgency} items={urgencyOptions} setOpen={setUrgencyOpen} setValue={setUrgency} setItems={() => {}} style={ddStyle} textStyle={ddText} dropDownContainerStyle={ddContainer} />
          </View>
          <AppInput label="Location" value={location} onChangeText={setLocation} placeholder="City, area, or hospital" />
          <AppInput label="Additional Notes" value={notes} onChangeText={setNotes} placeholder="Any more details" multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />
          <AppButton label="Submit Request" onPress={handleSubmit} loading={submitting} />
        </AppCard>

        {activeRequest ? (
          <AppCard style={styles.card}>
            <View style={styles.activeHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Active request</Text>
              <StatusBadge status={activeRequest.status} />
            </View>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Location: {activeRequest.location || 'Unknown'}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Blood Group: {activeRequest.bloodGroup}</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              <AppButton label="Cancel Request" variant="outline" onPress={handleCancelRequest} />
              <CompleteButton requestId={activeRequest.id} currentStatus={activeRequest.status as 'pending' | 'completed' | 'cancelled'} onCompleted={fetchActiveRequest} />
            </View>
          </AppCard>
        ) : null}

        <AppCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>More actions</Text>
          <ActionLink icon="calendar-outline" label="Plan Future Request" onPress={() => router.push('/receiver/advance-request')} colors={colors} />
          <ActionLink icon="time-outline" label="View Request History" onPress={() => router.push('/receiver/request-history')} colors={colors} />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionLink({ icon, label, onPress, colors }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.actionLink, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.actionText, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1.1, marginBottom: spacing.xs },
  title: { ...typography.title, fontSize: 30, lineHeight: 36, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  label: { ...typography.caption, fontSize: 13, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, fontSize: 18 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  meta: { ...typography.bodySm, marginTop: 2 },
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1 },
  actionText: { ...typography.bodySm, fontWeight: '600', flex: 1 },
});
