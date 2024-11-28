import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

const MemoryChat = ({ route }) => {
    const { profile } = route.params || {}; // Get profile data from route params
    const [messages, setMessages] = useState([
        { id: 1, text: `Hi, I'm ${profile?.name}, here to chat with you!`, sender: "AI" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: "User" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

            // Call your backend API for response
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: input, profile }),
            });

            const data = await response.json();
            const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                sender: "AI",
            };

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

    // Scroll to the last message when messages change
    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const renderTypingIndicator = () => {
        const [dots, setDots] = useState("");

        useEffect(() => {
            const interval = setInterval(() => {
                setDots((prev) => (prev.length < 3 ? prev + "." : ""));
            }, 500);
            return () => clearInterval(interval);
        }, []);

        return (
            <View style={styles.typingContainer}>
                <Text style={styles.typingText}>Typing</Text>
                <Text style={styles.typingDots}>{dots}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
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
                    <View style={styles.typingBubble}>{renderTypingIndicator()}</View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type your message..."
                    />
                    <Button
                        title={isLoading ? "Sending..." : "Send"}
                        onPress={handleSend}
                        disabled={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    messageBubble: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: "80%",
    },
    userBubble: {
        backgroundColor: "#007AFF",
        alignSelf: "flex-end",
        color: "#fff",
    },
    aiBubble: {
        backgroundColor: "#f0f0f0",
        alignSelf: "flex-start",
        color: "#333",
    },
    messageText: {
        fontSize: 16,
    },
    typingBubble: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f0f0",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        maxWidth: "80%",
    },
    typingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    typingText: {
        fontSize: 16,
        color: "#333",
    },
    typingDots: {
        fontSize: 16,
        color: "#333",
        marginLeft: 5,
        width: 20, // Fixed width
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
});

export default MemoryChat;



