import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Video } from "expo-av";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const CapsuleDetails = () => {
  const route = useRoute();
  const mediaRefs = useRef([]); // Use ref to manage media refs

  const { capsuleDetails, mediaFiles } = route.params;

  const formattedDate = capsuleDetails.release_date
    ? new Date(capsuleDetails.release_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Invalid Date";

    const renderMediaItem = ({ item, index }) => {
        if (item.url.endsWith(".mp4") || item.url.endsWith(".mov")) {
          return (
            <View style={styles.mediaContainer}>
              <Video
                source={{ uri: item.url }}
                style={styles.video}
                resizeMode="cover"
                useNativeControls
                shouldPlay={true}
                ref={(ref) => {
                  mediaRefs.current[index] = ref; // Save each video reference
                }}
              />
            </View>
          );
        }
      
        return (
          <Image
            source={{ uri: item.url }}
            style={styles.media}
            resizeMode="cover"
          />
        );
      };
      
      const handleSnapToItem = (index) => {
        // Pause all videos
        mediaRefs.current.forEach((ref, i) => {
          if (ref && i !== index) {
            ref.pauseAsync();
          }
        });
      
        // Play the video at the current index
        const currentVideo = mediaRefs.current[index];
        if (currentVideo) {
          currentVideo.playAsync();
        }
      };
      

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.carouselContainer}>
        <Carousel
            loop={false} // Stop infinite scrolling
            width={width}
            height={320} // Adjust height for the scrubber visibility
            data={mediaFiles || []}
            renderItem={({ item, index }) => renderMediaItem({ item, index })}
            onSnapToItem={(index) => handleSnapToItem(index)} // Handle active slide
            />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{capsuleDetails.title}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.description}>{capsuleDetails.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    mediaContainer: {
        width: "100%",
        height: 300,
        alignItems: "center",
        justifyContent: "center",
      },
      video: {
        width: "100%",
        height: "100%", // Ensure the video takes up the full height
        borderRadius: 10,
      },
      media: {
        width: "100%",
        height: 300,
        borderRadius: 10,
      },
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
});

export default CapsuleDetails;

