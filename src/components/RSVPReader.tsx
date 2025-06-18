import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface RSVPReaderProps {
  text: string;
  speed: number; // milliseconds per word
  onComplete: (words: string[]) => void;
  onWordSelect?: (word: string, position: { x: number; y: number }) => void;
}

const sampleTexts = {
  easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
  medium: "The implementation of rapid serial visual presentation (RSVP) has revolutionized digital reading. This technique presents words sequentially at a fixed point, eliminating the need for eye movement across the page.",
  hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
};

export const RSVPReader: React.FC<RSVPReaderProps> = ({ text, speed, onComplete, onWordSelect }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Memoize words array to prevent unnecessary splits
  const words = useMemo(() => text.split(/\s+/), [text]);

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
        // Use consistent speed for all words - no pausing on punctuation
        timerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setCurrentWordIndex(prev => prev + 1);
          }
        }, speed);
      } else {
        if (isMountedRef.current) {
          setIsPlaying(false);
          onComplete(words);
        }
      }
    };

    processWord();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentWordIndex, isPlaying, words, speed, onComplete]);

  const togglePlay = useCallback(() => {
    if (currentWordIndex >= words.length) {
      setCurrentWordIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentWordIndex, words.length]);

  const handleWordPress = useCallback((event: any) => {
    if (onWordSelect) {
      const { pageX, pageY } = event.nativeEvent;
      onWordSelect(words[currentWordIndex], { x: pageX, y: pageY });
    }
  }, [onWordSelect, words, currentWordIndex]);

  const currentWord = useMemo(() => words[currentWordIndex], [words, currentWordIndex]);
  const progress = useMemo(() => `${currentWordIndex + 1} / ${words.length}`, [currentWordIndex, words.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.wordContainer}>
        <TouchableOpacity
          onPress={handleWordPress}
          disabled={!onWordSelect}
          style={styles.wordTouchable}
        >
          <Text style={[styles.word, { color: theme.colors.onSurface }]}>
            {currentWord}
          </Text>
        </TouchableOpacity>
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
        {progress}
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
  wordTouchable: {
    padding: 10,
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