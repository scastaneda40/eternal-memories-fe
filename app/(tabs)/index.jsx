import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../constants/supabaseClient";

const PRIMARY_TEAL = "#19747E";

const Dashboard = () => {
    const navigation = useNavigation();
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
        <View style={styles.container}>
            {/* Hero Section */}
            <View>
                <ImageBackground
                    source={{
                        uri: highlightedMemory?.file_url || "https://via.placeholder.com/500",
                    }}
                    style={styles.heroImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay} />
                    <TouchableOpacity
                        style={styles.heroButton}
                        onPress={() => navigation.navigate("MemoryVault")}
                    >
                        <Text style={styles.heroButtonText}>View Memory Vault</Text>
                    </TouchableOpacity>
                </ImageBackground>
            </View>

            {/* Action Tiles */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionTile, styles.uploadTile]}
                    onPress={() => navigation.navigate("MemoryUpload")}
                >
                    <Text style={styles.actionText}>Upload Memory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionTile, styles.profileTile]}
                    onPress={() => navigation.navigate("LovedOneProfile")}
                >
                    <Text style={styles.actionText}>Create Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionTile, styles.galleryTile]}
                    onPress={() => navigation.navigate("MediaGallery")}
                >
                    <Text style={styles.actionText}>View Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionTile, styles.capsuleTile]}
                    onPress={() => navigation.navigate("CreateCapsule")}
                >
                    <Text style={styles.actionText}>Create Capsule</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    heroImage: {
        width: "100%",
        height: 250, // Fixed height for hero image
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    heroButton: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        backgroundColor: PRIMARY_TEAL,
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    heroButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    actionsContainer: {
        flex: 1,
        marginTop: 10, // Adjust spacing between hero and actions
        padding: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    actionTile: {
        width: "45%",
        height: 120,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    uploadTile: { backgroundColor: "#FFCCBC" },
    profileTile: { backgroundColor: "#C5E1A5" },
    galleryTile: { backgroundColor: "#80DEEA" },
    capsuleTile: { backgroundColor: "#FFAB91" },
    actionText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default Dashboard;
