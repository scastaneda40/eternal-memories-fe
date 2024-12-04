import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../../constants/ProfileContext";
import { supabase } from "../../constants/supabaseClient";

const PRIMARY_TEAL = "#19747E";

const Dashboard = () => {
    const navigation = useNavigation();
    const { profile, setProfile } = useProfile(); // Use profile from global context
    const [profiles, setProfiles] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    // Fetch profiles from Supabase or local storage
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data, error } = await supabase
                    .from("profile")
                    .select("*");

                if (error) {
                    console.error("Error fetching profiles:", error.message);
                } else {
                    setProfiles(data || []);
                }
            } catch (err) {
                console.error("Unexpected error fetching profiles:", err);
            }
        };

        fetchProfiles();
    }, []);

    // Automatically show the modal if no profile is set
    useEffect(() => {
        if (!profile) {
            setModalVisible(true);
        }
    }, [profile]);

    const handleProfileSelect = (selectedProfile) => {
        setProfile(selectedProfile);
        setModalVisible(false);
        Alert.alert("Profile Selected", `You selected: ${selectedProfile.name}`);
    };

    const renderProfile = ({ item }) => (
        <TouchableOpacity
            style={styles.profileItem}
            onPress={() => handleProfileSelect(item)}
        >
            <Text style={styles.profileName}>{item.name}</Text>
            <Text style={styles.profileRelationship}>{item.relationship}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Navigation Buttons */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("MemoryUpload")}
            >
                <Text style={styles.buttonText}>Upload Memory</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("LovedOneProfile")}
            >
                <Text style={styles.buttonText}>Create Loved One Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("CreateCapsule")}
            >
                <Text style={styles.buttonText}>Create Capsule</Text>
            </TouchableOpacity>

            {/* New Media Bank Buttons */}
            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate("MediaBankUpload", {
                        onUploadComplete: () => navigation.navigate("MediaGallery"),
                    })
                }
            >
                <Text style={styles.buttonText}>Upload Media</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("MediaGallery")}
            >
                <Text style={styles.buttonText}>View Media Gallery</Text>
            </TouchableOpacity>

            {/* Profile Selection Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select a Profile</Text>
                        <FlatList
                            data={profiles}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderProfile}
                            contentContainerStyle={styles.listContent}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                if (!profile) {
                                    Alert.alert(
                                        "Profile Required",
                                        "Please select a profile to continue."
                                    );
                                } else {
                                    setModalVisible(false);
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    button: {
        backgroundColor: PRIMARY_TEAL,
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "90%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    listContent: {
        paddingVertical: 10,
    },
    profileItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    profileName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    profileRelationship: {
        fontSize: 14,
        color: "#555",
    },
    closeButton: {
        backgroundColor: PRIMARY_TEAL,
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
});

export default Dashboard;



