import { createStackNavigator } from "@react-navigation/stack";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "react-native"; // For avatar image
import LovedOneProfile from "../../components/LovedOneProfile";
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
import MemoryUpload from "../../components/MemoryUpload";
import { ThemeProvider } from "../../constants/ThemeProvider";
import Settings from "../../components/Settings"; // New Settings page

const Stack = createStackNavigator();
const PRIMARY_TEAL = "#19747E";

export default function Layout() {
    return (
        <ThemeProvider>
            <UserProvider>
                <ProfileProvider>
                    <Stack.Navigator screenOptions={{ headerShown: true }}>
                        {/* Main Tabs */}
                        <Stack.Screen
                            name="MainTabs"
                            component={TabsLayout}
                            options={{
                                headerTitle: "",
                                headerStyle: { backgroundColor: "#f8f8f8" },
                                headerShadowVisible: false,
                                headerShown: false,
                            }}
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
                        <Stack.Screen name="MediaGallery" component={MediaGallery} options={{ title: "Gallery" }} />
                        {/* <Stack.Screen
                            name="Settings"
                            component={Settings}
                            options={{
                                headerShown: false,
                                gestureDirection: "horizontal",
                            }}
                        /> */}
                    </Stack.Navigator>
                </ProfileProvider>
            </UserProvider>
        </ThemeProvider>
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
                    } else if (route.name === "MemoryVault") {
                        iconName = "albums";
                    } else if (route.name === "CapsuleTimeline") {
                        iconName = "time";
                    } else if (route.name === "MemoryChat") {
                        iconName = "chatbubbles";
                    }

                    // if (route.name === "Settings") {
                    //     return (
                    //         <Image
                    //             source={{
                    //                 uri: "https://via.placeholder.com/100", // Replace with your avatar URL
                    //             }}
                    //             style={{
                    //                 width: size,
                    //                 height: size,
                    //                 borderRadius: size / 2,
                    //             }}
                    //         />
                    //     );
                    // }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: PRIMARY_TEAL,
                tabBarInactiveTintColor: "gray",
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Dashboard", headerShown: false }} />
            <Tabs.Screen name="MemoryVault" options={{ title: "Memory Vault" }} />
            {/* <Tabs.Screen name="Settings" options={{ title: "Profile", tabBarLabel: "Profile" }} /> */}
            <Tabs.Screen name="CapsuleTimeline" options={{ title: "Capsules" }} />
            <Tabs.Screen name="MemoryChat" options={{ title: "Memory Chat" }} />
        </Tabs>
    );
}
