import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useTheme, Button } from 'react-native-paper';

interface GuidedPacerProps {
  text: string;
  wpm: number;
  onComplete: () => void;
}

const sampleTexts = {
  easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
  medium: "The implementation of guided pacing has transformed how we approach digital reading. This technique uses visual cues to guide the reader's eye movement, creating a smooth and efficient reading experience.",
  hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
};

export const GuidedPacer: React.FC<GuidedPacerProps> = ({ text, wpm, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = text.split(/\s+/);
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordRefs = useRef<View[]>([]);

  const getDelay = (word: string) => {
    const baseDelay = (60 / wpm) * 1000;
    if (word.match(/[.,!?]/)) {
      return baseDelay * 3;
    }
    if (word.match(/[,;]/)) {
      return baseDelay * 1.5;
    }
    return baseDelay;
  };

  useEffect(() => {
    if (isPlaying) {
      const processWord = () => {
        if (currentWordIndex < words.length) {
          const delay = getDelay(words[currentWordIndex]);
          timerRef.current = setTimeout(() => {
            setCurrentWordIndex(prev => prev + 1);
            if (wordRefs.current[currentWordIndex + 1]) {
              wordRefs.current[currentWordIndex + 1].measureLayout(
                wordRefs.current[0],
                (x, y) => {
                  scrollViewRef.current?.scrollTo({ x: 0, y: y - 100, animated: true });
                },
                () => {}
              );
            }
          }, delay);
        } else {
          setIsPlaying(false);
          onComplete();
        }
      };

      processWord();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentWordIndex, isPlaying, words, wpm]);

  const togglePlay = () => {
    if (currentWordIndex >= words.length) {
      setCurrentWordIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Group words into lines for paragraph display
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentLineWidth = 0;
  const maxWidth = Dimensions.get('window').width - 40; // Account for padding

  words.forEach((word, index) => {
    const wordWidth = word.length * 12; // Approximate width based on character count
    if (currentLineWidth + wordWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = [word];
      currentLineWidth = wordWidth;
    } else {
      currentLine.push(word);
      currentLineWidth += wordWidth;
    }
  });
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={togglePlay}
          style={styles.button}
        >
          {isPlaying ? 'Pause' : 'Start'}
        </Button>
        <Text style={[styles.progress, { color: '#000000' }]}>
          {currentWordIndex + 1} / {words.length}
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {lines.map((line, lineIndex) => (
          <View key={lineIndex} style={styles.lineContainer}>
            {line.map((word, wordIndex) => {
              const globalIndex = words.indexOf(word);
              return (
                <Text
                  key={`${lineIndex}-${wordIndex}`}
                  ref={ref => {
                    if (ref) wordRefs.current[globalIndex] = ref;
                  }}
                  style={[
                    styles.word,
                    { color: '#000000' },
                    currentWordIndex === globalIndex && { 
                      color: theme.colors.primary,
                      fontWeight: 'bold'
                    }
                  ]}
                >
                  {word}{' '}
                </Text>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  word: {
    fontSize: 20,
    lineHeight: 28,
  },
  controls: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  button: {
    minWidth: 100,
  },
  progress: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 