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
import { useScalingDebug } from '../../utils/debug.scaling';
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

// ✅ FIXED: Remove width from base styles since it's dynamic
const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    // width removed - will be set via prop
    gap: s.mScale(8),
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgSurfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    gap: s.mScale(2),
    marginTop: s.mScale(12), // ✅ FIXED: Scaled instead of hard-coded
  },
}));

export const MediaCard: React.FC<MediaCardProps> = memo(({
  title,
  subtitle,
  imageUrl,
  size = 144,
  variant = 'default',
  onPress,
  style,
}) => {
  const { colors, scale: s } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    if (scale.value === 1) {
      return {};
    }
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springs.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const isCircle = variant === 'circle';

  // ✅ FIXED: Calculate scaled size once
  const scaledSize = s.mScale(size);
  const debug = useScalingDebug('MediaCard');
  const containerRef = React.useRef<View>(null);

  React.useEffect(() => {
    debug('Render', {
      props: {
        title: title.slice(0, 20) + '...',
        size,
        variant,
      },
      computed: {
        scaledSize,
        'imageContainer width': '100%',
        'imageContainer height': '100%',
        'imageWrapper explicit width': s.mScale(size),
        'imageWrapper explicit height': s.mScale(size),
      },
      calculations: {
        'Input size': size,
        'mScale(size)': s.mScale(size),
        'scale(size)': s.scale(size),
        'vScale(size)': s.vScale(size),
        'Difference (mScale - input)': s.mScale(size) - size,
        'Ratio (mScale/input)': (s.mScale(size) / size).toFixed(3),
        'Expected on POCO (~150px)': s.mScale(144),
      },
      styles: {
        'container.gap': styles.container.gap,
        'imageContainer.backgroundColor': styles.imageContainer.backgroundColor,
        'textContainer.gap': styles.textContainer.gap,
        'textContainer.marginTop': styles.textContainer.marginTop,
      },
    });
  }, [size, scaledSize, debug, s, styles, title, variant]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
        console.log('🎯 ACTUAL RENDERED SIZE:', {
          title: title.slice(0, 20),
          expectedWidth: scaledSize,
          actualWidth: width,  // ← This is the rendered width!
          actualHeight: height,
          difference: width - scaledSize,
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [scaledSize, title]);

  return (
    <Animated.View style={[styles.container, { width: scaledSize }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <Animated.View style={[animatedStyle]}>
          {/* Artwork Wrapper */}
          <View style={{ width: scaledSize, height: scaledSize }}>
            <SquircleView
              style={[
                styles.imageContainer,
                isCircle ? { borderRadius: 9999 } : { borderRadius: s.mScale(borderRadius.lg) }
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
                <MusicNote size={s.mScale(32)} color={colors.textSecondary} />
              )}
            </SquircleView>
          </View>

          {/* Meta */}
          <View style={[
            styles.textContainer,
            {
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