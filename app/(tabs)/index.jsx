import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
    StatusBar,
    Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../constants/supabaseClient";
import Calendar from "../../components/Calendar";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Dashboard = () => {
    const navigation = useNavigation();
    const [highlightedMemory, setHighlightedMemory] = useState(null);
    const insets = useSafeAreaInsets();


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
        <>
           
            <View style={[styles.container, { paddingTop: insets.top }]}>

            <View style={styles.container}>
                {/* Hero Section */}
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
                        onPress={() => navigation.navigate("MemoryVault")}
                    >
                        <Text style={styles.heroButtonText}>View Memory Vault</Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.heroArrowIcon} />
                    </TouchableOpacity>
                </ImageBackground>

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
            </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f6",
    },
    heroImage: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 300, // Extend enough to cover safe area
        zIndex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    profileIcon: {
        position: "absolute",
        top: Platform.OS === "android" ? 50 : 60,
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
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#19747E",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
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
        marginTop: 350, // Ensure this appears below the hero section
    },
    actionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        margin: 20,
    },
    actionTile: {
        width: "40%",
        height: 140,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 20,
        padding: 10,
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
