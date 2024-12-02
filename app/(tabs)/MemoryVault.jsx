import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";
import { useNavigation } from "@react-navigation/native";

const MemoryVault = () => {
  const [memories, setMemories] = useState([]);
  const { userId } = useUser(); // Get the user_id from context
  const { profile } = useProfile(); // Get the profile from context
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMemories = async () => {
      if (!profile || !userId) {
        console.error("Profile or user ID is missing");
        return;
      }

      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId) // Filter by user_id
        .eq("profile_id", profile.id) // Filter by profile_id
        .order("created_at", { ascending: false }); // Sort by most recent

      if (error) {
        console.error("Error fetching memories:", error.message);
      } else {
        setMemories(data);
      }
    };

    fetchMemories();
  }, [userId, profile]); // Re-run if userId or profile changes

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options); // Localized date
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const renderMemory = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("MemoryDetail", { memory: item })} // Pass memory data
      style={styles.memoryContainer}
    >
      <Image source={{ uri: item.file_url }} style={styles.memoryImage} />
      <Text style={styles.memoryTitle}>{item.title || "Untitled Memory"}</Text>
      <Text style={styles.memoryDate}>{formatDate(item.actual_date)}</Text>
      <Text numberOfLines={2} style={styles.memoryDescription}>
        {item.description || "No description provided."}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.mapButton]}
        onPress={() => navigation.navigate("VaultMap", { memories: memories || [] })}
      >
        <Text style={styles.buttonText}>View Map</Text>
      </TouchableOpacity>
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMemory}
        contentContainerStyle={styles.listContent} // Style for padding/margin
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  memoryContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  memoryImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  memoryDate: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 5,
  },
  memoryDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#19747E",
    padding: 12,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MemoryVault;







       


