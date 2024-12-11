import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import Geocoder from "react-native-geocoding";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";

const GOOGLE_MAPS_API_KEY = "AIzaSyBILRnNABNjR-C8w8GZYinp_uZBouZJHrc"; // Replace with your actual key
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = () => {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [manualAddress, setManualAddress] = useState("None");
  const [location, setLocation] = useState(null);
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
  const [search, setSearch] = useState("");

  // Reverse geocoding to get an address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const formattedAddress = response.results[0].formatted_address;
      setManualAddress(formattedAddress);
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const geocode = await Geocoder.from(search);
      const location = geocode.results[0].geometry.location;
      const formattedAddress = geocode.results[0].formatted_address;

      setRegion({
        ...region,
        latitude: location.lat,
        longitude: location.lng,
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container}>
        {!isMapVisible ? (
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

            <TouchableOpacity
              style={[styles.button, styles.neutralButton]}
              onPress={() => setIsMapVisible(true)}
            >
              <Text style={styles.buttonText}>Select Location</Text>
            </TouchableOpacity>
            <Text style={styles.addressText}>
              Selected Address: {manualAddress || "None"}
            </Text>

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
              onPress={() => Toast.show({ type: "success", text1: "Uploaded" })}
            >
              <Text style={styles.buttonText}>Upload Memory</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <SafeAreaView style={styles.container}>
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
        )}
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
  addressText: { fontSize: 14, color: "#333", marginVertical: 10 },
  mediaImage: { width: "100%", height: 150, borderRadius: 10 },
  carouselItem: { marginHorizontal: 10 },
  searchContainer: { flexDirection: "row", padding: 10, backgroundColor: "#f4f4f4" },
  searchButton: { backgroundColor: "#19747E", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  searchButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  map: { flex: 1 },
  footer: { padding: 10, backgroundColor: "#f9f9f9" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  disabledButton: { backgroundColor: "#aaa" },
  cancelButton: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  cancelButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
});

export default MemoryUpload;
