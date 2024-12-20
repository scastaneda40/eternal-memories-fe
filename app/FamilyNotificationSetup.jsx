import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, Alert, Image } from "react-native";
import { Checkbox } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../constants/supabaseClient";
import { useUser } from "../constants/UserContext";
import { Video } from "expo-av";

const FamilyNotificationSetup = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();

  const capsuleId = route?.params?.capsuleId;
  console.log("Received capsule ID from route:", capsuleId);
  const [capsuleDetails, setCapsuleDetails] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [filterByEmail, setFilterByEmail] = useState(false);
  const [filterByText, setFilterByText] = useState(false);

  useEffect(() => {
    if (!capsuleId) {
      Alert.alert("Error", "Capsule ID is missing.");
      navigation.goBack();
      return;
    }

    fetchCapsuleDetails();
    fetchContacts();
  }, []);

  const fetchCapsuleDetails = async () => {
    try {
      console.log("Fetching capsule details for ID:", capsuleId);
  
      const { data: capsule, error: capsuleError } = await supabase
        .from("capsules")
        .select("*")
        .eq("id", capsuleId)
        .single();
  
      if (capsuleError) {
        console.error("Error fetching capsule details:", capsuleError.message);
        Alert.alert("Error", "Failed to fetch capsule details.");
        return;
      }
  
      console.log("Fetched capsule details:", capsule);
  
      const { data: capsuleMedia, error: mediaError } = await supabase
        .from("capsule_media")
        .select(`
          media_id,
          media_bank (
            id,
            url,
            name,
            media_type
          )
        `)
        .eq("capsule_id", capsuleId);
  
      if (mediaError) {
        console.error("Error fetching capsule media:", mediaError.message);
        Alert.alert("Error", "Failed to fetch capsule media.");
        return;
      }
  
      console.log("Raw capsule media:", capsuleMedia);
  
      const mediaFiles =
        capsuleMedia?.map((entry) => entry.media_bank).filter(Boolean) || [];
      console.log("Parsed media files:", mediaFiles);
  
      const imageMedia = mediaFiles.find((media) => media.media_type === "photo");
      const videoMedia = mediaFiles.find((media) => media.media_type === "video");
  
      const imageUrl = imageMedia?.url || null;
      const videoUrl = videoMedia?.url || null;
  
      console.log("Extracted image media:", imageMedia);
      console.log("Extracted video media:", videoMedia);
      console.log("Extracted imageUrl:", imageUrl);
      console.log("Extracted videoUrl:", videoUrl);
  
      const capsuleDetailsWithMedia = { ...capsule, imageUrl, videoUrl, mediaFiles };
      console.log("Capsule details with media:", capsuleDetailsWithMedia);
  
      setCapsuleDetails(capsuleDetailsWithMedia);
    } catch (error) {
      console.error("Unexpected error fetching capsule details:", error.message);
      Alert.alert("Error", "Something went wrong.");
    }
  };
  

  const fetchContacts = async () => {
    try {
      const userId = user?.id;
      console.log("Fetching contacts for user ID:", userId);

      if (!userId) {
        Alert.alert("Error", "User ID is not available.");
        return;
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching contacts:", error.message);
        Alert.alert("Error", "Failed to fetch contacts.");
        return;
      }

      console.log("Fetched contacts:", data);
      setContacts(data);
    } catch (error) {
      console.error("Unexpected error fetching contacts:", error.message);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleConfirm = async () => {
    if (!capsuleDetails) {
      Alert.alert("Error", "Capsule details are not available.");
      return;
    }

    console.log("Capsule details at handleConfirm:", capsuleDetails);

    try {
      const selectedContactsInfo = contacts.filter((contact) =>
        selectedContacts.includes(contact.id)
      );

      console.log("Selected contacts for notification:", selectedContactsInfo);

      const notificationType =
        filterByEmail && filterByText
          ? "both"
          : filterByEmail
          ? "email"
          : "text";

      const payload = {
        contacts: selectedContactsInfo,
        notificationType,
        capsule: {
          id: capsuleId,
          title: capsuleDetails.title,
          description: capsuleDetails.description,
          imageUrl: capsuleDetails.imageUrl,
          videoUrl: capsuleDetails.videoUrl,
          detailsPageUrl: `https://yourapp.com/capsules/${capsuleId}`,
        },
      };

      console.log("Payload before sending:", payload);

      const response = await fetch(
        "http://192.168.1.116:5000/api/send-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      console.log("Server response text:", responseText);

      if (!response.ok) {
        try {
          const result = JSON.parse(responseText);
          console.error("Error from server:", result.error);
          Alert.alert("Error", result.error || "Failed to send notifications.");
        } catch (parseError) {
          console.error("Non-JSON error response:", responseText);
          Alert.alert("Error", "Failed to send notifications.");
        }
        return;
      }

      Alert.alert("Success", "Family notifications sent!");
      navigation.goBack();
    } catch (error) {
      console.error("Unexpected error:", error.message);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  if (!capsuleDetails) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading capsule details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Notification Preferences
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Checkbox
          status={filterByEmail ? "checked" : "unchecked"}
          onPress={() => setFilterByEmail(!filterByEmail)}
          color="#008080"
        />
        <Text style={{ marginRight: 20 }}>Email</Text>
        <Checkbox
          status={filterByText ? "checked" : "unchecked"}
          onPress={() => setFilterByText(!filterByText)}
          color="#008080"
        />
        <Text>Text</Text>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Notify Family Members
      </Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <Checkbox
              status={
                selectedContacts.includes(item.id) ? "checked" : "unchecked"
              }
              onPress={() => {
                if (selectedContacts.includes(item.id)) {
                  setSelectedContacts((prev) =>
                    prev.filter((id) => id !== item.id)
                  );
                } else {
                  setSelectedContacts((prev) => [...prev, item.id]);
                }
              }}
              color="#008080"
            />
            <Text style={{ marginLeft: 10, fontSize: 16 }}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 16,
              color: "gray",
            }}
          >
            No contacts available.
          </Text>
        }
      />
      <Button title="Confirm" color="#008080" onPress={handleConfirm} />
    </View>
  );
};

export default FamilyNotificationSetup;


