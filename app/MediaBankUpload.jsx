import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../constants/supabaseClient";
import Toast from "react-native-toast-message";
import { useUser } from "../constants/UserContext";

const MediaBankUpload = () => {
  const { userId } = useUser(); // Get user_id from context
  const [mediaBank, setMediaBank] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null); // For media preview in modal
  const [modalVisible, setModalVisible] = useState(false); // For upload modal
  const [newMediaName, setNewMediaName] = useState(""); // Name for new media
  const [pickedMedia, setPickedMedia] = useState(null); // Picked media from device
  const [loading, setLoading] = useState(false); // Loading indicator

  // Fetch media from the Media Bank
  const fetchMediaBank = async () => {
    try {
      const { data, error } = await supabase.from("media_bank").select("*");
      if (error) {
        console.error("Error fetching media:", error.message);
      } else {
        setMediaBank(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching media:", err);
    }
  };

  useEffect(() => {
    fetchMediaBank();
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      setPickedMedia(file);
    }
  };

  const uploadMedia = async () => {
    if (!newMediaName || !pickedMedia) {
      alert("Please provide a name and select media.");
      return;
    }
  
    setLoading(true);
  
    try {
      const fileName = `media-${Date.now()}.jpg`;
  
      // Prepare the file for upload
      const file = {
        uri: pickedMedia.uri,
        name: fileName,
        type: "image/jpeg",
      };
  
      // Upload the file to the bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media_bank")
        .upload(fileName, file);
  
      if (uploadError) {
        console.error("Error uploading media:", uploadError.message);
        setLoading(false);
        return;
      }
  
      // Generate a public URL for the uploaded file
      const { data: publicURLData, error: publicURLError } = supabase.storage
        .from("media_bank")
        .getPublicUrl(fileName);
  
      if (publicURLError) {
        console.error("Error generating public URL:", publicURLError.message);
        setLoading(false);
        return;
      }
  
      const publicURL = publicURLData.publicUrl;
      console.log("Generated Public URL:", publicURL);
  
      // Insert metadata into the `media_bank` table
      const typeId = "fd0836ed-95ee-4182-a14c-768c5b872660"; // Photo type_id
      const { data, error: insertError } = await supabase.from("media_bank").insert([
        {
          user_id: userId,
          url: publicURL,
          type_id: typeId,
          name: newMediaName,
        },
      ]);
  
      if (insertError) {
        console.error("Error inserting into media_bank table:", insertError.message);
        setLoading(false);
        return;
      }
  
      console.log("Media successfully added to database:", data);
  
      // Show success toast
      Toast.show({
        type: "success",
        text1: "Upload Successful!",
      });
  
      // Refresh media gallery
      fetchMediaBank();
  
      // Reset form and close modal
      setNewMediaName("");
      setPickedMedia(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Unexpected upload error:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedMedia(item)}>
      <Image source={{ uri: item.url }} style={styles.mediaImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Bank</Text>
      <Button title="Add Media" onPress={() => setModalVisible(true)} />

      {/* Media Gallery */}
      <Text style={styles.subtitle}>Media Gallery</Text>
      <FlatList
        data={mediaBank}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMediaItem}
        numColumns={3}
        contentContainerStyle={styles.gallery}
      />

      {/* Modal for Adding Media */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Media</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Media Name"
              value={newMediaName}
              onChangeText={setNewMediaName}
            />
            <Button title="Pick Media" onPress={pickMedia} />
            {pickedMedia && (
              <Image source={{ uri: pickedMedia.uri }} style={styles.previewImage} />
            )}
            {loading ? (
              <ActivityIndicator size="large" color="#19747E" />
            ) : (
              <View style={styles.modalButtons}>
                <Button title="Upload" onPress={uploadMedia} />
                <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Toast />


      {/* Modal for Full-Screen Media View */}
      {selectedMedia && (
        <Modal visible={true} transparent={true} onRequestClose={() => setSelectedMedia(null)}>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedMedia.url }} style={styles.fullscreenImage} />
            <Text style={styles.mediaName}>{selectedMedia.name}</Text>
            <TouchableOpacity onPress={() => setSelectedMedia(null)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, marginVertical: 10, borderRadius: 5, width: "80%" },
  gallery: { justifyContent: "space-between" },
  mediaImage: { width: 100, height: 100, margin: 5, borderRadius: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  previewImage: { width: 150, height: 150, marginVertical: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  fullscreenImage: { width: "90%", height: "70%", borderRadius: 10 },
  mediaName: { color: "#fff", fontSize: 18, marginVertical: 10 },
  closeButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    width: 100,
  },
  closeButtonText: { color: "#000", fontSize: 16 },
});

export default MediaBankUpload;



