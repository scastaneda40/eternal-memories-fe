import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    FlatList,
    Modal,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useProfile } from "../../constants/ProfileContext";
import { useUser } from "../../constants/UserContext";
import { supabase } from "../../constants/supabaseClient";

const MemoryChat = ({ route }) => {
    const { profile: globalProfile, setProfile } = useProfile();
    const { userId } = useUser();
    const profile = route?.params?.profile || globalProfile || null;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [dots, setDots] = useState("");
    const flatListRef = useRef(null);

    const [profiles, setProfiles] = useState([]);
    const [isModalVisible, setModalVisible] = useState(!profile); // Show modal if no profile

    // Fetch profiles if no profile is set
    useEffect(() => {
        if (!profile) {
            fetchProfiles();
        }
    }, [profile]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from("profile")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching profiles:", error.message);
            } else {
                setProfiles(data || []);
            }
        } catch (error) {
            console.error("Unexpected error fetching profiles:", error);
        }
    };

    const selectProfile = (selectedProfile) => {
        setProfile(selectedProfile);
        setModalVisible(false);
    };

    useEffect(() => {
        if (isTyping) {
            const interval = setInterval(() => {
                setDots((prev) => (prev.length < 3 ? prev + "." : ""));
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!profile) {
            setMessages((prev) => [
                ...prev,
                { id: Date.now(), text: "Please create a profile before chatting.", sender: "AI" },
            ]);
            return;
        }

        const userMessage = { id: Date.now(), text: input, sender: "User" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    profile,
                    user_id: userId,
                }),
            });

            const data = await response.json();
            if (!data.response || data.response.trim() === "") {
                throw new Error("Received empty response from server.");
            }

            const aiMessage = { id: Date.now() + 1, text: data.response, sender: "AI" };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error with AI response:", error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, text: "Sorry, I couldn't respond. Please try again later.", sender: "AI" },
            ]);
        } finally {
            setIsTyping(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
        <SafeAreaView style={styles.container}>
            {isModalVisible && (
                <Modal visible={isModalVisible} transparent={true} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select a Profile</Text>
                            <FlatList
                                data={profiles}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.profileItem}
                                        onPress={() => selectProfile(item)}
                                    >
                                        <Text style={styles.profileText}>{item.name}</Text>
                                        <Text style={styles.profileTextSmall}>{item.relationship}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.messageBubble,
                                item.sender === "AI" ? styles.aiBubble : styles.userBubble,
                            ]}
                        >
                            <Text style={styles.messageText}>{item.text}</Text>
                        </View>
                    )}
                />
                {isTyping && (
                    <View style={styles.typingBubble}>
                        <Text style={styles.typingText}>Typing{dots}</Text>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type your message..."
                    />
                    <Button title={isLoading ? "Sending..." : "Send"} onPress={handleSend} disabled={isLoading} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
    messageBubble: { marginVertical: 5, padding: 10, borderRadius: 10, maxWidth: "80%" },
    userBubble: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
    aiBubble: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
    messageText: { fontSize: 16 },
    typingBubble: { alignSelf: "flex-start", marginVertical: 10 },
    typingText: { fontSize: 16, color: "#333" },
    inputContainer: { flexDirection: "row", padding: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginRight: 10 },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "90%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    profileItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        alignItems: "center",
    },
    profileText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    profileTextSmall: {
        fontSize: 14,
        color: "#666",
    },
    closeButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default MemoryChat;

