import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../constants/supabaseClient';
import { useUser } from '../../constants/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const MemoryVault = () => {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  console.log('🛠 API_BASE_URL:', API_BASE_URL);

  const [memories, setMemories] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const route = useRoute();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);

  const userId = user?.id;

  console.log('🚀 Component Rendered | userId:', userId);

  useEffect(() => {
    if (!userId) return;

    const fetchProfiles = async () => {
      console.log('🔄 Fetching profiles for user:', userId);
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('profile') // 🔥 Try changing to "profiles"
          .select('*')
          .eq('user_id', userId);

        console.log('🛠 Raw response from Supabase:', { data, error });

        if (error) {
          console.error('❌ Error fetching profiles:', error.message);
        } else {
          setProfiles(data);
          if (data.length > 0) {
            setSelectedProfile(data[0].id);
          }
        }
      } catch (error) {
        console.error('❌ Unexpected error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [userId]);

  useEffect(() => {
    if (!selectedProfile || !userId) return;

    const fetchMemories = async () => {
      if (!selectedProfile || !userId || !API_BASE_URL) {
        console.error('❌ Missing required params:', {
          selectedProfile,
          userId,
          API_BASE_URL,
        });
        return;
      }

      console.log(`🔍 Fetching memories for profile: ${selectedProfile}`);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/memories?profile_id=${encodeURIComponent(
            selectedProfile
          )}`
        );

        console.log('🔹 Response Status:', response.status);
        console.log('🔹 Response Headers:', response.headers);

        const responseText = await response.text(); // Capture response body

        if (!response.ok) {
          throw new Error(
            `❌ Error fetching memories: ${response.status} - ${responseText}`
          );
        }

        const data = JSON.parse(responseText);
        console.log('✅ Memories fetched:', data);
        setMemories(data);
      } catch (error) {
        console.error('❌ Error fetching memories:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [selectedProfile, userId]);

  useEffect(() => {
    if (route.params?.updatedMemory) {
      console.log(
        '🔄 Updating UI with edited memory:',
        route.params.updatedMemory
      );

      setMemories((prevMemories) =>
        prevMemories.map((mem) =>
          mem.id === route.params.updatedMemory.id
            ? {
                ...mem,
                ...route.params.updatedMemory,
                actual_date: route.params.updatedMemory.actual_date,
              }
            : mem
        )
      );
    }
  }, [route.params?.updatedMemory]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#19747E" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() =>
          navigation.navigate('VaultMap', { memories: memories || [] })
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome
            name="globe"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }} // Increased space
          />
          <Text style={[styles.mapButtonText, { marginRight: 6 }]}>
            View Map
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Profile Name */}
            {selectedProfile && (
              <FontAwesome
                name="user-circle"
                size={18}
                color="#fff" // Change color if needed
                style={{ marginRight: 8 }} // Space between text & icon
              />
            )}
            <Text style={styles.dropdownButtonText}>
              {profiles.find((p) => p.id === selectedProfile)?.name ||
                'Select Profile'}
            </Text>

            {/* Show Icon Only When a Profile is Selected */}
          </View>
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.dropdownItem}
                onPress={() => {
                  console.log('🔹 Profile Selected:', profile.id);
                  setSelectedProfile(profile.id);
                  setDropdownVisible(false);
                }}
              >
                <Text style={{ fontSize: 16, color: '#333' }}>
                  {profile.name || 'Unnamed Profile'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memoryContainer}>
            <FlatList
              data={item.file_urls || []}
              horizontal
              keyExtractor={(url, index) => `${item.id}-media-${index}`}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ paddingHorizontal: 10 }} // Ensures even spacing
              renderItem={({ item: mediaUrl }) => (
                <View style={{ marginHorizontal: 5 }}>
                  {' '}
                  {/* Ensures even spacing */}
                  {mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov') ? (
                    <Video
                      source={{ uri: mediaUrl }}
                      style={{
                        width: 300,
                        height: 200,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={{
                        width: 300,
                        height: 200,
                        borderRadius: 10,
                      }}
                    />
                  )}
                </View>
              )}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MemoryDetail', { memory: item })
              }
            >
              <Text style={styles.memoryTitle}>
                {item.title || 'Untitled Memory'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.memoryDate}>
              {new Date(item.actual_date).toLocaleDateString()}
            </Text>
            <Text numberOfLines={2} style={styles.memoryDescription}>
              {item.description || 'No description provided.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 16, color: '#555' },
  mapButton: {
    backgroundColor: '#19747E',
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  mapButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dropdownContainer: { marginHorizontal: 20, marginVertical: 10 },
  dropdownButton: {
    backgroundColor: '#19747E',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dropdownButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dropdownMenu: {
    backgroundColor: '#f9f9f9',
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
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  memoryContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  memoryDate: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  memoryDescription: { fontSize: 14, color: '#555', marginBottom: 5 },
});

export default MemoryVault;
