import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Button, useTheme, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
// import AnimatedGradientBackground from '../components/AnimatedGradientBackground';

type RootStackParamList = {
  Home: undefined;
  RSVP: undefined;
  GuidedPacing: undefined;
  WordChunking: undefined;
  Profile: undefined;
  VocabularyDeck: undefined;
  WPMTest: undefined;
  Phonics: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const FancyTitle = React.memo(() => {
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
});

const FeatureCard = React.memo(({ 
  title, 
  description, 
  icon, 
  onPress, 
  color 
}: { 
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color: string;
}) => (
  <TouchableOpacity
    style={[styles.featureCard, { backgroundColor: color }]}
    onPress={onPress}
  >
    <IconButton icon={icon} size={32} iconColor="white" />
    <Text style={[styles.featureTitle, { color: 'white' }]}>{title}</Text>
    <Text style={[styles.featureDescription, { color: 'white' }]}>{description}</Text>
  </TouchableOpacity>
));

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const navigateTo = useCallback((screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  }, [navigation]);

  const features = useMemo(() => [
    {
      title: 'WPM Test',
      description: 'Measure your reading speed and comprehension',
      icon: 'speedometer',
      screen: 'WPMTest' as const,
      color: theme.colors.error,
    },
    {
      title: 'RSVP Reading',
      description: 'Speed reading with rapid serial visual presentation',
      icon: 'lightning-bolt',
      screen: 'RSVP' as const,
      color: theme.colors.primary,
    },
    {
      title: 'Guided Pacing',
      description: 'Follow a moving guide to maintain reading pace',
      icon: 'cursor-move',
      screen: 'GuidedPacing' as const,
      color: theme.colors.secondary,
    },
    {
      title: 'Word Chunking',
      description: 'Read text in meaningful word groups',
      icon: 'text-box-multiple',
      screen: 'WordChunking' as const,
      color: theme.colors.tertiary,
    },
    {
      title: 'Vocabulary Deck',
      description: 'Review and practice saved vocabulary',
      icon: 'book-open-variant',
      screen: 'VocabularyDeck' as const,
      color: theme.colors.primary,
    },
    {
      title: 'Phonics',
      description: 'Master sound-letter relationships and pronunciation',
      icon: 'music-note',
      screen: 'Phonics' as const,
      color: theme.colors.error,
    },
  ], [theme.colors]);

  const welcomeText = useMemo(() => (
    <Text style={[styles.welcome, { color: theme.colors.primary }]}>
      Welcome, {user?.username}!
    </Text>
  ), [theme.colors.primary, user?.username]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {/* <AnimatedGradientBackground /> */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FancyTitle />
        {welcomeText}

        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.screen}
              {...feature}
              onPress={() => navigateTo(feature.screen)}
            />
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={() => navigateTo('Profile')}
          style={styles.profileButton}
        >
          View Profile & Progress
        </Button>
      </ScrollView>
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
    fontWeight: 'bold',
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
    gap: 12,
  },
  featureCard: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
});

export default React.memo(HomeScreen); 