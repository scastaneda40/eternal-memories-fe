import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../../constants/ProfileContext"; // Adjust the path as necessary
import { supabase } from "../../constants/supabaseClient";

const Dashboard = () => {
    const navigation = useNavigation();
    const { setProfile } = useProfile(); // Set the selected profile in global context
    const [profiles, setProfiles] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    // Fetch profiles from Supabase or local storage
    useEffect(() => {
        const fetchProfiles = async () => {
            const { data, error } = await supabase
                .from("profile")
                .select("*");

            if (error) {
                console.error("Error fetching profiles:", error.message);
            } else {
                setProfiles(data || []);
            }
        };

        fetchProfiles();
    }, []);

    const handleProfileSelect = (profile) => {
        setProfile(profile); // Set the selected profile globally
        setModalVisible(false); // Close the modal
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
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>Select Profile</Text>
            </TouchableOpacity>

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
                            keyExtractor={(item) => item.id}
                            renderItem={renderProfile}
                            contentContainerStyle={styles.listContent}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
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
        backgroundColor: "#007AFF",
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
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
});

export default Dashboard;




