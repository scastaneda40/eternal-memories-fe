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
      const notifications = selectedContacts.map((contactId) => ({
        capsule_id: capsuleId,
        contact_id: contactId,
        notification_type: filterByEmail && filterByText ? "both" : filterByEmail ? "email" : "text",
      }));

      const { error } = await supabase.from("notifications").insert(notifications);

      if (error) {
        console.error("Error saving notifications:", error.message);
        Alert.alert("Error", "Failed to configure notifications.");
        return;
      }

      Alert.alert("Success", "Family notifications configured!");
      navigation.goBack(); // Return to the previous screen
    } catch (error) {
      console.error("Unexpected error saving notifications:", error.message);
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
        />
        <Text style={{ marginRight: 20 }}>Email</Text>
        <Checkbox
          status={filterByText ? "checked" : "unchecked"}
          onPress={() => setFilterByText(!filterByText)}
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
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
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
      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
};

export default FamilyNotificationSetup;

