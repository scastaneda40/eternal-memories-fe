import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../../constants/supabaseClient';
import { useRouter } from 'expo-router';
import { useUser } from '../../constants/UserContext';
import Constants from 'expo-constants';

export default function SignInScreen() {
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL?.replace(
    /\/$/,
    ''
  );
  const { setUser } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    setErrors((prev) => ({
      ...prev,
      email: email.includes('@') ? '' : 'Invalid email address.',
    }));
  };

  console.log('🔹 API_BASE_URL:', API_BASE_URL);

  const validatePassword = (password) => {
    setErrors((prev) => ({
      ...prev,
      password:
        password.length >= 8 ? '' : 'Password must be at least 8 characters.',
    }));
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.user) {
        console.log('✅ User already signed in:', sessionData.user);
        setUser(sessionData.user);
        // Redirect to the next screen, like dashboard or profile
        router.replace('/dashboard'); // Or /LovedOneProfile
      }
    };

    checkSession();
  }, []);

  const onSignInPress = async () => {
    if (errors.email || errors.password || isLoading) return;
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.user) {
        console.log('✅ User already logged in:', sessionData.user);
        setUser(sessionData.user);
        router.replace('/dashboard'); // Or /LovedOneProfile
        return;
      }

      // Continue with the sign-in process if no session found
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend sign-in error:', errorData);
        setErrors((prev) => ({ ...prev, password: errorData.message }));
        return;
      }

      const { token, user, needsProfile } = await response.json();
      console.log('✅ Backend auth success. Token:', token);

      if (!token) {
        console.error('❌ No token received from backend.');
        return;
      }

      // Set the session with Supabase Auth
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token, // If the backend provides it, use the refresh token
      });

      if (sessionError) {
        console.error('❌ Failed to persist session:', sessionError.message);
      } else {
        console.log('✅ Session persisted successfully!');
      }

      setUser(user); // Set the user after the session is established

      if (needsProfile) {
        console.log('🔄 Redirecting to profile creation...');
        router.replace('/LovedOneProfile');
      } else {
        console.log('🏠 Redirecting to dashboard...');
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('❌ Network or server error:', error.message);
    } finally {
      setIsLoading(false);
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
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={(password) => {
            setPassword(password);
            validatePassword(password);
          }}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/sign-up')}>
            <Text style={styles.linkTextHighlight}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#19747E',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: '#19747E',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#555',
  },
  linkTextHighlight: {
    color: '#19747E',
    fontWeight: 'bold',
  },
});
