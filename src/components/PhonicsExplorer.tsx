import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { audioPronunciationService } from '../services/AudioPronunciationService';

const { width } = Dimensions.get('window');

interface Phoneme {
  symbol: string;
  description: string;
  examples: string[];
}

interface PhonicsPattern {
  pattern: string;
  sound: string;
  examples: string[];
  type: 'digraph' | 'vowel_team' | 'silent_letter' | 'blend' | 'other';
}

interface WordBreakdown {
  word: string;
  letters: string[];
  phonemes: string[];
  syllables: string[];
  patterns: PhonicsPattern[];
  ipa: string;
  stress: number[];
}

interface PhonicsExplorerProps {
  word: string;
  onClose?: () => void;
}

// Phonics patterns database
const phonicsPatterns: PhonicsPattern[] = [
  // Digraphs
  { pattern: 'ch', sound: '/tʃ/', examples: ['chair', 'church', 'chicken'], type: 'digraph' },
  { pattern: 'sh', sound: '/ʃ/', examples: ['ship', 'fish', 'brush'], type: 'digraph' },
  { pattern: 'th', sound: '/θ/', examples: ['think', 'bath', 'three'], type: 'digraph' },
  { pattern: 'ph', sound: '/f/', examples: ['phone', 'photo', 'elephant'], type: 'digraph' },
  { pattern: 'wh', sound: '/w/', examples: ['what', 'when', 'where'], type: 'digraph' },
  { pattern: 'ck', sound: '/k/', examples: ['back', 'clock', 'duck'], type: 'digraph' },
  { pattern: 'ng', sound: '/ŋ/', examples: ['sing', 'ring', 'thing'], type: 'digraph' },
  
  // Vowel teams
  { pattern: 'ai', sound: '/eɪ/', examples: ['rain', 'train', 'mail'], type: 'vowel_team' },
  { pattern: 'ay', sound: '/eɪ/', examples: ['day', 'play', 'say'], type: 'vowel_team' },
  { pattern: 'ee', sound: '/iː/', examples: ['see', 'tree', 'feet'], type: 'vowel_team' },
  { pattern: 'ea', sound: '/iː/', examples: ['eat', 'meat', 'seat'], type: 'vowel_team' },
  { pattern: 'oa', sound: '/oʊ/', examples: ['boat', 'coat', 'road'], type: 'vowel_team' },
  { pattern: 'oi', sound: '/ɔɪ/', examples: ['oil', 'coin', 'join'], type: 'vowel_team' },
  { pattern: 'oy', sound: '/ɔɪ/', examples: ['boy', 'toy', 'joy'], type: 'vowel_team' },
  { pattern: 'ou', sound: '/aʊ/', examples: ['out', 'house', 'mouth'], type: 'vowel_team' },
  { pattern: 'ow', sound: '/aʊ/', examples: ['cow', 'how', 'now'], type: 'vowel_team' },
  { pattern: 'igh', sound: '/aɪ/', examples: ['high', 'night', 'light'], type: 'vowel_team' },
  
  // Silent letters
  { pattern: 'kn', sound: '/n/', examples: ['knight', 'know', 'knife'], type: 'silent_letter' },
  { pattern: 'wr', sound: '/r/', examples: ['write', 'wrong', 'wrap'], type: 'silent_letter' },
  { pattern: 'mb', sound: '/m/', examples: ['comb', 'lamb', 'thumb'], type: 'silent_letter' },
  { pattern: 'gn', sound: '/n/', examples: ['sign', 'gnat', 'gnaw'], type: 'silent_letter' },
  
  // Blends
  { pattern: 'bl', sound: '/bl/', examples: ['black', 'blue', 'blow'], type: 'blend' },
  { pattern: 'br', sound: '/br/', examples: ['bread', 'brown', 'break'], type: 'blend' },
  { pattern: 'cl', sound: '/kl/', examples: ['clock', 'clean', 'clap'], type: 'blend' },
  { pattern: 'cr', sound: '/kr/', examples: ['crab', 'cry', 'cross'], type: 'blend' },
  { pattern: 'dr', sound: '/dr/', examples: ['drum', 'drop', 'drive'], type: 'blend' },
  { pattern: 'fl', sound: '/fl/', examples: ['flag', 'fly', 'flower'], type: 'blend' },
  { pattern: 'fr', sound: '/fr/', examples: ['frog', 'free', 'friend'], type: 'blend' },
  { pattern: 'gl', sound: '/gl/', examples: ['glass', 'glow', 'glue'], type: 'blend' },
  { pattern: 'gr', sound: '/gr/', examples: ['green', 'grow', 'grass'], type: 'blend' },
  { pattern: 'pl', sound: '/pl/', examples: ['play', 'plant', 'plane'], type: 'blend' },
  { pattern: 'pr', sound: '/pr/', examples: ['pray', 'price', 'print'], type: 'blend' },
  { pattern: 'sl', sound: '/sl/', examples: ['sleep', 'slow', 'slide'], type: 'blend' },
  { pattern: 'sm', sound: '/sm/', examples: ['small', 'smile', 'smoke'], type: 'blend' },
  { pattern: 'sn', sound: '/sn/', examples: ['snake', 'snow', 'snap'], type: 'blend' },
  { pattern: 'sp', sound: '/sp/', examples: ['spot', 'spin', 'spoon'], type: 'blend' },
  { pattern: 'st', sound: '/st/', examples: ['stop', 'star', 'stick'], type: 'blend' },
  { pattern: 'sw', sound: '/sw/', examples: ['swim', 'sweet', 'swing'], type: 'blend' },
  { pattern: 'tr', sound: '/tr/', examples: ['tree', 'train', 'truck'], type: 'blend' },
  { pattern: 'tw', sound: '/tw/', examples: ['twin', 'twist', 'twelve'], type: 'blend' },
];

// Basic phoneme database
const phonemes: Record<string, Phoneme> = {
  '/æ/': { symbol: '/æ/', description: 'Short A as in cat', examples: ['cat', 'hat', 'map'] },
  '/eɪ/': { symbol: '/eɪ/', description: 'Long A as in cake', examples: ['cake', 'rain', 'day'] },
  '/ɑː/': { symbol: '/ɑː/', description: 'Broad A as in father', examples: ['father', 'car', 'far'] },
  '/e/': { symbol: '/e/', description: 'Short E as in bed', examples: ['bed', 'red', 'get'] },
  '/iː/': { symbol: '/iː/', description: 'Long E as in see', examples: ['see', 'tree', 'me'] },
  '/ɪ/': { symbol: '/ɪ/', description: 'Short I as in sit', examples: ['sit', 'hit', 'big'] },
  '/aɪ/': { symbol: '/aɪ/', description: 'Long I as in bike', examples: ['bike', 'like', 'time'] },
  '/ɒ/': { symbol: '/ɒ/', description: 'Short O as in hot', examples: ['hot', 'lot', 'dog'] },
  '/oʊ/': { symbol: '/oʊ/', description: 'Long O as in boat', examples: ['boat', 'go', 'no'] },
  '/ʊ/': { symbol: '/ʊ/', description: 'Short U as in put', examples: ['put', 'book', 'good'] },
  '/juː/': { symbol: '/juː/', description: 'Long U as in cute', examples: ['cute', 'use', 'music'] },
  '/ʌ/': { symbol: '/ʌ/', description: 'Short U as in cup', examples: ['cup', 'bus', 'run'] },
  '/ɜː/': { symbol: '/ɜː/', description: 'ER as in bird', examples: ['bird', 'girl', 'work'] },
  '/ə/': { symbol: '/ə/', description: 'Schwa as in about', examples: ['about', 'sofa', 'banana'] },
  '/tʃ/': { symbol: '/tʃ/', description: 'CH as in chair', examples: ['chair', 'church', 'chicken'] },
  '/ʃ/': { symbol: '/ʃ/', description: 'SH as in ship', examples: ['ship', 'fish', 'brush'] },
  '/θ/': { symbol: '/θ/', description: 'TH as in think', examples: ['think', 'bath', 'three'] },
  '/ð/': { symbol: '/ð/', description: 'TH as in this', examples: ['this', 'that', 'the'] },
  '/ŋ/': { symbol: '/ŋ/', description: 'NG as in sing', examples: ['sing', 'ring', 'thing'] },
  '/j/': { symbol: '/j/', description: 'Y as in yes', examples: ['yes', 'you', 'yellow'] },
  '/w/': { symbol: '/w/', description: 'W as in we', examples: ['we', 'water', 'wind'] },
};

export const PhonicsExplorer: React.FC<PhonicsExplorerProps> = ({ word, onClose }) => {
  const theme = useTheme();
  const [breakdown, setBreakdown] = useState<WordBreakdown | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PhonicsPattern | null>(null);

  useEffect(() => {
    analyzeWord(word);
  }, [word]);

  const analyzeWord = (targetWord: string) => {
    const lowerWord = targetWord.toLowerCase();
    const letters = targetWord.split('');
    
    // Find phonics patterns in the word
    const foundPatterns: PhonicsPattern[] = [];
    for (const pattern of phonicsPatterns) {
      if (lowerWord.includes(pattern.pattern)) {
        foundPatterns.push(pattern);
      }
    }

    // Simple syllable splitting (basic implementation)
    const syllables = splitIntoSyllables(lowerWord);
    
    // Generate basic phonemes (simplified)
    const phonemes = generatePhonemes(lowerWord, foundPatterns);
    
    // Generate IPA (simplified)
    const ipa = generateIPA(lowerWord, foundPatterns);
    
    // Stress pattern (simplified - primary stress on first syllable)
    const stress = [1, ...new Array(syllables.length - 1).fill(0)];

    setBreakdown({
      word: targetWord,
      letters,
      phonemes,
      syllables,
      patterns: foundPatterns,
      ipa,
      stress
    });
  };

  const splitIntoSyllables = (word: string): string[] => {
    // Basic syllable splitting - can be enhanced with more sophisticated algorithms
    const vowels = 'aeiouy';
    const syllables: string[] = [];
    let currentSyllable = '';
    
    for (let i = 0; i < word.length; i++) {
      currentSyllable += word[i];
      
      // Simple rule: split after vowel-consonant pattern
      if (i < word.length - 1) {
        const currentIsVowel = vowels.includes(word[i]);
        const nextIsVowel = vowels.includes(word[i + 1]);
        
        if (currentIsVowel && !nextIsVowel && i < word.length - 2) {
          // Check if next consonant is followed by vowel
          const nextNextIsVowel = vowels.includes(word[i + 2]);
          if (nextNextIsVowel) {
            syllables.push(currentSyllable);
            currentSyllable = '';
          }
        }
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    return syllables.length > 0 ? syllables : [word];
  };

  const generatePhonemes = (word: string, patterns: PhonicsPattern[]): string[] => {
    // Simplified phoneme generation
    const phonemes: string[] = [];
    let remainingWord = word;
    
    // Apply patterns first
    for (const pattern of patterns) {
      if (remainingWord.includes(pattern.pattern)) {
        phonemes.push(pattern.sound);
        remainingWord = remainingWord.replace(pattern.pattern, '');
      }
    }
    
    // Add remaining letters as basic phonemes
    for (const letter of remainingWord) {
      if (letter.match(/[aeiou]/)) {
        phonemes.push(`/${letter}/`);
      } else if (letter.match(/[bcdfghjklmnpqrstvwxyz]/)) {
        phonemes.push(`/${letter}/`);
      }
    }
    
    return phonemes.length > 0 ? phonemes : [`/${word}/`];
  };

  const generateIPA = (word: string, patterns: PhonicsPattern[]): string => {
    // Simplified IPA generation
    let ipa = word;
    
    for (const pattern of patterns) {
      ipa = ipa.replace(new RegExp(pattern.pattern, 'g'), pattern.sound);
    }
    
    return `/${ipa}/`;
  };

  const playAudio = async (text: string) => {
    try {
      await audioPronunciationService.playWord(text);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  if (!breakdown) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Text>Analyzing word...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.word, { color: theme.colors.primary }]}>
            {breakdown.word}
          </Text>
          <IconButton
            icon="volume-high"
            size={24}
            onPress={() => playAudio(breakdown.word)}
          />
        </View>

        {/* Letters and Phonemes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Letters & Sounds
          </Text>
          <View style={styles.lettersContainer}>
            {breakdown.letters.map((letter, index) => (
              <View key={index} style={styles.letterBox}>
                <Text style={[styles.letter, { color: theme.colors.onSurface }]}>
                  {letter}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.phonemesContainer}>
            {breakdown.phonemes.map((phoneme, index) => (
              <TouchableOpacity
                key={index}
                style={styles.phonemeBox}
                onPress={() => playAudio(phoneme.replace(/[\/]/g, ''))}
              >
                <Text style={[styles.phoneme, { color: theme.colors.primary }]}>
                  {phoneme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* IPA Transcription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            IPA Transcription
          </Text>
          <Text style={[styles.ipa, { color: theme.colors.secondary }]}>
            {breakdown.ipa}
          </Text>
        </View>

        {/* Syllables */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Syllables
          </Text>
          <View style={styles.syllablesContainer}>
            {breakdown.syllables.map((syllable, index) => (
              <TouchableOpacity
                key={index}
                style={styles.syllableBox}
                onPress={() => playAudio(syllable)}
              >
                <Text style={[styles.syllable, { color: theme.colors.onSurface }]}>
                  {syllable}
                </Text>
                {breakdown.stress[index] === 1 && (
                  <Text style={[styles.stress, { color: theme.colors.primary }]}>
                    ˈ
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phonics Patterns */}
        {breakdown.patterns.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Phonics Patterns
            </Text>
            <View style={styles.patternsContainer}>
              {breakdown.patterns.map((pattern, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.patternBox, { backgroundColor: theme.colors.primaryContainer }]}
                  onPress={() => setSelectedPattern(pattern)}
                >
                  <Text style={[styles.pattern, { color: theme.colors.onPrimaryContainer }]}>
                    {pattern.pattern} = {pattern.sound}
                  </Text>
                  <Text style={[styles.patternType, { color: theme.colors.onPrimaryContainer }]}>
                    {pattern.type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Pattern Details Modal */}
        {selectedPattern && (
          <View style={[styles.patternModal, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.patternTitle, { color: theme.colors.primary }]}>
              {selectedPattern.pattern} = {selectedPattern.sound}
            </Text>
            <Text style={[styles.patternDescription, { color: theme.colors.onSurface }]}>
              Examples: {selectedPattern.examples.join(', ')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPattern(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    maxWidth: width * 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  letterBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  letter: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phonemesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  phonemeBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    margin: 2,
  },
  phoneme: {
    fontSize: 14,
    fontWeight: '500',
  },
  ipa: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  syllablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  syllableBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
  },
  syllable: {
    fontSize: 16,
    fontWeight: '500',
  },
  stress: {
    fontSize: 12,
    position: 'absolute',
    top: 2,
  },
  patternsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patternBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    margin: 4,
  },
  pattern: {
    fontSize: 14,
    fontWeight: '500',
  },
  patternType: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  patternModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patternDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PhonicsExplorer; 