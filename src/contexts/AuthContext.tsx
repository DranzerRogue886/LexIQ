import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  email: string;
  wpmHistory: number[];
  comprehensionScores: number[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson && mounted) {
        setUser(JSON.parse(userJson));
      }
    } catch (err) {
      console.error('Error loading user:', err);
      if (mounted) {
        setError('Failed to load user data');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [mounted]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email,
        wpmHistory: [],
        comprehensionScores: [],
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await SecureStore.setItemAsync('userToken', 'mock-token');
      if (mounted) {
        setUser(mockUser);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      if (mounted) {
        setError('Failed to sign in');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: '1',
        username,
        email,
        wpmHistory: [],
        comprehensionScores: [],
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await SecureStore.setItemAsync('userToken', 'mock-token');
      if (mounted) {
        setUser(mockUser);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      if (mounted) {
        setError('Failed to sign up');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AsyncStorage.removeItem('user');
      await SecureStore.deleteItemAsync('userToken');
      if (mounted) {
        setUser(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      if (mounted) {
        setError('Failed to sign out');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 