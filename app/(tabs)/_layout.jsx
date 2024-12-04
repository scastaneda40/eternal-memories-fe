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
import PreviewCapsule from "../../components/PreviewCapsule";
import EditCapsule from "../../components/EditCapsule";
import MemoryDetail from "../../components/MemoryDetail";
import MediaBankUpload from "../../components/MediaBankUpload";
import MediaGallery from "../../components/MediaGallery";
import VaultMap from "../../components/VaultMap";
import { UserProvider } from "../../constants/UserContext";
import MemoryUpload from "./MemoryUpload";

const Stack = createStackNavigator();

// Define primary color
const PRIMARY_TEAL = "#19747E";

export default function Layout() {
    return (
        <UserProvider>
            <ProfileProvider>
                <Stack.Navigator screenOptions={{ headerShown: true }}>
                    {/* Main Tabs */}
                    <Stack.Screen
                        name="MainTabs"
                        component={TabsLayout}
                        options={{ headerShown: false }}
                    />

                    <Stack.Screen name="MemoryChat" component={MemoryChat} />
                    <Stack.Screen name="AddMedia" component={AddMedia} />
                    <Stack.Screen name="LovedOneProfile" component={LovedOneProfile} />
                    <Stack.Screen name="CreateCapsule" component={CreateCapsule} />
                    <Stack.Screen name="CapsuleReview" component={CapsuleReview} />
                    <Stack.Screen name="PreviewCapsule" component={PreviewCapsule} />
                    <Stack.Screen name="EditCapsule" component={EditCapsule} />
                    <Stack.Screen name="CapsuleTimeline" component={CapsuleTimeline} />
                    <Stack.Screen name="MemoryDetail" component={MemoryDetail} />
                    <Stack.Screen name="VaultMap" component={VaultMap} options={{ title: "Memory Map" }} />
                    <Stack.Screen name="MemoryUpload" component={MemoryUpload} />
                    <Stack.Screen name="MediaBankUpload" component={MediaBankUpload} />
                    <Stack.Screen name="MediaGallery" component={MediaGallery} />

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
                tabBarActiveTintColor: PRIMARY_TEAL, // Primary teal for selected tab
                tabBarInactiveTintColor: "gray", // Gray for inactive tabs
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

