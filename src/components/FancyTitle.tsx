import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

interface FancyTitleProps {
  showTagline?: boolean;
}

export const FancyTitle: React.FC<FancyTitleProps> = ({ showTagline = true }) => {
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
      {showTagline && (
        <Text style={[styles.tagline, { color: theme.colors.onSurface }]}>
          Elevate Your Reading
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
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
}); 