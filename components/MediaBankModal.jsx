import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../constants/supabaseClient';
import Constants from 'expo-constants';

const MediaBankModal = ({ isVisible, onClose, onMediaSelect, userId }) => {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  const [mediaBank, setMediaBank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]); // Store selected media

  // ✅ Fetch media from backend
  const fetchMediaBank = async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        console.error('❌ User session error:', sessionError?.message);
        setLoading(false);
        return;
      }

      const userToken = sessionData.session.access_token;
      if (!userToken) {
        console.error('❌ No user token found.');
        setLoading(false);
        return;
      }

      // ✅ Fix: Ensure URL matches backend API
      const response = await fetch(
        `${API_BASE_URL}:5000/api/media-bank?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}`
        );
      }

      const { media } = await response.json();
      console.log('✅ Media fetched successfully:', media);

      setMediaBank(media);
    } catch (error) {
      console.error('❌ fetchMediaBank() Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🟢 MediaBankModal visibility changed:', isVisible);
    if (isVisible) {
      console.log('🔍 Calling fetchMediaBank...');
      fetchMediaBank();
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 10 }}>
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
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
        ) : (
          <FlatList
            data={mediaBank}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3} // ✅ Grid format
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isVideo =
                item.url.endsWith('.mp4') || item.url.endsWith('.mov');
              const isSelected = selectedMedia.some(
                (mediaItem) => mediaItem.id === item.id
              );

              return (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    margin: 5,
                    aspectRatio: 1, // Keeps thumbnails square
                    maxWidth: '30%',
                    borderRadius: 8,
                    overflow: 'hidden',
                    position: 'relative',
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? '#19747E' : 'transparent',
                  }}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedMedia((prev) =>
                        prev.filter((mediaItem) => mediaItem.id !== item.id)
                      );
                    } else {
                      setSelectedMedia((prev) => [
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
                        <Text style={{ color: '#fff', fontSize: 16 }}>▶</Text>
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
          />
        )}

        {/* ✅ Confirm Selection Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#19747E',
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={() => {
            onMediaSelect(selectedMedia);
            onClose();
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Confirm Selection
          </Text>
        </TouchableOpacity>

        {/* ❌ Close Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#ddd',
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
          }}
          onPress={onClose}
        >
          <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold' }}>
            Close
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

export default MediaBankModal;
