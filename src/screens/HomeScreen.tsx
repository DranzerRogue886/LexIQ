import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

type RootStackParamList = {
  Home: undefined;
  RSVP: undefined;
  GuidedPacing: undefined;
  WordChunking: undefined;
  Profile: undefined;
  VocabularyDeck: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const FancyTitle = () => {
  const theme = useTheme();
  return (
    <View style={styles.titleContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.appTitle}>LexIQ</Text>
      </LinearGradient>
      <Text style={[styles.tagline, { color: theme.colors.onSurface }]}>
        Elevate Your Reading
      </Text>
    </View>
  );
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const readingTechniques = [
    {
      title: 'RSVP Reader',
      description: 'Rapid Serial Visual Presentation eliminates subvocalization by presenting words one at a time.',
      screen: 'RSVP',
    },
    {
      title: 'Guided Pacing',
      description: 'Reduce inefficient eye movement with a guided visual cue that moves through the text.',
      screen: 'GuidedPacing',
    },
    {
      title: 'Word Chunking',
      description: 'Expand your visual span by reading multiple words per eye fixation.',
      screen: 'WordChunking',
    },
  ];

  const renderFeatureCard = (
    title: string,
    description: string,
    icon: string,
    onPress: () => void,
    color: string
  ) => (
    <TouchableOpacity
      style={[styles.featureCard, { backgroundColor: color }]}
      onPress={onPress}
    >
      <IconButton icon={icon} size={32} iconColor="white" />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FancyTitle />
      
      <Title style={[styles.welcome, { color: theme.colors.primary }]}>
        Welcome, {user?.username}!
      </Title>

      <View style={styles.cardsContainer}>
        {readingTechniques.map((technique, index) => (
          <Card
            key={index}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate(technique.screen as keyof RootStackParamList)}
          >
            <Card.Content>
              <Title style={{ color: theme.colors.primary }}>{technique.title}</Title>
              <Paragraph style={{ color: theme.colors.onSurface }}>
                {technique.description}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate(technique.screen as keyof RootStackParamList)}
                style={{ backgroundColor: theme.colors.primary }}
              >
                Start Reading
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      <View style={styles.featuresGrid}>
        {renderFeatureCard(
          'RSVP Reading',
          'Speed reading with rapid serial visual presentation',
          'lightning-bolt',
          () => navigation.navigate('RSVP'),
          theme.colors.primary
        )}
        {renderFeatureCard(
          'Guided Pacing',
          'Follow a moving guide to maintain reading pace',
          'cursor-move',
          () => navigation.navigate('GuidedPacing'),
          theme.colors.secondary
        )}
        {renderFeatureCard(
          'Word Chunking',
          'Read text in meaningful word groups',
          'text-box-multiple',
          () => navigation.navigate('WordChunking'),
          theme.colors.tertiary
        )}
        {renderFeatureCard(
          'Vocabulary Deck',
          'Review and practice saved vocabulary',
          'book-open-variant',
          () => navigation.navigate('VocabularyDeck'),
          theme.colors.primary
        )}
      </View>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Profile')}
        style={styles.profileButton}
      >
        View Profile & Progress
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: isSmallDevice ? 12 : 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: isTablet ? 48 : isSmallDevice ? 32 : 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: isSmallDevice ? 14 : 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  welcome: {
    fontSize: isSmallDevice ? 20 : 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: isTablet ? 600 : undefined,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    width: '100%',
  },
  profileButton: {
    marginTop: 16,
    marginBottom: 32,
    alignSelf: 'center',
    width: isTablet ? 400 : '80%',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureCard: {
    width: '45%',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen; 