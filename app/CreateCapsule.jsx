import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  SafeAreaView,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import Carousel from 'react-native-reanimated-carousel';
import { useUser } from '../constants/UserContext';
import { useProfile } from '../constants/ProfileContext';
import { supabase } from '../constants/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';

const CreateCapsule = () => {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  const { user } = useUser();
  const { profile } = useProfile();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [media, setMedia] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isMediaBankModalVisible, setIsMediaBankModalVisible] = useState(false);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [mediaBank, setMediaBank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [mediaAdded, setMediaAdded] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [releaseDate, setReleaseDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setHours(12, 0, 0, 0); // ✅ Ensure default time is 12:00 PM
    return defaultDate;
  });

  const [isExtMediaBankModalVisible, setIsExtMediaBankModalVisible] =
    useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);

  const userId = user?.id;

  const state = navigation.getState();
  console.log('Navigation state:', JSON.stringify(state, null, 2));

  const privacyLevels = {
    private: 'Private',
    family: 'Family',
    public: 'Public',
  };

  const fetchMediaBank = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_bank')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching media bank:', error.message);
      } else {
        setMediaBank(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching media bank:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMediaBankModalVisible) {
      fetchMediaBank();
    }
  }, [isMediaBankModalVisible]);

  useEffect(() => {
    console.log('Media items:', media);
  }, [media]);

  const pickMedia = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows images & videos
      allowsMultipleSelection: true, // Multiple media selection
      quality: 1,
    });

    // Handle selected media
    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        ...result.assets.map((asset) => ({ uri: asset.uri })),
      ]);

      setIsAddingMedia(false); // ✅ Close modal after selection
    }
  };

  const handleDateConfirm = (date) => {
    // Set date with time at 12:00 PM
    const newDate = new Date(date);
    newDate.setHours(12, 0, 0, 0); // Set to 12:00 PM

    setReleaseDate(newDate);
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (time) => {
    if (releaseDate) {
      const newDate = new Date(releaseDate);
      newDate.setHours(time.getHours(), time.getMinutes(), 0, 0); // Update time
      setReleaseDate(newDate);
    }
    setTimePickerVisibility(false);
  };

  const pickImage = async () => {
    try {
      console.log('Requesting permissions...');
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need media library access.');
        return;
      }

      console.log('Launching ImagePicker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'], // Allow both images and videos
        allowsEditing: false,
        quality: 1,
      });

      console.log('ImagePicker result:', result);

      if (!result.canceled) {
        const file = result.assets[0];
        console.log('Selected media file:', file);

        const mediaType =
          file.type === 'image'
            ? 'photo'
            : file.type === 'video'
            ? 'video'
            : 'unknown';

        if (mediaType === 'unknown') {
          alert('Unsupported media type selected.');
          return;
        }

        setMedia((prev) => [
          ...prev,
          {
            uri: file.uri, // Use consistent URI formatting
            media_type: mediaType,
          },
        ]);
      } else {
        console.log('Image picker canceled');
      }
    } catch (error) {
      console.error('Error in pickImage:', error.message);
    }
  };

  const openTimePicker = () => {
    setReleaseDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setHours(prevDate.getHours(), prevDate.getMinutes(), 0, 0); // ✅ Preserve existing time
      return newDate;
    });

    setTimePickerVisibility(true);
  };

  const handleSelectFromMediaBank = (item) => {
    const isSelected = media.some((mediaItem) => mediaItem.id === item.id);
    if (isSelected) {
      setMedia((prev) => prev.filter((mediaItem) => mediaItem.id !== item.id));
    } else {
      setMedia((prev) => [...prev, { id: item.id, uri: item.url }]);
    }
  };

  const handleReview = () => {
    setReviewModalVisible(true);
  };

  const navigateToFamilyNotificationSetup = (capsuleId) => {
    console.log('Navigation object in CreateCapsule:', navigation); // Check if navigation is valid
    console.log('capsule id', capsuleId);
    navigation.navigate('FamilyNotificationSetup', { capsuleId });
  };

  const handleSubmit = async () => {
    if (!title || !description || !releaseDate || !userId || !profile?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'All fields are required.',
      });
      return;
    }

    const validPrivacyLevels = ['private', 'family', 'public'];
    if (!validPrivacyLevels.includes(privacy)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid privacy level.',
      });
      return;
    }

    try {
      console.log('🚀 Starting capsule creation...');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('release_date', releaseDate.toISOString());
      formData.append(
        'timezone',
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      formData.append('user_id', userId);
      formData.append('privacy_level', privacy);
      formData.append('profile_id', profile.id);

      // ✅ Append media files to FormData
      media.forEach((mediaItem, index) => {
        if (mediaItem.uri) {
          const fileType = mediaItem.uri.split('.').pop();
          formData.append('mediaFiles', {
            uri: mediaItem.uri,
            name: `media_${index}.${fileType}`,
            type:
              mediaItem.media_type === 'photo'
                ? `image/${fileType}`
                : `video/${fileType}`,
          });
        }
      });

      console.log('📤 Sending request with FormData:', formData);

      const response = await fetch('${API_BASE_URL}/api/capsules', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create capsule.');
      }

      console.log('✅ Capsule created successfully:', responseData);

      // ✅ Show success message and reset form
      setReviewModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Capsule created successfully!',
      });

      setTitle('');
      setDescription('');
      setReleaseDate(new Date());
      setPrivacy('private');
      setMedia([]);
    } catch (error) {
      console.error('❌ Error submitting capsule:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create capsule.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Create a Capsule</Text>
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Title</Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={{ fontSize: 16, marginVertical: 8 }}>Description</Text>
        <TextInput
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: '#ccc',
            height: 100,
          }}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 10 }}>Release Date</Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.pickerButton}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>
              {releaseDate
                ? releaseDate.toDateString()
                : 'Select a release date'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#333" />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            date={releaseDate}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </View>

        {/* Time Picker */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 10 }}>Release Time</Text>
          <TouchableOpacity
            onPress={openTimePicker}
            style={styles.pickerButton}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>
              {releaseDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Ionicons name="time-outline" size={20} color="#333" />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={() => setTimePickerVisibility(false)}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            marginBottom: 20,
          }}
        >
          {/* Privacy Label */}
          <Text style={{ fontSize: 16, marginRight: 10 }}>Privacy</Text>

          {/* Privacy Buttons */}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            {Object.keys(privacyLevels).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setPrivacy(level)}
                style={{
                  flex: 1,
                  backgroundColor: privacy === level ? '#19747E' : '#ccc',
                  padding: 10,
                  marginHorizontal: 3, // Reduced margin for better fit
                  borderRadius: 5,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14 }}>
                  {privacyLevels[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* <TouchableOpacity
          style={[styles.button, { marginBottom: 12 }]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Import Media</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginBottom: 12 }]}
          onPress={() => setMediaBankModalVisible(true)}
        >
          <Text style={styles.buttonText}>Select Media from Media Bank</Text>
        </TouchableOpacity> */}

        <View style={{ flex: 1, marginBottom: 20 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsAddingMedia(true)}
          >
            <Text style={styles.buttonText}>Add Media</Text>
          </TouchableOpacity>

          {/* ADD MEDIA MODAL ADD MEDIA MODAL ADD MEDIA MODAL  */}

          <Modal
            visible={isAddingMedia}
            animationType="slide"
            transparent={true}
          >
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: '90%',
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}
                >
                  Add Media
                </Text>
                {console.log('🔹 Rendering Modal:', isMediaBankModalVisible)}

                {/* Import from Device */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#19747E',
                    paddingVertical: 12,
                    width: '100%',
                    alignItems: 'center',
                    borderRadius: 8,
                    marginBottom: 10,
                    flexDirection: 'row', // ✅ Aligns icon & text horizontally
                    justifyContent: 'center', // ✅ Centers content
                  }}
                  onPress={pickMedia}
                >
                  <MaterialIcons
                    name="folder-open"
                    size={24}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: '#fff', fontSize: 16 }}>
                    Import from Device
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#555',
                    paddingVertical: 12,
                    width: '100%',
                    alignItems: 'center',
                    borderRadius: 8,
                    marginBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    console.log('🔹 Button Pressed: Attempting to open modal');
                    setIsAddingMedia(false); // Close the Add Media modal
                    setIsMediaBankModalVisible((prev) => {
                      console.log(
                        '🔹 isMediaBankModalVisible should be true now:',
                        !prev
                      );
                      return true;
                    });
                  }}
                >
                  <MaterialIcons
                    name="photo-library"
                    size={24}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: '#fff', fontSize: 16 }}>
                    Select from Media Bank
                  </Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ddd',
                    paddingVertical: 12,
                    width: '100%',
                    alignItems: 'center',
                    borderRadius: 8,
                  }}
                  onPress={() => setIsAddingMedia(false)}
                >
                  <Text style={{ color: '#333', fontSize: 16 }}>❌ Close</Text>
                </TouchableOpacity>
              </View>
              {mediaAdded && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    width: '90%',
                    backgroundColor: 'green',
                    padding: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center', // ✅ Center content
                    alignSelf: 'center', // ✅ Center horizontally
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    ✅ Media Added Successfully!
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </Modal>
        </View>

        <Modal
          visible={isMediaBankModalVisible}
          animationType="slide"
          transparent={true}
          // onRequestClose={() => setIsMediaBankModalVisible(false)}
        >
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: '#fff',
              padding: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Select Media from Media Bank
            </Text>

            {isLoading ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                Loading...
              </Text>
            ) : (
              <FlatList
                data={mediaBank}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isVideo =
                    item?.url?.endsWith('.mp4') || item?.url?.endsWith('.mov');

                  // Check if this item is selected based on its ID
                  const isSelected = media.some(
                    (mediaItem) => mediaItem.id === item.id
                  );

                  return (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        margin: 5,
                        aspectRatio: 1,
                        maxWidth: '30%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? '#19747E' : 'transparent',
                      }}
                      onPress={() => {
                        if (isSelected) {
                          // Deselect by filtering out this item's ID
                          setMedia((prev) =>
                            prev.filter((mediaItem) => mediaItem.id !== item.id)
                          );
                        } else {
                          // Add the new media object, ensuring ID is included
                          setMedia((prev) => [
                            ...prev,
                            { id: item.id, uri: item.url },
                          ]);
                        }
                      }}
                    >
                      {isVideo ? (
                        <>
                          <Video
                            source={{ uri: item.url }}
                            style={{
                              width: '100%',
                              height: '100%',
                              resizeMode: 'cover',
                            }}
                            resizeMode="cover"
                            shouldPlay={false}
                            useNativeControls={false}
                          />
                          <View
                            style={{
                              position: 'absolute',
                              top: '40%',
                              left: '40%',
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              borderRadius: 20,
                              padding: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 16,
                                textAlign: 'center',
                              }}
                            >
                              ▶
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Image
                          source={{ uri: item.url }}
                          style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'cover',
                          }}
                        />
                      )}
                      {isSelected && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: '#19747E',
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 16,
                              fontWeight: 'bold',
                            }}
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                numColumns={3}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
              />
            )}

            <TouchableOpacity
              style={{
                backgroundColor: '#19747E',
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() => setIsMediaBankModalVisible(false)}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {media.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              renderItem={({ item }) => {
                const isVideo =
                  item.uri.endsWith('.mp4') || item.uri.endsWith('.mov'); // Check if it's a video

                return (
                  <View style={styles.carouselItem}>
                    {isVideo ? (
                      <View
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Video
                          source={{ uri: item.uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 8,
                          }}
                          resizeMode="cover"
                          useNativeControls
                        />
                        {/* Play Button Overlay */}
                        <View
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [
                              { translateX: -15 },
                              { translateY: -15 },
                            ],
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 20,
                              fontWeight: 'bold',
                            }}
                          >
                            ▶
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.uri }}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </View>
                );
              }}
            />
          </View>
        )}

        <TouchableOpacity onPress={handleReview} style={styles.button}>
          <Text style={styles.buttonText}>Review Capsule</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
            {/* Centered Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Review Your Capsule
            </Text>

            {/* Capsule Details */}
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              Title: {title}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              Description: {description}
            </Text>
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>
              Release Date:{' '}
              {releaseDate
                ? releaseDate.toLocaleDateString([], {
                    weekday: 'long', // "Monday"
                    year: 'numeric', // "2025"
                    month: 'long', // "March"
                    day: 'numeric', // "11"
                  })
                : 'No date selected'}
            </Text>

            <Text style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>
              Release Time:{' '}
              {releaseDate
                ? releaseDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : '12:00 PM'}
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Privacy Level: {privacyLevels[privacy]}
            </Text>

            {/* Media Preview Carousel */}
            {media.length > 0 && (
              <View style={styles.carouselContainer}>
                <Carousel
                  loop
                  width={300}
                  height={200}
                  data={media}
                  renderItem={({ item }) => {
                    const isVideo =
                      item.uri.endsWith('.mp4') || item.uri.endsWith('.mov'); // Check if it's a video

                    return (
                      <View style={styles.carouselItem}>
                        {isVideo ? (
                          <View
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            <Video
                              source={{ uri: item.uri }}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 8,
                              }}
                              resizeMode="cover"
                              useNativeControls
                            />
                            {/* Play Button Overlay */}
                            <View
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: [
                                  { translateX: -15 },
                                  { translateY: -15 },
                                ],
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 20,
                                  fontWeight: 'bold',
                                }}
                              >
                                ▶
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <Image
                            source={{ uri: item.uri }}
                            style={{
                              width: '100%',
                              height: '100%',
                              resizeMode: 'cover',
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </View>
                    );
                  }}
                />
              </View>
            )}
            <Modal
              visible={isMediaBankModalVisible}
              animationType="slide"
              transparent={true}
              // onRequestClose={() => setIsMediaBankModalVisible(false)}
            >
              <SafeAreaView
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  Select Media from Media Bank
                </Text>

                {isLoading ? (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>
                    Loading...
                  </Text>
                ) : (
                  <FlatList
                    data={mediaBank}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                      const isVideo =
                        item.url.endsWith('.mp4') || item.url.endsWith('.mov');

                      // Check if this item is selected based on its ID
                      const isSelected = media.some(
                        (mediaItem) => mediaItem.id === item.id
                      );

                      return (
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            margin: 5,
                            aspectRatio: 1,
                            maxWidth: '30%',
                            borderRadius: 8,
                            overflow: 'hidden',
                            position: 'relative',
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: isSelected ? '#19747E' : 'transparent',
                          }}
                          onPress={() => {
                            if (isSelected) {
                              // Deselect by filtering out this item's ID
                              setMedia((prev) =>
                                prev.filter(
                                  (mediaItem) => mediaItem.id !== item.id
                                )
                              );
                            } else {
                              // Add the new media object, ensuring ID is included
                              setMedia((prev) => [
                                ...prev,
                                { id: item.id, uri: item.url },
                              ]);
                            }
                          }}
                        >
                          {isVideo ? (
                            <>
                              <Video
                                source={{ uri: item.url }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  resizeMode: 'cover',
                                }}
                                resizeMode="cover"
                                shouldPlay={false}
                                useNativeControls={false}
                              />
                              <View
                                style={{
                                  position: 'absolute',
                                  top: '40%',
                                  left: '40%',
                                  backgroundColor: 'rgba(0,0,0,0.6)',
                                  borderRadius: 20,
                                  padding: 5,
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 16,
                                    textAlign: 'center',
                                  }}
                                >
                                  ▶
                                </Text>
                              </View>
                            </>
                          ) : (
                            <Image
                              source={{ uri: item.url }}
                              style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'cover',
                              }}
                            />
                          )}
                          {isSelected && (
                            <View
                              style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                backgroundColor: '#19747E',
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 16,
                                  fontWeight: 'bold',
                                }}
                              >
                                ✓
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    numColumns={3}
                    contentContainerStyle={{
                      paddingBottom: 20,
                    }}
                  />
                )}

                <TouchableOpacity
                  style={{
                    backgroundColor: '#19747E',
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                  onPress={() => setIsMediaBankModalVisible(false)}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </SafeAreaView>
            </Modal>
            {/* Buttons */}
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: '#19747E',
                  padding: 15,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>
                  Submit Capsule
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={{
                  backgroundColor: '#ccc',
                  padding: 15,
                  borderRadius: 5,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#333', fontSize: 16 }}>
                  Back to Edit
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12, // Match button height
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#19747E',
    paddingVertical: 15, // Consistent vertical padding
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Ensure equal width for both buttons
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  carouselContainer: {
    justifyContent: 'center', // Centers content vertically (useful if container is tall)
    alignItems: 'center', // Centers content horizontally
    marginVertical: 20, // Add spacing above and below the carousel
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderColor: '#ccc',
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default CreateCapsule;
