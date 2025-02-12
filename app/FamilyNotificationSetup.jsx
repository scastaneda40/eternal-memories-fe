import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, Alert, Image, TouchableOpacity } from "react-native";
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
      const { data: capsule, error } = await supabase
        .from("capsules")
        .select("*")
        .eq("id", capsuleId)
        .single();

      if (error) throw error;

      setCapsuleDetails(capsule);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch capsule details.");
    }
  };

  const fetchContacts = async () => {
    try {
      const userId = user?.id;
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      setContacts(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch contacts.");
    }
  };

  // Dynamically filtered contacts based on preferences
  const filteredContacts = contacts.filter((contact) => {
    if (filterByEmail && !contact.email) return false;
    if (filterByText && !contact.phone) return false;
    return true;
  });

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
  {/* Filters */}
  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
    Notification Preferences
  </Text>

  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
    {/* Email Filter with Circle Outline */}
    <View
      style={{
        width: 36, // Circle size
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#008080", // Outline color
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        backgroundColor: filterByEmail ? "#008080" : "transparent", // Fill circle when checked
      }}
    >
      <Checkbox
        status={filterByEmail ? "checked" : "unchecked"}
        onPress={() => setFilterByEmail(!filterByEmail)}
        color={filterByEmail ? "#ffffff" : "#008080"}
        uncheckedColor="#008080"
        style={{
          alignSelf: "center", // Ensure it's centered horizontally
        }}
      />
    </View>
    <Text>Email</Text>
  </View>

  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
    {/* Text Filter with Circle Outline */}
    <View
      style={{
        width: 36, // Circle size
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#008080",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        backgroundColor: filterByText ? "#008080" : "transparent", // Fill circle when checked
      }}
    >
      <Checkbox
        status={filterByText ? "checked" : "unchecked"}
        onPress={() => setFilterByText(!filterByText)}
        color={filterByText ? "#ffffff" : "#008080"}
        uncheckedColor="#008080"
        style={{
          alignSelf: "center", // Ensure it's centered horizontally
        }}
      />
    </View>
    <Text>Text</Text>
  </View>

  {/* Contacts List */}
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
        {/* Contact Checkbox with Circle Outline */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: "#008080",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
            backgroundColor: selectedContacts.includes(item.id) ? "#008080" : "transparent",
          }}
        >
          <Checkbox
            status={selectedContacts.includes(item.id) ? "checked" : "unchecked"}
            onPress={() => {
              setSelectedContacts((prev) =>
                prev.includes(item.id)
                  ? prev.filter((id) => id !== item.id)
                  : [...prev, item.id]
              );
            }}
            color={selectedContacts.includes(item.id) ? "#ffffff" : "#008080"}
            uncheckedColor="#008080"
            style={{
              alignSelf: "center", // Ensure it's centered horizontally
            }}
          />
        </View>
        <Text style={{ marginLeft: 10 }}>{item.name}</Text>
      </View>
    )}
    ListEmptyComponent={<Text>No contacts available.</Text>}
  />

  {/* Confirm Button */}
  <Button title="Confirm" color="#008080" onPress={handleConfirm} />
</View>
    );  
};

// const styles = {
//   checkboxRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   circle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#008080",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//   },
//   checkboxLabel: {
//     fontSize: 16,
//   },
//   contactRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 5,
//     padding: 10,
//   },
//   contactName: {
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     fontSize: 16,
//     color: "gray",
//   },
// };

export default FamilyNotificationSetup;


