import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Carousel from 'react-native-reanimated-carousel';
import { useUser } from '../constants/UserContext';
import { useProfile } from '../constants/ProfileContext';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { supabase } from '../constants/supabaseClient';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AddMediaModal from '../components/AddMediaModal';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; // or 'react-native-vector-icons/FontAwesome'
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;
Geocoder.init(GOOGLE_MAPS_API_KEY);

const MemoryUpload = () => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Removes the title
    });
  }, [navigation]);

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] =
    useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });
  const [manualAddress, setManualAddress] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [media, setMedia] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { user } = useUser();
  const { profile: globalProfile } = useProfile();
  const navigation = useNavigation();
  const [mediaBank, setMediaBank] = useState([]);
  const [isMediaBankModalVisible, setIsMediaBankModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isMediaOptionsVisible, setMediaOptionsVisible] = useState(false);
  const [mediaAdded, setMediaAdded] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    console.log('Current selected profile:', selectedProfile);
  }, [selectedProfile]);

  useEffect(() => {
    console.log(
      '🔹 isMediaBankModalVisible changed to:',
      isMediaBankModalVisible
    );
  }, [isMediaBankModalVisible]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching profiles:', error.message);
        } else {
          console.log('Fetched profiles:', data);
          setProfiles(data);
          if (data.length > 0) {
            setSelectedProfile(data[0].id);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [userId]);

  const fetchMediaBank = async () => {
    try {
      setLoading(true);
      console.log('Fetching media for user_id:', userId);
      const { data, error } = await supabase
        .from('media_bank')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching media:', error.message);
      } else {
        console.log('Fetched media:', data);
        setMediaBank(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromMediaBank = (selectedItem) => {
    setMedia((prev) => [...prev, { uri: selectedItem.url }]);
    Toast.show({
      type: 'success',
      text1: 'Media Added',
      text2: 'Selected media added to the memory.',
    });
  };

  useEffect(() => {
    console.log('🔹 isMediaBankModalVisible:', isMediaBankModalVisible);

    if (isMediaBankModalVisible && userId) {
      fetchMediaBank();
    }
  }, [isMediaBankModalVisible, userId]);

  const handleProfileSelection = (profile) => {
    console.log('Selected Profile:', profile);
    setSelectedProfile(profile.id);
    setDropdownVisible(false); // Close the dropdown
    Toast.show({
      type: 'success',
      // text1: "Profile Selected",
      text1: `Current Profile: ${profile.name}`,
    });
  };

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

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const formattedAddress = response.results[0].formatted_address;
      setManualAddress(formattedAddress);
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const geocode = await Geocoder.from(search);
      const location = geocode.results[0].geometry.location;
      const formattedAddress = geocode.results[0].formatted_address;

      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({
        latitude: location.lat,
        longitude: location.lng,
      });
      setManualAddress(formattedAddress);
    } catch (error) {
      console.error('Error during geocoding:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        ...result.assets.map((asset) => ({ uri: asset.uri })),
      ]);
    }
  };

  const handleUpload = async () => {
    console.log('User:', user);
    console.log('Selected Profile:', selectedProfile);

    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'User ID is missing. Please log in again.',
      });
      return;
    }

    if (!selectedProfile) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Profile ID is missing. Please select a profile.',
      });
      return;
    }

    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Title is required.',
      });
      return;
    }

    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Description is required.',
      });
      return;
    }

    if (media.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'At least one media file is required.',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('profile_id', selectedProfile);
      formData.append('title', title.trim());
      formData.append('tags', tags.trim());
      formData.append('description', description.trim());
      formData.append('actual_date', date.toISOString());
      formData.append('address', manualAddress || '');
      formData.append(
        'location',
        JSON.stringify({
          latitude: marker.latitude,
          longitude: marker.longitude,
        })
      );

      // Add media files to FormData
      media.forEach((item, index) => {
        const fileName = item.uri.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append(`file_${index}`, {
          uri: item.uri,
          name: fileName,
          type: `image/${fileType}`,
        });
      });

      const response = await fetch('http://192.168.1.73:5000/upload', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Failed to upload memory');

      // Show success notification
      Toast.show({
        type: 'success',
        text1: 'Memory Uploaded!',
        text2: 'You can now add another memory.',
      });

      // Clear form fields
      setTitle('');
      setTags('');
      setDescription('');
      setManualAddress('');
      setMedia([]);
      setDate(new Date());
      setMarker({ latitude: 37.7749, longitude: -122.4194 }); // Reset marker to default
      setRegion({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.selectedProfileButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name="user-circle"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.selectedProfileButtonText}>
                {profiles.find((p) => p.id === selectedProfile)?.name ||
                  'Select Profile'}
              </Text>
            </View>
          </TouchableOpacity>

          {dropdownVisible ? (
            <View style={styles.dropdownMenu}>
              {profiles.length > 0 ? (
                profiles.map((profile) => (
                  <TouchableOpacity
                    key={profile.id}
                    style={styles.dropdownItem}
                    onPress={() => handleProfileSelection(profile)}
                  >
                    <Text style={styles.dropdownItemText}>
                      {profile.name || 'Unnamed Profile'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No profiles available</Text>
              )}
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>Create a Memory</Text>
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Tags</Text>
        <TextInput
          style={styles.input}
          placeholder="Create tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
        />
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { marginBottom: 20 }]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
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
          <Text style={{ fontSize: 16, marginRight: 10 }}>Memory Date</Text>

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
              {date.toDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#333" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </View>
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
          }}
        >
          <Text
            style={[styles.addressText, { flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {manualAddress ? manualAddress : '📍 Location not set'}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              styles.addressButton,
              { marginLeft: 10 },
            ]}
            onPress={() => setIsMapVisible(true)}
          >
            <Text style={styles.buttonText}>Select Location</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.uploadButton]}
          onPress={handleUpload}
        >
          <Text style={styles.buttonText}>Upload Memory</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={isMapVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search for a location"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          <MapView style={styles.map} region={region} onPress={handleMapPress}>
            <Marker coordinate={marker} />
          </MapView>
          <View style={styles.footer}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.inlineAddressText}>
                {manualAddress === 'None'
                  ? 'No address selected'
                  : manualAddress}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, !manualAddress && styles.disabledButton]}
                onPress={() => setIsMapVisible(false)}
                disabled={!manualAddress} // Disable button if no address is selected
              >
                <Text style={styles.buttonText}>Confirm Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsMapVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  selectedProfileButton: {
    padding: 10,
    backgroundColor: '#19747E', // Button color
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Space below the button
  },
  selectedProfileButtonText: {
    color: '#fff', // Text color
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownMenu: {
    backgroundColor: '#f9f9f9', // Light background for dropdown
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Distribute space evenly
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  searchButton: {
    backgroundColor: '#19747E',
    paddingHorizontal: 15,
    paddingVertical: 13, // Match input height
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 'auto', // Ensure height matches dynamically
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row', // Side-by-side buttons
    justifyContent: 'space-between', // Space between buttons
    width: '100%', // Occupy full width
    marginTop: 10,
  },
  inlineAddressText: {
    fontSize: 14,
    color: '#000', // Ensure visible text color
    textAlign: 'center',
    marginBottom: 5,
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'column', // Align buttons horizontally
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Ensures vertical alignment of both buttons
    marginTop: 10,
    gap: 10, // Space between the buttons
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15, // Match Confirm Location button padding
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  neutralButton: {
    backgroundColor: '#BBBBBB', // Neutral grey color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    marginBottom: 15,
  },
  addressButton: {
    marginBottom: 15,
  },
  carouselContainer: {
    justifyContent: 'center', // Centers content vertically (useful if container is tall)
    alignItems: 'center', // Centers content horizontally
    marginVertical: 20, // Add spacing above and below the carousel
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    overflow: 'hidden',
    width: 300,
    height: 200,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaBankList: {
    paddingBottom: 20,
  },
  mediaBankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaBankImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  mediaBankText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MemoryUpload;
