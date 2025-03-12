import React, { useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Video } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CapsuleDetails = () => {
  console.log('Media Files in Details:', JSON.stringify(mediaFiles, null, 2));

  const route = useRoute();
  const navigation = useNavigation();

  const mediaRefs = useRef([]); // Use ref to manage media refs

  const { capsuleDetails, mediaFiles } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);

  const formattedDate = capsuleDetails.release_date
    ? new Date(capsuleDetails.release_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Invalid Date';

  console.log('Media Files in Details:', mediaFiles);

  const renderMediaItem = ({ item }) => {
    if (!item.url) {
      console.warn(`⚠️ Media item missing URL:`, item);
      return <Text style={{ color: 'red' }}>⚠️ Missing Media</Text>; // Prevent crash
    }

    return (
      <View style={[styles.mediaContaine, { borderRadius: 8 }]}>
        {item.url.endsWith('.mp4') || item.url.endsWith('.mov') ? (
          <Video
            source={{ uri: item.url }}
            style={styles.media} // ✅ Ensures video has the same size as images
            resizeMode="cover"
            useNativeControls
            shouldPlay={true}
          />
        ) : (
          <Image
            source={{ uri: item.url }}
            style={styles.media} // ✅ Unified style for images
            resizeMode="cover"
          />
        )}
      </View>
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
  video: {
    width: '100%',
    height: '100%', // Ensure the video takes up the full height
    borderRadius: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333333',
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444444',
    textAlign: 'center',
  },
  mediaContainer: {
    width: '100%', // ✅ Ensures full width
    height: 400, // 🔥 Increase height (was based on aspect ratio)
    backgroundColor: 'black', // ✅ Avoids transparent background on videos
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // ✅ Optional: Adds rounded corners for consistency
    overflow: 'hidden', // ✅ Prevents overflow of media
  },
  media: {
    width: '100%', // ✅ Same width for both images and videos
    height: '100%', // ✅ Same height for both images and videos
    borderRadius: 8, // ✅ Optional: Match rounded corners
  },
});

export default CapsuleDetails;
