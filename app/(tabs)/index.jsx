import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Modal,
    Image,
    ScrollView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../constants/supabaseClient";
import Calendar from "../../components/Calendar";

const PRIMARY_TEAL = "#19747E";

const Dashboard = () => {
    const navigation = useNavigation();
    const [highlightedMemory, setHighlightedMemory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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

                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => navigation.navigate("UserProfile")}
                    >
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1611432579699-484f7990b127?q=80&w=2070&auto=format&fit=crop" }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.heroButton}
                        onPress={() => navigation.navigate("MemoryVault")}
                    >
                        <Text style={styles.heroButtonText}>View Memory Vault</Text>
                    </TouchableOpacity>
                </ImageBackground>
            </View>

            {/* Calendar Section */}
            {/* <View style={styles.calendarContainer}> */}
                <View style={styles.calendar}>
                    <Calendar />
                </View>
            {/* </View> */}

            {/* Action Tiles */}
           
            <View style={styles.actionsContainer}>
    {/* Upload Memory */}
    <TouchableOpacity style={styles.actionTile}>
        <LinearGradient colors={["#19747E", "#219E97"]} style={styles.gradientBackground}>
            <Text style={styles.actionText}>Upload Memory</Text>
        </LinearGradient>
    </TouchableOpacity>

    {/* Create Profile */}
    <TouchableOpacity style={styles.actionTile}>
        <LinearGradient colors={["#FFE48E", "#FFAB64"]} style={styles.gradientBackground}>
            <Text style={styles.actionText}>Create Profile</Text>
        </LinearGradient>
    </TouchableOpacity>

    {/* View Gallery */}
    <TouchableOpacity style={styles.actionTile}>
        <LinearGradient colors={["#71C9FF", "#428EFF"]} style={styles.gradientBackground}>
            <Text style={styles.actionText}>View Gallery</Text>
        </LinearGradient>
    </TouchableOpacity>

    {/* Create Capsule */}
    <TouchableOpacity style={styles.actionTile}>
        <LinearGradient colors={["#FF6A88", "#F1465A"]} style={styles.gradientBackground}>
            <Text style={styles.actionText}>Create Capsule</Text>
        </LinearGradient>
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
    avatarContainer: {
        position: "absolute",
        top: 40,
        left: 20,
        borderRadius: 25,
        overflow: "hidden",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    heroButton: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        backgroundColor: PRIMARY_TEAL,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    heroButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    calendarContainer: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#333",
    },
    calendar: {
        alignItems: "center",
    },
    calendarDate: {
        fontSize: 36,
        fontWeight: "800",
        color: "#19747E",
    },
    calendarDay: {
        fontSize: 16,
        color: "#666",
    },
    actionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // Allows wrapping for a grid layout
        justifyContent: "space-between", // Adds space between items
        margin: 20,
    },
    actionTile: {
        width: "45%", // Each tile takes 45% of the container width
        height: 140,
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 20, // Adds space between rows
    },
    gradientBackground: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    actionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});

export default Dashboard;

