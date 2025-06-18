import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WordRecallGrid } from '../components/WordRecallGrid';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'WordRecall'>;

const WordRecallScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const [showGrid, setShowGrid] = useState(true);

  const handleComplete = (score: number, missedWords: string[]) => {
    // Here you can implement logic to save the score and missed words
    console.log('Score:', score);
    console.log('Missed Words:', missedWords);
  };

  const handleReplay = () => {
    // Navigate back to the previous reading screen
    navigation.goBack();
  };

  // Get words from the previous reading session
  const passageWords = route.params?.passageWords || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showGrid && (
        <WordRecallGrid
          passageWords={passageWords}
          onComplete={handleComplete}
          onReplay={handleReplay}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WordRecallScreen; 