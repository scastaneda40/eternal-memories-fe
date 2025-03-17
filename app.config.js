import 'dotenv/config';

export default {
  expo: {
    name: 'eternal-moments-mobile',
    slug: 'eternal-moments-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    plugins: ['expo-router'], // ✅ Correct placement of plugins

    ios: {
      newArchEnabled: true,
      supportsTablet: true,
      bundleIdentifier: 'com.scastaneda.eternalmomentsbeta',
    },

    android: {
      package: 'com.example.eternalmomentsmobile',
      newArchEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },

    web: {
      favicon: './assets/images/favicon.png',
    },

    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      API_BASE_URL: process.env.API_BASE_URL,
      eas: {
        projectId: 'eb2876e4-b444-4350-b82b-0f8d8250c8a8',
      },
    },
  },
};
