import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../constants/ProfileContext";
import { useUser } from "../constants/UserContext";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = ({ route }) => {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const navigation = useNavigation();

  const { user } = useUser();
  const { profile: globalProfile } = useProfile();
  const passedProfile = route?.params?.profile;
  const profile = passedProfile || globalProfile;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setMedia((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
  };

  const handleUpload = async () => {
    if (!user || !user.id) {
      Toast.show({
        type: "error",
        text1: "User not authenticated",
        text2: "Please sign in to upload memories.",
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
    formData.append("user_id", user.id);
    formData.append("profile_id", profile?.id);
    formData.append("title", title);
    formData.append("tags", tags);
    formData.append("description", description);
    formData.append("actual_date", date.toISOString());
    if (location) {
      formData.append("location", JSON.stringify(location));
    }
    formData.append("address", manualAddress);

    media.forEach((item) => {
      const fileName = item.uri.split("/").pop();
      const fileType = fileName.split(".").pop();
      formData.append("file", {
        uri: item.uri,
        name: fileName,
        type: `image/${fileType}`,
      });
    });

    try {
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

      navigation.goBack();
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create a Memory</Text>

          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

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
            multiline
            numberOfLines={4}
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
            <Text style={styles.buttonText}>Import Media</Text>
          </TouchableOpacity>

          {media.length > 0 && (
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              scrollAnimationDuration={1000}
              renderItem={({ item }) => (
                <View style={styles.carouselItem}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                </View>
              )}
            />
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, marginVertical: 10, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: "top" },
  button: { padding: 12, borderRadius: 5, alignItems: "center", marginVertical: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  primaryButton: { backgroundColor: "#19747E" },
  neutralButton: { backgroundColor: "#BBBBBB" },
  mediaImage: { width: "100%", height: 150, borderRadius: 10 },
  carouselItem: { marginHorizontal: 10 },
});

export default MemoryUpload;











