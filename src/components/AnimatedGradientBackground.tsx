import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedGradientBackground: React.FC = () => {
  const translateX = useSharedValue(-width * 0.25);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width * 0.25, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-width * 0.25, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.gradientContainer, animatedStyle]}>
        <LinearGradient
          colors={['#6c3', '#09f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
      <Animated.View 
        style={[
          styles.gradientContainer, 
          animatedStyle, 
          { animationDuration: 4000 }
        ]}
      >
        <LinearGradient
          colors={['#09f', '#6c3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
      <Animated.View 
        style={[
          styles.gradientContainer, 
          animatedStyle, 
          { animationDuration: 5000 }
        ]}
      >
        <LinearGradient
          colors={['#6c3', '#09f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    left: -width,
    right: -width,
    top: 0,
    bottom: 0,
    opacity: 0.5,
  },
  gradient: {
    flex: 1,
  },
});

export default AnimatedGradientBackground; 