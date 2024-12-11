import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  Modal,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // Profile Dropdown
import { useUser } from "../constants/UserContext";
import { supabase } from "../constants/supabaseClient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Carousel from "react-native-reanimated-carousel";

const MemoryUpload = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [manualAddress, setManualAddress] = useState("None");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const { user } = useUser();

  const userId = user?.id;

  // Fetch profiles for the dropdown
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching profiles:", error.message);
      } else {
        setProfiles(data);
        if (data.length > 0) {
          setSelectedProfile(data[0].id); // Set the first profile as default
        }
      }
    };

    fetchProfiles();
  }, [userId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setMedia((prev) => [...prev, ...result.assets.map((asset) => ({ uri: asset.uri }))]);
    }
  };

  const handleUpload = async () => {
    try {
      if (!userId) {
        Toast.show({
          type: "error",
          text1: "User Missing",
          text2: "Please sign in to upload a memory.",
        });
        return;
      }

      if (!selectedProfile) {
        Toast.show({
          type: "error",
          text1: "Profile Missing",
          text2: "Please select a profile to upload the memory.",
        });
        return;
      }

      if (!title || !description || media.length === 0) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please provide a title, description, and at least one media file.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("profile_id", selectedProfile);
      formData.append("title", title);
      formData.append("tags", tags);
      formData.append("description", description);
      formData.append("actual_date", date.toISOString());

      media.forEach((item, index) => {
        const fileName = item.uri.split("/").pop();
        const fileType = fileName.split(".").pop();
        formData.append(`file_${index}`, {
          uri: item.uri,
          name: fileName,
          type: `image/${fileType}`,
        });
      });

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload memory.");
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Memory uploaded successfully!",
      });

      setTitle("");
      setTags("");
      setDescription("");
      setMedia([]);
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message || "An error occurred while uploading.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a Memory</Text>

        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Select Profile:</Text>
          <Picker
            selectedValue={selectedProfile}
            onValueChange={(itemValue) => setSelectedProfile(itemValue)}
            style={styles.dropdown}
          >
            {profiles.map((profile) => (
              <Picker.Item
                key={profile.id}
                label={profile.name || "Unnamed Profile"}
                value={profile.id}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(selectedDate) => {
            setDate(selectedDate);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <TouchableOpacity
          style={[styles.button, styles.neutralButton]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Select Media</Text>
        </TouchableOpacity>

        {media.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              scrollAnimationDuration={1000}
              renderItem={({ item }) => (
                <View style={styles.carouselItem}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpload}
        >
          <Text style={styles.buttonText}>Upload Memory</Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#19747E",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  carouselContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  carouselItem: {
    borderRadius: 8,
    overflow: "hidden",
    width: 300,
    height: 200,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
});

export default MemoryUpload;



