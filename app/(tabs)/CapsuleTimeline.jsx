import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../constants/supabaseClient";
import { useUser } from "../../constants/UserContext";

const CapsuleTimeline = () => {
  const { userId } = useUser();
  const [view, setView] = useState("upcoming"); // Toggle state
  const [capsules, setCapsules] = useState([]);

  useEffect(() => {
    fetchCapsules();
  }, [view]);

  const fetchCapsules = async () => {
    try {
      let query = supabase
        .from("capsules")
        .select("*")
        .eq("user_id", userId);
  
      if (view === "upcoming") {
        query = query.gte("release_date", new Date().toISOString());
      } else if (view === "released") {
        query = query.lte("release_date", new Date().toISOString());
      }
  
      const { data, error } = await query.order("release_date", {
        ascending: view === "upcoming", // Sort ascending for upcoming, descending for released
      });
  
      if (error) {
        console.error("Error fetching capsules:", error.message);
        return;
      }
  
      setCapsules(data || []);
    } catch (err) {
      console.error("Unexpected error fetching capsules:", err.message);
    }
  };
  

  const toggleView = (selectedView) => setView(selectedView);

  const renderCapsule = ({ item }) => (
    <TouchableOpacity style={styles.capsuleItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>
        {view === "upcoming"
          ? `Releases on: ${new Date(item.release_date).toDateString()}`
          : `Released on: ${new Date(item.release_date).toDateString()}`}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => toggleView("upcoming")}
          style={[
            styles.toggleButton,
            view === "upcoming" && styles.activeButton,
          ]}
        >
          <Text style={[styles.toggleText, view === "upcoming" && styles.activeText]}>
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
          <Text style={[styles.toggleText, view === "released" && styles.activeText]}>
            Released Capsules
          </Text>
        </TouchableOpacity>
      </View>

      {/* Capsule List */}
      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id}
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
