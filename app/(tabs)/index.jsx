import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../constants/supabaseClient";
import Calendar from "../../components/Calendar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";

const Dashboard = () => {
  const navigation = useNavigation();
  const [highlightedMemory, setHighlightedMemory] = useState(null);
  const insets = useSafeAreaInsets();

  const { profile, setProfile } = useProfile();
  const { user } = useUser();

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Fetching profiles...");
      try {
        const { data: profiles, error } = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", user?.id);
  
        if (error) {
          console.error("Error fetching profiles:", error.message);
          return;
        }
  
        if (profiles && profiles.length > 0) {
          console.log("Profiles found:", profiles);
          // Set the first profile if none is set in the context
          if (!profile?.id) {
            setProfile(profiles[0]); // Update profile context
          }
        } else {
          console.log("No profiles found for this user.");
        }
      } catch (err) {
        console.error("Unexpected error fetching profiles:", err);
      }
    };
  
    if (user?.id && !profile?.id) {
      fetchProfile();
    }
  }, [user?.id, profile?.id, setProfile]);


  useEffect(() => {
    const fetchRandomImage = async () => {
      console.log("Fetching random image...");
      try {
        const { data: memories, error } = await supabase
          .from("memories")
          .select(`
            *,
            memory_media (
              media_bank (
                url
              )
            )
          `)
          .eq("user_id", user?.id)
          .eq("profile_id", profile?.id);

        if (error) {
          console.error("Error fetching memories:", error.message);
          return;
        }

        // Flatten and filter out video URLs
        const imageUrls = memories
          .flatMap((memory) => memory.memory_media.map((media) => media.media_bank.url))
          .filter((url) => !url.endsWith(".mp4") && !url.endsWith(".mov"));

        if (imageUrls.length > 0) {
          const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
          console.log("Random image selected:", randomImage);
          setHighlightedMemory(randomImage); // Set the random image
        } else {
          console.log("No images found for the user and profile.");
        }
      } catch (err) {
        console.error("Unexpected error fetching memories:", err);
      }
    };

    if (profile?.id) {
      fetchRandomImage();
    }
  }, [profile?.id, user?.id]);
  

  
  
  return (
    <View style={{ flex: 1 }}>
      {/* Hero Section */}
      <ImageBackground
        source={{
          uri: highlightedMemory || "https://via.placeholder.com/500",
        }}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate("LovedOneProfile")}
        >
          <Image
            source={{
              uri: "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => navigation.navigate("MemoryVault")}
        >
          <Text style={styles.heroButtonText}>View Memory Vault</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Main Content */}
      <View
        contentContainerStyle={[
          styles.content,
        ]}
      >
        {/* Calendar Section */}
        <View style={styles.calendar}>
          <Calendar />
        </View>

        {/* Action Tiles */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate("MemoryUpload")}
          >
            <Ionicons name="cloud-upload-outline" size={28} color="#19747E" />
            <Text style={styles.tileText}>Upload Memory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate("LovedOneProfile")}
          >
            <Ionicons name="person-add-outline" size={28} color="#FFC55B" />
            <Text style={styles.tileText}>Create Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate("MediaGallery")}
          >
            <Ionicons name="images-outline" size={28} color="#428EFF" />
            <Text style={styles.tileText}>View Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate("CreateCapsule")}
          >
            <Ionicons name="cube-outline" size={28} color="#F1465A" />
            <Text style={styles.tileText}>Create Capsule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    height: 300, // Set height for hero image
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  profileIcon: {
    position: "absolute",
    top: Platform.OS === "android" ? 50 : 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19747E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  heroButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 10,
    backgroundColor: "#f4f4f6",
  },
  calendar: {
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 15
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    // marginVertical: 20,
  },
  actionTile: {
    width: "40%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tileText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 10,
  },
});

export default Dashboard;
