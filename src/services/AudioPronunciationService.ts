import { Audio } from 'expo-av';

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
  private sound: Audio.Sound | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  async playWord(word: string, options: PronunciationOptions = {}) {
    await this.initialize();

    try {
      // Try to get audio from dictionary API first
      const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3`;
      
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      
      // Set up error handling for audio playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.cleanup();
        }
      });

      return true;
    } catch (error) {
      console.log('Dictionary API audio not available, using TTS fallback');
      return this.playWithTTS(word, options);
    }
  }

  async playWithTTS(text: string, options: PronunciationOptions = {}) {
    await this.initialize();

    try {
      // Use browser TTS if available
      if ('speechSynthesis' in window) {
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
        
        // Try to set voice if available
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
        console.log('Speech synthesis not available');
        return false;
      }
    } catch (error) {
      console.error('TTS playback failed:', error);
      return false;
    }
  }

  async playPhoneme(phoneme: string, options: PronunciationOptions = {}) {
    // Remove IPA brackets for TTS
    const cleanPhoneme = phoneme.replace(/[\/\[\]]/g, '');
    
    // Map common phonemes to example words for better pronunciation
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
      
      // Add a small pause between phonemes
      if (i < phonemes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  private cleanup() {
    if (this.sound) {
      this.sound.unloadAsync();
      this.sound = null;
    }
  }

  // Get available voices for TTS
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

  // Check if audio is supported
  async isAudioSupported(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Preload audio for better performance
  async preloadAudio(word: string): Promise<boolean> {
    try {
      const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3`;
      
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false }
      );
      
      this.sound = sound;
      return true;
    } catch (error) {
      console.log('Preload failed, will use TTS fallback');
      return false;
    }
  }

  // Get pronunciation data from dictionary API
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

// Export singleton instance
export const audioPronunciationService = new AudioPronunciationService(); 