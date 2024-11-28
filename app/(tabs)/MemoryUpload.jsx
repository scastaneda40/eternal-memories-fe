import React, { useState, useEffect } from "react";
import {
    View,
    Button,
    Image,
    TextInput,
    Text,
    Alert,
    StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../constants/supabaseClient";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message"; // Import Toast

const MemoryUpload = () => {
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const navigation = useNavigation();

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
                mediaTypes: ["images"],
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
        if (!file) return Toast.show({ type: "error", text1: "Error", text2: "Please select a file!" });
        if (!tags || !description || !date)
            return Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please fill in all fields!",
            });
    
        const filePath = `uploads/${Date.now()}_${file.fileName}`;
    
        try {
            // Upload file to Supabase Storage
            const { data: fileData, error: fileError } = await supabase.storage
                .from("eternal-moment-uploads")
                .upload(filePath, {
                    uri: file.uri,
                    type: file.type,
                    name: file.fileName,
                });
    
            if (fileError) {
                return Toast.show({ type: "error", text1: "Error", text2: "Failed to upload memory." });
            }
    
            // Get the public URL of the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from("eternal-moment-uploads")
                .getPublicUrl(filePath);
    
            const publicUrl = publicUrlData.publicUrl;
    
            // Save metadata to database
            const { data: metadata, error: metadataError } = await supabase
                .from("memories")
                .insert([
                    {
                        file_url: publicUrl,
                        file_name: file.fileName,
                        tags: tags,
                        description: description,
                        actual_date: date,
                    },
                ]);
    
            if (metadataError) {
                return Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to save memory metadata.",
                });
            }
    
            // Show success message
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Memory uploaded successfully!",
            });
    
            // Delay navigation to Memory Vault to allow the toast to display
            setTimeout(() => {
                navigation.navigate("MemoryVault");
            }, 1500); // Delay navigation by 1.5 seconds
        } catch (error) {
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

