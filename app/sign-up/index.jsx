import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../constants/supabaseClient';

export default function SignUpScreen() {
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

  const validatePassword = (password) => {
    setErrors((prev) => ({
      ...prev,
      password:
        password.length >= 8 ? '' : 'Password must be at least 8 characters.',
    }));
  };

  const onSignUpPress = async () => {
    if (errors.email || errors.password || isLoading) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password: password,
      });

      if (error) {
        console.error('❌ Supabase Sign-Up Error:', error.message);
      } else {
        console.log('✅ Supabase Sign-Up Success:', data);
        router.replace('/'); // Redirect user after sign-up
      }
    } catch (error) {
      console.error('❌ Sign-Up Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeHeader}>Welcome to Eternal Memories</Text>
      <Text style={styles.description}>
        Relive and preserve your cherished moments. Create your account to begin
        your journey.
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
          onPress={onSignUpPress}
          disabled={!!errors.email || !!errors.password || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
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
});
