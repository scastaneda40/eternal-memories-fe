import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useUser } from "../../constants/UserContext";
import { useNavigation } from "@react-navigation/native";

const MemoryVault = () => {
  const [memories, setMemories] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const navigation = useNavigation();

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return; // Wait until userId is available

    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching profiles:", error.message);
        } else {
          setProfiles(data);
          if (data.length > 0) {
            setSelectedProfile(data[0].id);
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [userId]);

  useEffect(() => {
    if (!selectedProfile || !userId) return; // Wait until both userId and selectedProfile are available

    const fetchMemories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("memories")
          .select(`
            *,
            memory_media (
              media_bank (
                url
              )
            )
          `)
          .eq("user_id", userId)
          .eq("profile_id", selectedProfile)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching memories:", error.message);
        } else {
          const formattedMemories = data.map((memory) => {
            const file_urls = memory.memory_media.map(
              (media) => media.media_bank.url
            );
            return { ...memory, file_urls };
          });
          setMemories(formattedMemories);
        }
      } catch (error) {
        console.error("Unexpected error fetching memories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [selectedProfile, userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const renderMemory = ({ item }) => (
    <View style={styles.memoryContainer}>
      <FlatList
        data={item.file_urls || []}
        horizontal
        keyExtractor={(url, index) => `${item.id}-image-${index}`}
        showsHorizontalScrollIndicator={true}
        renderItem={({ item: imageUrl }) => (
          <Image source={{ uri: imageUrl }} style={styles.memoryImage} />
        )}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("MemoryDetail", { memory: item })}
      >
        <Text style={styles.memoryTitle}>
          {item.title || "Untitled Memory"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.memoryDate}>{formatDate(item.actual_date)}</Text>
      <Text numberOfLines={2} style={styles.memoryDescription}>
        {item.description || "No description provided."}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#19747E" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() =>
          navigation.navigate("VaultMap", { memories: memories || [] })
        }
      >
        <Text style={styles.mapButtonText}>View Map</Text>
      </TouchableOpacity>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownButtonText}>
            {profiles.find((p) => p.id === selectedProfile)?.name ||
              "Select Profile"}
          </Text>
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedProfile(profile.id);
                  setDropdownVisible(false);
                }}
              >
                <Text>{profile.name || "Unnamed Profile"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  mapButton: {
    backgroundColor: "#19747E",
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  dropdownButton: {
    backgroundColor: "#19747E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownMenu: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
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
});

export default MemoryVault;













       


