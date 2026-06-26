import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { ms } from '../../constants/Layout'; // ✅ import scaling
import { useThemeColor } from './Themed';

type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'button' | 'default';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const color = useThemeColor({}, 'text');

  return (
    <Text
      style={[
        styles.base,
        { color },
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'button' && styles.button,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: ms(14),   // ✅ scaled default
  },
  title: {
    fontSize: ms(20),   // ✅ scaled title
    fontWeight: '700',
  },
  subtitle: {
    fontSize: ms(16),   // ✅ scaled subtitle
    fontWeight: '600',
  },
  button: {
    fontSize: ms(15),   // ✅ scaled button text
    fontWeight: '600',
  },
});
