import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { lightTheme, darkTheme } from './src/theme/theme';
import { useColorScheme } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RSVPScreen from './src/screens/RSVPScreen';
import GuidedPacingScreen from './src/screens/GuidedPacingScreen';
import WordChunkingScreen from './src/screens/WordChunkingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RSVP: undefined;
  GuidedPacing: undefined;
  WordChunking: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: theme.colors.background,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RSVP" component={RSVPScreen} />
            <Stack.Screen name="GuidedPacing" component={GuidedPacingScreen} />
            <Stack.Screen name="WordChunking" component={WordChunkingScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
} 