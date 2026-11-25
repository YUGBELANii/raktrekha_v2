// components/CompleteButton.tsx
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { db } from "../firebase";

type CompleteButtonProps = {
  requestId: string;
  currentStatus: "pending" | "completed" | "cancelled";
  onCompleted?: () => void; // optional callback to refresh parent list
};

const CompleteButton: React.FC<CompleteButtonProps> = ({ requestId, currentStatus, onCompleted }) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    Alert.alert(
      "Mark as Completed",
      "Are you sure this request has been fulfilled?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          onPress: async () => {
            try {
              setLoading(true);
              const requestRef = doc(db, "requests", requestId);
              await updateDoc(requestRef, {
                status: "completed",
                completedAt: serverTimestamp(),
              });
              setLoading(false);
              Alert.alert("✅ Success", "Request marked as completed!");
              if (onCompleted) onCompleted();
            } catch (error) {
              console.error("Error updating request:", error);
              setLoading(false);
              Alert.alert("❌ Error", "Could not update request. Try again.");
            }
          },
        },
      ]
    );
  };

  if (currentStatus === "completed") {
    return <Text style={styles.completedBadge}>✅ Completed</Text>;
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handleComplete} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>✔ Mark as Completed</Text>}
    </TouchableOpacity>
  );
};

export default CompleteButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E63946",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  completedBadge: {
    color: "#2a9d8f",
    fontWeight: "700",
    fontSize: 14,
    alignSelf: "flex-end",
    marginTop: 6,
  },
});
