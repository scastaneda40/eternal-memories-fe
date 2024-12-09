import Constants from "expo-constants";
import { ClerkProvider } from "@clerk/clerk-expo";

const clerkPublishableKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
}

export { ClerkProvider, clerkPublishableKey };
