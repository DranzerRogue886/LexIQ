import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WordData {
  word: string;
  phonetics: string;
  audio: string;
  meanings: {
    partOfSpeech: string;
    definitions: string[];
  }[];
  source?: string; // Which reading activity the word came from
  dateAdded: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  lastReviewed?: string;
}

interface VocabularyContextType {
  vocabulary: WordData[];
  addWord: (wordData: WordData) => Promise<void>;
  removeWord: (word: string) => Promise<void>;
  updateWord: (word: string, updates: Partial<WordData>) => Promise<void>;
  getWordsBySource: (source: string) => WordData[];
  getWordsByMasteryLevel: (level: WordData['masteryLevel']) => WordData[];
  getWordsNeedingReview: () => WordData[];
  markWordAsReviewed: (word: string) => Promise<void>;
  incrementMasteryLevel: (word: string) => Promise<void>;
  clearVocabulary: () => Promise<void>;
  exportVocabulary: () => Promise<string>;
  importVocabulary: (data: string) => Promise<void>;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vocabulary, setVocabulary] = useState<WordData[]>([]);

  // Load vocabulary from storage on mount
  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const stored = await AsyncStorage.getItem('vocabulary');
      if (stored) {
        setVocabulary(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    }
  };

  const saveVocabulary = async (newVocabulary: WordData[]) => {
    try {
      await AsyncStorage.setItem('vocabulary', JSON.stringify(newVocabulary));
      setVocabulary(newVocabulary);
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  };

  const addWord = async (wordData: WordData) => {
    const existingWord = vocabulary.find(w => w.word.toLowerCase() === wordData.word.toLowerCase());
    
    if (existingWord) {
      // Update existing word with new information
      const updatedWord = {
        ...existingWord,
        ...wordData,
        reviewCount: existingWord.reviewCount + 1,
        lastReviewed: new Date().toISOString(),
      };
      
      const updatedVocabulary = vocabulary.map(w => 
        w.word.toLowerCase() === wordData.word.toLowerCase() ? updatedWord : w
      );
      await saveVocabulary(updatedVocabulary);
    } else {
      // Add new word
      const newWord: WordData = {
        ...wordData,
        dateAdded: new Date().toISOString(),
        masteryLevel: 'new',
        reviewCount: 0,
      };
      await saveVocabulary([...vocabulary, newWord]);
    }
  };

  const removeWord = async (word: string) => {
    const updatedVocabulary = vocabulary.filter(w => w.word.toLowerCase() !== word.toLowerCase());
    await saveVocabulary(updatedVocabulary);
  };

  const updateWord = async (word: string, updates: Partial<WordData>) => {
    const updatedVocabulary = vocabulary.map(w => 
      w.word.toLowerCase() === word.toLowerCase() ? { ...w, ...updates } : w
    );
    await saveVocabulary(updatedVocabulary);
  };

  const getWordsBySource = (source: string) => {
    return vocabulary.filter(word => word.source === source);
  };

  const getWordsByMasteryLevel = (level: WordData['masteryLevel']) => {
    return vocabulary.filter(word => word.masteryLevel === level);
  };

  const getWordsNeedingReview = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return vocabulary.filter(word => {
      if (word.masteryLevel === 'new') return true;
      if (!word.lastReviewed) return true;
      
      const lastReviewed = new Date(word.lastReviewed);
      const daysSinceReview = (now.getTime() - lastReviewed.getTime()) / (24 * 60 * 60 * 1000);
      
      // Review schedule based on mastery level
      switch (word.masteryLevel) {
        case 'learning':
          return daysSinceReview >= 3; // Review every 3 days
        case 'mastered':
          return daysSinceReview >= 7; // Review every week
        default:
          return daysSinceReview >= 1; // Review daily
      }
    });
  };

  const markWordAsReviewed = async (word: string) => {
    await updateWord(word, {
      lastReviewed: new Date().toISOString(),
      reviewCount: (vocabulary.find(w => w.word.toLowerCase() === word.toLowerCase())?.reviewCount || 0) + 1,
    });
  };

  const incrementMasteryLevel = async (word: string) => {
    const currentWord = vocabulary.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (!currentWord) return;

    const masteryLevels: WordData['masteryLevel'][] = ['new', 'learning', 'mastered'];
    const currentIndex = masteryLevels.indexOf(currentWord.masteryLevel);
    const nextLevel = masteryLevels[Math.min(currentIndex + 1, masteryLevels.length - 1)];

    await updateWord(word, { masteryLevel: nextLevel });
  };

  const clearVocabulary = async () => {
    await saveVocabulary([]);
  };

  const exportVocabulary = async (): Promise<string> => {
    return JSON.stringify(vocabulary, null, 2);
  };

  const importVocabulary = async (data: string) => {
    try {
      const importedVocabulary = JSON.parse(data);
      if (Array.isArray(importedVocabulary)) {
        await saveVocabulary(importedVocabulary);
      }
    } catch (error) {
      console.error('Error importing vocabulary:', error);
      throw new Error('Invalid vocabulary data format');
    }
  };

  const value: VocabularyContextType = {
    vocabulary,
    addWord,
    removeWord,
    updateWord,
    getWordsBySource,
    getWordsByMasteryLevel,
    getWordsNeedingReview,
    markWordAsReviewed,
    incrementMasteryLevel,
    clearVocabulary,
    exportVocabulary,
    importVocabulary,
  };

  return (
    <VocabularyContext.Provider value={value}>
      {children}
    </VocabularyContext.Provider>
  );
}; 