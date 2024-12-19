import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { Checkbox } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../constants/supabaseClient"; // Adjust path as needed
import { useUser } from "../constants/UserContext";

const FamilyNotificationSetup = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();

  const capsuleId = route?.params?.capsuleId;

  if (!capsuleId) {
    Alert.alert("Error", "Capsule ID is missing.");
    navigation.goBack();
    return null;
  }

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [filterByEmail, setFilterByEmail] = useState(false);
  const [filterByText, setFilterByText] = useState(false);

  useEffect(() => {
    fetchContacts(); // Fetch family contacts from the backend
  }, []);

  const fetchContacts = async () => {
    try {
      const userId = user?.id;

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

      setContacts(data);
    } catch (error) {
      console.error("Unexpected error fetching contacts:", error.message);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filterByEmail && filterByText) {
      return contact.email && contact.phone;
    }
    if (filterByEmail) {
      return contact.email;
    }
    if (filterByText) {
      return contact.phone;
    }
    return true;
  });

  const handleConfirm = async () => {
    try {
      // Get selected contacts info
      const selectedContactsInfo = contacts.filter((contact) =>
        selectedContacts.includes(contact.id)
      );
  
      // Determine notification type
      const notificationType =
        filterByEmail && filterByText
          ? "both"
          : filterByEmail
          ? "email"
          : "text";
  
      // Prepare payload
      const payload = {
        contacts: selectedContactsInfo,
        notificationType,
        capsule: {
          id: capsuleId,
          title: "Family Capsule",
          description: "Discover special memories curated just for you.",
          imageUrl: "https://example.com/path-to-image.jpg", // Replace with dynamic image
          videoUrl: "https://example.com/path-to-video.mp4", // Replace with dynamic video
          detailsPageUrl: "https://yourappdownloadlink.com", // Replace with actual link
        },
      };
  
      // Log payload for debugging
      console.log("Payload:", payload);
  
      // Make API call
      const response = await fetch("http://192.168.1.116:5000/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const responseText = await response.text();
      console.log("Response text:", responseText);
  
      if (!response.ok) {
        try {
          const result = JSON.parse(responseText);
          console.error("Error:", result.error);
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
  
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Notification Preferences
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <Checkbox
          status={filterByEmail ? "checked" : "unchecked"}
          onPress={() => setFilterByEmail(!filterByEmail)}
          color="#008080" // Teal color for the checkbox
        />
        <Text style={{ marginRight: 20 }}>Email</Text>
        <Checkbox
          status={filterByText ? "checked" : "unchecked"}
          onPress={() => setFilterByText(!filterByText)}
          color="#008080" // Teal color for the checkbox
        />
        <Text>Text</Text>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Notify Family Members
      </Text>
      <FlatList
        data={filteredContacts}
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
              status={selectedContacts.includes(item.id) ? "checked" : "unchecked"}
              onPress={() => {
                if (selectedContacts.includes(item.id)) {
                  setSelectedContacts((prev) =>
                    prev.filter((id) => id !== item.id)
                  );
                } else {
                  setSelectedContacts((prev) => [...prev, item.id]);
                }
              }}
              color="#008080" // Teal color for the checkbox
            />
            <Text style={{ marginLeft: 10, fontSize: 16 }}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "gray" }}>
            No contacts available.
          </Text>
        }
      />
      <Button title="Confirm" color="#008080" onPress={handleConfirm} />
    </View>
  );
};

export default FamilyNotificationSetup;

