import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { FancyTitle } from '../components/FancyTitle';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading, error: authError } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [errorMessage, setErrorMessage] = useState('');

  // Clear error message when switching between sign in and sign up
  useEffect(() => {
    setErrorMessage('');
  }, [isSignUp]);

  // Update error message when auth error changes
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  const handleSubmit = async () => {
    try {
      setErrorMessage('');

      // Basic validation
      if (!email || !password) {
        setErrorMessage('Please fill in all fields');
        return;
      }

      if (isSignUp && !username) {
        setErrorMessage('Please enter a username');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address');
        return;
      }

      // Password validation
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }

      if (isSignUp) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      
      // Only navigate if there's no error
      if (!errorMessage) {
        navigation.replace('Home');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during authentication');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FancyTitle />
            
            <View style={styles.formContainer}>
              <Text style={[styles.title, { color: theme.colors.primary }]}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>

              {isSignUp && (
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  mode="outlined"
                  autoCapitalize="none"
                />
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />

              {errorMessage && (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                  {errorMessage}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>

              <Button
                mode="text"
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchButton}
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 16,
  },
  error: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default LoginScreen; 