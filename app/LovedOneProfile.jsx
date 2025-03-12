import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { useProfile } from '../constants/ProfileContext';
import { useUser } from '../constants/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const LovedOneProfile = () => {
  const { setProfile } = useProfile();
  const { user } = useUser(); // Get the user object from context
  const userId = user?.id; // Extract userId from user
  const navigation = useNavigation(); // Get navigation object

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState(''); // New field
  const [traits, setTraits] = useState('');
  const [sayings, setSayings] = useState('');
  const [memories, setMemories] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);

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
      const response = await fetch('http://192.168.1.73:5000/profile', {
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
        <Text style={{ fontSize: 16, marginVertical: 8 }}>Shared Memories</Text>

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
});

export default LovedOneProfile;
