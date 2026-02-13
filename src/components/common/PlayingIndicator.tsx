import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: s.mScale(16),
    gap: s.mScale(2),
  },
  bar: {
    width: s.mScale(3),
    backgroundColor: colors.primaryBase,
    borderRadius: s.mScale(1.5),
  },
}));

export const PlayingIndicator: React.FC<{ isPlaying?: boolean }> = ({ isPlaying = true }) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);

  const h1 = useSharedValue(0.3);
  const h2 = useSharedValue(0.6);
  const h3 = useSharedValue(0.4);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimation(h1);
      cancelAnimation(h2);
      cancelAnimation(h3);
      // Optional: Reset to a base height or keep current?
      // Keeping current looks like "paused" equalizer.
      // Or we can animate to a steady state. 
      h1.value = withTiming(0.3, { duration: 200 });
      h2.value = withTiming(0.3, { duration: 200 });
      h3.value = withTiming(0.3, { duration: 200 });
      return;
    }

    const duration = 500;

    // Bar 1 Animation
    h1.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration, easing: Easing.linear }),
        withTiming(0.3, { duration, easing: Easing.linear })
      ),
      -1,
      true
    );

    // Bar 2 Animation (Opposite phase)
    h2.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: duration * 0.8, easing: Easing.linear }),
        withTiming(1.0, { duration: duration * 0.8, easing: Easing.linear })
      ),
      -1,
      true
    );

    // Bar 3 Animation (Offset)
    h3.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: duration * 1.2, easing: Easing.linear }),
        withTiming(0.2, { duration: duration * 1.2, easing: Easing.linear })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(h1);
      cancelAnimation(h2);
      cancelAnimation(h3);
    };
  }, [isPlaying]);

  const style1 = useAnimatedStyle(() => ({ height: `${h1.value * 100}%` }));
  const style2 = useAnimatedStyle(() => ({ height: `${h2.value * 100}%` }));
  const style3 = useAnimatedStyle(() => ({ height: `${h3.value * 100}%` }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, style1]} />
      <Animated.View style={[styles.bar, style2]} />
      <Animated.View style={[styles.bar, style3]} />
    </View>
  );
};
