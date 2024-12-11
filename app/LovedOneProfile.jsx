import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useProfile } from "../constants/ProfileContext";
import { useUser } from "../constants/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";


const LovedOneProfile = () => {
  const { setProfile } = useProfile();
  const { user } = useUser(); // Get the user object from context
  const userId = user?.id; // Extract userId from user
  const navigation = useNavigation(); // Get navigation object


  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState(""); // New field
  const [traits, setTraits] = useState("");
  const [sayings, setSayings] = useState("");
  const [memories, setMemories] = useState("");

  const handleSave = async () => {
    if (!userId) {
      console.error("User ID is missing from context.");
      Alert.alert("Error", "You must be logged in to save a profile.");
      return;
    }

    const profile = {
      name,
      relationship,
      traits,
      sayings,
      memories,
      user_id: userId, // Ensure this is from useUser context
    };

    console.log("Payload being sent to server:", profile);

    try {
      const response = await fetch("http://localhost:5000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      console.log("Server response status:", response.status);

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error(errorResponse.message || "Failed to save profile.");
      }

      const { profile: savedProfile } = await response.json();
      console.log("Saved profile received from server:", savedProfile);

      setProfile(savedProfile);

      Alert.alert("Success", "Profile saved successfully!", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("(tabs)"),
        },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Relationship (e.g., parent, sibling, spouse)"
        value={relationship}
        onChangeText={setRelationship}
        style={styles.input}
      />
      <TextInput
        placeholder="Personality Traits (e.g., kind, humorous)"
        value={traits}
        onChangeText={setTraits}
        style={styles.input}
      />
      <TextInput
        placeholder="Favorite Sayings"
        value={sayings}
        onChangeText={setSayings}
        style={styles.input}
      />
      <TextInput
        placeholder="Shared Memories"
        value={memories}
        onChangeText={setMemories}
        style={styles.input}
      />
      <Button title="Save Profile" onPress={handleSave} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
});

export default LovedOneProfile;





