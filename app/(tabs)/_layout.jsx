import { createStackNavigator } from "@react-navigation/stack";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import LovedOneProfile from "../../components/LovedOneProfile"; // Adjust path if necessary
import CreateCapsule from "../../components/CreateCapsule";
import AddMedia from "../../components/AddMedia";
import CapsuleReview from "../../components/CapsuleReview";
import { ProfileProvider } from "../../constants/ProfileContext";
import MemoryChat from "./MemoryChat";
import CapsuleTimeline from "./CapsuleTimeline";
import { UserProvider } from "../../constants/UserContext";

const Stack = createStackNavigator();

export default function Layout() {
    return (
      <UserProvider>
      <ProfileProvider>
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={TabsLayout} options={{ headerShown: false }} />

            <Stack.Screen name="MemoryChat" component={MemoryChat} />
            <Stack.Screen name="AddMedia" component={AddMedia} />

            <Stack.Screen name="LovedOneProfile" component={LovedOneProfile} />

            <Stack.Screen name="CreateCapsule" component={CreateCapsule} />

            <Stack.Screen name="CapsuleReview" component={CapsuleReview} />
           
        </Stack.Navigator>
        </ProfileProvider>
        </UserProvider>
    );
}

function TabsLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === "index") {
                        iconName = "home";
                    } else if (route.name === "MemoryUpload") {
                        iconName = "cloud-upload";
                    } else if (route.name === "MemoryVault") {
                        iconName = "albums";
                    } else if (route.name === "MemoryChat") {
                        iconName = "chatbubbles";
                    } else if (route.name === "CapsuleTimeline") {
                      iconName = "time"; 
                  }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "blue",
                tabBarInactiveTintColor: "gray",
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
            <Tabs.Screen name="MemoryUpload" options={{ title: "Upload Memory" }} />
            <Tabs.Screen name="MemoryVault" options={{ title: "Memory Vault" }} />
            <Tabs.Screen name="CapsuleTimeline" options={{ title: "Capsules" }} />
            <Tabs.Screen name="MemoryChat" options={{ title: "Memory Chat" }} />
        </Tabs>
    );
}
