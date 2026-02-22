import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import { ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const createStyles = makeScalingStyles((_s, _colors: ThemeColors) => ({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
}));

export const ActiveSongProgress: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { position, duration } = useTrackProgress();

  const progress = duration > 0 ? position / duration : 0;

  // Animating 'right' property to reveal the gradient from left to right
  // When progress is 0, right is 100% (hidden)
  // When progress is 1, right is 0% (fully visible)
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      right: `${100 - progress * 100}%`,
    };
  }, [progress]);

  const gradientColors = useMemo(() => {
    // Subtle gradient using text/surface colors instead of primary
    // Using a neutral white/light color for the progress feels more subtle against the dark background
    // or adapting to theme but keeping it monochrome/low saturation.

    // We'll use a very subtle white/gray overlay
    return [
      'rgba(255, 255, 255, 0.03)',
      'rgba(255, 255, 255, 0.02)',
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0.08)',
      'rgba(255, 255, 255, 0.1)',
    ];
  }, []);

  return (
    <AnimatedLinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, animatedStyle]}
      pointerEvents="none"
    />
  );
};
