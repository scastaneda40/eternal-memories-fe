import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSignIn, useUser as useClerkUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useUser } from "../../constants/UserContext";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user: clerkUser } = useClerkUser();
  const { setUser } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (clerkUser?.id) {
      console.log("Clerk user updated:", clerkUser);
      proceedWithBackendRequest(clerkUser.id); // Call backend once user is available
    }
  }, [clerkUser]);

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
    if (!isLoaded || errors.email || errors.password || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting to sign in...");
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      console.log("Sign-in attempt:", signInAttempt);

      if (signInAttempt.status === "complete") {
        console.log("Sign-in complete, activating session...");
        await setActive({ session: signInAttempt.createdSessionId });
        // Backend request will be triggered by useEffect when clerkUser updates
      } else {
        console.error("Sign-in not completed:", JSON.stringify(signInAttempt));
      }
    } catch (error) {
      console.error("Sign-in error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithBackendRequest = async (clerkUserId) => {
    try {
      const payload = {
        clerk_user_id: clerkUserId,
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

      if (!response.ok) {
        const errorData = await response.text(); // Fallback to text if JSON fails
        console.error("Failed to fetch user:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Parsed response from backend:", data);

      setUser({ id: data.id });
      console.log("User set in context:", data.id);
      router.replace("/");
    } catch (err) {
      console.error("Error communicating with backend:", err.message);
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
            (errors.email || errors.password || isLoading) &&
              styles.buttonDisabled,
          ]}
          onPress={onSignInPress}
          disabled={!!errors.email || !!errors.password || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
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


