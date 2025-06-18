import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordRefs = useRef<View[]>([]);
  const isMountedRef = useRef(true);

  // Memoize words array to prevent unnecessary splits
  const words = useMemo(() => text.split(/\s+/), [text]);

  // Memoize delay calculation
  const getDelay = useCallback((word: string) => {
    const baseDelay = (60 / wpm) * 1000;
    if (word.match(/[.,!?]/)) {
      return baseDelay * 3;
    }
    if (word.match(/[,;]/)) {
      return baseDelay * 1.5;
    }
    return baseDelay;
  }, [wpm]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !isMountedRef.current) return;

    const processWord = () => {
      if (currentWordIndex < words.length) {
        const delay = getDelay(words[currentWordIndex]);
        timerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setCurrentWordIndex(prev => prev + 1);
            if (wordRefs.current[currentWordIndex + 1]) {
              wordRefs.current[currentWordIndex + 1].measureLayout(
                wordRefs.current[0],
                (x, y) => {
                  if (isMountedRef.current && scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ x: 0, y: y - 100, animated: true });
                  }
                },
                () => {}
              );
            }
          }
        }, delay);
      } else {
        if (isMountedRef.current) {
          setIsPlaying(false);
          onComplete();
        }
      }
    };

    processWord();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentWordIndex, isPlaying, words, getDelay, onComplete]);

  const togglePlay = useCallback(() => {
    if (currentWordIndex >= words.length) {
      setCurrentWordIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentWordIndex, words.length]);

  // Memoize lines calculation
  const lines = useMemo(() => {
    const result: string[][] = [];
    let currentLine: string[] = [];
    let currentLineWidth = 0;
    const maxWidth = Dimensions.get('window').width - 40;

    words.forEach((word) => {
      const wordWidth = word.length * 12;
      if (currentLineWidth + wordWidth > maxWidth) {
        result.push(currentLine);
        currentLine = [word];
        currentLineWidth = wordWidth;
      } else {
        currentLine.push(word);
        currentLineWidth += wordWidth;
      }
    });
    if (currentLine.length > 0) {
      result.push(currentLine);
    }
    return result;
  }, [words]);

  const progress = useMemo(() => `${currentWordIndex + 1} / ${words.length}`, [currentWordIndex, words.length]);

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
        <Text style={[styles.progress, { color: theme.colors.onSurface }]}>
          {progress}
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
                    { color: theme.colors.onSurface },
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