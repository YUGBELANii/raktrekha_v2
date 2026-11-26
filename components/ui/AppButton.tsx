import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'md' | 'sm';
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = true,
  size = 'md',
}: Props) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  const bg = {
    primary: colors.primary,
    secondary: colors.primarySoft,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.dangerSoft,
  }[variant];

  const fg = {
    primary: '#FFFFFF',
    secondary: colors.primary,
    outline: colors.primary,
    ghost: colors.text,
    danger: colors.danger,
  }[variant];

  const borderColor = {
    primary: colors.primary,
    secondary: colors.primarySoft,
    outline: colors.borderStrong,
    ghost: 'transparent',
    danger: colors.dangerSoft,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        fullWidth && styles.fullWidth,
        { backgroundColor: bg, borderColor, opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={styles.icon} /> : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...typography.button,
  },
  labelSm: {
    fontSize: 14,
    lineHeight: 18,
  },
});
