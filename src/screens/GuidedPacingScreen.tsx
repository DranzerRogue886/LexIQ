import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, SegmentedButtons, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { GuidedPacer } from '../components/GuidedPacer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  GuidedPacing: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'GuidedPacing'>;

const GuidedPacingScreen: React.FC<Props> = ({ navigation }) => {
  const [wpm, setWpm] = useState(300);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isReading, setIsReading] = useState(false);
  const theme = useTheme();

  const sampleTexts = {
    easy: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand.",
    medium: "The implementation of guided pacing has transformed how we approach digital reading. This technique uses visual cues to guide the reader's eye movement, creating a smooth and efficient reading experience.",
    hard: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts."
  };

  const handleComplete = () => {
    setIsReading(false);
  };

  if (isReading) {
    return (
      <GuidedPacer
        text={sampleTexts[difficulty]}
        wpm={wpm}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Guided Pacing
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>
          Reading Speed: {wpm} WPM
        </Text>
        <Slider
          value={wpm}
          onValueChange={setWpm}
          minimumValue={100}
          maximumValue={1000}
          step={10}
          style={styles.slider}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>
          Text Difficulty
        </Text>
        <SegmentedButtons
          value={difficulty}
          onValueChange={value => setDifficulty(value as 'easy' | 'medium' | 'hard')}
          buttons={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.preview}>
        <Text style={[styles.previewText, { color: theme.colors.onSurface }]}>
          {sampleTexts[difficulty]}
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={() => setIsReading(true)}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        Start Reading
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  preview: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 8,
  },
});

export default GuidedPacingScreen; 