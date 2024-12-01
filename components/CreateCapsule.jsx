import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../constants/ProfileContext";
import { useUser } from "../constants/UserContext";

const CreateCapsule = () => {
  const { userId } = useUser();
  const { profile } = useProfile();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [privacy, setPrivacy] = useState("private"); // Default privacy level
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const privacyLevels = {
    private: "7df6a42d-ad9d-456e-b80f-423c7c5dbe67",
    family: "198b8eb9-4761-4f39-a959-699fc0e0859a",
    public: "5c5c24f4-adb5-472d-bc19-0bae23ef458b",
  };

  const handleSubmit = () => {
    if (!title || !releaseDate || !userId || !profile?.id) {
      Alert.alert("Validation Error", "All fields, including a profile, are required.");
      return;
    }

    const privacyId = privacyLevels[privacy];

    navigation.navigate("AddMedia", {
      capsuleDetails: {
        title,
        description,
        release_date: releaseDate.toISOString(),
        user_id: userId,
        privacy_id: privacyId,
        profile_id: profile.id, // Include profile_id from context
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Release Date</Text>
      <Button title="Pick a Date" onPress={() => setDatePickerVisibility(true)} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setReleaseDate(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <Text style={styles.selectedDate}>{releaseDate.toDateString()}</Text>

      <Button title="Next" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  label: { fontSize: 16, marginVertical: 8 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, borderColor: "#ccc" },
  selectedDate: { fontSize: 14, color: "#555", marginVertical: 8 },
});

export default CreateCapsule;


