import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/components/Themed';

interface MessageButtonProps {
  type?: 'whatsapp' | 'sms';
  phone: string;
  message: string;
  style?: ViewStyle;
}

const MessageButton: React.FC<MessageButtonProps> = ({ type = 'whatsapp', phone, message, style }) => {
  const { colors } = useAppTheme();

  const handlePress = () => {
    if (!phone) {
      Alert.alert('No phone number', 'This user has no phone number available.');
      return;
    }

    const url =
      type === 'whatsapp'
        ? `whatsapp://send?phone=+91${phone}&text=${encodeURIComponent(message)}`
        : `sms:${phone}?body=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        `${type === 'whatsapp' ? 'WhatsApp' : 'SMS'} not available`,
        `Please ensure ${type === 'whatsapp' ? 'WhatsApp' : 'your SMS app'} is installed and configured.`
      );
    });
  };

  const isWhatsApp = type === 'whatsapp';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isWhatsApp ? colors.successSoft : colors.primarySoft,
          borderColor: isWhatsApp ? colors.success : colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={isWhatsApp ? 'logo-whatsapp' : 'chatbubble-outline'} size={16} color={isWhatsApp ? colors.success : colors.primary} />
      <Text style={[styles.text, { color: isWhatsApp ? colors.success : colors.primary }]}>
        {isWhatsApp ? 'WhatsApp' : 'SMS'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});

export default MessageButton;
