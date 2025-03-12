import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../../constants/supabaseClient';
import { useUser } from '../../constants/UserContext';
import {
  convertUTCToLocal,
  convertUTCToSpecifiedZone,
} from '../../utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../../constants/ProfileContext';
import { DateTime } from 'luxon';
import Constants from 'expo-constants';

const CapsuleTimeline = () => {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  const navigation = useNavigation();

  const { profile } = useProfile();
  const [view, setView] = useState('upcoming');
  const [capsules, setCapsules] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
    });
  }, [navigation]);

  const { user } = useUser();

  const userId = user?.id;

  useEffect(() => {
    if (userId && profile?.id) {
      fetchCapsules();
    }
  }, [view, userId, profile?.id]);

  const fetchCapsules = async () => {
    try {
      console.log('Fetching capsules from backend...');

      const response = await fetch(
        `${API_BASE_URL}/api/capsules?user_id=${userId}&profile_id=${profile.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch capsules.');
      }

      console.log('✅ Capsules with media:', data);

      const now = DateTime.now().toUTC(); // Ensure time zone consistency

      const parsedCapsules = data.map((capsule) => ({
        ...capsule,
        release_date: new Date(capsule.release_date),
      }));

      const upcomingCapsules = parsedCapsules.filter(
        (capsule) => capsule.release_date > now.toJSDate()
      );
      const releasedCapsules = parsedCapsules.filter(
        (capsule) => capsule.release_date <= now.toJSDate()
      );

      console.log('✅ Upcoming Capsules:', upcomingCapsules);
      console.log('✅ Released Capsules:', releasedCapsules);

      setCapsules(view === 'upcoming' ? upcomingCapsules : releasedCapsules);
    } catch (err) {
      console.error('Unexpected error fetching capsules:', err.message);
    }
  };

  const toggleView = (selectedView) => setView(selectedView);

  const handlePress = (capsule) => {
    console.log('Navigating with capsule:', capsule);

    navigation.navigate('CapsuleDetails', {
      capsuleDetails: {
        ...capsule,
        release_date: capsule.release_date.toISOString(), // ✅ Ensure it's serializable
      },
      mediaFiles: capsule.mediaFiles || [], // ✅ Ensure media files are passed
    });
  };

  const MAX_TITLE_LENGTH = 20;

  const renderCapsule = ({ item }) => {
    const localDate = convertUTCToLocal(item.release_date);
    const specifiedDate = convertUTCToSpecifiedZone(
      item.release_date,
      item.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const handleFamilyNotificationSetup = () => {
      console.log(
        'Navigating to FamilyNotificationSetup with capsuleId:',
        item.id
      );
      navigation.navigate('FamilyNotificationSetup', { capsuleId: item.id });
    };

    const truncatedTitle =
      item.title.length > MAX_TITLE_LENGTH
        ? `${item.title.slice(0, MAX_TITLE_LENGTH)}...`
        : item.title;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={styles.capsuleItem}
      >
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.title}>
            {truncatedTitle}
          </Text>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, styles[item.privacy_level]]}>
              {item.privacy_level}
            </Text>
            {item.privacy_level === 'family' && (
              <TouchableOpacity onPress={handleFamilyNotificationSetup}>
                <Text style={styles.notificationText}>🔔</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.date}>
          {view === 'upcoming'
            ? `Releases on: ${localDate}`
            : `Released on: ${specifiedDate || localDate}`}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => toggleView('upcoming')}
          style={[
            styles.toggleButton,
            view === 'upcoming' && styles.activeButton,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              view === 'upcoming' && styles.activeText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleView('released')}
          style={[
            styles.toggleButton,
            view === 'released' && styles.activeButton,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              view === 'released' && styles.activeText,
            ]}
          >
            Released
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCapsule}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No capsules found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  toggleContainer: { flexDirection: 'row', marginBottom: 10 },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: { backgroundColor: '#19747E' },
  toggleText: { fontSize: 16, color: '#555' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  capsuleItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 8 },
  date: { fontSize: 14, color: '#888', marginTop: 5 },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  capsuleItem: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    textTransform: 'capitalize',
  },
  family: {
    backgroundColor: '#FFD700', // Gold
    color: '#FFF',
  },
  public: {
    backgroundColor: '#4CAF50', // Green
    color: '#FFF',
  },
  private: {
    backgroundColor: '#9E9E9E', // Gray
    color: '#FFF',
  },
  notificationText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#888', marginTop: 5 },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    overflow: 'hidden',
  },
});

export default CapsuleTimeline;
