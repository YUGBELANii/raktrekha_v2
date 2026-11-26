import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { typography } from '@/constants/theme';
import { useThemeColor } from './Themed';

type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'button' | 'default' | 'caption' | 'muted';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const color = useThemeColor({}, type === 'muted' ? 'textMuted' : 'text');

  return (
    <Text
      style={[
        styles.base,
        { color },
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'button' && styles.button,
        type === 'caption' && styles.caption,
        type === 'muted' && styles.muted,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    ...typography.bodySm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.h3,
  },
  button: {
    ...typography.button,
  },
  caption: {
    ...typography.caption,
  },
  muted: {
    ...typography.bodySm,
  },
});
