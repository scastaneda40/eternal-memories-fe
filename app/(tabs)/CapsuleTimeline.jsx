import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useUser } from "../../constants/UserContext";
import { convertUTCToLocal, convertUTCToSpecifiedZone } from "../../utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../../constants/ProfileContext";

const CapsuleTimeline = () => {
  const navigation = useNavigation();
  const { userId } = useUser();
  const { profile } = useProfile();
  const [view, setView] = useState("upcoming");
  const [capsules, setCapsules] = useState([]);

  useEffect(() => {
    if (userId && profile?.id) {
      fetchCapsules();
    }
  }, [view, userId, profile?.id]);

  const fetchCapsules = async () => {
    try {
      let query = supabase
        .from("capsules")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_id", profile.id); // Filter by current profile

      if (view === "upcoming") {
        query = query.gte("release_date", new Date().toISOString());
      } else if (view === "released") {
        query = query.lte("release_date", new Date().toISOString());
      }

      const { data, error } = await query.order("release_date", {
        ascending: view === "upcoming",
      });

      if (error) {
        console.error("Error fetching capsules:", error.message);
        return;
      }

      console.log("Fetched Capsules:", data);
      setCapsules(data || []);
    } catch (err) {
      console.error("Unexpected error fetching capsules:", err.message);
    }
  };

  const toggleView = (selectedView) => setView(selectedView);

  const handlePress = async (capsule) => {
    try {
      const { data: mediaFiles, error } = await supabase
        .from("media")
        .select("*")
        .eq("capsule_id", capsule.id);

      if (error) {
        console.error("Error fetching media files:", error.message);
        return;
      }

      navigation.navigate("EditCapsule", {
        capsuleDetails: capsule,
        mediaFiles: mediaFiles || [],
        isEditing: true,
      });
    } catch (err) {
      console.error("Error navigating to EditCapsule:", err.message);
    }
  };

  const renderCapsule = ({ item }) => {
    const localDate = convertUTCToLocal(item.release_date);
    const specifiedDate = convertUTCToSpecifiedZone(
      item.release_date,
      item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    return (
      <TouchableOpacity style={styles.capsuleItem} onPress={() => handlePress(item)}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          {view === "upcoming"
            ? `Releases on: ${localDate}`
            : `Released on: ${specifiedDate || localDate}`}
        </Text>
        <Text style={styles.description}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => toggleView("upcoming")}
          style={[
            styles.toggleButton,
            view === "upcoming" && styles.activeButton,
          ]}
        >
          <Text
            style={[styles.toggleText, view === "upcoming" && styles.activeText]}
          >
            Upcoming Capsules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleView("released")}
          style={[
            styles.toggleButton,
            view === "released" && styles.activeButton,
          ]}
        >
          <Text
            style={[styles.toggleText, view === "released" && styles.activeText]}
          >
            Released Capsules
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCapsule}
        ListEmptyComponent={<Text style={styles.emptyText}>No capsules found</Text>}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  toggleContainer: { flexDirection: "row", marginBottom: 10 },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: { backgroundColor: "#007AFF" },
  toggleText: { fontSize: 16, color: "#555" },
  activeText: { color: "#fff", fontWeight: "bold" },
  capsuleItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  date: { fontSize: 14, color: "#888", marginTop: 5 },
  description: { fontSize: 14, color: "#555", marginTop: 5 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 20 },
});

export default CapsuleTimeline;

