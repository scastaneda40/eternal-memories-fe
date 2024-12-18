import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  SafeAreaView,
  FlatList,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker";
import Carousel from "react-native-reanimated-carousel";
import { useUser } from "../constants/UserContext";
import { useProfile } from "../constants/ProfileContext";
import { supabase } from "../constants/supabaseClient";
import { Video } from "expo-av";

const CreateCapsule = () => {
  const { user } = useUser();
  const { profile } = useProfile();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [privacy, setPrivacy] = useState("private");
  const [media, setMedia] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isMediaBankModalVisible, setMediaBankModalVisible] = useState(false);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [mediaBank, setMediaBank] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const userId = user?.id;

  const privacyLevels = {
    private: "Private",
    family: "Family",
    public: "Public",
  };

  const fetchMediaBank = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("media_bank")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching media bank:", error.message);
      } else {
        setMediaBank(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching media bank:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        ...result.assets.map((asset) => ({
          uri: asset.uri,
          media_type: asset.type,
        })),
      ]);
    }
  };

  const handleSelectFromMediaBank = (item) => {
    const isSelected = media.some((mediaItem) => mediaItem.uri === item.url);
    if (isSelected) {
      setMedia((prev) => prev.filter((mediaItem) => mediaItem.uri !== item.url));
    } else {
      setMedia((prev) => [...prev, { uri: item.url, media_type: item.media_type }]);
    }
  };

  const handleSubmit = () => {
    console.log("Final Capsule Data:", {
      title,
      description,
      release_date: releaseDate.toISOString(),
      privacy,
      media,
    });

    Alert.alert("Capsule Created!", "Your capsule has been successfully created.");
    setReviewModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
      <ScrollView>
        {/* Input Fields */}
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Title</Text>
        <TextInput
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: "#ccc",
          }}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={{ fontSize: 16, marginVertical: 8 }}>Description</Text>
        <TextInput
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: "#ccc",
            height: 100,
          }}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
        />

        <Text style={{ fontSize: 16, marginVertical: 8 }}>Release Date</Text>
        <Button title="Pick Date" onPress={() => setDatePickerVisibility(true)} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setReleaseDate(date);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <Text style={{ fontSize: 14, marginVertical: 8 }}>
          {releaseDate.toDateString()}
        </Text>

        <Text style={{ fontSize: 16, marginVertical: 8 }}>Privacy</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {Object.keys(privacyLevels).map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setPrivacy(level)}
              style={{
                flex: 1,
                backgroundColor: privacy === level ? "#19747E" : "#ccc",
                padding: 10,
                marginHorizontal: 5,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>{privacyLevels[level]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Import Media" onPress={pickImage} />
        <Button
          title="Select From Media Bank"
          onPress={() => setMediaBankModalVisible(true)}
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={{ marginVertical: 20, alignItems: "center" }}>
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              renderItem={({ item }) => (
                <View style={{ width: 300, height: 200 }}>
                  {item.media_type === "video" ? (
                    <Video
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: "100%" }}
                      useNativeControls
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "cover",
                        borderRadius: 8,
                      }}
                    />
                  )}
                </View>
              )}
            />
          </View>
        )}

        {/* Review Button */}
        <TouchableOpacity
          onPress={() => setReviewModalVisible(true)}
          style={{
            backgroundColor: "#19747E",
            padding: 15,
            borderRadius: 5,
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Review Capsule</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            Review Your Capsule
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Title: {title}</Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Description: {description}</Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Release Date: {releaseDate.toDateString()}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Privacy Level: {privacyLevels[privacy]}
          </Text>

          {/* Media Carousel */}
          {media.length > 0 && (
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Carousel
                loop
                width={300}
                height={200}
                data={media}
                renderItem={({ item }) => (
                  <View style={{ width: 300, height: 200 }}>
                    {item.media_type === "video" ? (
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: "100%", height: "100%" }}
                        useNativeControls
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: item.uri }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </View>
                )}
              />
            </View>
          )}

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#19747E",
              padding: 15,
              borderRadius: 5,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>Submit Capsule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setReviewModalVisible(false)}
            style={{
              backgroundColor: "#ccc",
              padding: 15,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#333", fontSize: 16 }}>Back to Edit</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateCapsule;




