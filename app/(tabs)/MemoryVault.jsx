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

const MemoryVault = () => {
  const [memories, setMemories] = useState([]);
  const { userId } = useUser();
  const { profile } = useProfile();
  const [expandedMemoryId, setExpandedMemoryId] = useState(null);

  useEffect(() => {
    const fetchMemories = async () => {
      if (!profile || !userId) {
        console.error("Profile or user ID is missing");
        return;
      }

      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching memories:", error.message);
      } else {
        setMemories(data);
      }
    };

    fetchMemories();
  }, [userId, profile]);

  const renderMemory = ({ item }) => {
    const isExpanded = expandedMemoryId === item.id;
    const truncatedDescription =
      item.description.length > 100
        ? `${item.description.slice(0, 100)}...`
        : item.description;

    return (
      <View style={styles.memoryContainer}>
        <Image source={{ uri: item.file_url }} style={styles.memoryImage} />
        <Text style={styles.memoryTitle}>{item.title}</Text>
        <Text style={styles.memoryDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.memoryDescription}>
          {isExpanded ? item.description : truncatedDescription}
        </Text>
        {item.description.length > 100 && (
          <TouchableOpacity
            onPress={() =>
              setExpandedMemoryId(isExpanded ? null : item.id)
            }
          >
            <Text style={styles.readMore}>
              {isExpanded ? "Read Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMemory}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  memoryContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  memoryImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    color: "#333",
  },
  memoryDate: {
    fontSize: 12,
    textAlign: "center",
    color: "#777",
    marginBottom: 10,
  },
  memoryDescription: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  readMore: {
    fontSize: 14,
    color: "#19747E", // Deep teal for action links
    textAlign: "right",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default MemoryVault;

