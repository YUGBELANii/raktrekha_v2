import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppHeader, AppInput } from '@/components/ui';
import { spacing, typography, radii } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

const AdvanceRequestScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [form, setForm] = useState({ bloodType: '', units: '', reason: '' });
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onDateChange = (_event: any, selectedDate?: Date | undefined) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(Platform.OS === 'ios');
  };

  const handleSubmit = () => {
    if (!form.bloodType || !form.units || !form.reason) { alert('Please fill in all fields'); return; }
    const formattedDate = date.toISOString().split('T')[0];
    console.log('Request:', { ...form, requiredDate: formattedDate });
    alert(`Request submitted for ${formattedDate}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader title="Advance Request" subtitle="Plan a future blood need" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppCard>
          <AppInput label="Blood Type" placeholder="e.g. A+" value={form.bloodType} onChangeText={(t) => handleChange('bloodType', t)} autoCapitalize="characters" />
          <AppInput label="Units Required" placeholder="e.g. 2" keyboardType="numeric" value={form.units} onChangeText={(t) => handleChange('units', t)} />
          <AppInput label="Reason" placeholder="Why do you need it?" multiline style={{ minHeight: 90, textAlignVertical: 'top' }} value={form.reason} onChangeText={(t) => handleChange('reason', t)} />

          <Text style={[styles.label, { color: colors.text }]}>Required Date</Text>
          <Pressable onPress={() => setShowPicker(true)} style={[styles.dateBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.dateText, { color: colors.text }]}>{date.toDateString()}</Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} minimumDate={new Date()} maximumDate={new Date(2100, 11, 31)} />
          )}

          <AppButton label="Submit Request" onPress={handleSubmit} />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  label: { ...typography.caption, fontSize: 13, marginBottom: spacing.sm },
  dateBox: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, justifyContent: 'center', marginBottom: spacing.lg },
  dateText: { ...typography.body },
});

export default AdvanceRequestScreen;
