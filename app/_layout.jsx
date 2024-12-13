import React from "react";
import { Stack, Slot } from "expo-router";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../constants/UserContext";
import { ProfileProvider } from "../constants/ProfileContext";
import { clerkPublishableKey } from "../constants/clerkClient";
import * as SecureStore from 'expo-secure-store'
import { TokenCache } from '@clerk/clerk-expo/dist/cache'



export default function RootLayout() {
    if (!clerkPublishableKey) {
        throw new Error(
          "The Clerk publishable key (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) is missing."
        );
      }

    //   const createTokenCache = (TokenCache) => {
    //     return {
    //       getToken: async (key) => {
    //         try {
    //           const item = await SecureStore.getItemAsync(key)
    //           if (item) {
    //             console.log(`${key} was used 🔐 \n`)
    //           } else {
    //             console.log('No values stored under key: ' + key)
    //           }
    //           return item
    //         } catch (error) {
    //           console.error('secure store get item error: ', error)
    //           await SecureStore.deleteItemAsync(key)
    //           return null
    //         }
    //       },
    //       saveToken: (key, token) => {
    //         return SecureStore.setItemAsync(key, token)
    //       },
    //     }
    //   }
    
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <UserProvider>
          <ProfileProvider>
            <Stack screenOptions={{ headerShown: true, headerBackTitleVisible: false }}>
              {/* Main Tab Navigator */}
              <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
              {/* Additional Routes */}
              <Stack.Screen name="MemoryChat" />
              <Stack.Screen name="AddMedia" />
              <Stack.Screen name="LovedOneProfile"/>
              <Stack.Screen name="CreateCapsule" />
              <Stack.Screen name="CapsuleReview" />
              <Stack.Screen name="PreviewCapsule" />
              <Stack.Screen name="EditCapsule" />
              <Stack.Screen name="CapsuleTimeline" />
              <Stack.Screen name="MemoryDetail" />
              <Stack.Screen name="VaultMap" options={{ title: "Memory Map" }} />
              <Stack.Screen name="MemoryUpload" />
              <Stack.Screen name="MediaBankUpload" />
              <Stack.Screen name="MediaGallery" options={{ title: "Gallery" }} />
              <Stack.Screen name="login" options={{ title: "Log In" }} />
              <Stack.Screen name="SelectLocationScreen" options={{ title: "Select Location" }}   initialParams={{ currentAddress: "", currentLocation: null }} />
              {/* Render Child Routes */}
              <Slot />
            </Stack>
          </ProfileProvider>
        </UserProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

