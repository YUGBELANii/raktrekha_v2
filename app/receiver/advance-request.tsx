import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { ThemedText, ThemedView } from '../../components/Themed';

const AdvanceRequestScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [form, setForm] = useState({
    bloodType: '',
    units: '',
    reason: '',
  });

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date | undefined) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(Platform.OS === 'ios');
  };

  const handleSubmit = () => {
    if (!form.bloodType || !form.units || !form.reason) {
      alert('Please fill in all fields');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];

    console.log('Request:', {
      ...form,
      requiredDate: formattedDate,
    });

    alert(`Request submitted for ${formattedDate}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          Advance Blood Request
        </ThemedText>

        <ThemedText style={styles.label}>Blood Type</ThemedText>
        <TextInput
          placeholder="e.g. A+"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#222' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          value={form.bloodType}
          onChangeText={(text) => handleChange('bloodType', text)}
        />

        <ThemedText style={styles.label}>Units Required</ThemedText>
        <TextInput
          placeholder="e.g. 2"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#222' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          keyboardType="numeric"
          value={form.units}
          onChangeText={(text) => handleChange('units', text)}
        />

        <ThemedText style={styles.label}>Reason</ThemedText>
        <TextInput
          placeholder="Why do you need it?"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          style={[
            styles.input,
            {
              height: 100,
              textAlignVertical: 'top',
              backgroundColor: isDark ? '#222' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          multiline
          value={form.reason}
          onChangeText={(text) => handleChange('reason', text)}
        />

        <ThemedText style={[styles.label, { marginTop: 20 }]}>
          Required Date
        </ThemedText>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[
            styles.dateBox,
            {
              backgroundColor: isDark ? '#222' : '#fff',
            },
          ]}
        >
          <ThemedText>{date.toDateString()}</ThemedText>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(2100, 11, 31)}
          />
        )}

        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <ThemedText style={styles.submitText}>Submit Request</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#e53935',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdvanceRequestScreen;
