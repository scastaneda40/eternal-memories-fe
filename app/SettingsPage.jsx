import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    Switch, 
    ScrollView, 
    Modal,
    Button
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useUser } from "../constants/UserContext";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../constants/supabaseClient"; // Ensure your Supabase client is set up
import { useNavigation } from "@react-navigation/native";

const SettingsPage = () => {
  const navigation = useNavigation();
  const [isNotificationEnabled, setNotificationEnabled] = React.useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();
  
      if (!error && data) {
        setUser(data);
      }
    };
  
    fetchUser();
  }, [user?.avatar_url]);
  

  const openImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow cropping
      aspect: [1, 1], // Crop to a square
      quality: 1, // Full quality
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  
  const uploadImage = async () => {
    if (!selectedImage) return;
  
    try {
      setIsUploading(true);
  
      // Upload image to Supabase Storage
      const fileName = `avatars/${user.id}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, {
          uri: selectedImage,
          type: "image/jpeg",
          name: fileName,
        });
  
      if (error) throw error;
  
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
  
      const avatarUrl = publicUrlData.publicUrl;
  
      // Update user in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
  
      if (updateError) throw updateError;
  
      // Update local user context
      setUser((prevUser) => {
        const updatedUser = { ...prevUser, avatar_url: avatarUrl };
        console.log("Updated user context:", updatedUser);
        return updatedUser;
      });
  
      setModalVisible(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const toggleSwitch = () => setNotificationEnabled(!isNotificationEnabled);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      {console.log("avatar url being used in image", user?.avatar_url)}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
  source={{
    uri: user?.avatar_url ? `${user.avatar_url}?timestamp=${new Date().getTime()}` : "https://via.placeholder.com/150",
  }}
  style={styles.profileImage}
/>

        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.pencilIcon}>
          <Icon name="edit-2" size={18} color="#19747E" />
        </TouchableOpacity>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Manage Profile</Text>
          <Text style={styles.settingIcon}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity       
        onPress={() => navigation.navigate("ContactsScreen")} // Navigate to ContactsScreen
        style={styles.settingItem}>
          <Text style={styles.settingText}>My Contacts</Text>
          <Text style={styles.settingIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notification</Text>
          <Switch
            trackColor={{ false: "#d3d3d3", true: "#19747E" }}
            thumbColor={isNotificationEnabled ? "#fff" : "#f4f4f4"}
            ios_backgroundColor="#d3d3d3"
            onValueChange={toggleSwitch}
            value={isNotificationEnabled}
          />
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Help</Text>
          <Text style={styles.settingIcon}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Rate Us</Text>
          <Text style={styles.settingIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}
  >
    <View
      style={{
        width: 320,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 20,
          color: "#333",
        }}
      >
        Update Profile Picture
      </Text>

      {selectedImage ? (
        <Image
          source={{ uri: selectedImage }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#19747E",
          }}
        />
      ) : null}

      <TouchableOpacity
        style={{
          width: "90%",
          paddingVertical: 12,
          backgroundColor: "#19747E", // Teal
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 15,
        }}
        onPress={openImagePicker}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Choose Image
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          width: "90%",
          paddingVertical: 12,
          backgroundColor: isUploading || !selectedImage ? "#d3d3d3" : "#F8A833", // Muted gold
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 15,
        }}
        onPress={uploadImage}
        disabled={isUploading || !selectedImage}
      >
        <Text
          style={{
            color: isUploading || !selectedImage ? "#888" : "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          width: "90%",
          paddingVertical: 12,
          backgroundColor: "#FF5A5F", // Distinct red for cancel
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={() => setModalVisible(false)}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>




    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  pencilIcon: {
    position: "absolute",
    right: 15,
    top: 10,
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#19747E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  settingsList: {
    width: "100%",
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingIcon: {
    fontSize: 20,
    color: "#333",
  },
  logoutButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#19747E",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingsPage;
