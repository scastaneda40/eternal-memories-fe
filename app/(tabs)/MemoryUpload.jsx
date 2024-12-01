import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { supabase } from "../../constants/supabaseClient";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";

const GOOGLE_MAPS_API_KEY = "AIzaSyBILRnNABNjR-C8w8GZYinp_uZBouZJHrc";
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = ({ route }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [isMapVisible, setMapVisible] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef(null);

  const { userId } = useUser();
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
      setFile(result.assets[0]);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const handleMapSearch = async () => {
    if (!searchAddress) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter an address to search." });
      return;
    }

    try {
      const geoResult = await Geocoder.from(searchAddress);
      if (!geoResult.results || geoResult.results.length === 0) {
        Toast.show({ type: "error", text1: "Error", text2: "No results found." });
        return;
      }

      const { lat, lng } = geoResult.results[0].geometry.location;
      setLocation({ latitude: lat, longitude: lng, address: searchAddress });
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Unable to find location." });
    }
  };

  const handleMarkerDrag = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const geoResult = await Geocoder.from(latitude, longitude);
      if (geoResult.results && geoResult.results.length > 0) {
        const newAddress = geoResult.results[0].formatted_address;
        setLocation({ latitude, longitude, address: newAddress });
      } else {
        setLocation({ latitude, longitude, address: "Address not found" });
      }
    } catch (error) {
      console.error("Error reverse geocoding marker position:", error);
      setLocation({ latitude, longitude, address: "Unable to determine address" });
    }
  };

  const handleUpload = async () => {
    if (!title || !tags || !description || !date) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all required fields!" });
      return;
    }

    const memoryData = {
      user_id: userId,
      profile_id: profile.id,
      title,
      tags,
      description,
      actual_date: date.toISOString(),
      location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
      address: location?.address || manualAddress || null,
      file_url: file ? file.uri : null,
    };

    try {
      const { error } = await supabase.from("memories").insert(memoryData);
      if (error) throw error;

      Toast.show({ type: "success", text1: "Success", text2: "Memory uploaded successfully!" });

      setFile(null);
      setTitle("");
      setTags("");
      setDescription("");
      setDate(new Date());
      setLocation(null);
      setManualAddress("");
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "An unexpected error occurred." });
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

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={showDatePicker}>
            <Text style={styles.buttonText}>Select Date</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{date.toDateString()}</Text>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />

          <TouchableOpacity style={[styles.button, styles.neutralButton]} onPress={pickImage}>
            <Text style={styles.buttonText}>Add Media (Optional)</Text>
          </TouchableOpacity>
          {file && <Image source={{ uri: file.uri }} style={styles.memoryImage} />}

          <TouchableOpacity
  style={[styles.button, locationEnabled ? styles.destructiveButton : styles.secondaryButton]}
  onPress={() => setLocationEnabled((prev) => !prev)}
>
  <Text style={styles.buttonText}>
    {locationEnabled ? "Disable Location" : "Enable Location"}
  </Text>
</TouchableOpacity>

{locationEnabled && (
  <>
    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setMapVisible(true)}>
      <Text style={styles.buttonText}>Set Location on Map</Text>
    </TouchableOpacity>
    <TextInput
      placeholder="Enter Address (Optional)"
      value={manualAddress}
      onChangeText={setManualAddress}
      style={styles.input}
    />
    {location?.address && <Text style={styles.addressText}>Selected Address: {location.address}</Text>}
  </>
)}

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload Memory</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={isMapVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TextInput
                placeholder="Enter an address"
                value={searchAddress}
                onChangeText={(text) => setSearchAddress(text)}
                style={styles.searchInput}
              />
              <TouchableOpacity style={[styles.button, styles.destructiveButton]} onPress={handleMapSearch}>
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
            <MapView ref={mapRef} style={{ flex: 1 }} region={region}>
              {location && (
                <Marker
                  draggable
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  onDragEnd={handleMarkerDrag}
                  title="Memory Location"
                />
              )}
            </MapView>
            <TouchableOpacity style={[styles.button, styles.destructiveButton]} onPress={() => setMapVisible(false)}>
              <Text style={styles.buttonText}>Close Map</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
        <Toast />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#333" },
  memoryImage: { width: "100%", height: 200, borderRadius: 10, marginVertical: 15 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, marginVertical: 10, borderRadius: 5 },
  textArea: { height: 100, textAlignVertical: "top" },
  dateText: { fontSize: 16, marginVertical: 10, textAlign: "center", color: "#333" },
  addressText: { fontSize: 14, color: "#555", marginTop: 10 },

  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  primaryButton: { backgroundColor: "#19747E" },
  secondaryButton: { backgroundColor: "#3399CC" },
  destructiveButton: { backgroundColor: "#CC3333" },
  neutralButton: { backgroundColor: "#BBBBBB" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    marginRight: 10,
    borderRadius: 5,
  },
});

export default MemoryUpload;









