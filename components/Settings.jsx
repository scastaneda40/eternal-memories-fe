import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const PRIMARY_TEAL = "#19747E";

const Settings = () => {
    const navigation = useNavigation();

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", onPress: () => console.log("Signed out") },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* User Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: "https://via.placeholder.com/150" }} // Replace with user avatar URL
                    style={styles.avatar}
                />
                <Text style={styles.userName}>John Doe</Text>
            </View>

            {/* Options */}
            <TouchableOpacity
                style={styles.option}
                onPress={() => navigation.navigate("ChangeProfile")}
            >
                <Text style={styles.optionText}>Change Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={handleSignOut}>
                <Text style={styles.optionText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 20,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    userName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    option: {
        backgroundColor: PRIMARY_TEAL,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center",
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Settings;
