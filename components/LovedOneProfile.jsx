import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useProfile } from "../constants/ProfileContext";
import { SafeAreaView } from "react-native-safe-area-context";

const LovedOneProfile = ({ navigation }) => {
    const { setProfile } = useProfile();
    const [name, setName] = useState("");
    const [relationship, setRelationship] = useState(""); // New field
    const [traits, setTraits] = useState("");
    const [sayings, setSayings] = useState("");
    const [memories, setMemories] = useState("");

    const handleSave = () => {
        const profile = { name, relationship, traits, sayings, memories };
        setProfile(profile); // Save globally
        navigation.navigate("MemoryChat", { profile }); // Navigate to chat
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




