import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { ms } from '../../constants/Layout';
import { useThemeColor } from './Themed';

export function ThemedView({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return <View style={[styles.view, { backgroundColor }, style]} {...props} />;
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    paddingHorizontal: ms(16),  // ✅ scaled horizontal padding
  },
});
