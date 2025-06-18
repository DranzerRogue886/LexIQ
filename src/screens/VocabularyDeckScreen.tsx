import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, Searchbar, Menu } from 'react-native-paper';
import { useVocabulary } from '../contexts/VocabularyContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VocabularyDeck'>;

const VocabularyDeckScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { vocabulary, removeWord, markWordAsReviewed } = useVocabulary();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'review'>('date');

  const filteredDeck = useMemo(() => 
    vocabulary
      .filter(word => word.word.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }),
    [vocabulary, searchQuery, sortBy]
  );

  const handleMenuOpen = useCallback((word: string) => {
    setMenuVisible(word);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuVisible(null);
  }, []);

  const handleReview = useCallback((word: string) => {
    markWordAsReviewed(word);
    setMenuVisible(null);
  }, [markWordAsReviewed]);

  const handleRemove = useCallback((word: string) => {
    removeWord(word);
    setMenuVisible(null);
  }, [removeWord]);

  const handleSortToggle = useCallback(() => {
    setSortBy(prev => prev === 'date' ? 'review' : 'date');
  }, []);

  const renderWordItem = useCallback(({ item }: { item: typeof vocabulary[0] }) => {
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
            onDismiss={handleMenuClose}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => handleMenuOpen(item.word)}
              />
            }
          >
            <Menu.Item
              onPress={() => handleReview(item.word)}
              title="Mark as Reviewed"
            />
            <Menu.Item
              onPress={() => handleRemove(item.word)}
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
            Added: {new Date(item.dateAdded).toLocaleDateString()}
          </Text>
          <Text style={{ color: theme.colors.onSurface }}>
            Reviews: {item.reviewCount || 0}
          </Text>
        </View>
      </View>
    );
  }, [theme, menuVisible, handleMenuClose, handleMenuOpen, handleReview, handleRemove]);

  const keyExtractor = useCallback((item: typeof vocabulary[0]) => item.word, []);

  const ListEmptyComponent = useMemo(() => (
    <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
      No words in your deck yet
    </Text>
  ), [theme]);

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
          onPress={handleSortToggle}
        />
      </View>

      <FlatList
        data={filteredDeck}
        renderItem={renderWordItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
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