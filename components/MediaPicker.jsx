import React, { useState, useEffect } from "react";
import { View, FlatList, Image, TouchableOpacity, Button, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../constants/supabaseClient";

const MediaPicker = ({ onMediaSelect }) => {
    const [mediaBank, setMediaBank] = useState([]);

    useEffect(() => {
        // Fetch media from the Media Bank
        const fetchMediaBank = async () => {
            const { data, error } = await supabase
                .from("media_bank")
                .select("*");
            if (error) console.error("Error fetching media:", error.message);
            else setMediaBank(data);
        };

        fetchMediaBank();
    }, []);

    const uploadMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.cancelled) {
            const { uri } = result;

            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from("media")
                .upload(`media/${Date.now()}`, {
                    uri,
                    name: `media-${Date.now()}`,
                    type: "image/jpeg",
                });

            if (error) {
                console.error("Error uploading media:", error.message);
                return;
            }

            // Save to Media Bank
            const { publicURL } = supabase.storage.from("media").getPublicUrl(data.path);
            const { error: saveError } = await supabase
                .from("media_bank")
                .insert([{ url: publicURL, user_id: "your-user-id" }]);

            if (saveError) console.error("Error saving to media bank:", saveError.message);

            // Refresh Media Bank
            setMediaBank((prev) => [...prev, { url: publicURL }]);
        }
    };

    return (
        <View>
            <FlatList
                data={mediaBank}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onMediaSelect(item)}>
                        <Image source={{ uri: item.url }} style={styles.image} />
                    </TouchableOpacity>
                )}
            />
            <Button title="Upload from Device" onPress={uploadMedia} />
        </View>
    );
};

const styles = StyleSheet.create({
    image: { width: 100, height: 100, margin: 10 },
});

export default MediaPicker;
