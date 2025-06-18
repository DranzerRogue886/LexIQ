import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Button, TextInput, IconButton, Portal, Modal } from 'react-native-paper';
import PhonicsExplorer from '../components/PhonicsExplorer';
import PhonicsGames from '../components/PhonicsGames';
import PhonemeSoundboard from '../components/PhonemeSoundboard';

const { width, height } = Dimensions.get('window');

const PhonicsScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedWord, setSelectedWord] = useState('');
  const [showExplorer, setShowExplorer] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  const handleWordAnalysis = () => {
    if (selectedWord.trim()) {
      setShowExplorer(true);
      setShowGames(false);
      setShowSoundboard(false);
    }
  };

  const handleCloseExplorer = () => {
    setShowExplorer(false);
  };

  const handleCloseGames = () => {
    setShowGames(false);
  };

  const handleCloseSoundboard = () => {
    setShowSoundboard(false);
  };

  const openGames = () => {
    setShowGames(true);
    setShowExplorer(false);
    setShowSoundboard(false);
  };

  const openSoundboard = () => {
    setShowSoundboard(true);
    setShowExplorer(false);
    setShowGames(false);
  };

  const LearningTipsModal = () => (
    <Portal>
      <Modal
        visible={showTipsModal}
        onDismiss={() => setShowTipsModal(false)}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
            Learning Tips
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowTipsModal(false)}
          />
        </View>
        
        <ScrollView style={styles.tipsScroll}>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <IconButton
                icon="lightbulb"
                size={24}
                iconColor={theme.colors.primary}
              />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.colors.onSurface }]}>
                  Start with Simple Words
                </Text>
                <Text style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
                  Begin with CVC words (cat, dog, hat) to understand basic sound-letter relationships.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <IconButton
                icon="ear"
                size={24}
                iconColor={theme.colors.secondary}
              />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.colors.onSurface }]}>
                  Listen and Repeat
                </Text>
                <Text style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
                  Use the audio features to hear correct pronunciation and practice repeating sounds.
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <IconButton
                icon="puzzle"
                size={24}
                iconColor={theme.colors.tertiary}
              />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.colors.onSurface }]}>
                  Practice Patterns
                </Text>
                <Text style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
                  Focus on common phonics patterns like digraphs (ch, sh) and vowel teams (ai, ee).
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <IconButton
                icon="gamepad-variant"
                size={24}
                iconColor={theme.colors.error}
              />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.colors.onSurface }]}>
                  Play Games Regularly
                </Text>
                <Text style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
                  Use the phonics games to reinforce learning and make practice fun and engaging.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Tips Button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Phonics & Phonetics
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Master sound-letter relationships and pronunciation
          </Text>
        </View>
        <IconButton
          icon="help-circle"
          size={28}
          iconColor={theme.colors.primary}
          onPress={() => setShowTipsModal(true)}
          style={styles.tipsButton}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Word Analysis Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Word Analysis
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Enter any word to see its phonics breakdown, phonemes, and pronunciation patterns.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Enter a word to analyze"
                value={selectedWord}
                onChangeText={setSelectedWord}
                mode="outlined"
                style={styles.textInput}
                right={
                  <TextInput.Icon
                    icon="magnify"
                    onPress={handleWordAnalysis}
                    disabled={!selectedWord.trim()}
                  />
                }
              />
              <Button
                mode="contained"
                onPress={handleWordAnalysis}
                disabled={!selectedWord.trim()}
                style={styles.analyzeButton}
              >
                Analyze Word
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Phonics Explorer */}
        {showExplorer && selectedWord && (
          <View style={styles.componentContainer}>
            <PhonicsExplorer word={selectedWord} onClose={handleCloseExplorer} />
          </View>
        )}

        {/* Interactive Tools Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Interactive Tools
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Practice phonics skills with games and explore the complete phoneme chart.
            </Text>
            
            <View style={styles.toolsContainer}>
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={openGames}
              >
                <IconButton
                  icon="gamepad-variant"
                  size={32}
                  iconColor={theme.colors.onPrimaryContainer}
                />
                <Text style={[styles.toolTitle, { color: theme.colors.onPrimaryContainer }]}>
                  Phonics Games
                </Text>
                <Text style={[styles.toolDescription, { color: theme.colors.onPrimaryContainer }]}>
                  Blending, segmenting, and pattern recognition games
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: theme.colors.secondaryContainer }]}
                onPress={openSoundboard}
              >
                <IconButton
                  icon="music-note"
                  size={32}
                  iconColor={theme.colors.onSecondaryContainer}
                />
                <Text style={[styles.toolTitle, { color: theme.colors.onSecondaryContainer }]}>
                  Phoneme Soundboard
                </Text>
                <Text style={[styles.toolDescription, { color: theme.colors.onSecondaryContainer }]}>
                  Interactive chart of all English phonemes with audio
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Phonics Games */}
        {showGames && (
          <View style={styles.componentContainer}>
            <PhonicsGames onClose={handleCloseGames} />
          </View>
        )}

        {/* Phoneme Soundboard */}
        {showSoundboard && (
          <View style={styles.componentContainer}>
            <PhonemeSoundboard onClose={handleCloseSoundboard} />
          </View>
        )}

        {/* Progress Tracking Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Your Progress
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Track your phonics learning journey and identify areas for improvement.
            </Text>
            
            <View style={styles.progressContainer}>
              <Card style={[styles.progressCard, { backgroundColor: theme.colors.primaryContainer }]}>
                <Card.Content style={styles.progressCardContent}>
                  <IconButton
                    icon="text-search"
                    size={32}
                    iconColor={theme.colors.onPrimaryContainer}
                  />
                  <Text style={[styles.progressValue, { color: theme.colors.onPrimaryContainer }]}>
                    0
                  </Text>
                  <Text style={[styles.progressLabel, { color: theme.colors.onPrimaryContainer }]}>
                    Words Analyzed
                  </Text>
                </Card.Content>
              </Card>
              
              <Card style={[styles.progressCard, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Card.Content style={styles.progressCardContent}>
                  <IconButton
                    icon="trophy"
                    size={32}
                    iconColor={theme.colors.onSecondaryContainer}
                  />
                  <Text style={[styles.progressValue, { color: theme.colors.onSecondaryContainer }]}>
                    0
                  </Text>
                  <Text style={[styles.progressLabel, { color: theme.colors.onSecondaryContainer }]}>
                    Games Completed
                  </Text>
                </Card.Content>
              </Card>
              
              <Card style={[styles.progressCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
                <Card.Content style={styles.progressCardContent}>
                  <IconButton
                    icon="puzzle"
                    size={32}
                    iconColor={theme.colors.onTertiaryContainer}
                  />
                  <Text style={[styles.progressValue, { color: theme.colors.onTertiaryContainer }]}>
                    0
                  </Text>
                  <Text style={[styles.progressLabel, { color: theme.colors.onTertiaryContainer }]}>
                    Patterns Learned
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <LearningTipsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tipsButton: {
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    marginBottom: 8,
  },
  analyzeButton: {
    marginTop: 8,
  },
  componentContainer: {
    marginBottom: 20,
  },
  toolsContainer: {
    gap: 16,
  },
  toolCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    gap: 12,
  },
  progressCard: {
    borderRadius: 12,
    elevation: 2,
  },
  progressCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  progressLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tipsScroll: {
    flex: 1,
  },
  tipsContainer: {
    padding: 16,
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PhonicsScreen; 