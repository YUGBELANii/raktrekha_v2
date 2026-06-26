// components/MessageButton.tsx
import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MessageButtonProps {
  type?: 'whatsapp' | 'sms';
  phone: string;
  message: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ type = 'whatsapp', phone, message }) => {
  const handlePress = (event: GestureResponderEvent) => {
    if (!phone) {
      Alert.alert('No phone number', 'This user has no phone number available.');
      return;
    }

    let url = '';
    if (type === 'whatsapp') {
      url = `whatsapp://send?phone=+91${phone}&text=${encodeURIComponent(message)}`;
    } else {
      url = `sms:${phone}?body=${encodeURIComponent(message)}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert(
        `${type === 'whatsapp' ? 'WhatsApp' : 'SMS'} not available`,
        `Please ensure ${type === 'whatsapp' ? 'WhatsApp' : 'your SMS app'} is installed and configured.`
      );
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>
        {type === 'whatsapp' ? 'WhatsApp' : 'Send SMS'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
button: {
  flex: 1,                 // ✅ equal width for each button
  backgroundColor: '#128C7E',
  paddingVertical: 10,
  paddingHorizontal: 5,
  borderRadius: 8,
  marginHorizontal: 4,     // ✅ spacing between buttons
  alignItems: 'center',
},


  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MessageButton;
