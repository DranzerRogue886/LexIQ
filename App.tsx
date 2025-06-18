import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { VocabularyProvider } from './src/contexts/VocabularyContext';
import { lightTheme } from './src/theme/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RSVPScreen from './src/screens/RSVPScreen';
import GuidedPacingScreen from './src/screens/GuidedPacingScreen';
import WordChunkingScreen from './src/screens/WordChunkingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WordRecallScreen from './src/screens/WordRecallScreen';
import VocabularyDeckScreen from './src/screens/VocabularyDeckScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RSVP: undefined;
  GuidedPacing: undefined;
  WordChunking: undefined;
  Profile: undefined;
  WordRecall: {
    passageWords: string[];
  };
  VocabularyDeck: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider theme={lightTheme}>
      <AuthProvider>
        <VocabularyProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="RSVP" component={RSVPScreen} />
              <Stack.Screen name="GuidedPacing" component={GuidedPacingScreen} />
              <Stack.Screen name="WordChunking" component={WordChunkingScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="WordRecall" component={WordRecallScreen} />
              <Stack.Screen name="VocabularyDeck" component={VocabularyDeckScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </VocabularyProvider>
      </AuthProvider>
    </PaperProvider>
  );
} 