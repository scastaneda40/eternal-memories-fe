import React from "react";
import { Stack, Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../constants/UserContext";
import { ProfileProvider } from "../constants/ProfileContext";
import { AuthProvider } from "../constants/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <ProfileProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Main Tab Navigator */}
              <Stack.Screen name="(tabs)" />
              {/* Additional Routes */}
              <Stack.Screen name="MemoryChat" />
              <Stack.Screen name="AddMedia" />
              <Stack.Screen name="LovedOneProfile" />
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
              {/* Render Child Routes */}
              <Slot />
            </Stack>
          </ProfileProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
