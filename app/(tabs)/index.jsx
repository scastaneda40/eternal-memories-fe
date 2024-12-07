import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
    ScrollView,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../constants/supabaseClient";
import Calendar from "../../components/Calendar";

const Dashboard = () => {
    const navigation = useNavigation();
    const [highlightedMemory, setHighlightedMemory] = useState(null);
    const slideAnim = useRef(new Animated.Value(-100)).current; // Slide-in animation

    useEffect(() => {
        // Fetch the highlighted memory
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

        // Slide-in animation
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }).start();
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
                    <Animated.View style={[styles.heroButtonContainer, { transform: [{ translateX: slideAnim }] }]}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("MemoryVault")}
                            style={styles.heroButton}
                        >
                            <Text style={styles.heroButtonText}>View Memory Vault</Text>
                            <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.heroArrowIcon} />
                        </TouchableOpacity>
                    </Animated.View>
                </ImageBackground>
            </View>

            {/* Calendar Section */}
            <View style={styles.calendar}>
                <Calendar />
            </View>

            {/* Action Tiles */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionTile}
                    onPress={() => navigation.navigate("MemoryUpload")}
                >
                    <Ionicons name="cloud-upload-outline" size={28} color="#19747E" style={styles.tileIcon} />
                    <Text style={styles.tileText}>Upload Memory</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionTile}
                    onPress={() => navigation.navigate("LovedOneProfile")}
                >
                    <Ionicons name="person-add-outline" size={28} color="#FFC55B" style={styles.tileIcon} />
                    <Text style={styles.tileText}>Create Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionTile}
                    onPress={() => navigation.navigate("MediaGallery")}
                >
                    <Ionicons name="images-outline" size={28} color="#428EFF" style={styles.tileIcon} />
                    <Text style={styles.tileText}>View Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionTile}
                    onPress={() => navigation.navigate("CreateCapsule")}
                >
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
    heroButtonContainer: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
    },
    heroButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#19747E",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    heroButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    heroArrowIcon: {
        marginLeft: 10,
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
        marginHorizontal: 10,
    },
    actionTile: {
        width: "40%",
        height: 140,
        borderRadius: 10,
        backgroundColor: "#fff",
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




