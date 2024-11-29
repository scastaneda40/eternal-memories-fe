import React, { useState, useEffect } from "react";
import {
    View,
    Button,
    Image,
    TextInput,
    Alert,
    StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";

const MemoryUpload = ({ route }) => {
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const { userId } = useUser();
    const { profile: globalProfile } = useProfile();
    const passedProfile = route?.params?.profile;

    // Use profile from navigation or fallback to context
    const profile = passedProfile || globalProfile;

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "We need access to your photo library to upload memories."
                );
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            return Toast.show({ type: "error", text1: "Error", text2: "Please select a file!" });
        }
        if (!tags || !description || !date) {
            return Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields!" });
        }
        if (!profile || !profile.id) {
            return Toast.show({ type: "error", text1: "Error", text2: "No valid profile selected!" });
        }

        console.log("Profile in use:", profile);

        const formData = new FormData();
        formData.append("file", {
            uri: file.uri,
            type: file.type || "image/jpeg", // Default to image/jpeg if type is missing
            name: file.fileName || "upload.jpg", // Default name if fileName is missing
        });
        formData.append("user_id", userId);
        formData.append("profile_id", profile.id);
        formData.append("tags", tags);
        formData.append("description", description);
        formData.append("actual_date", date);

        console.log("FormData:", formData);

        try {
            const response = await fetch("http://localhost:5000/upload", 
            {
                method: "POST",
                body: formData,
                // headers: {}, // Let fetch set the correct Content-Type
            });

            if (!response.ok) {
                console.log('the body', response)
                const errorText = await response.text();
                console.error("Upload error details:", errorText);
                throw new Error("Failed to upload memory");
            }

            // Show success message
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Memory uploaded successfully!",
            });

            // Clear form
            setFile(null);
            setTags("");
            setDescription("");
            setDate("");
        } catch (error) {
            console.error("Error uploading memory:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred.",
            });
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Pick a Memory" onPress={pickImage} />
            {file && (
                <Image
                    source={{ uri: file.uri }}
                    style={{ width: 100, height: 100, marginVertical: 10 }}
                />
            )}
            {file && (
                <>
                    <TextInput
                        placeholder="Tags (comma-separated)"
                        value={tags}
                        onChangeText={setTags}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Date (YYYY-MM-DD)"
                        value={date}
                        onChangeText={setDate}
                        style={styles.input}
                    />
                    <Button title="Upload Memory" onPress={handleUpload} />
                </>
            )}
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flex: 1,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
});

export default MemoryUpload;



