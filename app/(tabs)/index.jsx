import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../constants/supabaseClient';
import Calendar from '../../components/Calendar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../../constants/ProfileContext';
import { useUser } from '../../constants/UserContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Example

const Dashboard = () => {
  const navigation = useNavigation();
  const [highlightedMemory, setHighlightedMemory] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const { profile, setProfile } = useProfile();
  const { user } = useUser();

  const screenHeight = Dimensions.get('window').height;

  const dynamicTileStyle = {
    width: '100%',
    height: screenHeight * 0.12, // ✅ Fix: This must be applied dynamically in JSX
  };

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile for user:', user?.id);

      if (!user?.id) return;

      try {
        const { data: profiles, error } = await supabase
          .from('profile')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching profile:', error.message);
          return;
        }

        if (profiles && profiles.length > 0) {
          console.log('Profiles found:', profiles);
          const selectedProfile = profiles[0]; // ✅ Pick the first profile
          setProfile(selectedProfile); // ✅ Update profile context
        } else {
          console.log('No profiles found for this user.');
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
      }
    };

    fetchProfile(); // ✅ Fetch profile on component mount
  }, []); // ✅ Runs only once when the component mounts

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user details for:', user?.id);

      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('users') // Make sure this is the correct table for auth users
          .select('avatar_url')
          .eq('id', user.id)
          .single(); // Ensures we only get one user record

        if (error) {
          console.error('Error fetching user avatar:', error.message);
          return;
        }

        if (data?.avatar_url) {
          console.log('User avatar found:', data.avatar_url);
          setAvatar(`${data.avatar_url}?timestamp=${new Date().getTime()}`);
        } else {
          console.log('No avatar found for this user.');
        }
      } catch (err) {
        console.error('Unexpected error fetching user avatar:', err);
      }
    };

    fetchUser(); // Fetch user details on component mount
  }, [user?.id]); // Re-run if user ID changes

  useEffect(() => {
    const fetchRandomImage = async () => {
      console.log('Fetching random image...');
      try {
        const { data: memories, error } = await supabase
          .from('memories')
          .select(
            `
            *,
            memory_media (
              media_bank (
                url
              )
            )
          `
          )
          .eq('user_id', user?.id)
          .eq('profile_id', profile?.id);

        if (error) {
          console.error('Error fetching memories:', error.message);
          return;
        }

        // Flatten and filter out video URLs
        const imageUrls = memories
          .flatMap((memory) =>
            memory.memory_media.map((media) => media.media_bank.url)
          )
          .filter((url) => !url.endsWith('.mp4') && !url.endsWith('.mov'));

        if (imageUrls.length > 0) {
          const randomImage =
            imageUrls[Math.floor(Math.random() * imageUrls.length)];
          console.log('Random image selected:', randomImage);
          setHighlightedMemory(randomImage); // Set the random image
        } else {
          console.log('No images found for the user and profile.');
        }
      } catch (err) {
        console.error('Unexpected error fetching memories:', err);
      }
    };

    if (profile?.id) {
      fetchRandomImage();
    }
  }, [profile?.id, user?.id]);

  return (
    <View style={{ flex: 1 }}>
      {/* Hero Section */}
      <ImageBackground
        source={{
          uri: highlightedMemory || 'https://via.placeholder.com/500',
        }}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate('SettingsPage')}
        >
          {console.log('🧐 Dashboard Avatar URL:', avatar)}
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
            />
          ) : (
            <View style={styles.iconContainer}>
              <Icon name="user" size={28} color="#555" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => navigation.navigate('MemoryVault')}
        >
          <Text style={styles.heroButtonText}>View Memory Vault</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Calendar Section */}
        <View style={styles.calendar}>
          <Calendar />
        </View>

        {/* Action Tiles */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionTile, dynamicTileStyle]} // ✅ Apply dynamic style here
            onPress={() => navigation.navigate('MemoryUpload')}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color="#19747E"
              style={styles.tileIcon}
            />
            <Text style={styles.tileText}>Upload Memory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, dynamicTileStyle]} // ✅ Apply dynamic style here
            onPress={() => navigation.navigate('LovedOneProfile')}
          >
            <Ionicons
              name="person-add-outline"
              size={28}
              color="#19747E"
              style={styles.tileIcon}
            />
            <Text style={styles.tileText}>Create Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, dynamicTileStyle]} // ✅ Apply dynamic style here
            onPress={() => navigation.navigate('MediaGallery')}
          >
            <Ionicons
              name="images-outline"
              size={28}
              color="#19747E"
              style={styles.tileIcon}
            />
            <Text style={styles.tileText}>View Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, dynamicTileStyle]} // ✅ Apply dynamic style here
            onPress={() => navigation.navigate('CreateCapsule')}
          >
            <Ionicons
              name="cube-outline"
              size={28}
              color="#19747E"
              style={styles.tileIcon}
            />
            <Text style={styles.tileText}>Create Capsule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    height: 265, // Set height for hero image
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  profileIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 60,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2, // Circular border only when icon is shown
    borderColor: '#777',
    backgroundColor: '#e0e0e0', // Optional background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#19747E',
    paddingVertical: 14, // Adjust padding for a smaller button size
    paddingHorizontal: 15,
    borderRadius: 8,
    position: 'absolute',
    top: 150, // Bring it closer to the top
    left: 20, // Align it to the left
    width: '65%',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 10,
    backgroundColor: '#f4f4f6',
    flex: 1,
    justifyContent: 'space-between',
    borderTopLeftRadius: 20, // Rounded top left corner
    borderTopRightRadius: 20, // Rounded top right corner
    marginTop: -25, // Slightly pull it up to align with the hero section
  },
  calendar: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingBottom: '5%',
    marginBottom: 0,
  },
  actionTile: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  tileIcon: {
    marginBottom: 10, // Space between icon and text
  },
  tileText: {
    fontSize: 16, // Adjust font size
    fontWeight: '600', // Make text bold
    color: '#333', // Dark gray color for text
  },
});

export default Dashboard;
