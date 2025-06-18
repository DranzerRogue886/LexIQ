import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, Searchbar, Menu } from 'react-native-paper';
import { useVocabulary } from '../contexts/VocabularyContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VocabularyDeck'>;

const VocabularyDeckScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { deck, removeFromDeck, updateReviewStatus } = useVocabulary();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'review'>('date');

  const filteredDeck = deck
    .filter(word => word.word.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.savedAt - a.savedAt;
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

  const renderWordItem = ({ item }: { item: typeof deck[0] }) => {
    const menuOpen = menuVisible === item.word;

    return (
      <View style={[styles.wordCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.wordHeader}>
          <View>
            <Text style={[styles.word, { color: theme.colors.primary }]}>
              {item.word}
            </Text>
            <Text style={[styles.phonetics, { color: theme.colors.onSurface }]}>
              {item.phonetics}
            </Text>
          </View>
          <Menu
            visible={menuOpen}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(item.word)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                updateReviewStatus(item.word);
                setMenuVisible(null);
              }}
              title="Mark as Reviewed"
            />
            <Menu.Item
              onPress={() => {
                removeFromDeck(item.word);
                setMenuVisible(null);
              }}
              title="Remove from Deck"
            />
          </Menu>
        </View>

        {item.meanings.map((meaning, index) => (
          <View key={index} style={styles.meaning}>
            <Text
              style={[styles.partOfSpeech, { color: theme.colors.primary }]}
            >
              {meaning.partOfSpeech}
            </Text>
            {meaning.definitions.slice(0, 2).map((def, defIndex) => (
              <Text
                key={defIndex}
                style={[styles.definition, { color: theme.colors.onSurface }]}
              >
                • {def}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.stats}>
          <Text style={{ color: theme.colors.onSurface }}>
            Added: {new Date(item.savedAt).toLocaleDateString()}
          </Text>
          <Text style={{ color: theme.colors.onSurface }}>
            Reviews: {item.reviewCount || 0}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search words..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <IconButton
          icon={sortBy === 'date' ? 'clock-outline' : 'star-outline'}
          onPress={() => setSortBy(sortBy === 'date' ? 'review' : 'date')}
        />
      </View>

      <FlatList
        data={filteredDeck}
        renderItem={renderWordItem}
        keyExtractor={item => item.word}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
            No words in your deck yet
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  wordCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    gap: 12,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  phonetics: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  meaning: {
    gap: 4,
  },
  partOfSpeech: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  definition: {
    fontSize: 14,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});

export default VocabularyDeckScreen; 