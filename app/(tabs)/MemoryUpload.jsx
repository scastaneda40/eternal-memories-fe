import React, { useState, useEffect } from "react";
import {
    View,
    Button,
    Image,
    TextInput,
    Alert,
    StyleSheet,
    Text,
    Modal,
    FlatList,
    TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { supabase } from "../../constants/supabaseClient";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";

const MemoryUpload = ({ route }) => {
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const { userId } = useUser();
    const { profile: globalProfile, setProfile } = useProfile();
    const passedProfile = route?.params?.profile;

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

    useEffect(() => {
        if (!profile) {
            fetchProfiles();
        }
    }, [profile]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from("profile")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching profiles:", error.message);
            } else {
                setProfiles(data || []);
                setModalVisible(true);
            }
        } catch (error) {
            console.error("Unexpected error fetching profiles:", error);
        }
    };

    const selectProfile = (selectedProfile) => {
        setProfile(selectedProfile);
        setModalVisible(false);
    };

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

    const showDatePicker = () => setDatePickerVisibility(true);

    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (selectedDate) => {
        setDate(selectedDate);
        hideDatePicker();
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

        const formData = new FormData();
        formData.append("file", {
            uri: file.uri,
            type: file.type || "image/jpeg",
            name: file.fileName || "upload.jpg",
        });
        formData.append("user_id", userId);
        formData.append("profile_id", profile.id);
        formData.append("tags", tags);
        formData.append("description", description);
        formData.append("actual_date", date.toISOString());

        try {
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload error details:", errorText);
                throw new Error("Failed to upload memory");
            }

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Memory uploaded successfully!",
            });

            setFile(null);
            setTags("");
            setDescription("");
            setDate(new Date());
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
                    style={styles.memoryImage}
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
                        style={[styles.input, styles.textArea]}
                        multiline={true}
                        numberOfLines={4}
                    />
                    <Button title="Select Date" onPress={showDatePicker} />
                    <Text style={styles.dateText}>{date.toDateString()}</Text>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />
                    <Button title="Upload Memory" onPress={handleUpload} />
                </>
            )}
            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select a Profile</Text>
                        <FlatList
                            data={profiles}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.profileItem}
                                    onPress={() => selectProfile(item)}
                                >
                                    <Text style={styles.profileText}>{item.name}</Text>
                                    <Text style={styles.profileTextSmall}>{item.relationship}</Text>
                                </TouchableOpacity>
                            )}
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
    memoryImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    dateText: {
        fontSize: 16,
        marginVertical: 10,
        textAlign: "center",
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
    profileItem: {
        backgroundColor: "#fff",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        alignItems: "center",
    },
    profileText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    profileTextSmall: {
        fontSize: 14,
        color: "#666",
    },
    closeButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
});

export default MemoryUpload;






