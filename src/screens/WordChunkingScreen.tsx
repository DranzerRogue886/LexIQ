import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Button, SegmentedButtons, useTheme, Menu } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { WordChunker } from '../components/WordChunker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VocabularyLookup } from '../components/VocabularyLookup';
import { useVocabulary } from '../contexts/VocabularyContext';
import { GestureResponderEvent } from 'react-native';

type RootStackParamList = {
  WordChunking: undefined;
  WordRecall: { passageWords: string[] };
};

type Props = NativeStackScreenProps<RootStackParamList, 'WordChunking'>;

const { width, height } = Dimensions.get('window');

const WordChunkingScreen: React.FC<Props> = ({ navigation }) => {
  const [wpm, setWpm] = useState(300);
  const [chunkSize, setChunkSize] = useState(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedText, setSelectedText] = useState<string>('random');
  const [isReading, setIsReading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; position: { x: number; y: number } } | null>(null);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const theme = useTheme();
  const { addWord } = useVocabulary();

  const sampleTexts = {
    // Easy texts - simple vocabulary, short sentences
    easy_basic: "The quick brown fox jumps over the lazy dog. This is a simple sentence that helps you practice reading. The words are common and easy to understand. Reading helps us learn new things every day. We can discover amazing stories and interesting facts. Books take us to different places and times. Libraries are full of wonderful books waiting to be read. Reading makes our minds stronger and more creative.",
    easy_nature: "Birds fly high in the blue sky. Flowers bloom in the warm sun. Trees sway gently in the breeze. Nature is beautiful and peaceful. Mountains stand tall against the horizon. Rivers flow through valleys and forests. Animals roam freely in their natural habitats. The ocean waves crash against sandy beaches. Stars twinkle brightly in the night sky. Rain falls softly on green grass and leaves.",
    easy_family: "My family loves to cook together. We make delicious food in our kitchen. Mom teaches us new recipes. Dad helps with the dishes. My sister sets the table nicely. My brother washes the vegetables. We all work as a team. Cooking brings our family closer together. We share stories while we prepare meals. The kitchen smells wonderful with fresh ingredients. Everyone has a special job to do.",
    easy_animals: "Cats and dogs are popular pets. They bring joy to many families. Some people prefer fish or birds. All animals need love and care. Horses run fast across open fields. Elephants are gentle giants of the jungle. Lions hunt together in groups called prides. Dolphins swim gracefully through ocean waters. Butterflies flutter from flower to flower. Penguins waddle on ice and snow.",
    
    // Medium texts - moderate vocabulary, varied sentence structure
    medium_technology: "The implementation of word chunking has revolutionized how we process text. This technique groups words together, allowing readers to process multiple words in a single fixation. Modern reading applications utilize advanced algorithms to optimize reading speed and comprehension. Digital devices have transformed the way we consume written content. Smartphones and tablets provide convenient access to vast libraries of information. Artificial intelligence continues to enhance our reading experiences through personalized recommendations and adaptive learning systems.",
    medium_education: "Learning new skills requires dedication and practice. Students must develop effective study habits to succeed academically. Regular review helps reinforce important concepts and improve retention. Teachers play a crucial role in guiding students through their educational journey. Different learning styles require various teaching approaches and methodologies. Technology integration in classrooms enhances engagement and facilitates interactive learning experiences. Continuous education throughout life promotes personal growth and professional development.",
    medium_health: "Regular exercise and proper nutrition are essential for maintaining good health. Physical activity strengthens muscles and improves cardiovascular function. A balanced diet provides necessary nutrients for optimal body performance. Mental health awareness has become increasingly important in modern society. Stress management techniques help individuals cope with daily challenges. Preventive healthcare measures can significantly reduce the risk of chronic diseases. Quality sleep contributes to overall well-being and cognitive function.",
    medium_travel: "Exploring new places broadens our perspective and creates lasting memories. Different cultures offer unique experiences and valuable insights into human diversity. Travel planning requires careful consideration of logistics and cultural sensitivities. Local cuisine provides authentic tastes of regional traditions and culinary heritage. Historical sites connect us with the past and help us understand our shared human story. Sustainable tourism practices ensure that destinations remain preserved for future generations.",
    
    // Hard texts - complex vocabulary, sophisticated concepts
    hard_science: "The cognitive neuroscience of reading comprehension involves complex neural networks that process visual information, decode linguistic patterns, and integrate semantic meaning. This sophisticated system enables humans to transform abstract symbols into meaningful concepts. Neuroplasticity allows the brain to adapt and reorganize neural pathways based on reading experience and practice. Functional magnetic resonance imaging reveals distinct brain regions activated during different reading tasks. The interaction between working memory and long-term memory systems facilitates comprehension and knowledge retention. Advanced computational models simulate reading processes to better understand cognitive mechanisms.",
    hard_philosophy: "The epistemological foundations of human knowledge encompass both empirical observation and rational deduction. Philosophers throughout history have grappled with the fundamental questions of existence, consciousness, and the nature of reality. Metaphysical inquiries explore the relationship between mind and matter, challenging our understanding of subjective experience. Ethical frameworks provide systematic approaches to moral reasoning and decision-making processes. Existential philosophy examines the individual's search for meaning in an apparently indifferent universe. Phenomenological methods investigate the structures of consciousness and lived experience.",
    hard_economics: "Macroeconomic policy formulation requires careful analysis of multiple interdependent variables including inflation rates, employment levels, and gross domestic product growth. Central banks must balance competing objectives while maintaining financial stability and promoting sustainable economic development. Fiscal policy instruments influence aggregate demand through government spending and taxation mechanisms. Monetary policy tools affect money supply and interest rates to achieve price stability and full employment. International trade dynamics create complex interdependencies between national economies and global markets. Economic forecasting models incorporate statistical analysis and behavioral economics principles.",
    hard_literature: "The postmodern literary movement challenges traditional narrative structures and questions the reliability of objective truth. Authors employ innovative techniques such as stream-of-consciousness narration and non-linear storytelling to explore complex themes. Intertextuality creates layered meanings through references to other literary works and cultural artifacts. Deconstructionist approaches reveal the inherent contradictions and ambiguities within seemingly coherent texts. Feminist literary criticism examines gender representation and power dynamics in narrative construction. Postcolonial literature addresses issues of identity, cultural hybridity, and historical trauma."
  };

  const getTextOptions = () => {
    const options = [
      { value: 'random', label: 'Random Text' },
      { value: 'easy_basic', label: 'Basic Reading' },
      { value: 'easy_nature', label: 'Nature' },
      { value: 'easy_family', label: 'Family Life' },
      { value: 'easy_animals', label: 'Animals' },
      { value: 'medium_technology', label: 'Technology' },
      { value: 'medium_education', label: 'Education' },
      { value: 'medium_health', label: 'Health & Fitness' },
      { value: 'medium_travel', label: 'Travel' },
      { value: 'hard_science', label: 'Science' },
      { value: 'hard_philosophy', label: 'Philosophy' },
      { value: 'hard_economics', label: 'Economics' },
      { value: 'hard_literature', label: 'Literature' },
    ];
    return options;
  };

  const getCurrentText = () => {
    if (selectedText === 'random') {
      const textKeys = Object.keys(sampleTexts);
      const randomKey = textKeys[Math.floor(Math.random() * textKeys.length)];
      return sampleTexts[randomKey as keyof typeof sampleTexts];
    }
    return sampleTexts[selectedText as keyof typeof sampleTexts] || sampleTexts.easy_basic;
  };

  const handleComplete = () => {
    setIsReading(false);
    // Navigate to Word Recall game with the passage words
    navigation.navigate('WordRecall', {
      passageWords: getCurrentText().split(/\s+/),
    });
  };

  const handleWordPress = (word: string, event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setSelectedWord({ word, position: { x: pageX, y: pageY } });
  };

  const handleCloseLookup = () => {
    setSelectedWord(null);
  };

  const handleTextChange = (value: string) => {
    setSelectedText(value);
    setShowTextMenu(false);
  };

  if (isReading) {
    return (
      <WordChunker
        text={getCurrentText()}
        wpm={wpm}
        chunkSize={chunkSize}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Word Chunking
        </Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Reading Speed: {wpm} WPM
          </Text>
          <Slider
            value={wpm}
            onValueChange={setWpm}
            minimumValue={100}
            maximumValue={1000}
            step={10}
            style={styles.slider}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Words per Chunk: {chunkSize}
          </Text>
          <Slider
            value={chunkSize}
            onValueChange={setChunkSize}
            minimumValue={1}
            maximumValue={7}
            step={1}
            style={styles.slider}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Text Difficulty
          </Text>
          <SegmentedButtons
            value={difficulty}
            onValueChange={value => setDifficulty(value as 'easy' | 'medium' | 'hard')}
            buttons={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Select Text
          </Text>
          <Menu
            visible={showTextMenu}
            onDismiss={() => setShowTextMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowTextMenu(true)}
                style={styles.textSelector}
              >
                {selectedText === 'random' ? 'Random Text' : getTextOptions().find(opt => opt.value === selectedText)?.label || 'Select Text'}
              </Button>
            }
          >
            {getTextOptions().map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => handleTextChange(option.value)}
                title={option.label}
                leadingIcon={selectedText === option.value ? 'check' : undefined}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.preview}>
          <Text style={[styles.previewText, { color: theme.colors.onSurface }]}>
            {getCurrentText()}
          </Text>
          <Text style={[styles.wordCount, { color: theme.colors.onSurfaceVariant }]}>
            {getCurrentText().split(/\s+/).length} words
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setIsReading(true)}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            Start Reading
          </Button>
        </View>
      </ScrollView>

      {selectedWord && (
        <VocabularyLookup
          word={selectedWord.word}
          position={selectedWord.position}
          onClose={handleCloseLookup}
          source="Word Chunking"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60, // Extra padding for scroll content
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  textSelector: {
    marginTop: 8,
  },
  preview: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    minHeight: 120, // Minimum height for preview
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  wordCount: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    minWidth: 200,
  },
  readingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  word: {
    fontSize: 16,
    marginRight: 8,
  },
});

export default WordChunkingScreen; 