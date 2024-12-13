import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Video } from "expo-av";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const MemoryDetail = ({ navigation }) => {
  const route = useRoute();
  const mediaRefs = useRef([]); // Use ref to manage media refs

  const memory = route?.params?.memory;

  useEffect(() => {
    console.log("Route params:", route.params);
  }, [route]);

  if (!memory) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.errorText}>Memory details are unavailable.</Text>
      </View>
    );
  }

  const formattedDate = memory.actual_date
    ? new Date(memory.actual_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Invalid Date";

  const renderMediaItem = ({ item }) => {
    if (item.endsWith(".mp4") || item.endsWith(".mov")) {
      return (
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          <Video
            source={{ uri: item }}
            style={styles.media}
            resizeMode="cover"
            useNativeControls
            shouldPlay={false}
            ref={(ref) => {
              if (ref && !mediaRefs.current.includes(ref)) {
                mediaRefs.current.push(ref); // Add ref without triggering re-renders
              }
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -15 }, { translateY: -15 }],
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: 15,
              width: 30,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              ▶
            </Text>
          </View>
        </View>
      );
    }
    return <Image source={{ uri: item }} style={styles.media} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width}
            height={300}
            data={memory.file_urls || []}
            renderItem={renderMediaItem}
            onSnapToItem={() => {
              mediaRefs.current.forEach((ref) => {
                if (ref) ref.pauseAsync(); // Pause all videos on slide change
              });
            }}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{memory.title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.description}>{memory.description}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => console.log("Share")}
          >
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("EditMemory", { memory })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  carouselContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  media: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333333",
  },
  date: {
    fontSize: 16,
    textAlign: "center",
    color: "#555555",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#444444",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#DDDDDD",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#19747E",
  },
  secondaryButton: {
    backgroundColor: "#3399CC",
  },
});

export default MemoryDetail;




