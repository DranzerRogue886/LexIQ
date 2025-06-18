import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Button, useTheme, Card, ProgressBar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVocabulary } from '../contexts/VocabularyContext';

type RootStackParamList = {
  WPMResults: { 
    wpm: number; 
    comprehension: number; 
    difficulty: string; 
    passageId: string;
    duration: number;
  };
  Home: undefined;
  WPMTest: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'WPMResults'>;

const { width, height } = Dimensions.get('window');

const WPMResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { wpm, comprehension, difficulty, passageId, duration } = route.params;
  const theme = useTheme();
  const { vocabulary } = useVocabulary();
  const [isValidResult, setIsValidResult] = useState(false);

  useEffect(() => {
    // Check if comprehension is sufficient for valid WPM
    setIsValidResult(comprehension >= 70);
  }, [comprehension]);

  const getRecommendedTraining = (wpm: number, difficulty: string) => {
    if (difficulty === 'easy') {
      if (wpm < 200) return { type: 'Guided RSVP', speed: 180, description: 'Build foundational reading speed' };
      if (wpm < 300) return { type: 'Word Chunking', speed: 250, description: 'Improve word processing efficiency' };
      return { type: 'RSVP Reading', speed: 350, description: 'Advanced speed training' };
    } else if (difficulty === 'medium') {
      if (wpm < 180) return { type: 'Guided RSVP', speed: 160, description: 'Focus on comprehension at higher speeds' };
      if (wpm < 250) return { type: 'Word Chunking', speed: 220, description: 'Enhance chunking skills' };
      return { type: 'RSVP Reading', speed: 300, description: 'Speed reading practice' };
    } else {
      if (wpm < 150) return { type: 'Guided RSVP', speed: 130, description: 'Complex text processing' };
      if (wpm < 200) return { type: 'Word Chunking', speed: 180, description: 'Advanced comprehension training' };
      return { type: 'RSVP Reading', speed: 250, description: 'Expert level reading' };
    }
  };

  const getWPMCategory = (wpm: number, difficulty: string) => {
    if (difficulty === 'easy') {
      if (wpm < 150) return { category: 'Slow', color: theme.colors.error, icon: '🐌' };
      if (wpm < 250) return { category: 'Average', color: theme.colors.tertiary, icon: '📖' };
      if (wpm < 350) return { category: 'Fast', color: theme.colors.primary, icon: '⚡' };
      return { category: 'Very Fast', color: theme.colors.secondary, icon: '🚀' };
    } else if (difficulty === 'medium') {
      if (wpm < 120) return { category: 'Slow', color: theme.colors.error, icon: '🐌' };
      if (wpm < 200) return { category: 'Average', color: theme.colors.tertiary, icon: '📖' };
      if (wpm < 280) return { category: 'Fast', color: theme.colors.primary, icon: '⚡' };
      return { category: 'Very Fast', color: theme.colors.secondary, icon: '🚀' };
    } else {
      if (wpm < 100) return { category: 'Slow', color: theme.colors.error, icon: '🐌' };
      if (wpm < 160) return { category: 'Average', color: theme.colors.tertiary, icon: '📖' };
      if (wpm < 220) return { category: 'Fast', color: theme.colors.primary, icon: '⚡' };
      return { category: 'Very Fast', color: theme.colors.secondary, icon: '🚀' };
    }
  };

  const getComprehensionFeedback = (score: number) => {
    if (score >= 90) return { feedback: 'Excellent comprehension!', color: theme.colors.secondary };
    if (score >= 80) return { feedback: 'Good comprehension!', color: theme.colors.primary };
    if (score >= 70) return { feedback: 'Adequate comprehension.', color: theme.colors.tertiary };
    return { feedback: 'Low comprehension - focus on understanding.', color: theme.colors.error };
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const recommendation = getRecommendedTraining(wpm, difficulty);
  const wpmCategory = getWPMCategory(wpm, difficulty);
  const comprehensionFeedback = getComprehensionFeedback(comprehension);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Test Results
        </Text>

        {/* Main Results Card */}
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Text style={[styles.wpmScore, { color: theme.colors.primary }]}>
                {wpm} WPM
              </Text>
              <Text style={[styles.wpmCategory, { color: wpmCategory.color }]}>
                {wpmCategory.icon} {wpmCategory.category}
              </Text>
            </View>

            <View style={styles.comprehensionSection}>
              <Text style={[styles.comprehensionScore, { color: comprehensionFeedback.color }]}>
                🧠 {comprehension}% Comprehension
              </Text>
              <Text style={[styles.comprehensionFeedback, { color: comprehensionFeedback.color }]}>
                {comprehensionFeedback.feedback}
              </Text>
            </View>

            {!isValidResult && (
              <View style={[styles.warningCard, { backgroundColor: theme.colors.errorContainer }]}>
                <Text style={[styles.warningText, { color: theme.colors.onErrorContainer }]}>
                  ⚠️ WPM score may not be accurate due to low comprehension
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Test Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Test Details
            </Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Difficulty Level:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Reading Time:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {formatTime(duration)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Words Read:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {Math.round(wpm * (duration / 60000))} words
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Training Recommendation */}
        <Card style={styles.recommendationCard}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🎯 Recommended Training
            </Text>
            
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationType, { color: theme.colors.primary }]}>
                {recommendation.type} at {recommendation.speed} WPM
              </Text>
              <Text style={[styles.recommendationDescription, { color: theme.colors.onSurfaceVariant }]}>
                {recommendation.description}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Progress Tracking */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📈 Progress Tracking
            </Text>
            
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: theme.colors.onSurfaceVariant }]}>
                Next Test Reminder:
              </Text>
              <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                7 days from now
              </Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: theme.colors.onSurfaceVariant }]}>
                Goal for Next Test:
              </Text>
              <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
                {wpm + 10} WPM with 80%+ comprehension
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            icon="home"
          >
            Back to Home
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('WPMTest')}
            style={styles.button}
            icon="refresh"
            disabled={true} // Disabled due to 24-hour cooldown
          >
            Retake Test (24h cooldown)
          </Button>
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
    marginBottom: 24,
  },
  mainCard: {
    marginBottom: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  wpmScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wpmCategory: {
    fontSize: 20,
    fontWeight: '600',
  },
  comprehensionSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  comprehensionScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comprehensionFeedback: {
    fontSize: 16,
    textAlign: 'center',
  },
  warningCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  recommendationCard: {
    marginBottom: 20,
  },
  recommendationContent: {
    alignItems: 'center',
  },
  recommendationType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 24,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 8,
  },
});

export default WPMResultsScreen; 