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
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../constants/supabaseClient";
import { useProfile } from "../constants/ProfileContext";
import { useUser } from "../constants/UserContext";

const GOOGLE_MAPS_API_KEY = "AIzaSyBILRnNABNjR-C8w8GZYinp_uZBouZJHrc";
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = ({ route }) => {
  const [media, setMedia] = useState([]);
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
  const navigation = useNavigation();

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
      setMedia((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
  };

  const importMediaFromBank = async () => {
    navigation.navigate("MediaBank", {
      onMediaSelect: (selectedMedia) => {
        setMedia((prev) => [...prev, selectedMedia]);
      },
    });
  };

  const handleUpload = async () => {
    // Upload logic here...
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create a Memory</Text>

          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />

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
          <TouchableOpacity style={[styles.button, styles.neutralButton]} onPress={importMediaFromBank}>
            <Text style={styles.buttonText}>Add from Media Bank</Text>
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
                  <Image source={{ uri: item.uri || item.file_url }} style={styles.mediaImage} />
                </View>
              )}
            />
          )}

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpload}>
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











