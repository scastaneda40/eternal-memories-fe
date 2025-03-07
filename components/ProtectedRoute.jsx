import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../constants/supabaseClient";

const PRIMARY_TEAL = "#19747E";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setIsAuthLoaded(true);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (isAuthLoaded && !user) {
      console.log("🔹 No active Supabase session, redirecting to sign-in.");
      router.replace("/sign-in");
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </SafeAreaView>
    );
  }

  return user ? children : null;
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
