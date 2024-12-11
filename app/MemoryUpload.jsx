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
  Image
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
  const [location, setLocation] = useState(null);
  const { user } = useUser();
  const { profile: globalProfile } = useProfile();
  const navigation = useNavigation();



  console.log('duh media', media)
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
      setMedia((prev) => [...prev, ...result.assets.map((asset) => ({ uri: asset.uri }))]);
    }
  };

  const selectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allow multiple selections if needed
      quality: 1, // Adjust quality (1 = best quality)
    });
  
    if (!result.canceled) {
      setMedia((prevMedia) => [...prevMedia, ...result.assets.map(asset => ({ uri: asset.uri }))]);
    }
  };
  
  const handleUpload = async () => {
    try {
      console.log("Upload button clicked");
      console.log("Checking user object...");
      console.log("User object before check:", user);
  
      // Check if user exists
      if (!user) {
        Toast.show({
          type: "error",
          text1: "User not authenticated",
          text2: "Please sign in to upload memories.",
        });
        return;
      }
  
      if (!user.id) {
        Toast.show({
          type: "error",
          text1: "Invalid User Data",
          text2: "User ID is missing.",
        });
        return;
      }
  
      console.log("User is authenticated:", user);
  
      // Check if profile exists
      if (!globalProfile) {
        Toast.show({
          type: "error",
          text1: "Profile Missing",
          text2: "Please create a profile before uploading a memory.",
        });
        navigation.navigate("LovedOneProfile");
        return;
      }
  
      if (!globalProfile.id) {
        Toast.show({
          type: "error",
          text1: "Invalid Profile Data",
          text2: "Profile ID is missing.",
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
  
      console.log("Preparing form data...");
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("profile_id", globalProfile.id);
      formData.append("title", title);
      formData.append("tags", tags);
      formData.append("description", description);
      formData.append("actual_date", date.toISOString()); // Use the `date` state
      formData.append("address", manualAddress || "");
      console.log("Marker coordinates:", marker);
      formData.append(
        "location",
        JSON.stringify({
          latitude: marker.latitude,
          longitude: marker.longitude,
        })
      );
  
      console.log("Adding media files...");
      media.forEach((item, index) => {
        const fileName = item.uri.split("/").pop();
        const fileType = fileName.split(".").pop();
        formData.append(`file_${index}`, {
          uri: item.uri,
          name: fileName,
          type: `image/${fileType}`,
        });
      });
  
      console.log("Sending POST request...");
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
      console.log("Memory uploaded successfully!");
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Form Fields */}
        <Text style={styles.title}>Create a Memory</Text>

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
  onPress={selectMedia}
>
  <Text style={styles.buttonText}>Select Media</Text>
</TouchableOpacity>
<TouchableOpacity
          style={[styles.button, styles.neutralButton]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Import Media</Text>
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

        <Text style={styles.addressText}>
          Selected Address: {manualAddress}
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setIsMapVisible(true)}
        >
          <Text style={styles.buttonText}>Select Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpload}
        >
          <Text style={styles.buttonText}>Upload Memory</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Map Modal */}
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
  <Text style={styles.addressText}>
    Selected Address: {manualAddress || "None"}
  </Text>
  <View style={styles.buttonContainer}>
  <TouchableOpacity
    style={[styles.button, !manualAddress && styles.disabledButton]}
    onPress={() => setIsMapVisible(false)}
    disabled={!manualAddress}
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




