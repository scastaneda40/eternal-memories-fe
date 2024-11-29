import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";

const MemoryVault = () => {
    const [memories, setMemories] = useState([]);
    const { userId } = useUser(); // Get the user_id from context
    const { profile } = useProfile(); // Get the profile from context

    useEffect(() => {
        const fetchMemories = async () => {
            if (!profile || !userId) {
                console.error("Profile or user ID is missing");
                return;
            }

            const { data, error } = await supabase
                .from("memories")
                .select("*")
                .eq("user_id", userId) // Filter by user_id
                .eq("profile_id", profile.id) // Filter by profile_id
                .order("created_at", { ascending: false }); // Sort by most recent

            if (error) {
                console.error("Error fetching memories:", error.message);
            } else {
                setMemories(data);
            }
        };

        fetchMemories();
    }, [userId, profile]); // Re-run if userId or profile changes

    const renderMemory = ({ item }) => (
        <View style={styles.memoryContainer}>
            <Image
                source={{ uri: item.file_url }}
                style={styles.memoryImage}
            />
            <Text style={styles.memoryTitle}>{item.file_name}</Text>
            <Text style={styles.memoryDescription}>{item.description}</Text>
            <Text style={styles.memoryTags}>{item.tags}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={memories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMemory}
                contentContainerStyle={styles.listContent} // Style for padding/margin
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    memoryContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 10,
        backgroundColor: "#f9f9f9",
    },
    memoryImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
    },
    memoryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 5,
    },
    memoryDescription: {
        fontSize: 14,
        color: "#555",
        marginBottom: 5,
    },
    memoryTags: {
        fontSize: 12,
        color: "#777",
    },
});

export default MemoryVault;

