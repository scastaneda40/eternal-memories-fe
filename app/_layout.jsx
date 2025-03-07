import React from 'react';
import { Stack, Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../constants/UserContext';
import { ProfileProvider } from '../constants/ProfileContext';
import BackButton from '../components/BackButton';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ProfileProvider>
          <Stack
            screenOptions={{
              headerShown: true,
              headerBackTitleVisible: false,
              headerLeft: ({ canGoBack }) =>
                canGoBack ? <BackButton /> : null,
              headerStyle: {
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
                backgroundColor: 'white',
              },
            }}
          >
            <Stack.Screen
              name="sign-in/index"
              options={{
                headerTitle: '',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SettingsPage"
              options={{ headerTitle: 'Account Settings' }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, headerTitle: '' }}
            />
            <Stack.Screen name="MemoryChat" />
            <Stack.Screen name="AddMedia" />
            <Stack.Screen name="LovedOneProfile" />
            <Stack.Screen name="CreateCapsule" />
            <Stack.Screen name="CapsuleReview" />
            <Stack.Screen name="ContactsScreen" />
            <Stack.Screen name="PreviewCapsule" />
            <Stack.Screen name="EditCapsule" />
            <Stack.Screen name="CapsuleTimeline" />
            <Stack.Screen name="VoiceVault" />
            <Stack.Screen name="MemoryUpload" />
            <Stack.Screen name="MediaBankUpload" />
            <Stack.Screen
              name="FamilyNotificationSetup"
              options={{ title: 'Setup Family Notifications' }}
            />
            <Stack.Screen name="CapsuleDetails" />
            <Stack.Screen name="MediaGallery" options={{ title: 'Gallery' }} />
            <Stack.Screen name="login" options={{ title: 'Log In' }} />
            <Stack.Screen
              name="SelectLocationScreen"
              options={{ title: 'Select Location' }}
              initialParams={{ currentAddress: '', currentLocation: null }}
            />
            <Slot />
          </Stack>
        </ProfileProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
