import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

interface WordRecallGridProps {
  passageWords: string[];
  onComplete: (score: number, missedWords: string[]) => void;
  onReplay: () => void;
}

interface WordItem {
  word: string;
  isCorrect: boolean;
  isSelected: boolean;
  isDistractor: boolean;
}

export const WordRecallGrid: React.FC<WordRecallGridProps> = ({
  passageWords,
  onComplete,
  onReplay,
}) => {
  const theme = useTheme();
  const [words, setWords] = useState<WordItem[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState<string[]>([]);

  // Generate distractor words (similar length and frequency)
  const generateDistractors = (passageWords: string[], count: number): string[] => {
    const distractors = [
      'analyze', 'concept', 'develop', 'evaluate', 'function',
      'generate', 'implement', 'knowledge', 'language', 'method',
      'network', 'observe', 'process', 'quality', 'research',
      'structure', 'technology', 'understand', 'validate', 'witness'
    ];
    
    // Filter out words that are too similar to passage words
    const filteredDistractors = distractors.filter(
      distractor => !passageWords.some(word => 
        Math.abs(word.length - distractor.length) <= 2
      )
    );
    
    // Randomly select distractors
    return filteredDistractors
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  };

  useEffect(() => {
    // Select 4-6 words from the passage
    const selectedPassageWords = passageWords
      .filter(word => word.length > 3) // Filter out short words
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(6, passageWords.length));

    // Generate distractors
    const distractors = generateDistractors(selectedPassageWords, 6);

    // Combine and shuffle words
    const allWords = [
      ...selectedPassageWords.map(word => ({
        word,
        isCorrect: true,
        isSelected: false,
        isDistractor: false,
      })),
      ...distractors.map(word => ({
        word,
        isCorrect: false,
        isSelected: false,
        isDistractor: true,
      })),
    ].sort(() => Math.random() - 0.5);

    setWords(allWords);
  }, [passageWords]);

  const handleWordPress = (index: number) => {
    if (gameComplete) return;

    setWords(prevWords => {
      const newWords = [...prevWords];
      newWords[index] = {
        ...newWords[index],
        isSelected: !newWords[index].isSelected,
      };
      return newWords;
    });
  };

  const handleSubmit = () => {
    const selectedWords = words.filter(word => word.isSelected);
    const correctSelections = selectedWords.filter(word => word.isCorrect).length;
    const incorrectSelections = selectedWords.filter(word => !word.isCorrect).length;
    const missedCorrectWords = words
      .filter(word => word.isCorrect && !word.isSelected)
      .map(word => word.word);

    const finalScore = Math.max(0, correctSelections - incorrectSelections);
    setScore(finalScore);
    setMissedWords(missedCorrectWords);
    setGameComplete(true);
    onComplete(finalScore, missedCorrectWords);
  };

  const getWordStyle = (word: WordItem) => {
    if (!gameComplete) {
      return word.isSelected
        ? { backgroundColor: theme.colors.primary }
        : { backgroundColor: theme.colors.surface };
    }

    if (word.isSelected) {
      return word.isCorrect
        ? { backgroundColor: theme.colors.primary }
        : { backgroundColor: theme.colors.error };
    }

    return word.isCorrect
      ? { backgroundColor: theme.colors.error }
      : { backgroundColor: theme.colors.surface };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Select all the words you saw in the previous passage
      </Text>

      <View style={styles.grid}>
        {words.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.wordCell, getWordStyle(word)]}
            onPress={() => handleWordPress(index)}
          >
            <Text
              style={[
                styles.wordText,
                { color: word.isSelected ? theme.colors.background : theme.colors.onSurface },
              ]}
            >
              {word.word}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!gameComplete ? (
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
        >
          Submit
        </Button>
      ) : (
        <View style={styles.results}>
          <Text style={[styles.score, { color: theme.colors.primary }]}>
            Score: {score}
          </Text>
          {missedWords.length > 0 && (
            <View style={styles.missedWords}>
              <Text style={[styles.missedTitle, { color: theme.colors.error }]}>
                Missed Words:
              </Text>
              {missedWords.map((word, index) => (
                <Text key={index} style={[styles.missedWord, { color: theme.colors.onSurface }]}>
                  {word}
                </Text>
              ))}
            </View>
          )}
          <Button
            mode="outlined"
            onPress={onReplay}
            style={styles.button}
          >
            Replay Passage
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  wordCell: {
    width: (Dimensions.get('window').width - 60) / 3,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    marginTop: 20,
  },
  results: {
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  missedWords: {
    width: '100%',
    marginBottom: 20,
  },
  missedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  missedWord: {
    fontSize: 16,
    marginBottom: 5,
  },
}); 