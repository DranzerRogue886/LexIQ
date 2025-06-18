import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface RSVPReaderProps {
  text: string;
  wpm: number;
  onComplete: () => void;
}

const sampleTexts = {
  easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
  medium: "The implementation of rapid serial visual presentation (RSVP) has revolutionized digital reading. This technique presents words sequentially at a fixed point, eliminating the need for eye movement across the page.",
  hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
};

export const RSVPReader: React.FC<RSVPReaderProps> = ({ text, wpm, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = text.split(/\s+/);
  const theme = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.wordContainer}>
        <Text style={[styles.word, { color: theme.colors.onSurface }]}>
          {words[currentWordIndex]}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={togglePlay}
      >
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>
          {isPlaying ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.progress, { color: theme.colors.onSurface }]}>
        {currentWordIndex + 1} / {words.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wordContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progress: {
    marginTop: 20,
    fontSize: 16,
  },
}); 