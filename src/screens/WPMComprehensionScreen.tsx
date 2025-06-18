import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Button, useTheme, Card, RadioButton } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
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
};

type Props = NativeStackScreenProps<RootStackParamList, 'WPMComprehension'>;

const { width, height } = Dimensions.get('window');

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'literal' | 'sequence' | 'vocabulary' | 'inference';
}

const WPMComprehensionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { difficulty, passageId, startTime, endTime, wordCount } = route.params;
  const theme = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);

  // Comprehension questions for each passage
  const comprehensionQuestions: Record<string, ComprehensionQuestion[]> = {
    'easy_1': [
      {
        id: '1',
        question: 'What did Sarah often buy for breakfast?',
        options: ['A warm croissant', 'Fresh bread', 'Coffee', 'Fruit'],
        correctAnswer: 0,
        type: 'literal'
      },
      {
        id: '2',
        question: 'Where was the old oak tree located?',
        options: ['In Sarah\'s backyard', 'In the center of the park', 'Near the bakery', 'In the community garden'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '3',
        question: 'What did families do together in the community garden?',
        options: ['Play games', 'Have picnics', 'Maintain the space', 'Read books'],
        correctAnswer: 2,
        type: 'literal'
      },
      {
        id: '4',
        question: 'How did Sarah feel about her neighborhood?',
        options: ['She was bored', 'She felt lucky', 'She wanted to move', 'She was indifferent'],
        correctAnswer: 1,
        type: 'inference'
      }
    ],
    'easy_2': [
      {
        id: '1',
        question: 'What color was the sand on the beach?',
        options: ['Brown', 'White', 'Yellow', 'Gray'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '2',
        question: 'What were the children doing in the water?',
        options: ['Swimming', 'Building sandcastles', 'Chasing each other', 'Fishing'],
        correctAnswer: 2,
        type: 'literal'
      },
      {
        id: '3',
        question: 'What were the parents doing under the umbrellas?',
        options: ['Sleeping', 'Reading books', 'Talking', 'Eating'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '4',
        question: 'What could be seen on the horizon?',
        options: ['Mountains', 'Small boats', 'Birds', 'Clouds'],
        correctAnswer: 1,
        type: 'literal'
      }
    ],
    'medium_1': [
      {
        id: '1',
        question: 'What is the "golden hour" in photography?',
        options: ['The best time to take photos', 'The time just before sunset', 'The middle of the day', 'Early morning'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '2',
        question: 'What does the rule of thirds help photographers with?',
        options: ['Choosing lenses', 'Framing subjects', 'Setting exposure', 'Post-processing'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '3',
        question: 'What type of lens brings distant subjects closer?',
        options: ['Wide-angle', 'Telephoto', 'Macro', 'Fisheye'],
        correctAnswer: 1,
        type: 'vocabulary'
      },
      {
        id: '4',
        question: 'What is the main purpose of post-processing techniques?',
        options: ['To change the subject', 'To enhance images', 'To fix broken cameras', 'To save money'],
        correctAnswer: 1,
        type: 'inference'
      }
    ],
    'medium_2': [
      {
        id: '1',
        question: 'What happens during sleep that helps with memory?',
        options: ['The brain processes information', 'The body grows taller', 'The heart beats faster', 'The eyes move rapidly'],
        correctAnswer: 0,
        type: 'literal'
      },
      {
        id: '2',
        question: 'What type of sleep is associated with dreaming?',
        options: ['Deep sleep', 'Light sleep', 'Rapid eye movement sleep', 'Napping'],
        correctAnswer: 2,
        type: 'literal'
      },
      {
        id: '3',
        question: 'What can poor sleep quality affect?',
        options: ['Only physical health', 'Only mental health', 'Mood, concentration, and decision-making', 'Only memory'],
        correctAnswer: 2,
        type: 'literal'
      },
      {
        id: '4',
        question: 'What environment promotes better sleep?',
        options: ['Warm and bright', 'Cool and dark', 'Noisy and busy', 'Hot and humid'],
        correctAnswer: 1,
        type: 'literal'
      }
    ],
    'hard_1': [
      {
        id: '1',
        question: 'What is a qubit in quantum computing?',
        options: ['A classical bit', 'A quantum bit', 'A computer program', 'A measurement device'],
        correctAnswer: 1,
        type: 'vocabulary'
      },
      {
        id: '2',
        question: 'What property allows qubits to represent multiple states simultaneously?',
        options: ['Entanglement', 'Superposition', 'Interference', 'Decoherence'],
        correctAnswer: 1,
        type: 'vocabulary'
      },
      {
        id: '3',
        question: 'What allows quantum computers to solve certain problems faster?',
        options: ['Larger size', 'Superposition and entanglement', 'Better programming', 'More memory'],
        correctAnswer: 1,
        type: 'inference'
      },
      {
        id: '4',
        question: 'What challenge do quantum systems face?',
        options: ['High cost', 'Environmental interference', 'Slow speed', 'Limited applications'],
        correctAnswer: 1,
        type: 'literal'
      }
    ],
    'hard_2': [
      {
        id: '1',
        question: 'Who formulated the "hard problem of consciousness"?',
        options: ['Albert Einstein', 'David Chalmers', 'Sigmund Freud', 'William James'],
        correctAnswer: 1,
        type: 'literal'
      },
      {
        id: '2',
        question: 'What does dualism propose about mind and body?',
        options: ['They are the same', 'They are separate substances', 'Only mind exists', 'Only body exists'],
        correctAnswer: 1,
        type: 'vocabulary'
      },
      {
        id: '3',
        question: 'What do phenomenological approaches focus on?',
        options: ['Brain scans', 'First-person experience', 'Behavioral patterns', 'Neural networks'],
        correctAnswer: 1,
        type: 'vocabulary'
      },
      {
        id: '4',
        question: 'What do functionalist theories emphasize?',
        options: ['Physical structure', 'Information processing and behavior', 'Subjective experience', 'Brain chemistry'],
        correctAnswer: 1,
        type: 'inference'
      }
    ]
  };

  useEffect(() => {
    const passageQuestions = comprehensionQuestions[passageId] || [];
    setQuestions(passageQuestions);
    setAnswers(new Array(passageQuestions.length).fill(-1));
  }, [passageId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    const unanswered = answers.filter(answer => answer === -1).length;
    if (unanswered > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${unanswered} unanswered question(s). Are you sure you want to finish?`,
        [
          { text: 'Continue Answering', style: 'cancel' },
          { text: 'Finish Test', onPress: calculateResults }
        ]
      );
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    
    const comprehensionScore = Math.round((correctAnswers / questions.length) * 100);
    const duration = endTime - startTime;
    const durationMinutes = duration / 60000;
    const wpm = Math.round(wordCount / durationMinutes);

    // Save test result
    saveTestResult(wpm, comprehensionScore, duration);

    navigation.navigate('WPMResults', {
      wpm,
      comprehension: comprehensionScore,
      difficulty,
      passageId,
      duration
    });
  };

  const saveTestResult = async (wpm: number, comprehension: number, duration: number) => {
    try {
      const existingHistory = await AsyncStorage.getItem('wpm_test_history');
      const history: any[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newResult = {
        timestamp: new Date().toISOString(),
        difficultyLevel: difficulty,
        wpmScore: wpm,
        comprehensionScore: comprehension,
        passageId: passageId,
        userInputFlags: [], // Could track violations here
        duration: duration
      };
      
      history.push(newResult);
      await AsyncStorage.setItem('wpm_test_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading questions...</Text>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Comprehension Check
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <ProgressBar 
          progress={getProgressPercentage() / 100} 
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Question */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <Text style={[styles.questionText, { color: theme.colors.onSurface }]}>
              {currentQ.question}
            </Text>
            
            <RadioButton.Group
              onValueChange={value => handleAnswerSelect(parseInt(value))}
              value={answers[currentQuestion] >= 0 ? answers[currentQuestion].toString() : ''}
            >
              {currentQ.options.map((option, index) => (
                <RadioButton.Item
                  key={index}
                  label={option}
                  value={index.toString()}
                  labelStyle={[styles.optionText, { color: theme.colors.onSurface }]}
                  color={theme.colors.primary}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            style={styles.navButton}
          >
            Previous
          </Button>
          
          {currentQuestion < questions.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              disabled={answers[currentQuestion] === -1}
              style={[styles.navButton, { backgroundColor: theme.colors.primary }]}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleFinish}
              style={[styles.navButton, { backgroundColor: theme.colors.secondary }]}
            >
              Finish Test
            </Button>
          )}
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  questionCard: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default WPMComprehensionScreen; 