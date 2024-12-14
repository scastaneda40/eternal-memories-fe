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

            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: PRIMARY_TEAL,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            height: 80, // Increased height for better spacing
            backgroundColor: "#fff",
            borderTopColor: "transparent",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarIconStyle: {
            marginBottom: 4
          },
          tabBarLabelStyle: {
            fontSize: 12, // Slightly larger label for readability
            fontWeight: "500",
            marginTop: -4, // Align label closer to the icon
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 8,
          },
        })}
      >
        <Tabs.Screen name="index" options={{ headerShown: false, title: "Home" }} />
        <Tabs.Screen name="MemoryVault" options={{ title: "Memory Vault" }} />
        <Tabs.Screen name="CapsuleTimeline" options={{ title: "Capsules" }} />
        <Tabs.Screen name="MemoryChat" options={{ title: "Memory Chat" }} />
      </Tabs>
    </ProtectedRoute>
  );
}
