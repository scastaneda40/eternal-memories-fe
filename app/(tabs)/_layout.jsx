import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProtectedRoute from "../../components/ProtectedRoute";

const PRIMARY_TEAL = "#19747E";

export default function TabsLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "index") iconName = "home";
            else if (route.name === "MemoryVault") iconName = "albums";
            else if (route.name === "CapsuleTimeline") iconName = "time";
            else if (route.name === "MemoryChat") iconName = "chatbubbles";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: PRIMARY_TEAL,
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="MemoryVault" options={{ title: "Memory Vault" }} />
        <Tabs.Screen name="CapsuleTimeline" options={{ title: "Capsules" }} />
        <Tabs.Screen name="MemoryChat" options={{ title: "Memory Chat" }} />
      </Tabs>
    </ProtectedRoute>
  );
}
