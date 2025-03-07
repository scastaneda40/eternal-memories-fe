import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { supabase } from '../constants/supabaseClient';

const EditCapsule = ({ navigation, route }) => {
  const { capsuleDetails } = route.params || {};
  const [mediaFiles, setMediaFiles] = useState([]);
  const [deletedMedia, setDeletedMedia] = useState([]);

  useEffect(() => {
    if (capsuleDetails?.id) {
      fetchMediaFiles();
    }
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('capsule_id', capsuleDetails.id);

      if (error) {
        console.error('Error fetching media files:', error.message);
        return;
      }

      setMediaFiles(data || []);
    } catch (err) {
      console.error('Error fetching media files:', err.message);
    }
  };

  const handlePickMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
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
          isNew: true,
        },
      ]);
    }
  };

  const handleDeleteMedia = (id) => {
    const mediaToDelete = mediaFiles.find(
      (media) => media.id === id || media.uri === id
    );

    if (!mediaToDelete) {
      console.error('Media not found for deletion.');
      return;
    }

    if (!mediaToDelete.isNew) {
      setDeletedMedia((prev) => [...prev, id]);
    }

    setMediaFiles((prev) =>
      prev.filter((media) => media.id !== id && media.uri !== id)
    );
  };

  const handleUpdate = async () => {
    try {
      // Update capsule details
      const { error: capsuleError } = await supabase
        .from('capsules')
        .update({
          title: capsuleDetails.title,
          description: capsuleDetails.description,
          release_date: capsuleDetails.release_date,
        })
        .eq('id', capsuleDetails.id);

      if (capsuleError) {
        console.error('Error updating capsule:', capsuleError.message);
        throw capsuleError;
      }

      // Delete media marked for deletion
      for (const id of deletedMedia) {
        const { error: deleteError } = await supabase
          .from('media')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting media:', deleteError.message);
          throw deleteError;
        }
      }

      // Upload new media
      for (const media of mediaFiles.filter((media) => media.isNew)) {
        const publicUrl = await uploadToSupabase(media, 'media');
        const typeId =
          media.type === 'image'
            ? 'fd0836ed-95ee-4182-a14c-768c5b872660'
            : '8b086244-fa6b-4f1d-8576-4642fe3bc097';

        const { error: insertError } = await supabase
          .from('media')
          .insert([
            { capsule_id: capsuleDetails.id, type_id: typeId, url: publicUrl },
          ]);

        if (insertError) {
          console.error('Error uploading media:', insertError.message);
          throw insertError;
        }
      }

      Alert.alert('Success', 'Capsule updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating capsule and media:', error.message);
      Alert.alert('Error', 'Failed to update capsule.');
    }
  };

  const uploadToSupabase = async (file, folder = 'media') => {
    const { uri } = file;
    const fileName = `${Date.now()}_${uri.split('/').pop()}`;
    const filePath = `${folder}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('eternal-moment-uploads')
        .upload(filePath, { uri, type: 'multipart/form-data' });

      if (error) throw new Error(`Supabase upload error: ${error.message}`);

      const { data: publicData, error: publicUrlError } = supabase.storage
        .from('eternal-moment-uploads')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        throw new Error(
          `Error retrieving public URL: ${publicUrlError.message}`
        );
      }

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error uploading file to Supabase:', error);
      throw error;
    }
  };

  if (!capsuleDetails || !capsuleDetails.id) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: Capsule details not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Capsule</Text>
      <Button title="Add Photos/Videos" onPress={handlePickMedia} />
      <Text style={styles.sectionTitle}>Selected Media</Text>
      <FlatList
        horizontal
        data={mediaFiles}
        keyExtractor={(item, index) => `${item.id || item.uri}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.mediaItem}>
            {item.type === 'image' ? (
              <Image
                source={{ uri: item.uri || item.url }}
                style={styles.mediaPreview}
              />
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
      <Button title="Update Capsule" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  mediaPreview: { width: 100, height: 100, marginRight: 10 },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    paddingHorizontal: 5,
  },
  removeButtonText: { color: '#fff', fontSize: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default EditCapsule;
