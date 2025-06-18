import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button, ProgressBar } from 'react-native-paper';
import { audioPronunciationService } from '../services/AudioPronunciationService';

const { width, height } = Dimensions.get('window');

interface GameQuestion {
  id: string;
  type: 'blending' | 'segmenting' | 'pattern';
  question: string;
  answer: string;
  options?: string[];
  phonemes?: string[];
  pattern?: string;
}

interface PhonicsGamesProps {
  onClose?: () => void;
}

type GameType = 'blending' | 'segmenting' | 'pattern';

const PhonicsGames: React.FC<PhonicsGamesProps> = ({ onClose }) => {
  const theme = useTheme();
  const [currentGame, setCurrentGame] = useState<GameType>('blending');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [draggedItems, setDraggedItems] = useState<string[]>([]);

  // Game questions database
  const gameQuestions: Record<GameType, GameQuestion[]> = {
    blending: [
      {
        id: 'b1',
        type: 'blending',
        question: 'What word do these sounds make?',
        answer: 'cat',
        phonemes: ['/k/', '/æ/', '/t/'],
      },
      {
        id: 'b2',
        type: 'blending',
        question: 'What word do these sounds make?',
        answer: 'ship',
        phonemes: ['/ʃ/', '/ɪ/', '/p/'],
      },
      {
        id: 'b3',
        type: 'blending',
        question: 'What word do these sounds make?',
        answer: 'rain',
        phonemes: ['/r/', '/eɪ/', '/n/'],
      },
      {
        id: 'b4',
        type: 'blending',
        question: 'What word do these sounds make?',
        answer: 'tree',
        phonemes: ['/t/', '/r/', '/iː/'],
      },
      {
        id: 'b5',
        type: 'blending',
        question: 'What word do these sounds make?',
        answer: 'book',
        phonemes: ['/b/', '/ʊ/', '/k/'],
      },
    ],
    segmenting: [
      {
        id: 's1',
        type: 'segmenting',
        question: 'Break this word into sounds:',
        answer: 'dog',
        phonemes: ['/d/', '/ɒ/', '/g/'],
      },
      {
        id: 's2',
        type: 'segmenting',
        question: 'Break this word into sounds:',
        answer: 'fish',
        phonemes: ['/f/', '/ɪ/', '/ʃ/'],
      },
      {
        id: 's3',
        type: 'segmenting',
        question: 'Break this word into sounds:',
        answer: 'moon',
        phonemes: ['/m/', '/uː/', '/n/'],
      },
      {
        id: 's4',
        type: 'segmenting',
        question: 'Break this word into sounds:',
        answer: 'star',
        phonemes: ['/s/', '/t/', '/ɑː/'],
      },
      {
        id: 's5',
        type: 'segmenting',
        question: 'Break this word into sounds:',
        answer: 'play',
        phonemes: ['/p/', '/l/', '/eɪ/'],
      },
    ],
    pattern: [
      {
        id: 'p1',
        type: 'pattern',
        question: 'What phonics pattern do you see in "chair"?',
        answer: 'ch',
        options: ['ch', 'ai', 'ir', 'none'],
        pattern: 'ch',
      },
      {
        id: 'p2',
        type: 'pattern',
        question: 'What phonics pattern do you see in "rain"?',
        answer: 'ai',
        options: ['ai', 'ra', 'in', 'none'],
        pattern: 'ai',
      },
      {
        id: 'p3',
        type: 'pattern',
        question: 'What phonics pattern do you see in "ship"?',
        answer: 'sh',
        options: ['sh', 'hi', 'ip', 'none'],
        pattern: 'sh',
      },
      {
        id: 'p4',
        type: 'pattern',
        question: 'What phonics pattern do you see in "night"?',
        answer: 'igh',
        options: ['igh', 'ni', 'ght', 'none'],
        pattern: 'igh',
      },
      {
        id: 'p5',
        type: 'pattern',
        question: 'What phonics pattern do you see in "knight"?',
        answer: 'kn',
        options: ['kn', 'igh', 't', 'none'],
        pattern: 'kn',
      },
    ],
  };

  const currentQuestions = gameQuestions[currentGame];
  const currentQ = currentQuestions[currentQuestion];

  useEffect(() => {
    return () => {
      audioPronunciationService.stop();
    };
  }, []);

  const playAudio = async (text: string) => {
    try {
      await audioPronunciationService.playWord(text);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const startGame = (gameType: GameType) => {
    setCurrentGame(gameType);
    setCurrentQuestion(0);
    setScore(0);
    setGameStarted(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setAttempts(0);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent multiple selections while showing feedback
    
    setSelectedAnswer(answer);
    const correct = answer === currentQ.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    } else {
      setAttempts(attempts + 1);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
  };

  const handleNext = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowFeedback(false);
      setAttempts(0);
    } else {
      // Game finished
      setGameStarted(false);
    }
  };

  const getGameInstructions = (gameType: GameType) => {
    switch (gameType) {
      case 'blending':
        return 'Listen to the sounds and choose the correct word';
      case 'segmenting':
        return 'Break the word into its individual sounds';
      case 'pattern':
        return 'Identify the phonics pattern in the word';
      default:
        return '';
    }
  };

  const renderBlendingGame = () => (
    <View style={styles.gameContainer}>
      <Text style={[styles.question, { color: theme.colors.onSurface }]}>
        {currentQ.question}
      </Text>
      
      <View style={styles.phonemesContainer}>
        {currentQ.phonemes?.map((phoneme, index) => (
          <TouchableOpacity
            key={index}
            style={styles.phonemeBox}
            onPress={() => playAudio(phoneme.replace(/[\/]/g, ''))}
          >
            <Text style={[styles.phoneme, { color: theme.colors.primary }]}>
              {phoneme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.optionsContainer}>
        {['cat', 'dog', 'hat', 'bat'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedAnswer === option && {
                backgroundColor: isCorrect ? theme.colors.primary : theme.colors.error,
              },
              showFeedback && selectedAnswer !== option && option === currentQ.answer && {
                backgroundColor: theme.colors.primary,
                opacity: 0.7,
              },
            ]}
            onPress={() => handleAnswerSelect(option)}
            disabled={showFeedback}
          >
            <Text style={[
              styles.optionText,
              { 
                color: selectedAnswer === option || (showFeedback && option === currentQ.answer) 
                  ? 'white' 
                  : theme.colors.onSurface 
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSegmentingGame = () => (
    <View style={styles.gameContainer}>
      <Text style={[styles.question, { color: theme.colors.onSurface }]}>
        {currentQ.question}
      </Text>
      
      <TouchableOpacity
        style={styles.wordBox}
        onPress={() => playAudio(currentQ.answer)}
      >
        <Text style={[styles.wordText, { color: theme.colors.primary }]}>
          {currentQ.answer}
        </Text>
        <Text style={[styles.audioHint, { color: theme.colors.onSurfaceVariant }]}>
          Tap to hear
        </Text>
      </TouchableOpacity>

      <View style={styles.segmentingContainer}>
        <Text style={[styles.segmentingLabel, { color: theme.colors.onSurface }]}>
          Drag the sounds in order:
        </Text>
        <View style={styles.dragArea}>
          {currentQ.phonemes?.map((phoneme, index) => (
            <View key={index} style={styles.draggablePhoneme}>
              <Text style={[styles.phoneme, { color: theme.colors.primary }]}>
                {phoneme}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPatternGame = () => (
    <View style={styles.gameContainer}>
      <Text style={[styles.question, { color: theme.colors.onSurface }]}>
        {currentQ.question}
      </Text>
      
      <View style={styles.patternWordContainer}>
        <Text style={[styles.patternWord, { color: theme.colors.primary }]}>
          {currentQ.answer}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQ.options?.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedAnswer === option && {
                backgroundColor: isCorrect ? theme.colors.primary : theme.colors.error,
              },
              showFeedback && selectedAnswer !== option && option === currentQ.answer && {
                backgroundColor: theme.colors.primary,
                opacity: 0.7,
              },
            ]}
            onPress={() => handleAnswerSelect(option)}
            disabled={showFeedback}
          >
            <Text style={[
              styles.optionText,
              { 
                color: selectedAnswer === option || (showFeedback && option === currentQ.answer) 
                  ? 'white' 
                  : theme.colors.onSurface 
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGame = () => {
    switch (currentGame) {
      case 'blending':
        return renderBlendingGame();
      case 'segmenting':
        return renderSegmentingGame();
      case 'pattern':
        return renderPatternGame();
      default:
        return null;
    }
  };

  if (!gameStarted) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Phonics Games
          </Text>
          
          <View style={styles.gameSelection}>
            <TouchableOpacity
              style={[styles.gameCard, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => startGame('blending')}
            >
              <Text style={[styles.gameTitle, { color: theme.colors.onPrimaryContainer }]}>
                Blending Game
              </Text>
              <Text style={[styles.gameDescription, { color: theme.colors.onPrimaryContainer }]}>
                Hear sounds and choose the word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gameCard, { backgroundColor: theme.colors.secondaryContainer }]}
              onPress={() => startGame('segmenting')}
            >
              <Text style={[styles.gameTitle, { color: theme.colors.onSecondaryContainer }]}>
                Segmenting Game
              </Text>
              <Text style={[styles.gameDescription, { color: theme.colors.onSecondaryContainer }]}>
                Break words into sounds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gameCard, { backgroundColor: theme.colors.tertiaryContainer }]}
              onPress={() => startGame('pattern')}
            >
              <Text style={[styles.gameTitle, { color: theme.colors.onTertiaryContainer }]}>
                Pattern Game
              </Text>
              <Text style={[styles.gameDescription, { color: theme.colors.onTertiaryContainer }]}>
                Find phonics patterns
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.gameHeader}>
          <Text style={[styles.gameTitle, { color: theme.colors.primary }]}>
            {currentGame.charAt(0).toUpperCase() + currentGame.slice(1)} Game
          </Text>
          <Text style={[styles.score, { color: theme.colors.onSurface }]}>
            Score: {score}/{currentQuestions.length}
          </Text>
        </View>

        <ProgressBar
          progress={(currentQuestion + 1) / currentQuestions.length}
          color={theme.colors.primary}
          style={styles.progressBar}
        />

        <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
          {getGameInstructions(currentGame)}
        </Text>

        {renderGame()}

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedback,
              { color: isCorrect ? theme.colors.primary : theme.colors.error }
            ]}>
              {isCorrect ? '✅ Correct!' : `❌ Try again! (Attempt ${attempts})`}
            </Text>
            
            <View style={styles.feedbackButtons}>
              {!isCorrect && (
                <Button
                  mode="outlined"
                  onPress={handleRetry}
                  style={styles.retryButton}
                >
                  Try Again
                </Button>
              )}
              
              <Button
                mode="contained"
                onPress={handleNext}
                style={styles.nextButton}
              >
                {currentQuestion < currentQuestions.length - 1 ? 'Next Question' : 'Finish Game'}
              </Button>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    maxWidth: width * 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  gameSelection: {
    gap: 16,
  },
  gameCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  gameContainer: {
    alignItems: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  phonemesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  phonemeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    margin: 4,
  },
  phoneme: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    minWidth: 80,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  wordBox: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  audioHint: {
    fontSize: 14,
    marginTop: 8,
  },
  segmentingContainer: {
    alignItems: 'center',
  },
  segmentingLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  dragArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
  draggablePhoneme: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    margin: 4,
  },
  patternWordContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
  },
  patternWord: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedback: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    marginRight: 8,
  },
  nextButton: {
    marginLeft: 8,
  },
});

export default PhonicsGames; 