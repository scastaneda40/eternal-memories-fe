import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useProfile } from "../constants/ProfileContext";
import { useUser } from "../constants/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

const LovedOneProfile = ({ navigation }) => {
    const { setProfile } = useProfile();
    const { userId } = useUser();

    const [name, setName] = useState("");
    const [relationship, setRelationship] = useState(""); // New field
    const [traits, setTraits] = useState("");
    const [sayings, setSayings] = useState("");
    const [memories, setMemories] = useState("");


const handleSave = async () => {
    const profile = { name, relationship, traits, sayings, memories, user_id: userId }; // Include user_id

    try {
        // Save to backend
        const response = await fetch("http://localhost:5000/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error("Failed to save profile");
        }

        const { profile: savedProfile } = await response.json();
        setProfile(savedProfile); // Save globally with ID from the database

        Alert.alert("Success", "Profile saved successfully!", [
            { text: "OK", onPress: () => navigation.navigate("MemoryChat", { profile: savedProfile }) },
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





