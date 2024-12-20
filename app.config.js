import 'dotenv/config';

export default {
  expo: {
    name: "eternal-moments-mobile",
    slug: "eternal-moments-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      "newArchEnabled": true,
      supportsTablet: true,
      bundleIdentifier: "com.example.eternal-moments-mobile", // Add a generic bundleIdentifier
    },
    android: {
      "newArchEnabled": true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },
};

