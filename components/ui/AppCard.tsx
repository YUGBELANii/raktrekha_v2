import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { radii, shadows, spacing } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export function AppCard({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
});
