import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { radii, shadows, spacing } from '@/constants/theme';
import { useThemeColor } from './Themed';

export function ThemedCard({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View
      style={[styles.card, { backgroundColor, borderColor }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.card,
  },
});
