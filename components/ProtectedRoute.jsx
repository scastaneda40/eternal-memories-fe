import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../constants/AuthContext";

const PRIMARY_TEAL = "#19747E";

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.replace("/login");
    }
  }, [isMounted, isLoading, user, router]);

  if (isLoading || (!user && !isMounted)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={PRIMARY_TEAL} />
      </View>
    );
  }

  return children;
}

export default ProtectedRoute;



