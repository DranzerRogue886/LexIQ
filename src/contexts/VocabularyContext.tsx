import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WordData {
  word: string;
  phonetics: string;
  audio: string;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
  }[];
  savedAt: number;
  lastReviewed?: number;
  reviewCount: number;
}

interface VocabularyContextType {
  deck: WordData[];
  addToDeck: (word: WordData) => void;
  removeFromDeck: (word: string) => void;
  updateReviewStatus: (word: string) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deck, setDeck] = useState<WordData[]>([]);

  useEffect(() => {
    loadDeck();
  }, []);

  const loadDeck = async () => {
    try {
      const savedDeck = await AsyncStorage.getItem('vocabularyDeck');
      if (savedDeck) {
        setDeck(JSON.parse(savedDeck));
      }
    } catch (error) {
      console.error('Error loading vocabulary deck:', error);
    }
  };

  const saveDeck = async (newDeck: WordData[]) => {
    try {
      await AsyncStorage.setItem('vocabularyDeck', JSON.stringify(newDeck));
    } catch (error) {
      console.error('Error saving vocabulary deck:', error);
    }
  };

  const addToDeck = (word: WordData) => {
    const newWord = {
      ...word,
      savedAt: Date.now(),
      reviewCount: 0,
    };

    setDeck(prevDeck => {
      const newDeck = [...prevDeck, newWord];
      saveDeck(newDeck);
      return newDeck;
    });
  };

  const removeFromDeck = (word: string) => {
    setDeck(prevDeck => {
      const newDeck = prevDeck.filter(item => item.word !== word);
      saveDeck(newDeck);
      return newDeck;
    });
  };

  const updateReviewStatus = (word: string) => {
    setDeck(prevDeck => {
      const newDeck = prevDeck.map(item => {
        if (item.word === word) {
          return {
            ...item,
            lastReviewed: Date.now(),
            reviewCount: (item.reviewCount || 0) + 1,
          };
        }
        return item;
      });
      saveDeck(newDeck);
      return newDeck;
    });
  };

  return (
    <VocabularyContext.Provider
      value={{
        deck,
        addToDeck,
        removeFromDeck,
        updateReviewStatus,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
}; 