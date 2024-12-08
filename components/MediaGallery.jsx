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
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../constants/supabaseClient";
import { useUser } from "../constants/UserContext";

const MediaBankGallery = () => {
  const { userId } = useUser();
  const [mediaBank, setMediaBank] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickedMedia, setPickedMedia] = useState(null);
  const [newMediaName, setNewMediaName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMediaBank = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("media_bank").select("*").eq("user_id", userId);
      if (error) {
        console.error("Error fetching media:", error.message);
      } else {
        setMediaBank(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching media:", err);
    } finally {
      setLoading(false);
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

    setUploading(true);

    try {
      const fileName = `media-${Date.now()}.jpg`;
      const file = {
        uri: pickedMedia.uri,
        name: fileName,
        type: "image/jpeg",
      };

      const { error: uploadError } = await supabase.storage
        .from("media_bank")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading media:", uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicURLData, error: publicURLError } = supabase.storage
        .from("media_bank")
        .getPublicUrl(fileName);

      if (publicURLError) {
        console.error("Error generating public URL:", publicURLError.message);
        setUploading(false);
        return;
      }

      const publicURL = publicURLData.publicUrl;
      const typeId = "fd0836ed-95ee-4182-a14c-768c5b872660";

      const { error: insertError } = await supabase.from("media_bank").insert([
        {
          url: publicURL,
          type_id: typeId,
          name: newMediaName,
          user_id: userId,
        },
      ]);

      if (insertError) {
        console.error("Error inserting into media_bank table:", insertError.message);
        setUploading(false);
        return;
      }

      Toast.show({
        type: "success",
        text1: "Upload Successful!",
      });

      fetchMediaBank();
      setNewMediaName("");
      setPickedMedia(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Unexpected upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedMedia(item)}>
      <Image source={{ uri: item.url }} style={styles.mediaImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Toast />
      <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Upload Media</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#19747E" />
      ) : mediaBank.length > 0 ? (
        <FlatList
          data={mediaBank}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMediaItem}
          numColumns={3}
          contentContainerStyle={styles.gallery}
        />
      ) : (
        <Text style={styles.noMediaText}>No media found</Text>
      )}

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
            <TouchableOpacity style={[styles.button, styles.pickButton]} onPress={pickMedia}>
              <Text style={styles.buttonText}>Pick Media</Text>
            </TouchableOpacity>
            {pickedMedia && (
              <Image source={{ uri: pickedMedia.uri }} style={styles.previewImage} />
            )}
            {uploading ? (
              <ActivityIndicator size="large" color="#19747E" />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={uploadMedia}>
                  <Text style={styles.buttonText}>Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => {
                    setModalVisible(false);
                    fetchMediaBank();
                  }}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
{selectedMedia && (
  <Modal visible={true} transparent={true} onRequestClose={() => setSelectedMedia(null)}>
    <View style={styles.modalContainer}>
      <View style={styles.previewModalContent}>
        {/* Display Selected Media Name */}
        <Text style={styles.mediaName}>{selectedMedia.name}</Text>

        {/* Display Selected Media Image */}
        <Image source={{ uri: selectedMedia.url }} style={styles.fullscreenImage} />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.previewCloseButton} // Use the dedicated button style
          onPress={() => setSelectedMedia(null)}
        >
          <Text style={styles.previewCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}


    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    gallery: { justifyContent: "center", alignItems: "center"},
    mediaImage: { width: 100, height: 100, margin: 5, borderRadius: 10 },
    noMediaText: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 20 },
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
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 10,
      marginVertical: 10,
      borderRadius: 5,
      width: "100%",
    },
    previewImage: { width: 150, height: 150, marginVertical: 10, borderRadius: 10 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, width: "100%" },
    modalButton: {
      backgroundColor: "#19747E",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginHorizontal: 5,
    },
    closeButton: { backgroundColor: "#F44336" },
    uploadButton: {
      backgroundColor: "#19747E",
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 20,
      marginVertical: 30,
      alignItems: "center",
      marginTop: 20
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    fullscreenImage: { width: "90%", height: "60%", marginBottom: 15, borderRadius: 10 },
  
    previewModalContent: {
        backgroundColor: "#fff", // Modal background
        padding: 15, // Adjust padding for less space
        borderRadius: 10, // Rounded corners
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
      },
      mediaName: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 5, // Reduce space above and below the title
        marginBottom: 20,
      },
      previewCloseButton: {
        backgroundColor: "#F44336", // Red button background
        padding: 12, // Button padding
        borderRadius: 10,
        alignItems: "center",
        marginTop: 2, // Reduce space between the button and image
        width: "50%", // Adjust button width
        marginTop: 20
      },  
      previewCloseButtonText: {
          color: "#fff"
      }    
  });
  
  
  
export default MediaBankGallery;

