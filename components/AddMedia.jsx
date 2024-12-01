import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

const AddMedia = ({ navigation, route }) => {
  const { capsuleDetails, isEditing = false, mediaFiles: existingMedia = [] } = route.params || {};
  const [mediaFiles, setMediaFiles] = useState([]);

  // Preload existing media files when editing
  useEffect(() => {
    if (isEditing && existingMedia.length > 0) {
      setMediaFiles(existingMedia);
    }
  }, [isEditing, existingMedia]);

  const handlePickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaFiles((prev) => [
        ...prev,
        {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          isNew: true, // Mark as new media
        },
      ]);
    }
  };

  const handleDeleteMedia = (id) => {
    setMediaFiles((prev) => prev.filter((media) => media.id !== id && media.uri !== id));
  };

  const handleDone = () => {
    navigation.navigate("CapsuleReview", { capsuleDetails, mediaFiles });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Media</Text>
      <Button title="Add Photos/Videos" onPress={handlePickMedia} />
      <Text style={styles.sectionTitle}>Selected Media</Text>
      <FlatList
        horizontal
        data={mediaFiles}
        keyExtractor={(item, index) => `${item.id || item.uri}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.mediaItem}>
            {item.type === "image" ? (
              <Image source={{ uri: item.uri || item.url }} style={styles.mediaPreview} />
            ) : (
              <Video
                source={{ uri: item.uri || item.url }}
                style={styles.mediaPreview}
                useNativeControls
              />
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleDeleteMedia(item.id || item.uri)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Done" onPress={handleDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  mediaPreview: { width: 100, height: 100, marginRight: 10 },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 15,
    paddingHorizontal: 5,
  },
  removeButtonText: { color: "#fff", fontSize: 12 },
});

export default AddMedia;
