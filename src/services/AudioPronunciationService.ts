import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface PronunciationOptions {
  rate?: number;
  pitch?: number;
  voice?: string;
  language?: string;
}

export interface PhonemeAudio {
  symbol: string;
  audioUrl?: string;
  fallbackText: string;
}

class AudioPronunciationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  async playWord(word: string, options: PronunciationOptions = {}) {
    await this.initialize();
    return this.playWithTTS(word, options);
  }

  async playWithTTS(text: string, options: PronunciationOptions = {}) {
    await this.initialize();
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const {
          rate = 0.8,
          pitch = 1.0,
          voice = 'en-US',
          language = 'en-US'
        } = options;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = language;
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.lang.includes(language));
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.onend = () => {
          console.log('TTS playback completed');
        };
        utterance.onerror = (event) => {
          console.error('TTS error:', event);
        };
        speechSynthesis.speak(utterance);
        return true;
      } else {
        // Use expo-speech for native
        const {
          rate = 0.8,
          pitch = 1.0,
          voice = undefined,
          language = 'en-US'
        } = options;
        Speech.speak(text, {
          rate,
          pitch,
          voice,
          language,
          onDone: () => console.log('TTS playback completed'),
          onError: (error) => console.error('TTS error:', error),
        });
        return true;
      }
    } catch (error) {
      console.error('TTS playback failed:', error);
      return false;
    }
  }

  async playPhoneme(phoneme: string, options: PronunciationOptions = {}) {
    const cleanPhoneme = phoneme.replace(/[\/\[\]]/g, '');
    const phonemeMap: Record<string, string> = {
      'æ': 'cat',
      'eɪ': 'day',
      'ɑː': 'car',
      'e': 'bed',
      'iː': 'see',
      'ɪ': 'sit',
      'aɪ': 'bike',
      'ɒ': 'hot',
      'oʊ': 'boat',
      'ʊ': 'book',
      'juː': 'cute',
      'ʌ': 'cup',
      'ɜː': 'bird',
      'ə': 'about',
      'ɔɪ': 'coin',
      'aʊ': 'house',
      'ɪə': 'ear',
      'eə': 'air',
      'tʃ': 'chair',
      'ʃ': 'ship',
      'θ': 'think',
      'ð': 'this',
      'ŋ': 'sing',
      'j': 'yes',
      'w': 'we',
      'dʒ': 'jump',
    };
    const exampleWord = phonemeMap[cleanPhoneme] || cleanPhoneme;
    return this.playWord(exampleWord, options);
  }

  async playSyllable(syllable: string, options: PronunciationOptions = {}) {
    return this.playWord(syllable, options);
  }

  async playPhonemeSequence(phonemes: string[], options: PronunciationOptions = {}) {
    await this.initialize();
    for (let i = 0; i < phonemes.length; i++) {
      const phoneme = phonemes[i];
      await this.playPhoneme(phoneme, options);
      if (i < phonemes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  async stop() {
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      Speech.stop();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async getAvailableVoices(): Promise<string[]> {
    try {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        return voices.map(voice => voice.name);
      }
      return [];
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  async isAudioSupported(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPronunciationData(word: string) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const phonetics = entry.phonetics || [];
        return {
          word: entry.word,
          phonetic: entry.phonetic,
          phonetics: phonetics.map((p: any) => ({
            text: p.text,
            audio: p.audio,
          })),
          meanings: entry.meanings,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching pronunciation data:', error);
      return null;
    }
  }
}

export const audioPronunciationService = new AudioPronunciationService(); 