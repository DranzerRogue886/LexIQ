import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Text, IconButton, useTheme, Portal, Surface } from 'react-native-paper';
import { Audio } from 'expo-av';

interface VocabularyLookupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onSaveToDeck: (wordData: WordData) => void;
}

interface WordData {
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
  onSaveToDeck,
}) => {
  const theme = useTheme();
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchDefinition();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [word]);

  const fetchDefinition = async () => {
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
      const processedData: WordData = {
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
      setError('Definition not found');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!wordData?.audio) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: wordData.audio },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const handleSaveToDeck = () => {
    if (wordData) {
      onSaveToDeck(wordData);
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
                    icon={isSaved ? 'star' : 'star-outline'}
                    size={24}
                    onPress={handleSaveToDeck}
                  />
                </View>

                {wordData.phonetics && (
                  <View style={styles.phonetics}>
                    <Text style={{ color: theme.colors.onSurface }}>
                      {wordData.phonetics}
                    </Text>
                    {wordData.audio && (
                      <IconButton
                        icon="volume-high"
                        size={20}
                        onPress={playAudio}
                      />
                    )}
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
  },
  modal: {
    position: 'absolute',
    width: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height * 0.6,
    borderRadius: 12,
    elevation: 5,
    padding: 16,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  phonetics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meaning: {
    gap: 8,
  },
  partOfSpeech: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  definition: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 