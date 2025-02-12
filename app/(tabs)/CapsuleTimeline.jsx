import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useUser } from "../../constants/UserContext";
import { convertUTCToLocal, convertUTCToSpecifiedZone } from "../../utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../../constants/ProfileContext";

const CapsuleTimeline = () => {
  const navigation = useNavigation();
  
  const { profile } = useProfile();
  const [view, setView] = useState("upcoming");
  const [capsules, setCapsules] = useState([]);

  const { user } = useUser();

  const userId = user?.id;

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
      // Fetch media linked to the capsule by manually joining capsule_media and media_bank
      const { data: capsuleMedia, error } = await supabase
        .from("capsule_media")
        .select(`
          media_id,
          media_bank (
            id,
            url,
            name,
            media_type
          )
        `)
        .eq("capsule_id", capsule.id);
  
      if (error) {
        console.error("Error fetching media for capsule:", error.message);
        return;
      }
  
      // Extract the `media_bank` array from the response
      const mediaFiles = capsuleMedia.map((entry) => entry.media_bank);
  
      console.log("Media files fetched for capsule:", capsule.id, mediaFiles);
  
      // Navigate to CapsuleDetails with the capsule details and media files
      navigation.navigate("CapsuleDetails", {
        capsuleDetails: capsule,
        mediaFiles: mediaFiles || [],
      });
    } catch (err) {
      console.error("Error navigating to CapsuleDetails:", err.message);
    }
  };
  
  const MAX_TITLE_LENGTH = 20;

  const renderCapsule = ({ item }) => {
    const localDate = convertUTCToLocal(item.release_date);
    const specifiedDate = convertUTCToSpecifiedZone(
      item.release_date,
      item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  
    const handleFamilyNotificationSetup = () => {
      console.log("Navigating to FamilyNotificationSetup with capsuleId:", item.id);
      navigation.navigate("FamilyNotificationSetup", { capsuleId: item.id });
    };

    const truncatedTitle =
    item.title.length > MAX_TITLE_LENGTH
      ? `${item.title.slice(0, MAX_TITLE_LENGTH)}...`
      : item.title;
  
    return (
      <TouchableOpacity onPress={() => handlePress(item)} style={styles.capsuleItem}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.title}>{truncatedTitle}</Text>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, styles[item.privacy_level]]}>
              {item.privacy_level}
            </Text>
            {item.privacy_level === "family" && (
              <TouchableOpacity onPress={handleFamilyNotificationSetup}>
                <Text style={styles.notificationText}>🔔</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.date}>
          {view === "upcoming"
            ? `Releases on: ${localDate}`
            : `Released on: ${specifiedDate || localDate}`}
        </Text>
        <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
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
            Upcoming 
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
            Released 
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
  activeButton: { backgroundColor: "#19747E" },
  toggleText: { fontSize: 16, color: "#555" },
  activeText: { color: "#fff", fontWeight: "bold" },
  capsuleItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", flex: 1, marginRight: 8 },
  date: { fontSize: 14, color: "#888", marginTop: 5 },
  description: { fontSize: 14, color: "#555", marginTop: 5, overflow: "hidden" },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 20 },
  capsuleItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    textTransform: "capitalize",
  },
  family: {
    backgroundColor: "#FFD700", // Gold
    color: "#FFF",
  },
  public: {
    backgroundColor: "#4CAF50", // Green
    color: "#FFF",
  },
  private: {
    backgroundColor: "#9E9E9E", // Gray
    color: "#FFF",
  },
  notificationText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  date: { fontSize: 14, color: "#888", marginTop: 5 },
  description: { fontSize: 14, color: "#555", marginTop: 5, overflow: "hidden" },
});



export default CapsuleTimeline;

