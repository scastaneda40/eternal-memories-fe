import React, { useState } from "react";
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
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import Carousel from "react-native-reanimated-carousel";
import { useUser } from "../constants/UserContext";
import { useProfile } from "../constants/ProfileContext";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const GOOGLE_MAPS_API_KEY = "AIzaSyBILRnNABNjR-C8w8GZYinp_uZBouZJHrc";
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });
  const [manualAddress, setManualAddress] = useState("None");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [media, setMedia] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { user } = useUser();
  const { profile: globalProfile } = useProfile();
  const navigation = useNavigation();

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const formattedAddress = response.results[0].formatted_address;
      setManualAddress(formattedAddress);
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const geocode = await Geocoder.from(search);
      const location = geocode.results[0].geometry.location;
      const formattedAddress = geocode.results[0].formatted_address;

      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({
        latitude: location.lat,
        longitude: location.lng,
      });
      setManualAddress(formattedAddress);
    } catch (error) {
      console.error("Error during geocoding:", error);
    }
  };




  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        ...result.assets.map((asset) => ({ uri: asset.uri })),
      ]);
    }
  };

  const handleUpload = async () => {
    // Check for missing fields

    console.log("User:", user);
    console.log("Global Profile:", globalProfile);
    if (!user?.id) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "User ID is missing. Please log in again.",
      });
      return;
    }
  
    if (!globalProfile?.id) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "Profile ID is missing. Please select a profile.",
      });
      return;
    }
  
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "Title is required.",
      });
      return;
    }
  
    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "Description is required.",
      });
      return;
    }
  
    if (media.length === 0) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: "At least one media file is required.",
      });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("profile_id", globalProfile.id);
      formData.append("title", title.trim());
      formData.append("tags", tags.trim());
      formData.append("description", description.trim());
      formData.append("actual_date", date.toISOString());
      formData.append("address", manualAddress || "");
      formData.append(
        "location",
        JSON.stringify({ latitude: marker.latitude, longitude: marker.longitude })
      );
  
      // Add media files to FormData
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
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (!response.ok) throw new Error("Failed to upload memory");
  
      Toast.show({ type: "success", text1: "Success", text2: "Memory uploaded!" });
      navigation.goBack();
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({ type: "error", text1: "Upload Failed", text2: error.message });
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a Memory</Text>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setDatePickerVisibility(true)}>
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
        <TouchableOpacity style={[styles.button, styles.neutralButton]} onPress={pickImage}>
          <Text style={styles.buttonText}>Import Media</Text>
        </TouchableOpacity>
        {media.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              renderItem={({ item }) => (
                <View style={styles.carouselItem}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                </View>
              )}
            />
          </View>
        )}
        <Text style={styles.addressText}>Selected Address: {manualAddress}</Text>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setIsMapVisible(true)}>
          <Text style={styles.buttonText}>Select Address</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpload}>
          <Text style={styles.buttonText}>Upload Memory</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={isMapVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for a location"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          <MapView style={styles.map} region={region} onPress={handleMapPress}>
            <Marker coordinate={marker} />
          </MapView>
          <View style={styles.footer}>
  <TouchableOpacity
    style={[styles.button, !manualAddress && styles.disabledButton]}
    onPress={() => setIsMapVisible(false)}
    disabled={!manualAddress} // Disable button if no address is selected
  >
    <Text style={styles.buttonText}>Confirm Location</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.cancelButton}
    onPress={() => setIsMapVisible(false)}
  >
    <Text style={styles.cancelButtonText}>Cancel</Text>
  </TouchableOpacity>
</View>
        </SafeAreaView>
      </Modal>
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12, // Match button height
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#19747E",
    paddingVertical: 15, // Consistent vertical padding
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Ensure equal width for both buttons
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    justifyContent: "space-between", // Distribute space evenly
    padding: 10,
    backgroundColor: "#f4f4f4",
  },
  searchButton: {
    backgroundColor: "#19747E",
    paddingHorizontal: 15,
    paddingVertical: 13, // Match input height
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: "auto", // Ensure height matches dynamically
    marginLeft: 10,
  },  
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row", // Align buttons horizontally
    justifyContent: "space-between", // Space out the buttons
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensures vertical alignment of both buttons
    marginTop: 10,
    gap: 10, // Space between the buttons
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  cancelButton: {
    backgroundColor: "#fff",
    padding: 15, // Match Confirm Location button padding
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  neutralButton: {
    backgroundColor: "#BBBBBB", // Neutral grey color
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  carouselContainer: {
    justifyContent: 'center', // Centers content vertically (useful if container is tall)
    alignItems: 'center', // Centers content horizontally
    marginVertical: 20, // Add spacing above and below the carousel
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    overflow: 'hidden',
    width: 300,
    height: 200,
  }, 
   mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

});

export default MemoryUpload;