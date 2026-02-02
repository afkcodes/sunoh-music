import React, { memo } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import SquircleView from 'react-native-fast-squircle';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import TurboImage from 'react-native-turbo-image';

import { borderRadius, springs, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { MusicNote } from './SolarIcons.generated';
import { Text } from './Text';

interface MediaCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  size?: number;
  variant?: 'default' | 'circle';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    width: s.mScale(140), // Default width
    gap: s.mScale(8),
  },
  imageContainer: {
    width: '100%',
    // aspectRatio: 1, // Removed to prevent potential layout oscillation with explicit height
    backgroundColor: colors.bgSurfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s.mScale(borderRadius.lg),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    gap: s.mScale(2),
  },
}));

export const MediaCard: React.FC<MediaCardProps> = memo(({
  title,
  subtitle,
  imageUrl,
  size = 140, 
  variant = 'default',
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springs.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const isCircle = variant === 'circle';

  return (
    <Animated.View style={[styles.container, style, { width: size }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <Animated.View style={[animatedStyle]}>
            {/* Artwork */}
            {/* Artwork Wrapper to enforce layout reservation */}
            <View style={{ width: size, height: size }}>
                <SquircleView 
                    style={[
                        styles.imageContainer, 
                        { 
                            backgroundColor: colors.bgSurfaceHover, 
                            flex: 1, // Fill the wrapper
                            width: '100%', 
                            height: '100%',
                        },
                        isCircle ? { borderRadius: 9999 } : {}
                    ]} 
                    cornerSmoothing={isCircle ? 0 : 1}
                >
                {imageUrl ? (
                    <TurboImage
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <MusicNote size={32} color={colors.textSecondary} />
                )}
                </SquircleView>
            </View>

            {/* Meta */}
            <View style={[
                styles.textContainer, 
                { 
                    marginTop: 12,
                    alignItems: isCircle ? 'center' : 'flex-start' 
                }
            ]}>
                <Text 
                    variant="body" 
                    style={{ fontWeight: '600', textAlign: isCircle ? 'center' : 'left' }} 
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text 
                        variant="caption" 
                        color="secondary" 
                        style={{ textAlign: isCircle ? 'center' : 'left' }}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

MediaCard.displayName = 'MediaCard';
