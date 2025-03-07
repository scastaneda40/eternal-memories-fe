import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Video } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../constants/supabaseClient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../constants/UserContext';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import MediaBankModal from '../components/MediaBankModal';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

const MemoryDetail = () => {
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: '' }); // ✅ Hides the screen title
  }, [navigation]);

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;

  const route = useRoute();
  const mediaRefs = useRef([]);
  const navigation = useNavigation();
  const { user } = useUser();
  const userId = user?.id;

  const memory = route?.params?.memory;
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemory, setEditedMemory] = useState({ ...memory });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [search, setSearch] = useState(''); // ✅ Fix: Add search input state
  const [manualAddress, setManualAddress] = useState('None'); // ✅ Selected address
  const [marker, setMarker] = useState({
    latitude: 37.7749, // Default: San Francisco (Replace with memory location if available)
    longitude: -122.4194,
  });
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMediaOptionsVisible, setMediaOptionsVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null); // Stores selected media before confirming
  const [selectedMediaType, setSelectedMediaType] = useState(null); // 'image' or 'video'
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null); // Tracks the index of the item being deleted
  const [isMediaBankModalVisible, setIsMediaBankModalVisible] = useState(false);
  const [mediaAdded, setMediaAdded] = useState(false);

  // ✅ Load existing location if available

  useEffect(() => {
    if (memory?.address) {
      const addressParts = memory.address.split(',');
      const city = addressParts.length > 1 ? addressParts[0].trim() : '';
      const state = addressParts.length > 2 ? addressParts[1].trim() : '';

      setEditedMemory((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          city,
          state,
        },
      }));
    }
  }, [memory]);

  useEffect(() => {
    console.log('🔄 Updated media in carousel:', editedMemory.file_urls);
  }, [editedMemory.file_urls]);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
      }
    })();
  }, []);

  useEffect(() => {
    if (editedMemory.location?.coordinates) {
      const [longitude, latitude] = editedMemory.location.coordinates;
      setMarker({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [editedMemory.location]);

  useEffect(() => {
    console.log('Current navigation state:', navigation.getState());
  }, [navigation]);

  useEffect(() => {
    console.log('Route params:', route.params);
  }, [route]);

  if (!memory) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.errorText}>Memory details are unavailable.</Text>
      </View>
    );
  }

  const formattedDate = editedMemory.actual_date
    ? new Date(editedMemory.actual_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Invalid Date';

  const renderMediaItem = ({ item, index }) => {
    if (!item) {
      console.error(`🚨 Invalid media item at index ${index}:`, item);
      return null;
    }

    const isDeleting = deletingIndex === index; // Check if this item is being deleted

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderWidth: isDeleting ? 5 : 0,
          borderColor: isDeleting ? 'red' : 'transparent',
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'border-color 0.5s ease-in-out',
          backgroundColor: 'transparent', // Prevent white bleeding
        }}
      >
        {typeof item === 'string' &&
        (item.endsWith('.mp4') || item.endsWith('.mov')) ? (
          <Video
            source={{ uri: item }}
            style={[styles.media, { borderRadius: 12 }]} // Apply borderRadius to media as well
            resizeMode="cover"
            useNativeControls
            shouldPlay={false}
            ref={(ref) => {
              if (ref && !mediaRefs.current.includes(ref)) {
                mediaRefs.current.push(ref);
              }
            }}
          />
        ) : (
          <Image
            source={{ uri: item }}
            style={[styles.media, { borderRadius: 12 }]} // Apply borderRadius to media as well
          />
        )}

        {/* ✅ Only show Delete Button when `isEditing` is `true` */}
        {isEditing && (
          <>
            {/* 🗑️ Delete Button */}
            <TouchableOpacity
              onPress={() => handleDeleteMedia(index)}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: '#D32F2F',
                borderRadius: 50,
                width: 45,
                height: 45,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Feather name="trash-2" size={22} color="#fff" />
            </TouchableOpacity>

            {/* ➕ Add Media Button */}
            <TouchableOpacity
              onPress={() => setMediaOptionsVisible(true)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: '#19747E', // Teal color
                borderRadius: 50,
                width: 45,
                height: 45,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setDatePickerOpen(false); // Close picker

    if (selectedDate) {
      const newFormattedDate = selectedDate.toISOString().split('T')[0]; // Convert to "YYYY-MM-DD"
      console.log('🟢 [handleDateChange] New selected date:', newFormattedDate);

      setEditedMemory((prev) => ({
        ...prev,
        actual_date: newFormattedDate,
      }));

      console.log('🟢 [handleDateChange] Updated editedMemory:', editedMemory);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  // ✅ Convert coordinates to an address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        let city = '';
        let state = '';

        // Extract city and state from address components
        addressComponents.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name; // Use short_name for state abbreviations (e.g., "CA")
          }
        });

        // Store in state
        setManualAddress(`${city}, ${state}`);
        setEditedMemory((prev) => ({
          ...prev,
          location: {
            coordinates: [longitude, latitude],
            city,
            state,
          },
        }));
      }
    } catch (error) {
      console.error('❌ Error during reverse geocoding:', error);
    }
  };

  // ✅ Search for a location by name
  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        search
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      console.log('🔍 Fetching from Google Maps API:', url);

      const response = await fetch(url);

      console.log('📡 Response Status:', response.status);
      console.log(
        '📡 Response Headers:',
        JSON.stringify(response.headers, null, 2)
      );

      const data = await response.json();

      console.log('✅ Full API Response:', JSON.stringify(data, null, 2));

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const addressComponents = data.results[0].address_components;
        const fullAddress = data.results[0].formatted_address;
        let city = '';
        let state = '';

        // Extract city and state
        addressComponents.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
        });

        setRegion((prev) => ({
          ...prev,
          latitude: location.lat,
          longitude: location.lng,
        }));

        setMarker({
          latitude: location.lat,
          longitude: location.lng,
        });

        setManualAddress(fullAddress);

        setEditedMemory((prev) => ({
          ...prev,
          location: {
            coordinates: [location.lng, location.lat],
            city,
            state,
            address: fullAddress,
          },
        }));
      } else {
        console.error(
          `❌ Error: Google Maps API returned status '${data.status}' - ${
            data.error_message || 'No additional error message'
          }`
        );
      }
    } catch (error) {
      console.error('🚨 Fetch failed:', error.message);
    }
  };

  const handleSave = async () => {
    console.log(
      '🟠 [handleSave] Current editedMemory before saving:',
      editedMemory
    );

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        throw new Error('User session not found.');
      }

      const userToken = sessionData.session.access_token;
      if (!userToken) {
        throw new Error('User token does not exist.');
      }

      // ✅ Convert location to valid GeoJSON format
      const formattedLocation = editedMemory.location?.coordinates
        ? {
            type: 'Point',
            coordinates: editedMemory.location.coordinates,
          }
        : null;

      console.log('🔵 [handleSave] Sending to backend:', {
        id: editedMemory.id,
        title: editedMemory.title,
        actual_date: editedMemory.actual_date,
        description: editedMemory.description,
        location: formattedLocation, // ✅ Now in correct GeoJSON format
        address: editedMemory.location?.address, // ✅ Ensure address is sent separately
      });

      const response = await fetch(
        'http://localhost:5000/api/memories/update',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            id: editedMemory.id,
            title: editedMemory.title,
            actual_date: editedMemory.actual_date,
            description: editedMemory.description,
            location: formattedLocation, // ✅ Fixed GeoJSON format
            address: editedMemory.location?.address, // ✅ Send address separately
            file_urls: editedMemory.file_urls || [], // ✅ Send file URLs (even empty)
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const dataResponse = await response.json();
      console.log(
        '✅ [handleSave] Memory successfully updated via backend:',
        dataResponse
      );

      // ✅ Explicitly update state and trigger re-render
      setEditedMemory((prev) => ({
        ...prev,
        actual_date: dataResponse.data[0]?.actual_date || prev.actual_date,
        location: dataResponse.data[0]?.location || prev.location,
        address: dataResponse.data[0]?.address || prev.address,
      }));

      // ✅ Navigate with updated memory
      navigation.navigate('(tabs)', {
        screen: 'MemoryVault',
        params: {
          updatedMemory: {
            ...dataResponse.data[0],
            actual_date: dataResponse.data[0]?.actual_date || prev.actual_date,
          },
        },
      });
    } catch (error) {
      console.error(
        '❌ [handleSave] Failed to update memory via backend:',
        error.message
      );
    }
  };

  const handleDeleteMedia = (index) => {
    if (!editedMemory.file_urls || editedMemory.file_urls.length === 0) return;

    // Show a confirmation alert
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this media file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // ✅ Highlight the item before deletion
            setDeletingIndex(index);

            // ✅ Delay deletion slightly so user sees the red border effect
            setTimeout(() => {
              const updatedMedia = (editedMemory.file_urls || []).filter(
                (_, i) => i !== index
              );

              setEditedMemory((prev) => ({
                ...prev,
                file_urls: updatedMedia,
              }));

              setDeletingIndex(null); // Reset after deletion
            }, 500); // Wait 0.5s before deleting
          },
        },
      ]
    );
  };

  const handleEditLocation = () => {
    console.log('📍 Edit Location button clicked!');
    // In the next step, we can replace this with a real map picker or input field
  };

  const locationFetched = useRef(false); // Prevent multiple API calls

  const fetchCityAndState = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        const { city, state } = data.results[0].components;
        return city && state ? { city, state } : null; // Return null if either is missing
      }
    } catch (error) {
      console.error('❌ Error fetching city and state:', error);
    }
    return null; // Return null if there's an error
  };

  // const fetchMediaBank = async () => {
  //   try {
  //       setLoading(true);
  //       console.log("Fetching media from backend...");

  //       const response = await fetch("https://localhost:5000/api/media-bank", {
  //           method: "GET",
  //           headers: {
  //               Authorization: `Bearer ${userToken}`, // Ensure user is authenticated
  //               "Content-Type": "application/json",
  //           },
  //       });

  //       if (!response.ok) {
  //           throw new Error(`Error: ${response.statusText}`);
  //       }

  //       const data = await response.json();
  //       console.log("Fetched media:", data.media);
  //       setMediaBank(data.media);
  //   } catch (err) {
  //       console.error("Error fetching media:", err);
  //   } finally {
  //       setLoading(false);
  //   }
  // };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets
          .map((asset) => asset.uri)
          .filter(Boolean); // ✅ Filter invalid URIs

        setEditedMemory((prev) => ({
          ...prev,
          file_urls: [...(prev.file_urls || []), ...newMedia],
        }));

        console.log('✅ Updated file_urls:', editedMemory.file_urls);

        setMediaAdded(true);

        // ✅ Hide after 3 seconds
        setTimeout(() => setMediaAdded(false), 3000);
      }
    } catch (error) {
      console.error('❌ Error picking media:', error);
    }
  };

  // Fetch location only if it’s missing
  useEffect(() => {
    if (!editedMemory.location?.city || !editedMemory.location?.state) {
      if (editedMemory.location?.coordinates) {
        const [longitude, latitude] = editedMemory.location.coordinates;

        fetchCityAndState(latitude, longitude).then((locationData) => {
          if (locationData) {
            setEditedMemory((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                city: locationData.city,
                state: locationData.state,
              },
            }));
          }
        });
      }
    }
  }, [editedMemory.location]);

  // Function to display city & state or "Set Location"
  const getCityAndState = (location) => {
    if (!location?.city || !location?.state) return '📍 Set Location';
    return `📍 ${location.city}, ${location.state}`;
  };

  // Inside return statement

  useEffect(() => {
    console.log('Updated editedMemory:', editedMemory);
  }, [editedMemory]);

  useEffect(() => {
    console.log('Updated editedMemory location:', editedMemory.location);
  }, [editedMemory.location]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast ref={(ref) => Toast.setRef(ref)} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width}
            height={300}
            data={(editedMemory.file_urls || []).filter(Boolean)} // ✅ Remove invalid items
            renderItem={({ item, index }) => renderMediaItem({ item, index })} // ✅ Ensure correct props
            onSnapToItem={() => {
              mediaRefs.current.forEach((ref) => {
                if (ref) ref.pauseAsync();
              });
            }}
          />
        </View>

        {isMediaOptionsVisible && (
          <Modal
            visible={isMediaOptionsVisible}
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
                {/* Select from Media Bank */}
                <MediaBankModal
                  isVisible={isMediaBankModalVisible}
                  onClose={() => setIsMediaBankModalVisible(false)}
                  onMediaSelect={(selectedMedia) => {
                    console.log('✅ Media selected:', selectedMedia);

                    setEditedMemory((prev) => ({
                      ...prev,
                      file_urls: [
                        ...(prev.file_urls || []),
                        ...selectedMedia.map((item) => item.uri),
                      ],
                    }));

                    setMediaAdded(true); // ✅ Trigger re-render

                    setTimeout(() => {
                      setMediaAdded(false);
                    }, 3000);
                  }}
                  userId={userId}
                />
                ;
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
                  onPress={() => setIsMediaBankModalVisible(true)} // ✅ Open new modal
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
                  onPress={() => setMediaOptionsVisible(false)}
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
        )}

        <View style={styles.detailsContainer}>
          {/* Title Box - Only in Edit Mode */}
          <View style={isEditing ? styles.editBox : {}}>
            {isEditing ? (
              <TextInput
                style={[styles.title, { textAlign: 'center' }]}
                value={editedMemory.title}
                onChangeText={(text) =>
                  setEditedMemory({ ...editedMemory, title: text })
                }
              />
            ) : (
              <Text
                style={[
                  styles.title,
                  {
                    textAlign: 'center',
                  },
                ]}
              >
                {memory.title}
              </Text>
            )}
          </View>

          {/* Date Picker Section */}
          <View style={{ alignItems: 'center' }}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  onPress={() => setDatePickerOpen(true)}
                  style={styles.editBox}
                >
                  <Text style={{ fontSize: 16, color: '#555' }}>
                    {formattedDate} (Tap to change)
                  </Text>
                </TouchableOpacity>
                {datePickerOpen && (
                  <DateTimePicker
                    value={
                      editedMemory.actual_date
                        ? new Date(editedMemory.actual_date)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange} // ✅ Updated to use correct function
                  />
                )}
              </>
            ) : (
              <Text style={styles.date}>{formattedDate}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={() => setIsMapVisible(true)}
              style={{
                marginTop: 5,
                padding: 15,
                marginBottom: 10,
                backgroundColor: '#EFEFEF',
                borderRadius: 5,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: '#555' }}>
                {getCityAndState(editedMemory.location)}
              </Text>
            </TouchableOpacity>
          )}

          {isMapVisible && (
            <Modal
              visible={isMapVisible}
              animationType="slide"
              transparent={true}
            >
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    backgroundColor: '#f4f4f4',
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 12,
                      fontSize: 16,
                    }}
                    placeholder="Search for a location"
                    value={search}
                    onChangeText={setSearch}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#19747E',
                      paddingHorizontal: 15,
                      paddingVertical: 13,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 10,
                    }}
                    onPress={handleSearch}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
                    >
                      Search
                    </Text>
                  </TouchableOpacity>
                </View>

                <MapView
                  style={{ flex: 1 }}
                  region={region}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={marker} />
                </MapView>

                <View
                  style={{
                    padding: 15,
                    backgroundColor: '#f9f9f9',
                    borderTopWidth: 1,
                    borderColor: '#ddd',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#000',
                        textAlign: 'center',
                        marginBottom: 5,
                      }}
                    >
                      {manualAddress === 'None'
                        ? 'No address selected'
                        : manualAddress}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: manualAddress ? '#19747E' : '#aaa',
                        paddingVertical: 12,
                        paddingHorizontal: 15,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: '45%',
                        textAlign: 'center',
                        marginHorizontal: 5,
                      }}
                      onPress={async () => {
                        try {
                          // Use Reverse Geocoding to Extract City & State
                          const response = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.latitude},${marker.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                          );
                          const data = await response.json();

                          if (data.status === 'OK' && data.results.length > 0) {
                            let city = '';
                            let state = '';

                            // Extract city & state
                            data.results[0].address_components.forEach(
                              (component) => {
                                if (component.types.includes('locality')) {
                                  city = component.long_name;
                                }
                                if (
                                  component.types.includes(
                                    'administrative_area_level_1'
                                  )
                                ) {
                                  state = component.short_name;
                                }
                              }
                            );

                            setEditedMemory((prev) => ({
                              ...prev,
                              location: {
                                coordinates: [
                                  marker.longitude,
                                  marker.latitude,
                                ],
                                city,
                                state,
                                address: manualAddress, // ✅ Store full address
                              },
                            }));

                            console.log('✅ Updated location:', {
                              city,
                              state,
                            });
                          } else {
                            console.error('❌ Reverse geocoding failed');
                          }
                        } catch (error) {
                          console.error('❌ Error fetching city/state:', error);
                        }

                        setIsMapVisible(false);
                      }}
                      disabled={!manualAddress}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}
                      >
                        Confirm Location
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#fff',
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        alignItems: 'center',
                        maxWidth: '45%',
                        justifyContent: 'center',
                        flex: 1,
                        marginHorizontal: 5,
                      }}
                      onPress={() => setIsMapVisible(false)}
                    >
                      <Text
                        style={{
                          color: '#333',
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>
          )}

          <MediaBankModal
            isVisible={isMediaBankModalVisible}
            onClose={() => {
              console.log('🟢 MediaBankModal closed');
              setIsMediaBankModalVisible(false);
            }}
            onMediaSelect={(selectedMedia) => {
              console.log('✅ Media selected:', selectedMedia);
              setEditedMemory((prev) => ({
                ...prev,
                file_urls: [
                  ...(prev.file_urls || []),
                  ...selectedMedia.map((item) => item.uri),
                ],
              }));

              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 3000);
            }}
            userId={userId}
          />

          {/* Description Box - Only in Edit Mode */}
          <View
            style={
              isEditing
                ? [
                    styles.editBox,
                    { flex: 1, justifyContent: 'center', alignItems: 'center' },
                  ]
                : {}
            }
          >
            {isEditing ? (
              <TextInput
                style={[styles.description, { textAlign: 'center' }]}
                value={editedMemory.description}
                onChangeText={(text) =>
                  setEditedMemory({ ...editedMemory, description: text })
                }
                multiline
              />
            ) : (
              <Text
                style={[styles.description, { textAlign: 'center' }]}
                numberOfLines={10}
                ellipsizeMode="tail"
              >
                {memory.description}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => console.log('Share')}
        >
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>

        {isEditing ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 30,
    lineHeight: 32,
    marginBottom: 10,
    color: '#333333',
    paddingTop: 0,
  },
  date: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 16,
    color: '#444444',
    textAlign: 'center',
    textAlignVertical: 'center',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#DDDDDD',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#19747E',
  },
  secondaryButton: {
    backgroundColor: '#3399CC',
  },
  editBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 5,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignItemVertical: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default MemoryDetail;
