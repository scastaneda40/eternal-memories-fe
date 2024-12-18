import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from "react-native";
import * as Contacts from "expo-contacts";
import { supabase } from "../constants/supabaseClient";
import { useUser } from "../constants/UserContext";
import { parsePhoneNumberFromString } from "libphonenumber-js";


const ContactsScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [isAddContactModalVisible, setAddContactModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const userId = user?.id;

  const isValidPhoneNumber = (phone) => {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber ? phoneNumber.isValid() : false;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const fetchContacts = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching contacts:", error.message);
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching contacts:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const importContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access contacts was denied.");
        return;
      }

      const { data } = await Contacts.getContactsAsync();
      if (data.length === 0) {
        Alert.alert("No Contacts Found", "No contacts available on your device.");
        return;
      }

      const contactsToSave = data.map((contact) => ({
        name: contact.name,
        email: contact.emails?.[0]?.email || null,
        phone: contact.phoneNumbers?.[0]?.number || null,
      }));

      for (const contact of contactsToSave) {
        if (contact.name) {
          await supabase.from("contacts").upsert({
            user_id: userId,
            ...contact,
          });
        }
      }

      Alert.alert("Import Successful", "Contacts imported successfully!");
      fetchContacts(); // Refresh list
    } catch (error) {
      console.error("Error importing contacts:", error.message);
      Alert.alert("Error", "Failed to import contacts.");
    }
  };

  const addContact = async () => {
    const { name, email, phone } = newContact;
  
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required.");
      return;
    }
  
    if (email && !isValidEmail(email.trim())) {
      Alert.alert("Validation Error", "Invalid email format.");
      return;
    }
  
    if (phone && !isValidPhoneNumber(phone.trim())) {
      Alert.alert("Validation Error", "Invalid phone number format.");
      return;
    }
  
    try {
      const { error } = await supabase.from("contacts").insert({
        user_id: userId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      });
  
      if (error) {
        console.error("Error adding contact:", error.message);
        Alert.alert("Error", "Failed to add contact.");
      } else {
        Alert.alert("Success", "Contact added successfully!");
        setAddContactModalVisible(false);
        setNewContact({ name: "", email: "", phone: "" });
        fetchContacts();
      }
    } catch (error) {
      console.error("Unexpected error adding contact:", error.message);
      Alert.alert("Error", "Failed to add contact.");
    }
  };
  
  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Add a Contact" onPress={() => setAddContactModalVisible(true)} />
      {isLoading ? (
        <ActivityIndicator size="large" color="#19747E" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>{item.email || "No email"}</Text>
              <Text>{item.phone || "No phone"}</Text>
            </View>
          )}
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={isAddContactModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Add a Contact
          </Text>

          <TextInput
            placeholder="Name"
            value={newContact.name}
            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Email"
            value={newContact.email}
            onChangeText={(text) => setNewContact({ ...newContact, email: text })}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Phone"
            value={newContact.phone}
            onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <Button title="Add Contact" onPress={addContact} />
          <Button
            title="Import Contacts from Phone"
            onPress={importContacts}
            style={{ marginTop: 10 }}
          />
          <Button
            title="Cancel"
            onPress={() => setAddContactModalVisible(false)}
            style={{ marginTop: 10 }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ContactsScreen;
