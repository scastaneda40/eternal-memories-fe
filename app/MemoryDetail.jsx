import React, { useEffect, useState } from "react";
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
  const [mediaRefs, setMediaRefs] = useState([]);

  useEffect(() => {
    console.log("Route params:", route.params);
  }, [route]);

  const memory = route?.params?.memory;

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

  // Render each media item
  const renderMediaItem = ({ item }) => {
    if (item.endsWith(".mp4") || item.endsWith(".mov")) {
      return (
        <Video
          source={{ uri: item }}
          style={styles.media}
          resizeMode="cover"
          useNativeControls
          shouldPlay={false} // Avoid auto-play when switching
          ref={(ref) => {
            setMediaRefs((prevRefs) => {
              const newRefs = [...prevRefs];
              newRefs.push(ref);
              return newRefs;
            });
          }}
        />
      );
    }
    return <Image source={{ uri: item }} style={styles.media} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Carousel Section */}
       
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width}
            height={300}
            data={memory.file_urls || []}
            renderItem={renderMediaItem}
            onSnapToItem={() => {
              // Pause all videos when switching slides
              mediaRefs.forEach((ref) => {
                if (ref) ref.pauseAsync();
              });
            }}
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{memory.title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.description}>{memory.description}</Text>
        </View>

        {/* Button Section */}
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
    // paddingHorizontal: 50
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



