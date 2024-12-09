import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const handleAuth = async (email, password) => {
    try {
      if (isSignUp) {
        await signUp.create({ emailAddress: email, password });
        await signUp.attemptEmailAddressVerification({ code: "123456" }); // Example code
      } else {
        await signIn.create({ identifier: email, password });
      }
      alert("Authentication successful!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isSignUp ? "Sign Up" : "Log In"}
        onPress={() => handleAuth("test@example.com", "password123")}
      />
      <Button
        title={isSignUp ? "Switch to Log In" : "Switch to Sign Up"}
        onPress={() => setIsSignUp((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
});
