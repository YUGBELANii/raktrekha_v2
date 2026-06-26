import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { ms } from '../../constants/Layout';
import { useThemeColor } from './Themed';

export function ThemedCard({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'card');

  return <View style={[styles.card, { backgroundColor }, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    padding: ms(14),       // ✅ scaled padding
    borderRadius: ms(12),  // ✅ scaled radius
    marginBottom: ms(12),  // ✅ scaled margin
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
  },
});
