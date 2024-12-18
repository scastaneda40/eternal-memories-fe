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

  useEffect(() => {
    if (isMediaBankModalVisible) {
      fetchMediaBank();
    }
  }, [isMediaBankModalVisible]);

  const handleSubmit = () => {
    if (!title || !releaseDate || !userId || !profile?.id) {
      Alert.alert("Validation Error", "All fields, including a profile, are required.");
      return;
    }

    console.log("Capsule Data:", {
      title,
      description,
      release_date: releaseDate.toISOString(),
      privacy,
      media,
    });

    Alert.alert("Capsule Created!", "Your capsule has been successfully created.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
      <ScrollView>
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

        <Text style={{ fontSize: 16, marginVertical: 8 }}>Privacy</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
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

        {/* Media Carousel */}
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

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#19747E",
            padding: 15,
            borderRadius: 5,
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Create Capsule</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Media Bank Modal */}
      <Modal
        visible={isMediaBankModalVisible}
        animationType="slide"
        onRequestClose={() => setMediaBankModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
            Select Media from Media Bank
          </Text>

          {isLoading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
          ) : (
            <FlatList
              data={mediaBank}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = media.some((mediaItem) => mediaItem.uri === item.url);
                return (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      margin: 5,
                      aspectRatio: 1,
                      maxWidth: "30%",
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? "#19747E" : "transparent",
                      position: "relative",
                    }}
                    onPress={() => handleSelectFromMediaBank(item)}
                  >
                    {item.media_type === "video" ? (
                      <>
                        <Video
                          source={{ uri: item.url }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                        <View
                          style={{
                            position: "absolute",
                            top: "40%",
                            left: "40%",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            borderRadius: 20,
                            padding: 5,
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 16 }}>▶</Text>
                        </View>
                      </>
                    ) : (
                      <Image
                        source={{ uri: item.url }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    )}
                    {isSelected && (
                      <View
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "#19747E",
                          borderRadius: 12,
                          width: 24,
                          height: 24,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 16 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              numColumns={3}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
          <Button title="Close" onPress={() => setMediaBankModalVisible(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateCapsule;



