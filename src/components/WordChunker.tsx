import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

interface WordChunkerProps {
  text: string;
  wpm: number;
  chunkSize: number;
  onComplete: () => void;
}

const sampleTexts = {
  easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
  medium: "The implementation of word chunking has revolutionized how we process text. This technique groups words together, allowing readers to process multiple words in a single fixation.",
  hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
};

export const WordChunker: React.FC<WordChunkerProps> = ({ text, wpm, chunkSize, onComplete }) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = text.split(/\s+/);
  const chunks = words.reduce((acc: string[][], word, i) => {
    const chunkIndex = Math.floor(i / chunkSize);
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push(word);
    return acc;
  }, []);
  const theme = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDelay = (chunk: string[]) => {
    const baseDelay = (60 / wpm) * 1000;
    const hasPunctuation = chunk.some(word => word.match(/[.,!?]/));
    const hasComma = chunk.some(word => word.match(/[,;]/));
    
    if (hasPunctuation) {
      return baseDelay * 3;
    }
    if (hasComma) {
      return baseDelay * 1.5;
    }
    return baseDelay;
  };

  useEffect(() => {
    if (isPlaying) {
      const processChunk = () => {
        if (currentChunkIndex < chunks.length) {
          const delay = getDelay(chunks[currentChunkIndex]);
          timerRef.current = setTimeout(() => {
            setCurrentChunkIndex(prev => prev + 1);
          }, delay);
        } else {
          setIsPlaying(false);
          onComplete();
        }
      };

      processChunk();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentChunkIndex, isPlaying, chunks, wpm]);

  const togglePlay = () => {
    if (currentChunkIndex >= chunks.length) {
      setCurrentChunkIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.chunkContainer}>
        <Text style={[styles.chunk, { color: theme.colors.onSurface }]}>
          {chunks[currentChunkIndex]?.join(' ')}
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
        {currentChunkIndex + 1} / {chunks.length}
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
  chunkContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chunk: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
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