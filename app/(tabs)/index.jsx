import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../constants/supabaseClient";
import Calendar from "../../components/Calendar";

const Dashboard = () => {
    const [highlightedMemory, setHighlightedMemory] = useState(null);

    useEffect(() => {
        const fetchHighlightedMemory = async () => {
            try {
                const { data, error } = await supabase
                    .from("memories")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(1);

                if (error) {
                    console.error("Error fetching memory:", error.message);
                } else {
                    setHighlightedMemory(data[0]);
                }
            } catch (err) {
                console.error("Unexpected error fetching memory:", err);
            }
        };

        fetchHighlightedMemory();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {/* Hero Section */}
            <View style={styles.heroContainer}>
                <ImageBackground
                    source={{
                        uri: highlightedMemory?.file_url || "https://via.placeholder.com/500",
                    }}
                    style={styles.heroImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay} />

                    {/* Profile Icon */}
                    <TouchableOpacity
                        style={styles.profileIcon}
                        onPress={() => console.log("Navigate to UserProfile")}
                    >
                        <Image
                            source={{
                                uri: "https://images.unsplash.com/photo-1611432579699-484f7990b127?q=80&w=2070&auto=format&fit=crop",
                            }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>

                    {/* Hero Button */}
                    <TouchableOpacity
                        style={styles.heroButton}
                        onPress={() => console.log("Navigate to MemoryVault")}
                    >
                        <Text style={styles.heroButtonText}>View Memory Vault</Text>
                    </TouchableOpacity>
                </ImageBackground>
            </View>

            {/* Calendar Section */}
            <View style={styles.calendar}>
                <Calendar />
            </View>

            {/* Action Tiles */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionTile}>
                    <Ionicons name="cloud-upload-outline" size={28} color="#19747E" style={styles.tileIcon} />
                    <Text style={styles.tileText}>Upload Memory</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile}>
                    <Ionicons name="person-add-outline" size={28} color="#FFC55B" style={styles.tileIcon} />
                    <Text style={styles.tileText}>Create Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile}>
                    <Ionicons name="images-outline" size={28} color="#428EFF" style={styles.tileIcon} />
                    <Text style={styles.tileText}>View Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile}>
                    <Ionicons name="cube-outline" size={28} color="#F1465A" style={styles.tileIcon} />
                    <Text style={styles.tileText}>Create Capsule</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f6",
    },
    heroContainer: {
        width: "100%",
        height: 300,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: "hidden",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    profileIcon: {
        position: "absolute",
        top: 40,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    heroButton: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        backgroundColor: "#19747E",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    heroButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    calendar: {
        alignItems: "center",
        marginTop: 20,
    },
    actionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        margin: 20,
        marginHorizontal: 10
    },
    actionTile: {
        width: "40%",
        height: 140, // Square-like dimensions
        borderRadius: 10, // Slightly rounded corners
        backgroundColor: "#fff", // White background
        marginBottom: 20,
        padding: 10,
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    tileIcon: {
        position: "absolute",
        top: 10,
        left: 10,
    },
    tileText: {
        position: "absolute",
        bottom: 10,
        left: 10,
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
});

export default Dashboard;




