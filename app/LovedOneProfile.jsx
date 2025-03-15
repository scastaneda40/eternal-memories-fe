import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useProfile } from '../constants/ProfileContext';
import { useUser } from '../constants/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const LovedOneProfile = () => {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  const { setProfile } = useProfile();
  const { user } = useUser(); // Get the user object from context
  const userId = user?.id; // Extract userId from user
  const navigation = useNavigation(); // Get navigation object

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState(''); // New field
  const [traits, setTraits] = useState('');
  const [sayings, setSayings] = useState('');
  const [memories, setMemories] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);

  useEffect(() => {
    const checkExistingProfiles = async () => {
      try {
        console.log('🔍 Checking profiles for user:', userId);
        const response = await fetch(
          `${API_BASE_URL}/profile?user_id=${userId}`
        );

        console.log('🔹 Response Status:', response.status);
        console.log('🔹 Response Headers:', response.headers);

        const responseText = await response.text(); // Read as plain text first
        console.log('🔹 Raw Response Text:', responseText);

        // Only parse if it starts with `{` or `[`
        if (responseText.startsWith('{') || responseText.startsWith('[')) {
          const data = JSON.parse(responseText);
          console.log('✅ Parsed profile data:', data);

          if (!data || data.length === 0) {
            console.log('🆕 First-time user, showing instructions...');
            setShowInstructions(true);
          }
        } else {
          console.error('❌ Server did not return JSON:', responseText);
        }
      } catch (error) {
        console.error('❌ Error checking profiles:', error);
      }
    };

    if (userId) {
      checkExistingProfiles();
    }
  }, [userId]);

  const handleSave = async () => {
    if (!userId) {
      console.error('User ID is missing from context.');
      Alert.alert('Error', 'You must be logged in to save a profile.');
      return;
    }

    const profile = {
      name,
      relationship,
      traits,
      sayings,
      memories,
      user_id: userId, // Ensure this is from useUser context
    };

    console.log('Payload being sent to server:', profile);

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      console.log('Server response status:', response.status);

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error(errorResponse.message || 'Failed to save profile.');
      }

      const { profile: savedProfile } = await response.json();
      console.log('Saved profile received from server:', savedProfile);

      setProfile(savedProfile);

      Alert.alert('Success', 'Profile saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <>
      {showInstructions && (
        <Modal visible={showInstructions} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create a Profile</Text>
              <Text style={styles.modalText}>
                Profiles help you organize memories for the important people in
                your life. Every memory, message, or photo you add will be
                linked to a profile. You can create as many as you like.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowInstructions(false)}
              >
                <Text style={styles.modalButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <SafeAreaView
        style={[styles.container, { paddingTop: 10 }]}
        edges={['left', 'right']}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create a Profile</Text>

          <Text style={{ fontSize: 16, marginVertical: 8 }}>Name</Text>
          <TextInput
            placeholder="Enter their name (e.g., Grandma Rose)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Text style={{ fontSize: 16, marginVertical: 8 }}>Relationship</Text>
          <TextInput
            placeholder="Relationship? (e.g., Father, Best Friend)"
            value={relationship}
            onChangeText={setRelationship}
            style={styles.input}
          />
          <Text style={{ fontSize: 16, marginVertical: 8 }}>
            Personality Traits
          </Text>

          <TextInput
            placeholder="Personality traits (e.g., kind, humorous)"
            value={traits}
            onChangeText={setTraits}
            style={styles.input}
          />
          <Text style={{ fontSize: 16, marginVertical: 8 }}>
            Favorite Sayings
          </Text>

          <TextInput
            placeholder="What are their favorite sayings?"
            value={sayings}
            onChangeText={setSayings}
            style={[styles.input, styles.largeInput]}
            multiline={true}
            numberOfLines={3}
          />
          <Text style={{ fontSize: 16, marginVertical: 8 }}>
            Shared Memories
          </Text>

          <TextInput
            placeholder="Share a few memories with them."
            value={memories}
            onChangeText={setMemories}
            style={[styles.input, styles.largerInput]}
            multiline={true}
            numberOfLines={5} // More lines for longer content
          />
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            styles.uploadButton,
            { marginBottom: 20 },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#19747E',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  largeInput: {
    height: 80,
    paddingVertical: 15,
  },
  largerInput: {
    height: 120,
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#19747E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LovedOneProfile;
