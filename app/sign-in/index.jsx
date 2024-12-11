import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useUser } from "../../constants/UserContext";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { setUser } = useUser(); // Access `setUser` here


  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateEmail = (email) => {
    if (!email.includes("@")) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address." }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded || errors.email || errors.password) {
      return;
    }
  
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
  
      console.log("Sign-in attempt:", signInAttempt);
  
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
  
        const userId = signInAttempt.createdSessionId;
        const payload = {
          clerk_user_id: userId,
          email: emailAddress,
        };
  
        console.log("Payload being sent to backend:", payload);
  
        const response = await fetch("http://localhost:5000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
  
        console.log("Raw response from backend:", response);
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Parse the response JSON safely
        const data = await response.json();
        console.log("Parsed response from backend:", data.id);
  
        // Update UserContext
        setUser({ id: data.id });
  
        // Navigate to the dashboard
        router.replace("/");
      } else {
        console.error("Sign-in not completed:", JSON.stringify(signInAttempt, null, 2));
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeHeader}>Welcome Back</Text>
      <Text style={styles.description}>
        Sign in to relive and preserve your cherished moments.
      </Text>
      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          onChangeText={(email) => {
            setEmailAddress(email);
            validateEmail(email);
          }}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={true}
          onChangeText={(password) => {
            setPassword(password);
            validatePassword(password);
          }}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.button,
            (errors.email || errors.password) && styles.buttonDisabled,
          ]}
          onPress={onSignInPress}
          disabled={!!errors.email || !!errors.password}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account?</Text>
          <Link href="/sign-up" style={styles.link}>
            <Text style={styles.linkTextHighlight}>Sign up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  welcomeHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#19747E",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  button: {
    width: "100%",
    backgroundColor: "#19747E",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: "#555",
  },
  linkTextHighlight: {
    color: "#19747E",
    fontWeight: "bold",
  },
});
