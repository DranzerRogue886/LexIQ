import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
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
import WPMTestScreen from './src/screens/WPMTestScreen';
import WPMReadingScreen from './src/screens/WPMReadingScreen';
import WPMComprehensionScreen from './src/screens/WPMComprehensionScreen';
import WPMResultsScreen from './src/screens/WPMResultsScreen';
import PhonicsScreen from './src/screens/PhonicsScreen';

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
  WPMTest: undefined;
  WPMReading: { difficulty: 'easy' | 'medium' | 'hard' };
  WPMComprehension: { 
    difficulty: string; 
    passageId: string; 
    startTime: number; 
    endTime: number;
    wordCount: number;
  };
  WPMResults: { 
    wpm: number; 
    comprehension: number; 
    difficulty: string; 
    passageId: string;
    duration: number;
  };
  Phonics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...MD3LightTheme,
  ...lightTheme,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <VocabularyProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: true,
                animation: 'fade',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.primary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="RSVP" 
                component={RSVPScreen}
                options={{
                  title: 'RSVP Reading',
                }}
              />
              <Stack.Screen 
                name="GuidedPacing" 
                component={GuidedPacingScreen}
                options={{
                  title: 'Guided Pacing',
                }}
              />
              <Stack.Screen 
                name="WordChunking" 
                component={WordChunkingScreen}
                options={{
                  title: 'Word Chunking',
                }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                  title: 'Profile & Progress',
                }}
              />
              <Stack.Screen 
                name="WordRecall" 
                component={WordRecallScreen}
                options={{
                  title: 'Word Recall',
                }}
              />
              <Stack.Screen 
                name="VocabularyDeck" 
                component={VocabularyDeckScreen}
                options={{
                  title: 'Vocabulary Deck',
                }}
              />
              <Stack.Screen 
                name="WPMTest" 
                component={WPMTestScreen}
                options={{
                  title: 'WPM Reading Test',
                }}
              />
              <Stack.Screen 
                name="WPMReading" 
                component={WPMReadingScreen}
                options={{
                  title: 'Reading Test',
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="WPMComprehension" 
                component={WPMComprehensionScreen}
                options={{
                  title: 'Comprehension Check',
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="WPMResults" 
                component={WPMResultsScreen}
                options={{
                  title: 'Test Results',
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen 
                name="Phonics" 
                component={PhonicsScreen}
                options={{
                  title: 'Phonics & Phonetics',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </VocabularyProvider>
      </AuthProvider>
    </PaperProvider>
  );
} 