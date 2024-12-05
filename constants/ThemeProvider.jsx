import React, { createContext, useContext } from "react";
import { Text, StyleSheet, Platform } from "react-native";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const theme = {
        text: {
            fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
        },
    };

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

const ThemedText = (props) => {
    const theme = useContext(ThemeContext);
    return <Text style={[theme.text, props.style]}>{props.children}</Text>;
};

export { ThemeProvider, ThemedText };
