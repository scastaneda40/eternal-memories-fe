import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { supabase } from "../../constants/supabaseClient";

const MemoryVault = () => {
    const [memories, setMemories] = useState([]);

    useEffect(() => {
        const fetchMemories = async () => {
            const { data, error } = await supabase
                .from("memories")
                .select("*")
                .order("created_at", { ascending: false }); // Sort by most recent

            if (error) {
                console.error("Error fetching memories:", error.message);
            } else {
                setMemories(data);
            }
        };

        fetchMemories();
    }, []);

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
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listContent: {
        paddingBottom: 20, // Add padding at the bottom for scrolling
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
