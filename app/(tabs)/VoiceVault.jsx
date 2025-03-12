import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const VoiceVault = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '', // Remove title to prevent extra space
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Change as needed
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Change as needed
  },
});

export default VoiceVault;
