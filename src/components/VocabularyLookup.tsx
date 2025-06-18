import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Text, IconButton, useTheme, Portal, Surface, Button } from 'react-native-paper';
import * as Speech from 'expo-speech';
import { useVocabulary, WordData } from '../contexts/VocabularyContext';

interface VocabularyLookupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  source?: string; // Which reading activity this word came from
}

interface DictionaryWordData {
  word: string;
  phonetics: string;
  audio: string;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
  }[];
}

export const VocabularyLookup: React.FC<VocabularyLookupProps> = ({
  word,
  position,
  onClose,
  source = 'unknown',
}) => {
  const theme = useTheme();
  const { addWord, vocabulary } = useVocabulary();
  const [wordData, setWordData] = useState<DictionaryWordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const isMountedRef = useRef(true);

  // Check if word is already in vocabulary
  const existingWord = vocabulary.find(w => w.word.toLowerCase() === word.toLowerCase());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!word) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
        );
        
        if (!response.ok) {
          throw new Error('Definition not found');
        }

        const data = await response.json();
        if (!isMountedRef.current) return;

        const processedData: DictionaryWordData = {
          word: data[0].word,
          phonetics: data[0].phonetics?.[0]?.text || '',
          audio: data[0].phonetics?.[0]?.audio || '',
          meanings: data[0].meanings.map((entry: any) => ({
            partOfSpeech: entry.partOfSpeech,
            definitions: entry.definitions.map((def: any) => def.definition),
          })),
        };

        setWordData(processedData);
      } catch (err) {
        if (isMountedRef.current) {
          setError('Definition not found');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [word]);

  const playAudio = async () => {
    if (!wordData?.word) return;

    try {
      Speech.speak(wordData.word, {
        rate: 0.8,
        pitch: 1.0,
        language: 'en-US',
        onDone: () => console.log('TTS playback completed'),
        onError: (error) => console.error('TTS error:', error),
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSaveToVocabulary = async () => {
    if (wordData) {
      const vocabularyWordData: WordData = {
        word: wordData.word,
        phonetics: wordData.phonetics,
        audio: wordData.audio,
        meanings: wordData.meanings,
        source: source,
        dateAdded: new Date().toISOString(),
        masteryLevel: 'new',
        reviewCount: 0,
      };
      
      await addWord(vocabularyWordData);
      setIsSaved(true);
    }
  };

  const modalStyle = {
    ...styles.modal,
    top: position.y,
    left: position.x,
  };

  return (
    <Portal>
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Surface style={[modalStyle, { backgroundColor: theme.colors.surface }]}>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text style={{ color: theme.colors.error }}>{error}</Text>
            ) : wordData ? (
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={[styles.word, { color: theme.colors.primary }]}>
                    {wordData.word}
                  </Text>
                  <IconButton
                    icon={isSaved || existingWord ? 'star' : 'star-outline'}
                    size={24}
                    onPress={handleSaveToVocabulary}
                    disabled={isSaved || existingWord}
                  />
                </View>

                {wordData.phonetics && (
                  <View style={styles.phonetics}>
                    <Text style={{ color: theme.colors.onSurface }}>
                      {wordData.phonetics}
                    </Text>
                    <IconButton
                      icon="volume-high"
                      size={20}
                      onPress={playAudio}
                    />
                  </View>
                )}

                {wordData.meanings.map((meaning, index) => (
                  <View key={index} style={styles.meaning}>
                    <Text
                      style={[
                        styles.partOfSpeech,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {meaning.partOfSpeech}
                    </Text>
                    {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                      <Text
                        key={defIndex}
                        style={[
                          styles.definition,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        • {def}
                      </Text>
                    ))}
                  </View>
                ))}

                {source !== 'unknown' && (
                  <Text style={[styles.source, { color: theme.colors.onSurfaceVariant }]}>
                    Source: {source}
                  </Text>
                )}

                {isSaved && (
                  <Text style={[styles.savedMessage, { color: theme.colors.primary }]}>
                    ✓ Added to vocabulary
                  </Text>
                )}

                {existingWord && (
                  <Text style={[styles.savedMessage, { color: theme.colors.primary }]}>
                    ✓ Already in vocabulary
                  </Text>
                )}
              </View>
            ) : null}
          </Surface>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    width: 300,
    maxHeight: 400,
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  phonetics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meaning: {
    marginBottom: 12,
  },
  partOfSpeech: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  definition: {
    fontSize: 14,
    marginBottom: 2,
    lineHeight: 20,
  },
  source: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  savedMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
}); 