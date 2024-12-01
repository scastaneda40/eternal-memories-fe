import React from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const PreviewCapsule = ({ route }) => {
  const { capsule } = route.params; // Capsule data passed from navigation
  const navigation = useNavigation();

  const handleDelete = () => {
    Alert.alert(
      "Delete Capsule",
      "Are you sure you want to delete this capsule? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implement your deletion logic here
            console.log("Capsule deleted:", capsule.id);
            navigation.goBack(); // Go back to the timeline after deletion
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{capsule.title}</Text>
      <Text style={styles.description}>{capsule.description}</Text>
      <Text style={styles.date}>
        Release Date: {new Date(capsule.release_date).toLocaleString()}
      </Text>
      <Text style={styles.privacy}>Privacy: {capsule.privacy}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit Capsule"
          onPress={() =>
            navigation.navigate("EditCapsule", { capsule }) // Navigate to the edit page
          }
        />
        <Button
          title="Add Media"
          onPress={() =>
            navigation.navigate("AddMedia", { capsuleId: capsule.id }) // Navigate to the add media page
          }
        />
        <Button title="Delete Capsule" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  privacy: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default PreviewCapsule;
