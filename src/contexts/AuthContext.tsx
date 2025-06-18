import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

const STORAGE_KEY = 'user';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUser = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (userJson && isMountedRef.current) {
        setUser(JSON.parse(userJson));
      }
    } catch (err) {
      console.error('Error loading user:', err);
      if (isMountedRef.current) {
        setError('Failed to load user data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const updateState = useCallback((updates: Partial<{ user: User | null; loading: boolean; error: string | null }>) => {
    if (!isMountedRef.current) return;
    
    if ('user' in updates) setUser(updates.user!);
    if ('loading' in updates) setLoading(updates.loading!);
    if ('error' in updates) setError(updates.error!);
  }, []);

  const validateCredentials = useCallback((email: string, password: string, username?: string) => {
    if (!EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (username && username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isMountedRef.current) return;
    
    try {
      updateState({ loading: true, error: null });
      validateCredentials(email, password);
      
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email,
        wpmHistory: [],
        comprehensionScores: [],
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      updateState({ user: mockUser, loading: false });
    } catch (err) {
      console.error('Sign in error:', err);
      updateState({
        error: err instanceof Error ? err.message : 'Failed to sign in. Please try again.',
        loading: false
      });
    }
  }, [updateState, validateCredentials]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    if (!isMountedRef.current) return;
    
    try {
      updateState({ loading: true, error: null });
      validateCredentials(email, password, username);
      
      const mockUser = {
        id: '1',
        username,
        email,
        wpmHistory: [],
        comprehensionScores: [],
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      updateState({ user: mockUser, loading: false });
    } catch (err) {
      console.error('Sign up error:', err);
      updateState({
        error: err instanceof Error ? err.message : 'Failed to sign up. Please try again.',
        loading: false
      });
    }
  }, [updateState, validateCredentials]);

  const signOut = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      updateState({ loading: true, error: null });
      await AsyncStorage.removeItem(STORAGE_KEY);
      updateState({ user: null, loading: false });
    } catch (err) {
      console.error('Sign out error:', err);
      updateState({ error: 'Failed to sign out', loading: false });
    }
  }, [updateState]);

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    error,
  }), [user, loading, signIn, signUp, signOut, error]);

  return (
    <AuthContext.Provider value={value}>
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