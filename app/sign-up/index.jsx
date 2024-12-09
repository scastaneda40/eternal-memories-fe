import * as React from 'react';
import { TextInput, TouchableOpacity, View, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [errors, setErrors] = React.useState({ email: '', password: '' });

  const validateEmail = (email) => {
    if (!email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email address.' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const validatePassword = async (password) => {
    if (password.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters.' }));
    } else {
      try {
        // Simulate sign-up attempt to detect pwned passwords
        await signUp.create({ password });
        setErrors((prev) => ({ ...prev, password: '' })); // Clear error if valid
      } catch (error) {
        const pwnedError = error?.errors?.find((err) => err.code === 'form_password_pwned');
        if (pwnedError) {
          setErrors((prev) => ({
            ...prev,
            password: 'Password found in a data breach. Please use a different password.',
          }));
        } else {
          setErrors((prev) => ({ ...prev, password: '' }));
        }
      }
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded || errors.email || errors.password) {
      return;
    }

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeHeader}>Welcome to Eternal Memories</Text>
      <Text style={styles.description}>
        Relive and preserve your cherished moments. Create your account to begin your journey.
      </Text>
      {!pendingVerification && (
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
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          <TouchableOpacity
            style={[styles.button, (errors.email || errors.password) && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={!!errors.email || !!errors.password}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
      {pendingVerification && (
        <View style={styles.formContainer}>
          <Text style={styles.instructionText}>Enter the verification code sent to your email:</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Verification Code"
            placeholderTextColor="#aaa"
            onChangeText={(code) => setCode(code)}
          />
          <TouchableOpacity style={styles.button} onPress={onPressVerify}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </TouchableOpacity>
        </View>
      )}
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
  instructionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
});
