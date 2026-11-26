import { doc, serverTimestamp, updateDoc } from '../lib/supabase';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../lib/supabase';
import { AppButton } from './ui';

type CompleteButtonProps = {
  requestId: string;
  currentStatus: 'pending' | 'completed' | 'cancelled';
  onCompleted?: () => void;
};

const CompleteButton: React.FC<CompleteButtonProps> = ({ requestId, currentStatus, onCompleted }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    Alert.alert('Mark as Completed', 'Are you sure this request has been fulfilled?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Complete',
        onPress: async () => {
          try {
            setLoading(true);
            const requestRef = doc(db, 'requests', requestId);
            await updateDoc(requestRef, {
              status: 'completed',
              completedAt: serverTimestamp(),
            });
            Alert.alert('Success', 'Request marked as completed!');
            onCompleted?.();
          } catch (error) {
            console.error('Error updating request:', error);
            Alert.alert('Error', 'Could not update request. Try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (currentStatus === 'completed') {
    return <AppButton label="Completed" variant="secondary" disabled icon="checkmark-circle" size="sm" />;
  }

  return (
    <AppButton
      label="Mark Completed"
      onPress={handleComplete}
      loading={loading}
      variant="primary"
      icon="checkmark"
      size="sm"
    />
  );
};

export default CompleteButton;
