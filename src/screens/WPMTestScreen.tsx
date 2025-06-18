import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Button, SegmentedButtons, useTheme, Card, ProgressBar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVocabulary } from '../contexts/VocabularyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  WPMTest: undefined;
  WPMReading: { difficulty: 'easy' | 'medium' | 'hard' };
  WPMResults: { 
    wpm: number; 
    comprehension: number; 
    difficulty: string; 
    passageId: string;
    duration: number;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'WPMTest'>;

const { width, height } = Dimensions.get('window');

interface WPMTestResult {
  timestamp: string;
  difficultyLevel: string;
  wpmScore: number;
  comprehensionScore: number;
  passageId: string;
  userInputFlags: string[];
  duration: number;
}

const WPMTestScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { vocabulary } = useVocabulary();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [lastTestDate, setLastTestDate] = useState<string | null>(null);
  const [daysSinceLastTest, setDaysSinceLastTest] = useState<number>(0);
  const [recentResults, setRecentResults] = useState<WPMTestResult[]>([]);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('wpm_test_history');
      if (history) {
        const results: WPMTestResult[] = JSON.parse(history);
        setRecentResults(results);
        
        if (results.length > 0) {
          const lastTest = results[results.length - 1];
          setLastTestDate(lastTest.timestamp);
          
          const daysSince = Math.floor(
            (Date.now() - new Date(lastTest.timestamp).getTime()) / (1000 * 60 * 60 * 24)
          );
          setDaysSinceLastTest(daysSince);
        }
      }
    } catch (error) {
      console.error('Error loading test history:', error);
    }
  };

  const handleStartTest = () => {
    if (daysSinceLastTest < 1) {
      Alert.alert(
        'Test Cooldown',
        'Please wait at least 24 hours between WPM tests for accurate results.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.navigate('WPMReading', { difficulty });
  };

  const getAverageWPM = (results: WPMTestResult[]) => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.wpmScore, 0);
    return Math.round(total / results.length);
  };

  const getRecommendedTraining = (wpm: number, difficulty: string) => {
    if (difficulty === 'easy') {
      if (wpm < 200) return 'Guided RSVP at 180 WPM';
      if (wpm < 300) return 'Word Chunking at 250 WPM';
      return 'RSVP Reading at 350 WPM';
    } else if (difficulty === 'medium') {
      if (wpm < 180) return 'Guided RSVP at 160 WPM';
      if (wpm < 250) return 'Word Chunking at 220 WPM';
      return 'RSVP Reading at 300 WPM';
    } else {
      if (wpm < 150) return 'Guided RSVP at 130 WPM';
      if (wpm < 200) return 'Word Chunking at 180 WPM';
      return 'RSVP Reading at 250 WPM';
    }
  };

  const recentResultsForDifficulty = recentResults.filter(r => r.difficultyLevel === difficulty);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          WPM Reading Test
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Measure your reading speed and comprehension
        </Text>

        {/* Re-test Reminder */}
        {lastTestDate && daysSinceLastTest >= 7 && (
          <Card style={[styles.reminderCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <Text style={[styles.reminderText, { color: theme.colors.onPrimaryContainer }]}>
                📅 It's been {daysSinceLastTest} days since your last WPM test. 
                Want to check your progress?
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select Difficulty Level
          </Text>
          <SegmentedButtons
            value={difficulty}
            onValueChange={value => setDifficulty(value as 'easy' | 'medium' | 'hard')}
            buttons={[
              { 
                value: 'easy', 
                label: 'Easy',
                icon: 'school',
              },
              { 
                value: 'medium', 
                label: 'Medium',
                icon: 'book-open-variant',
              },
              { 
                value: 'hard', 
                label: 'Hard',
                icon: 'brain',
              },
            ]}
            style={styles.segmentedButtons}
          />
          
          <Text style={[styles.difficultyInfo, { color: theme.colors.onSurfaceVariant }]}>
            {difficulty === 'easy' && 'Grade 4-6: Simple vocabulary, short sentences'}
            {difficulty === 'medium' && 'Grade 7-9: Descriptive texts, narrative flow'}
            {difficulty === 'hard' && 'Grade 10+: Complex sentences, figurative language'}
          </Text>
        </View>

        {/* Recent Performance */}
        {recentResultsForDifficulty.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Performance ({difficulty})
            </Text>
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Average WPM:
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                    {getAverageWPM(recentResultsForDifficulty)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Tests Taken:
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                    {recentResultsForDifficulty.length}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Last Test:
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                    {daysSinceLastTest} days ago
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Test Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Test Instructions
          </Text>
          <Card style={styles.instructionsCard}>
            <Card.Content>
              <Text style={[styles.instructionText, { color: theme.colors.onSurface }]}>
                • Read the passage at your normal pace{'\n'}
                • Lockdown mode prevents scrolling and copying{'\n'}
                • Answer comprehension questions after reading{'\n'}
                • Score 70%+ for valid WPM results{'\n'}
                • Test takes 2-5 minutes
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Start Test Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartTest}
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            disabled={daysSinceLastTest < 1}
            icon="play"
          >
            Begin Reading Test
          </Button>
          
          {daysSinceLastTest < 1 && (
            <Text style={[styles.cooldownText, { color: theme.colors.error }]}>
              Please wait {24 - (daysSinceLastTest * 24)} hours before retesting
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  reminderCard: {
    marginBottom: 24,
  },
  reminderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  difficultyInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsCard: {
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 250,
  },
  cooldownText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WPMTestScreen; 