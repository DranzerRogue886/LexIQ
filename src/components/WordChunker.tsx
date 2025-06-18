import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

interface WordChunkerProps {
  text: string;
  wpm: number;
  chunkSize: number;
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const sampleTexts = {
  easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
  medium: "The implementation of word chunking has revolutionized how we process text. This technique groups words together, allowing readers to process multiple words in a single fixation.",
  hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
};

export const WordChunker: React.FC<WordChunkerProps> = ({ text, wpm, chunkSize, onComplete }) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const theme = useTheme();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Memoize words and chunks to prevent unnecessary recalculations
  const words = useMemo(() => text.split(/\s+/), [text]);
  const chunks = useMemo(() => 
    words.reduce((acc: string[][], word, i) => {
      const chunkIndex = Math.floor(i / chunkSize);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(word);
      return acc;
    }, []),
    [words, chunkSize]
  );

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

    const processChunk = () => {
      if (currentChunkIndex < chunks.length) {
        // Use consistent speed for all chunks - no pausing on punctuation
        const delay = (60 / wpm) * 1000 * chunkSize;
        timerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setCurrentChunkIndex(prev => prev + 1);
          }
        }, delay);
      } else {
        if (isMountedRef.current) {
          setIsPlaying(false);
          onComplete();
        }
      }
    };

    processChunk();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentChunkIndex, isPlaying, chunks, wpm, chunkSize, onComplete]);

  const togglePlay = useCallback(() => {
    if (currentChunkIndex >= chunks.length) {
      setCurrentChunkIndex(0);
    }
    setIsPlaying(prev => !prev);
  }, [currentChunkIndex, chunks.length]);

  const currentChunk = useMemo(() => chunks[currentChunkIndex]?.join(' '), [chunks, currentChunkIndex]);
  const progress = useMemo(() => `${currentChunkIndex + 1} / ${chunks.length}`, [currentChunkIndex, chunks.length]);

  // Calculate responsive font size based on chunk length and screen width
  const getFontSize = useCallback((chunk: string) => {
    const chunkLength = chunk.length;
    const maxWidth = width * 0.8; // 80% of screen width
    
    if (chunkLength <= 20) return 32;
    if (chunkLength <= 40) return 28;
    if (chunkLength <= 60) return 24;
    if (chunkLength <= 80) return 20;
    if (chunkLength <= 100) return 18;
    return 16;
  }, []);

  const fontSize = useMemo(() => getFontSize(currentChunk || ''), [currentChunk, getFontSize]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.chunkContainer}>
        <Text 
          style={[
            styles.chunk, 
            { 
              color: theme.colors.onSurface,
              fontSize: fontSize,
              lineHeight: fontSize * 1.4,
            }
          ]}
          numberOfLines={3}
          adjustsFontSizeToFit={true}
        >
          {currentChunk}
        </Text>
      </View>
      
      <View style={styles.controls}>
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
        
        <Text style={[styles.speedInfo, { color: theme.colors.onSurfaceVariant }]}>
          {wpm} WPM • {chunkSize} words per chunk
        </Text>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    maxWidth: width * 0.9,
    minHeight: height * 0.4,
  },
  chunk: {
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  controls: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 16,
    marginBottom: 8,
  },
  speedInfo: {
    fontSize: 14,
  },
}); 