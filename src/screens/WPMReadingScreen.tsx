import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert, BackHandler } from 'react-native';
import { Text, Button, useTheme, Card, ProgressBar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  WPMReading: { difficulty: 'easy' | 'medium' | 'hard' };
  WPMComprehension: { 
    difficulty: string; 
    passageId: string; 
    startTime: number; 
    endTime: number;
    wordCount: number;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'WPMReading'>;

const { width, height } = Dimensions.get('window');

interface WPMPassage {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const WPMReadingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { difficulty } = route.params;
  const theme = useTheme();
  const [isReading, setIsReading] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentPassage, setCurrentPassage] = useState<WPMPassage | null>(null);
  const [violations, setViolations] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const backHandlerRef = useRef<any>(null);

  // WPM Test Passages
  const wpmPassages: WPMPassage[] = {
    easy: [
      {
        id: 'easy_1',
        title: 'The Friendly Neighborhood',
        content: `Sarah loved her neighborhood. Every morning, she walked past the old oak tree that stood tall in the center of the park. Children played on the swings while parents chatted on nearby benches. The local bakery filled the air with the sweet smell of fresh bread. Sarah often stopped to buy a warm croissant for breakfast. Her neighbors were always friendly, waving hello as she passed by. The community garden was full of colorful flowers and vegetables. Families worked together to maintain the beautiful space. Sarah felt lucky to live in such a welcoming place where everyone knew each other's names.`,
        wordCount: 89,
        difficulty: 'easy'
      },
      {
        id: 'easy_2',
        title: 'A Day at the Beach',
        content: `The beach was perfect today. White sand stretched for miles along the coastline. Gentle waves crashed against the shore, creating a soothing rhythm. Families built sandcastles and played in the shallow water. Seagulls soared overhead, searching for food along the shoreline. Children laughed as they chased each other through the surf. Parents relaxed under colorful umbrellas, reading books and enjoying the sunshine. The ocean breeze carried the salty smell of the sea. Small boats dotted the horizon, their sails catching the wind. It was a beautiful day for making memories with family and friends.`,
        wordCount: 87,
        difficulty: 'easy'
      }
    ],
    medium: [
      {
        id: 'medium_1',
        title: 'The Art of Photography',
        content: `Photography captures moments that tell stories beyond words. A skilled photographer understands how light, composition, and timing work together to create compelling images. The golden hour, that magical time just before sunset, bathes subjects in warm, flattering light. Composition rules like the rule of thirds help photographers frame their subjects effectively. Different lenses offer unique perspectives, from wide-angle views that capture vast landscapes to telephoto lenses that bring distant subjects closer. Understanding exposure settings allows photographers to control how much light reaches the camera sensor. Post-processing techniques can enhance images while maintaining their authenticity.`,
        wordCount: 95,
        difficulty: 'medium'
      },
      {
        id: 'medium_2',
        title: 'The Science of Sleep',
        content: `Sleep is essential for both physical and mental health, yet many people struggle to get adequate rest. During sleep, the brain processes information from the day and consolidates memories. The body repairs tissues and strengthens the immune system. Sleep cycles consist of different stages, including rapid eye movement sleep when dreaming occurs. Poor sleep quality can affect mood, concentration, and decision-making abilities. Creating a consistent bedtime routine helps signal the body that it's time to rest. Avoiding screens before bed and maintaining a cool, dark sleep environment promotes better sleep. Regular exercise and stress management techniques can improve sleep quality significantly.`,
        wordCount: 98,
        difficulty: 'medium'
      }
    ],
    hard: [
      {
        id: 'hard_1',
        title: 'Quantum Computing Fundamentals',
        content: `Quantum computing represents a paradigm shift in computational power, leveraging the principles of quantum mechanics to process information in fundamentally different ways than classical computers. Unlike classical bits that exist in binary states, quantum bits or qubits can exist in superposition, representing multiple states simultaneously. This property enables quantum computers to solve certain complex problems exponentially faster than their classical counterparts. Entanglement, another quantum phenomenon, allows qubits to become correlated in ways that classical systems cannot achieve. However, quantum systems are highly sensitive to environmental interference, requiring sophisticated error correction techniques.`,
        wordCount: 92,
        difficulty: 'hard'
      },
      {
        id: 'hard_2',
        title: 'Philosophical Perspectives on Consciousness',
        content: `Consciousness remains one of the most enigmatic phenomena in philosophy and cognitive science, challenging our understanding of subjective experience and self-awareness. The hard problem of consciousness, as formulated by David Chalmers, questions how physical processes in the brain give rise to subjective experience. Various philosophical positions attempt to address this question, from dualism which posits mind and body as separate substances, to physicalism which maintains that consciousness emerges from physical processes. Phenomenological approaches focus on the first-person experience of consciousness, while functionalist theories emphasize the role of consciousness in information processing and behavior.`,
        wordCount: 94,
        difficulty: 'hard'
      }
    ]
  };

  useEffect(() => {
    // Select a random passage for the chosen difficulty
    const passages = wpmPassages[difficulty];
    const randomPassage = passages[Math.floor(Math.random() * passages.length)];
    setCurrentPassage(randomPassage);

    // Prevent back navigation during test
    backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isReading) {
        Alert.alert(
          'Test in Progress',
          'You cannot exit during the reading test. Please complete the test or contact support.',
          [{ text: 'OK' }]
        );
        return true;
      }
      return false;
    });

    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty, isReading]);

  useEffect(() => {
    if (isReading) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isReading, startTime]);

  const handleStartReading = () => {
    setIsReading(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setViolations([]);
  };

  const handleFinishReading = () => {
    if (!isReading || !currentPassage) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Calculate WPM
    const durationMinutes = duration / 60000;
    const wpm = Math.round(currentPassage.wordCount / durationMinutes);

    // Check for violations
    if (violations.length > 0) {
      Alert.alert(
        'Test Violations Detected',
        `Your test had ${violations.length} violation(s): ${violations.join(', ')}. This may affect your results.`,
        [
          { text: 'Continue Anyway', onPress: () => navigateToComprehension(endTime, duration) },
          { text: 'Retake Test', onPress: () => resetTest() }
        ]
      );
    } else {
      navigateToComprehension(endTime, duration);
    }
  };

  const navigateToComprehension = (endTime: number, duration: number) => {
    navigation.navigate('WPMComprehension', {
      difficulty,
      passageId: currentPassage!.id,
      startTime,
      endTime,
      wordCount: currentPassage!.wordCount
    });
  };

  const resetTest = () => {
    setIsReading(false);
    setStartTime(0);
    setElapsedTime(0);
    setViolations([]);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentPassage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading passage...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          {currentPassage.title}
        </Text>
        <Text style={[styles.difficulty, { color: theme.colors.onSurfaceVariant }]}>
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Text>
        {isReading && (
          <Text style={[styles.timer, { color: theme.colors.primary }]}>
            ⏱️ {formatTime(elapsedTime)}
          </Text>
        )}
      </View>

      {/* Reading Area */}
      <ScrollView 
        style={styles.readingContainer}
        contentContainerStyle={styles.readingContent}
        scrollEnabled={!isReading} // Disable scrolling during test
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.passageCard}>
          <Card.Content>
            <Text style={[styles.passageText, { color: theme.colors.onSurface }]}>
              {currentPassage.content}
            </Text>
            <Text style={[styles.wordCount, { color: theme.colors.onSurfaceVariant }]}>
              {currentPassage.wordCount} words
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {!isReading ? (
          <Button
            mode="contained"
            onPress={handleStartReading}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            icon="play"
          >
            Begin Reading
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleFinishReading}
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            icon="stop"
          >
            Done Reading
          </Button>
        )}

        {/* Lockdown Mode Indicator */}
        {isReading && (
          <View style={styles.lockdownIndicator}>
            <Text style={[styles.lockdownText, { color: theme.colors.error }]}>
              🔒 Lockdown Mode Active
            </Text>
            <Text style={[styles.lockdownSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Scrolling disabled • No copying • Stay focused
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 16,
    marginBottom: 8,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  readingContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  readingContent: {
    paddingBottom: 20,
  },
  passageCard: {
    marginBottom: 16,
  },
  passageText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'justify',
  },
  wordCount: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controls: {
    padding: 20,
    paddingTop: 16,
  },
  button: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  lockdownIndicator: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
  },
  lockdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lockdownSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WPMReadingScreen; 