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
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Mapping file types to type_id values
const typeMapping = {
  image: "fd0836ed-95ee-4182-a14c-768c5b872660", // Photo
  video: "8b086244-fa6b-4f1d-8576-4642fe3bc097", // Video
  text: "73145e1c-472c-49db-a348-3f718867080c",  // Text
};

const CapsuleReview = ({ route, navigation }) => {
  const { capsuleDetails, mediaFiles } = route.params || {};
  const [loading, setLoading] = useState(false);

  if (!capsuleDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: Capsule details not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const uploadToSupabase = async (file, folder = "capsules") => {
    const { uri } = file;
    const fileName = `${Date.now()}_${uri.split("/").pop()}`;
    const filePath = `${folder}/${fileName}`;

    try {
      console.log("Uploading file to Supabase with path:", filePath);

      const { data, error } = await supabase.storage
        .from("eternal-moment-uploads") // Bucket name
        .upload(filePath, { uri, type: "multipart/form-data" });

      if (error) throw new Error(`Supabase upload error: ${error.message}`);

      // Retrieve public URL
      const { data: publicData, error: publicUrlError } = supabase.storage
        .from("eternal-moment-uploads")
        .getPublicUrl(filePath);

      if (publicUrlError) {
        throw new Error(`Error retrieving public URL: ${publicUrlError.message}`);
      }

      console.log("Public URL retrieved:", publicData.publicUrl);
      return publicData.publicUrl;
    } catch (error) {
      console.error("Error uploading file to Supabase:", error);
      throw error;
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data: capsuleData, error: capsuleError } = await supabase
        .from("capsules")
        .insert([
          {
            title: capsuleDetails.title,
            description: capsuleDetails.description,
            release_date: capsuleDetails.release_date,
            privacy_id: capsuleDetails.privacy_id,
            user_id: capsuleDetails.user_id,
            profile_id: capsuleDetails.profile_id, // Add profile_id
          },
        ])
        .select()
        .single();
  
      if (capsuleError) throw new Error(capsuleError.message);
  
      for (const file of mediaFiles) {
        const publicUrl = await uploadToSupabase(file, "media");
        const typeId = typeMapping[file.type] || typeMapping.text;
  
        await supabase.from("media").insert([
          { capsule_id: capsuleData.id, type_id: typeId, url: publicUrl },
        ]);
      }
  
      Alert.alert("Success", "Capsule saved!");
      navigation.navigate("MainTabs");
    } catch (error) {
      Alert.alert("Error", "Failed to save capsule.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = () => {
    navigation.navigate("AddMedia", { capsuleDetails, mediaFiles });
  };

  return (
    <View style={styles.container}>
      {/* Capsule Details */}
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
          {new Date(capsuleDetails.release_date).toDateString()}
        </Text>
        <Text style={styles.detailItem}>
          <Text style={styles.label}>Privacy:</Text> {capsuleDetails.privacy_level}
        </Text>
      </View>

      {/* Media Preview */}
      <View style={styles.mediaContainer}>
        <Text style={styles.sectionTitle}>Media Preview</Text>
        <FlatList
          horizontal
          data={mediaFiles}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.mediaItem}>
              {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
              ) : (
                <Video
                  source={{ uri: item.uri }}
                  style={styles.mediaPreview}
                  useNativeControls
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={handleEdit} />
        <Button
          title={loading ? "Saving..." : "Confirm"}
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
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CapsuleReview;




