import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getAuth } from '../../lib/supabase';
import { doc, getDoc, setDoc } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';
import { db } from '../../lib/supabase';

type DayAvailability = { available: boolean; start: string; end: string };
type Availability = { [day: string]: DayAvailability };
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleAvailability() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const user = getAuth().currentUser;
  const [availability, setAvailability] = useState<Availability>({});
  const [showTimePicker, setShowTimePicker] = useState({ show: false, day: '', type: 'start' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAvailability(); }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const fetchAvailability = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    let initial: Availability = {};
    weekdays.forEach((day) => { initial[day] = { available: false, start: '09:00 AM', end: '05:00 PM' }; });
    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.availability) { setAvailability({ ...initial, ...userData.availability }); return; }
    }
    setAvailability(initial);
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: { ...prev[day], available: !prev[day]?.available } }));
  };

  const handleTimeChange = (_event: any, selectedDate: Date | undefined) => {
    if (!selectedDate) { setShowTimePicker({ show: false, day: '', type: 'start' }); return; }
    const formatted = formatTime(selectedDate);
    const { day, type } = showTimePicker;
    setAvailability((prev) => ({ ...prev, [day]: { ...prev[day], [type]: formatted } }));
    setShowTimePicker({ show: false, day: '', type: 'start' });
  };

  const handleSave = async () => {
    if (!user) return;
    const invalidDay = weekdays.find((day) => {
      const { available, start, end } = availability[day];
      if (!available) return false;
      const to24 = (t: string) => {
        const [time, period] = t.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return to24(start) >= to24(end);
    });
    if (invalidDay) { alert(`Invalid time range on ${invalidDay}. Start time must be before end time.`); return; }
    try {
      setSaving(true);
      await setDoc(doc(db, 'users', user.uid), { availability }, { merge: true });
      alert('Availability saved!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Availability" subtitle="Set when you can donate" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {weekdays.map((day) => {
          const dayData = availability?.[day];
          return (
            <AppCard key={day} style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={[styles.day, { color: colors.text }]}>{day}</Text>
                  <Text style={[styles.hint, { color: colors.textMuted }]}>{dayData?.available ? 'Available for donation' : 'Unavailable'}</Text>
                </View>
                <Switch value={dayData?.available ?? false} onValueChange={() => toggleDay(day)} trackColor={{ false: colors.border, true: colors.primarySoft }} thumbColor={dayData?.available ? colors.primary : '#f4f3f4'} />
              </View>
              {dayData?.available ? (
                <View style={styles.timeRow}>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setShowTimePicker({ show: true, day, type: 'start' })}>
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Start</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{dayData?.start ?? '--:--'}</Text>
                  </Pressable>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setShowTimePicker({ show: true, day, type: 'end' })}>
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>End</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{dayData?.end ?? '--:--'}</Text>
                  </Pressable>
                </View>
              ) : null}
            </AppCard>
          );
        })}
        <AppButton label="Save Availability" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
        {showTimePicker.show && (
          <DateTimePicker value={new Date()} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleTimeChange} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { ...typography.h3, fontSize: 17 },
  hint: { ...typography.caption, marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  timeBtn: { flex: 1, borderWidth: 1, borderRadius: radii.md, padding: spacing.md },
  timeLabel: { ...typography.caption, marginBottom: 2 },
  timeValue: { ...typography.bodySm, fontWeight: '700' },
});
