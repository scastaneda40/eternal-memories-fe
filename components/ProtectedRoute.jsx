import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const PRIMARY_TEAL = "#19747E";

export default function ProtectedRoute({ children }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.replace("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.text}>Redirecting to Sign In...</Text>
      </SafeAreaView>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: PRIMARY_TEAL,
  },
});

