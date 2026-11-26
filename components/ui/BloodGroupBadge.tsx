import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

export function BloodGroupBadge({ group, size = 'md' }: { group: string; size?: 'md' | 'sm' }) {
  const { colors } = useAppTheme();
  const sm = size === 'sm';
  return (
    <View style={[styles.badge, sm && styles.sm, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}> 
      <Text style={[styles.text, sm && styles.textSm, { color: colors.primary }]}>{group || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: {
    ...typography.button,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 13,
    lineHeight: 16,
  },
});
