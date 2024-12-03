import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";

const ShareDetail = ({ route }) => {
  const { memory } = route.params || {};

  const shareLink = async () => {
    try {
      const message = `
        Check out this memory:
        Title: ${memory.title || "Untitled Memory"}
        Date: ${new Date(memory.actual_date).toLocaleDateString()}
        Description: ${memory.description || "No description provided."}
      `;

      // If the file URL exists and sharing is available
      if (memory.file_url && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(memory.file_url, { dialogTitle: message });
      } else {
        // Fallback to showing the link in the browser
        Linking.openURL(memory.file_url || "https://example.com");
      }
    } catch (error) {
      console.error("Error sharing memory:", error);
      Alert.alert("Error", "Failed to share the memory. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Link</Text>
      <TouchableOpacity style={styles.shareButton} onPress={shareLink}>
        <Text style={styles.buttonText}>Share Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: "#19747E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ShareDetail;

