import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

const CreateCapsule = () => {
  const { user } = useUser();
  const { profile } = useProfile();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [privacy, setPrivacy] = useState('private');
  const [media, setMedia] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isMediaBankModalVisible, setMediaBankModalVisible] = useState(false);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [mediaBank, setMediaBank] = useState([]);
  const [isLoading, setLoading] = useState(false);

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

  const handleSelectFromMediaBank = (item) => {
    const isSelected = media.some((mediaItem) => mediaItem.uri === item.url);
    if (isSelected) {
      setMedia((prev) =>
        prev.filter((mediaItem) => mediaItem.uri !== item.url)
      );
    } else {
      setMedia((prev) => [
        ...prev,
        { uri: item.url, media_type: item.media_type },
      ]);
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
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const validPrivacyLevels = ['private', 'family', 'public'];
    if (!validPrivacyLevels.includes(privacy)) {
      Alert.alert('Error', 'Invalid privacy level.');
      return;
    }

    try {
      console.log('Starting capsule creation...');

      // Insert capsule record
      const { data: capsuleData, error: capsuleError } = await supabase
        .from('capsules')
        .insert([
          {
            title,
            description,
            release_date: releaseDate.toISOString(),
            privacy_level: privacy,
            user_id: userId,
            profile_id: profile.id,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        ])
        .select()
        .single();

      if (capsuleError) {
        console.error('Capsule insertion error:', capsuleError.message);
        throw capsuleError;
      }

      console.log('Capsule saved:', capsuleData);

      const capsuleMediaEntries = [];

      for (const item of media) {
        console.log('Processing media item:', item);

        // Insert into media_bank
        const { data: mediaBankData, error: mediaBankError } = await supabase
          .from('media_bank')
          .insert([
            {
              user_id: userId,
              profile_id: profile.id,
              url: item.uri,
              name: item.name || 'Untitled Media',
              media_type: item.media_type,
            },
          ])
          .select()
          .single();

        if (mediaBankError) {
          console.error(
            'Media bank insertion error:',
            mediaBankError.message,
            'Item:',
            item
          );
          continue; // Skip this item
        }

        console.log('Media bank record saved:', mediaBankData);

        // Prepare entries for capsule_media
        capsuleMediaEntries.push({
          capsule_id: capsuleData.id,
          media_id: mediaBankData.id, // Reference saved media ID
        });
      }

      // Batch insert into capsule_media
      if (capsuleMediaEntries.length > 0) {
        const { error: capsuleMediaError } = await supabase
          .from('capsule_media')
          .insert(capsuleMediaEntries);

        if (capsuleMediaError) {
          console.error(
            'Capsule media insertion error:',
            capsuleMediaError.message
          );
          throw capsuleMediaError;
        }

        console.log('Capsule media entries saved:', capsuleMediaEntries);
      } else {
        console.warn('No media linked to capsule.');
      }

      Alert.alert('Success', 'Capsule created successfully!');

      // Handle family notification setup
      if (privacy === 'family') {
        Alert.alert(
          'Family Notifications',
          'Would you like to set up notifications for family members?',
          [
            {
              text: 'Schedule Later',
              onPress: () => console.log('Notification setup skipped.'),
            },
            {
              text: 'Set Up Now',
              onPress: () => {
                // Navigate to the notification setup screen/modal
                navigateToFamilyNotificationSetup(capsuleData.id);
              },
            },
          ]
        );
      }

      setReviewModalVisible(false);
    } catch (error) {
      console.error('Error submitting capsule:', error.message);
      Alert.alert('Error', 'Failed to create capsule.');
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
          {/* Release Date Label */}
          <Text style={{ fontSize: 16, marginRight: 10 }}>Release Date</Text>

          {/* Date Picker Button */}
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 5,
              borderColor: '#ccc',
              flex: 1, // Allows it to take up available space
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 16, color: '#333' }}>
              {releaseDate
                ? releaseDate.toDateString()
                : 'Select a release date'}
            </Text>

            {/* Calendar Icon */}
            <Ionicons name="calendar-outline" size={20} color="#333" />
          </TouchableOpacity>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(date) => {
              setReleaseDate(date);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
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

        <TouchableOpacity
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
        </TouchableOpacity>

        <Modal
          visible={isMediaBankModalVisible}
          animationType="slide"
          onRequestClose={() => setMediaBankModalVisible(false)} // Allows closing the modal
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff', padding: 10 }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Select Media from Media Bank
            </Text>
            {isLoading ? (
              <Text style={{ textAlign: 'center' }}>Loading...</Text>
            ) : (
              <FlatList
                data={mediaBank}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => {
                  const isSelected = media.some(
                    (mediaItem) => mediaItem.uri === item.url
                  );
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelectFromMediaBank(item)}
                      style={{
                        flex: 1,
                        margin: 5,
                        aspectRatio: 1,
                        maxWidth: '30%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? '#19747E' : 'transparent',
                        position: 'relative',
                      }}
                    >
                      {item.media_type === 'video' ? (
                        <Video
                          source={{ uri: item.url }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Image
                          source={{ uri: item.url }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                      {isSelected && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: '#19747E',
                            borderRadius: 12,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity
              onPress={() => setMediaBankModalVisible(false)}
              style={{
                backgroundColor: '#19747E',
                padding: 15,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {media.length > 0 && (
          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Carousel
              loop
              width={300}
              height={200}
              data={media}
              renderItem={({ item }) => (
                <View style={{ width: 300, height: 200, position: 'relative' }}>
                  {item.media_type === 'video' ? (
                    <>
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: '100%', height: '100%' }}
                        useNativeControls
                        resizeMode="cover"
                      />
                      {/* Video Overlay Icon */}
                      <View
                        style={{
                          position: 'absolute',
                          top: '40%',
                          left: '45%',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: 25,
                          width: 50,
                          height: 50,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 24,
                            fontWeight: 'bold',
                          }}
                        >
                          ▶
                        </Text>
                      </View>
                    </>
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
              )}
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
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              Release Date: {releaseDate.toDateString()}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20 }}>
              Privacy Level: {privacyLevels[privacy]}
            </Text>

            {/* Media Preview Carousel */}
            {media.length > 0 && (
              <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <Carousel
                  loop
                  width={300}
                  height={200}
                  data={media}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: 300,
                        height: 200,
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {item.media_type === 'video' ? (
                        <>
                          <Video
                            source={{ uri: item.uri }}
                            style={{ width: '100%', height: '100%' }}
                            useNativeControls
                            resizeMode="cover"
                          />
                          {/* Video Overlay Icon */}
                          <View
                            style={{
                              position: 'absolute',
                              top: '40%',
                              left: '45%',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              borderRadius: 25,
                              width: 50,
                              height: 50,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 24,
                                fontWeight: 'bold',
                              }}
                            >
                              ▶
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Image
                          source={{ uri: item.uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'cover',
                          }}
                        />
                      )}
                    </View>
                  )}
                />
              </View>
            )}

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
});

export default CreateCapsule;
