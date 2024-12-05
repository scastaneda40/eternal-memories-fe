import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

const DailyGriefQuote = () => {
    const [quote] = useState(
        "What we once enjoyed and deeply loved we can never lose. - Helen Keller"
    );

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1518976024611-8a7ab499c92a",
            }}
            resizeMode="cover"
            style={styles.background}
        >
            <View style={styles.overlay}>
                <Text style={styles.quoteText}>{quote.split("-")[0]}</Text>
                <Text style={styles.authorText}>- {quote.split("-")[1]}</Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
        padding: 20,
        borderRadius: 15,
    },
    quoteText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 32,
    },
    authorText: {
        color: "#ffdf91",
        fontSize: 18,
        marginTop: 10,
        textAlign: "right",
        fontStyle: "italic",
    },
});

export default DailyGriefQuote;












