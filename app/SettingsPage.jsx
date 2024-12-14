import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useUser } from "../constants/UserContext";

const SettingsPage = () => {
  const [isNotificationEnabled, setNotificationEnabled] = React.useState(false);
  const { user } = useUser();

  const toggleSwitch = () => setNotificationEnabled(!isNotificationEnabled);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
        <TouchableOpacity style={styles.pencilIcon}>
          <Icon name="edit-2" size={18} color="#19747E" />
        </TouchableOpacity>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Manage Profile</Text>
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
    right: 5,
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
