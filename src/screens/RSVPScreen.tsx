import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, SegmentedButtons, useTheme, Menu, Divider } from 'react-native-paper';
import { RSVPReader } from '../components/RSVPReader';
import { VocabularyLookup } from '../components/VocabularyLookup';
import { useVocabulary } from '../contexts/VocabularyContext';
import { sampleTexts, getRandomText, SampleText } from '../data/sampleTexts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  RSVP: undefined;
  WordRecall: { passageWords: string[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'RSVP'>;

const { width, height } = Dimensions.get('window');

const RSVPScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { vocabulary } = useVocabulary();
  const [speed, setSpeed] = useState(300);
  const [speedMode, setSpeedMode] = useState<'preset' | 'custom'>('preset');
  const [customWPM, setCustomWPM] = useState(300);
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState<SampleText | null>(null);
  const [selectedText, setSelectedText] = useState<string>('random');
  const [showVocabularyLookup, setShowVocabularyLookup] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [lookupPosition, setLookupPosition] = useState({ x: 0, y: 0 });
  const [showCustomSpeedMenu, setShowCustomSpeedMenu] = useState(false);

  useEffect(() => {
    // Set a random text by default
    setCurrentText(getRandomText());
  }, []);

  // Convert WPM to milliseconds per word
  const wpmToMs = (wpm: number) => {
    return (60 / wpm) * 1000;
  };

  // Convert milliseconds per word to WPM
  const msToWpm = (ms: number) => {
    return Math.round(60 / (ms / 1000));
  };

  const handleSpeedChange = (value: string) => {
    if (value === 'custom') {
      setSpeedMode('custom');
      setSpeed(wpmToMs(customWPM));
    } else {
      setSpeedMode('preset');
      setSpeed(parseInt(value));
    }
  };

  const handleCustomWPMChange = (wpm: number) => {
    setCustomWPM(wpm);
    setSpeed(wpmToMs(wpm));
    setShowCustomSpeedMenu(false);
  };

  const handleTextChange = (value: string) => {
    if (value === 'random') {
      setCurrentText(getRandomText());
    } else {
      const text = sampleTexts.find(t => t.id === value);
      if (text) {
        setCurrentText(text);
      }
    }
    setSelectedText(value);
  };

  const handleWordSelect = (word: string, position: { x: number; y: number }) => {
    setSelectedWord(word);
    setLookupPosition(position);
    setShowVocabularyLookup(true);
  };

  const handleVocabularyClose = () => {
    setShowVocabularyLookup(false);
    setSelectedWord('');
  };

  const handleComplete = (words: string[]) => {
    // Navigate to word recall screen with the words from the passage
    navigation.navigate('WordRecall', { passageWords: words });
  };

  const getTextOptions = () => {
    const options = [
      { value: 'random', label: 'Random Text' },
      ...sampleTexts.map(text => ({
        value: text.id,
        label: `${text.title} (${text.difficulty})`
      }))
    ];
    return options;
  };

  const getSpeedOptions = () => {
    const presetOptions = [
      { value: '200', label: 'Fast' },
      { value: '300', label: 'Normal' },
      { value: '500', label: 'Slow' },
    ];

    if (speedMode === 'custom') {
      presetOptions.push({ value: 'custom', label: `${customWPM} WPM` });
    } else {
      presetOptions.push({ value: 'custom', label: 'Custom WPM' });
    }

    return presetOptions;
  };

  if (!currentText) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.controls}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          RSVP Reading
        </Text>
        
        <Text style={[styles.textInfo, { color: theme.colors.onSurface }]}>
          {currentText.title} - {currentText.category} ({currentText.difficulty})
        </Text>

        <SegmentedButtons
          value={selectedText}
          onValueChange={handleTextChange}
          buttons={getTextOptions().map(option => ({
            value: option.value,
            label: option.label,
          }))}
          style={styles.textSelector}
        />

        <View style={styles.speedContainer}>
          <SegmentedButtons
            value={speedMode === 'custom' ? 'custom' : speed.toString()}
            onValueChange={handleSpeedChange}
            buttons={getSpeedOptions().map(option => ({
              value: option.value,
              label: option.label,
            }))}
            style={styles.speedSelector}
          />
          
          {speedMode === 'custom' && (
            <Menu
              visible={showCustomSpeedMenu}
              onDismiss={() => setShowCustomSpeedMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowCustomSpeedMenu(true)}
                  style={styles.customSpeedButton}
                >
                  {customWPM} WPM
                </Button>
              }
            >
              {[100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800].map((wpm) => (
                <Menu.Item
                  key={wpm}
                  onPress={() => handleCustomWPMChange(wpm)}
                  title={`${wpm} WPM`}
                  leadingIcon={customWPM === wpm ? 'check' : undefined}
                />
              ))}
            </Menu>
          )}
        </View>

        <Text style={[styles.speedInfo, { color: theme.colors.onSurfaceVariant }]}>
          Current speed: {msToWpm(speed)} WPM ({speed}ms per word)
        </Text>

        <Button
          mode="contained"
          onPress={() => setIsReading(!isReading)}
          style={styles.button}
        >
          {isReading ? 'Stop' : 'Start Reading'}
        </Button>
      </View>

      <View style={styles.readerContainer}>
        {isReading ? (
          <RSVPReader
            text={currentText.content}
            speed={speed}
            onComplete={handleComplete}
            onWordSelect={handleWordSelect}
          />
        ) : (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewText, { color: theme.colors.onSurface }]}>
              {currentText.content.substring(0, 200)}...
            </Text>
            <Text style={[styles.wordCount, { color: theme.colors.onSurfaceVariant }]}>
              {currentText.wordCount} words • {currentText.uniqueWords.length} unique words
            </Text>
          </View>
        )}
      </View>

      {showVocabularyLookup && (
        <VocabularyLookup
          word={selectedWord}
          position={lookupPosition}
          onClose={handleVocabularyClose}
          source="RSVP Reading"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  controls: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInfo: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  textSelector: {
    marginBottom: 16,
  },
  speedContainer: {
    marginBottom: 16,
  },
  speedSelector: {
    marginBottom: 8,
  },
  customSpeedButton: {
    marginTop: 8,
  },
  speedInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  readerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    maxWidth: width * 0.9,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  wordCount: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RSVPScreen; 