import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import { uploadToSupabase } from "../utils/uploadToSupabase";
import { supabase } from "../constants/supabaseClient";


const CapsuleReview = ({ route, navigation }) => {
  const { capsuleDetails, mediaFiles, isEditing = false } = route.params || {};
  const [loading, setLoading] = useState(false);

  if (!capsuleDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: Capsule details not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      console.log("Capsule Details:", capsuleDetails);
      console.log("Media Files:", mediaFiles);
  
      let capsuleId = capsuleDetails.id;
      if (!capsuleId) {
        console.log("Creating new capsule...");
        capsuleId = await createCapsule();
        console.log("Created Capsule ID:", capsuleId);
      }
  
      // Insert media into the database
      const newMedia = mediaFiles.filter((media) => media.isNew);
      const insertedMedia = [];
  
      for (const media of newMedia) {
        const publicUrl = await uploadToSupabase(media, "media");
        const typeId =
          media.type === "image"
            ? "fd0836ed-95ee-4182-a14c-768c5b872660"
            : "8b086244-fa6b-4f1d-8576-4642fe3bc097";
  
        console.log("Inserting media:", { type_id: typeId, url: publicUrl });
  
        const { data, error } = await supabase.from("media").insert([
          { type_id: typeId, url: publicUrl },
        ]).select();
  
        if (error) {
          console.error("Error inserting media:", error);
          throw error;
        }
  
        insertedMedia.push(data[0]);
      }
  
      // Insert into the join table
      for (const media of insertedMedia) {
        const { error } = await supabase.from("capsule_media").insert([
          { capsule_id: capsuleId, media_id: media.id },
        ]);
        if (error) {
          console.error("Error inserting into join table:", error);
          throw error;
        }
      }
  
      Alert.alert("Success", "Capsule created successfully!");
      navigation.navigate("CapsuleTimeline");
    } catch (error) {
      console.error("Error saving capsule:", error);
      Alert.alert("Error", "Failed to save capsule.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const createCapsule = async () => {
    const { data, error } = await supabase
      .from("capsules")
      .insert([
        {
          title: capsuleDetails.title,
          description: capsuleDetails.description,
          release_date: capsuleDetails.release_date,
          privacy_id: capsuleDetails.privacy_id,
          user_id: capsuleDetails.user_id,
          profile_id: capsuleDetails.profile_id,
        },
      ])
      .select(); // Fetch the created capsule's data
  
    if (error) throw error;
    if (!data || !data[0]) {
      console.error("Capsule creation failed:", data);
      throw new Error("Failed to create capsule.");
    }
    return data[0].id; // Return the created capsule ID
  };
  

  const updateCapsule = async () => {
    // Update logic for existing capsules
    const { error } = await supabase
      .from("capsules")
      .update({
        title: capsuleDetails.title,
        description: capsuleDetails.description,
        release_date: capsuleDetails.release_date,
      })
      .eq("id", capsuleDetails.id);
    if (error) throw error;
    console.log("Capsule updated successfully");
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Capsule Details</Text>
        <Text style={styles.detailItem}>
          <Text style={styles.label}>Title:</Text> {capsuleDetails.title}
        </Text>
        <Text style={styles.detailItem}>
          <Text style={styles.label}>Description:</Text> {capsuleDetails.description}
        </Text>
        <Text style={styles.detailItem}>
          <Text style={styles.label}>Release Date:</Text>{" "}
          {new Date(capsuleDetails.release_date).toLocaleString()}
        </Text>
      </View>

      <View style={styles.mediaContainer}>
        <Text style={styles.sectionTitle}>Media Preview</Text>
        <FlatList
          horizontal
          data={mediaFiles}
          keyExtractor={(item, index) => `${item.id || item.uri}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.mediaItem}>
              {item.type === "image" ? (
                <Image source={{ uri: item.url || item.uri }} style={styles.mediaPreview} />
              ) : (
                <Video
                  source={{ uri: item.url || item.uri }}
                  style={styles.mediaPreview}
                  useNativeControls
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? "Update Capsule" : "Submit Capsule"}
          onPress={handleConfirm}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  detailsContainer: { marginBottom: 20 },
  detailItem: { fontSize: 16, marginVertical: 5 },
  label: { fontWeight: "bold" },
  mediaContainer: { marginBottom: 20 },
  mediaItem: { marginRight: 10 },
  mediaPreview: { width: 100, height: 100, borderRadius: 5 },
  buttonContainer: { marginTop: 20 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CapsuleReview;








