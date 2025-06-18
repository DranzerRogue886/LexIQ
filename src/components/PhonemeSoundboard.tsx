import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text, Card, useTheme, IconButton, Searchbar } from 'react-native-paper';
import { audioPronunciationService } from '../services/AudioPronunciationService';

const { width, height } = Dimensions.get('window');

interface Phoneme {
  symbol: string;
  description: string;
  examples: string[];
  category: 'vowels' | 'consonants' | 'diphthongs' | 'digraphs';
  commonSpellings: string[];
}

interface PhonemeSoundboardProps {
  onClose?: () => void;
}

const PhonemeSoundboard: React.FC<PhonemeSoundboardProps> = ({ onClose }) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vowels' | 'consonants' | 'diphthongs' | 'digraphs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoneme, setSelectedPhoneme] = useState<Phoneme | null>(null);

  // Comprehensive phoneme database
  const phonemes: Phoneme[] = [
    // Vowels
    { symbol: '/æ/', description: 'Short A as in cat', examples: ['cat', 'hat', 'map'], category: 'vowels', commonSpellings: ['a', 'ai'] },
    { symbol: '/eɪ/', description: 'Long A as in cake', examples: ['cake', 'rain', 'day'], category: 'vowels', commonSpellings: ['a_e', 'ai', 'ay'] },
    { symbol: '/ɑː/', description: 'Broad A as in father', examples: ['father', 'car', 'far'], category: 'vowels', commonSpellings: ['ar', 'a'] },
    { symbol: '/e/', description: 'Short E as in bed', examples: ['bed', 'red', 'get'], category: 'vowels', commonSpellings: ['e', 'ea'] },
    { symbol: '/iː/', description: 'Long E as in see', examples: ['see', 'tree', 'me'], category: 'vowels', commonSpellings: ['ee', 'ea', 'e_e'] },
    { symbol: '/ɪ/', description: 'Short I as in sit', examples: ['sit', 'hit', 'big'], category: 'vowels', commonSpellings: ['i', 'y'] },
    { symbol: '/aɪ/', description: 'Long I as in bike', examples: ['bike', 'like', 'time'], category: 'vowels', commonSpellings: ['i_e', 'igh', 'y'] },
    { symbol: '/ɒ/', description: 'Short O as in hot', examples: ['hot', 'lot', 'dog'], category: 'vowels', commonSpellings: ['o', 'a'] },
    { symbol: '/oʊ/', description: 'Long O as in boat', examples: ['boat', 'go', 'no'], category: 'vowels', commonSpellings: ['o_e', 'oa', 'ow'] },
    { symbol: '/ʊ/', description: 'Short U as in put', examples: ['put', 'book', 'good'], category: 'vowels', commonSpellings: ['oo', 'u'] },
    { symbol: '/juː/', description: 'Long U as in cute', examples: ['cute', 'use', 'music'], category: 'vowels', commonSpellings: ['u_e', 'ue', 'ew'] },
    { symbol: '/ʌ/', description: 'Short U as in cup', examples: ['cup', 'bus', 'run'], category: 'vowels', commonSpellings: ['u', 'o'] },
    { symbol: '/ɜː/', description: 'ER as in bird', examples: ['bird', 'girl', 'work'], category: 'vowels', commonSpellings: ['er', 'ir', 'ur'] },
    { symbol: '/ə/', description: 'Schwa as in about', examples: ['about', 'sofa', 'banana'], category: 'vowels', commonSpellings: ['a', 'e', 'i', 'o', 'u'] },
    
    // Diphthongs
    { symbol: '/ɔɪ/', description: 'OI as in coin', examples: ['coin', 'oil', 'boy'], category: 'diphthongs', commonSpellings: ['oi', 'oy'] },
    { symbol: '/aʊ/', description: 'OU as in house', examples: ['house', 'out', 'cow'], category: 'diphthongs', commonSpellings: ['ou', 'ow'] },
    { symbol: '/ɪə/', description: 'EAR as in ear', examples: ['ear', 'hear', 'near'], category: 'diphthongs', commonSpellings: ['ear', 'eer'] },
    { symbol: '/eə/', description: 'AIR as in air', examples: ['air', 'hair', 'fair'], category: 'diphthongs', commonSpellings: ['air', 'are'] },
    
    // Consonants
    { symbol: '/p/', description: 'P as in pen', examples: ['pen', 'map', 'stop'], category: 'consonants', commonSpellings: ['p', 'pp'] },
    { symbol: '/b/', description: 'B as in bed', examples: ['bed', 'job', 'rub'], category: 'consonants', commonSpellings: ['b', 'bb'] },
    { symbol: '/t/', description: 'T as in ten', examples: ['ten', 'cat', 'sit'], category: 'consonants', commonSpellings: ['t', 'tt'] },
    { symbol: '/d/', description: 'D as in dog', examples: ['dog', 'bed', 'red'], category: 'consonants', commonSpellings: ['d', 'dd'] },
    { symbol: '/k/', description: 'K as in key', examples: ['key', 'book', 'make'], category: 'consonants', commonSpellings: ['k', 'c', 'ck'] },
    { symbol: '/g/', description: 'G as in go', examples: ['go', 'big', 'dog'], category: 'consonants', commonSpellings: ['g', 'gg'] },
    { symbol: '/f/', description: 'F as in fish', examples: ['fish', 'off', 'leaf'], category: 'consonants', commonSpellings: ['f', 'ff', 'ph'] },
    { symbol: '/v/', description: 'V as in van', examples: ['van', 'love', 'five'], category: 'consonants', commonSpellings: ['v'] },
    { symbol: '/θ/', description: 'TH as in think', examples: ['think', 'bath', 'three'], category: 'consonants', commonSpellings: ['th'] },
    { symbol: '/ð/', description: 'TH as in this', examples: ['this', 'that', 'the'], category: 'consonants', commonSpellings: ['th'] },
    { symbol: '/s/', description: 'S as in sun', examples: ['sun', 'bus', 'yes'], category: 'consonants', commonSpellings: ['s', 'ss', 'c'] },
    { symbol: '/z/', description: 'Z as in zoo', examples: ['zoo', 'buzz', 'zebra'], category: 'consonants', commonSpellings: ['z', 'zz', 's'] },
    { symbol: '/ʃ/', description: 'SH as in ship', examples: ['ship', 'fish', 'brush'], category: 'consonants', commonSpellings: ['sh', 'ti', 'ci'] },
    { symbol: '/ʒ/', description: 'ZH as in vision', examples: ['vision', 'measure', 'treasure'], category: 'consonants', commonSpellings: ['si', 'ge'] },
    { symbol: '/h/', description: 'H as in hat', examples: ['hat', 'he', 'who'], category: 'consonants', commonSpellings: ['h', 'wh'] },
    { symbol: '/m/', description: 'M as in man', examples: ['man', 'home', 'sum'], category: 'consonants', commonSpellings: ['m', 'mm'] },
    { symbol: '/n/', description: 'N as in no', examples: ['no', 'sun', 'ten'], category: 'consonants', commonSpellings: ['n', 'nn'] },
    { symbol: '/ŋ/', description: 'NG as in sing', examples: ['sing', 'ring', 'thing'], category: 'consonants', commonSpellings: ['ng'] },
    { symbol: '/l/', description: 'L as in leg', examples: ['leg', 'ball', 'milk'], category: 'consonants', commonSpellings: ['l', 'll'] },
    { symbol: '/r/', description: 'R as in red', examples: ['red', 'car', 'bird'], category: 'consonants', commonSpellings: ['r', 'rr'] },
    { symbol: '/j/', description: 'Y as in yes', examples: ['yes', 'you', 'yellow'], category: 'consonants', commonSpellings: ['y', 'i'] },
    { symbol: '/w/', description: 'W as in we', examples: ['we', 'water', 'wind'], category: 'consonants', commonSpellings: ['w', 'wh'] },
    
    // Digraphs
    { symbol: '/tʃ/', description: 'CH as in chair', examples: ['chair', 'church', 'chicken'], category: 'digraphs', commonSpellings: ['ch', 'tch'] },
    { symbol: '/dʒ/', description: 'J as in jump', examples: ['jump', 'bridge', 'edge'], category: 'digraphs', commonSpellings: ['j', 'dge', 'ge'] },
  ];

  useEffect(() => {
    return () => {
      audioPronunciationService.stop();
    };
  }, []);

  const playAudio = async (text: string) => {
    try {
      await audioPronunciationService.playWord(text);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  const filteredPhonemes = phonemes.filter(phoneme => {
    const matchesCategory = selectedCategory === 'all' || phoneme.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      phoneme.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phoneme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phoneme.examples.some(example => example.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vowels': return theme.colors.primary;
      case 'consonants': return theme.colors.secondary;
      case 'diphthongs': return theme.colors.tertiary;
      case 'digraphs': return theme.colors.error;
      default: return theme.colors.onSurface;
    }
  };

  const handlePhonemePress = (phoneme: Phoneme) => {
    setSelectedPhoneme(phoneme);
    playAudio(phoneme.examples[0]);
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Phoneme Soundboard
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
          />
        </View>

        <Searchbar
          placeholder="Search phonemes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryContainer}>
            {['all', 'vowels', 'consonants', 'diphthongs', 'digraphs'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && {
                    backgroundColor: getCategoryColor(category),
                  },
                ]}
                onPress={() => setSelectedCategory(category as any)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category ? 'white' : theme.colors.onSurface }
                ]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView style={styles.phonemesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.phonemesGrid}>
            {filteredPhonemes.map((phoneme) => (
              <TouchableOpacity
                key={phoneme.symbol}
                style={[
                  styles.phonemeCard,
                  { backgroundColor: theme.colors.surface },
                  selectedPhoneme?.symbol === phoneme.symbol && {
                    borderColor: getCategoryColor(phoneme.category),
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handlePhonemePress(phoneme)}
              >
                <Text style={[styles.phonemeSymbol, { color: getCategoryColor(phoneme.category) }]}>
                  {phoneme.symbol}
                </Text>
                <Text style={[styles.phonemeDescription, { color: theme.colors.onSurface }]}>
                  {phoneme.description}
                </Text>
                <Text style={[styles.phonemeExamples, { color: theme.colors.onSurfaceVariant }]}>
                  {phoneme.examples.join(', ')}
                </Text>
                <Text style={[styles.phonemeSpellings, { color: theme.colors.primary }]}>
                  {phoneme.commonSpellings.join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {selectedPhoneme && (
          <View style={[styles.detailCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.detailTitle, { color: theme.colors.onPrimaryContainer }]}>
              {selectedPhoneme.symbol} - {selectedPhoneme.description}
            </Text>
            <Text style={[styles.detailExamples, { color: theme.colors.onPrimaryContainer }]}>
              Examples: {selectedPhoneme.examples.join(', ')}
            </Text>
            <Text style={[styles.detailSpellings, { color: theme.colors.onPrimaryContainer }]}>
              Common spellings: {selectedPhoneme.commonSpellings.join(', ')}
            </Text>
            <View style={styles.audioButtons}>
              {selectedPhoneme.examples.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.audioButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => playAudio(example)}
                >
                  <Text style={[styles.audioButtonText, { color: 'white' }]}>
                    🔊 {example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  phonemesContainer: {
    maxHeight: height * 0.5,
  },
  phonemesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  phonemeCard: {
    width: (width - 80) / 2,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  phonemeSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phonemeDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  phonemeExamples: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  phonemeSpellings: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailExamples: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailSpellings: {
    fontSize: 14,
    marginBottom: 12,
  },
  audioButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  audioButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PhonemeSoundboard; 