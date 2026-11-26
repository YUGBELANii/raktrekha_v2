import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

type Status = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'active' | 'urgent' | string;

const labelMap: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
  active: 'Active',
  urgent: 'Urgent',
};

export function StatusBadge({ status }: { status: Status }) {
  const { colors } = useAppTheme();
  const key = String(status || '').toLowerCase();
  const map: Record<string, { bg: string; fg: string }> = {
    pending: { bg: colors.warningSoft, fg: colors.warning },
    accepted: { bg: colors.primarySoft, fg: colors.primary },
    active: { bg: colors.primarySoft, fg: colors.primary },
    completed: { bg: colors.successSoft, fg: colors.success },
    cancelled: { bg: colors.dangerSoft, fg: colors.danger },
    urgent: { bg: colors.dangerSoft, fg: colors.danger },
  };
  const s = map[key] || { bg: colors.primarySoft, fg: colors.primary };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{labelMap[key] || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
