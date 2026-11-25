import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import { ThemedText, ThemedView, useThemeColor } from '../../components/Themed';
import { db } from '../../firebase';

type DayAvailability = {
  available: boolean;
  start: string;
  end: string;
};

type Availability = {
  [day: string]: DayAvailability;
};

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleAvailability() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { width } = useWindowDimensions();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const user = getAuth().currentUser;

  const [availability, setAvailability] = useState<Availability>({});
  const [showTimePicker, setShowTimePicker] = useState({ show: false, day: '', type: 'start' });

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    fetchAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const fetchAvailability = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    let initial: Availability = {};
    weekdays.forEach(day => {
      initial[day] = {
        available: false,
        start: '09:00 AM',
        end: '05:00 PM',
      };
    });

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.availability) {
        setAvailability({ ...initial, ...userData.availability });
        return;
      }
    }

    setAvailability(initial);
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day]?.available,
      },
    }));
  };

  const handleTimeChange = (_event: any, selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setShowTimePicker({ show: false, day: '', type: 'start' });
      return;
    }

    const formatted = formatTime(selectedDate);
    const { day, type } = showTimePicker;

    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: formatted,
      },
    }));

    setShowTimePicker({ show: false, day: '', type: 'start' });
  };

  const handleSave = async () => {
    if (!user) return;

    const invalidDay = weekdays.find(day => {
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

    if (invalidDay) {
      alert(`Invalid time range on ${invalidDay}. Start time must be before end time.`);
      return;
    }

    await setDoc(doc(db, 'users', user.uid), { availability }, { merge: true });
    alert('Availability saved!');
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemedText style={styles.header}>Your Weekly Availability</ThemedText>

        {weekdays.map(day => (
          <ThemedView key={day} style={[styles.card, { backgroundColor: cardColor }]}>
            <ThemedView style={styles.row}>
              <ThemedText style={[styles.dayText, { color: textColor }]}>{day}</ThemedText>
              <Switch
                value={availability?.[day]?.available ?? false}
                onValueChange={() => toggleDay(day)}
              />
            </ThemedView>

            {availability?.[day]?.available && (
              <ThemedView style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker({ show: true, day, type: 'start' })}
                >
                  <ThemedText>Start: {availability?.[day]?.start ?? '--:--'}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker({ show: true, day, type: 'end' })}
                >
                  <ThemedText>End: {availability?.[day]?.end ?? '--:--'}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Save Availability</ThemedText>
        </TouchableOpacity>

        {showTimePicker.show && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: { fontSize: 15, fontWeight: '600' },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeButton: {
    padding: 8,
    backgroundColor: '#ccc',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#e53935',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
  },
});
