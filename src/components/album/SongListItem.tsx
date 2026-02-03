/**
 * SongListItem Component
 * 
 * A modern, clean song list item with:
 * - Track number indicator
 * - Song metadata (title, artist, duration)
 * - Play state visualization
 * - Smooth press interactions
 */

import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { springs, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Song } from '../../types/album';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { MusicNote } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

interface SongListItemProps {
  song: Song;
  index: number;
  isPlaying?: boolean;
  onPress: () => void;
}

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(12),
    paddingHorizontal: s.mScale(16),
    gap: s.mScale(12),
  },
  indexContainer: {
    width: s.mScale(32),
    height: s.mScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: s.mScale(32),
    height: s.mScale(32),
    borderRadius: s.mScale(16),
    backgroundColor: colors.primaryBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: s.mScale(4),
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(6),
  },
  dot: {
    width: s.mScale(3),
    height: s.mScale(3),
    borderRadius: s.mScale(1.5),
    backgroundColor: colors.textTertiary,
  },
}));

export const SongListItem: React.FC<SongListItemProps> = memo(({
  song,
  index,
  isPlaying = false,
  onPress
}) => {
  const { colors } = useTheme();
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

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: string) => {
    const secs = parseInt(seconds, 10);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {/* Track Number / Play Icon */}
        <View style={styles.indexContainer}>
          {isPlaying ? (
            <View style={styles.playIcon}>
              <MusicNote size={16} color={colors.textInverse} />
            </View>
          ) : (
            <Text variant="body" color="tertiary" style={{ fontWeight: '500' }}>
              {(index + 1).toString().padStart(2, '0')}
            </Text>
          )}
        </View>

        {/* Song Info */}
        <View style={styles.content}>
          <Text
            variant="body"
            color={isPlaying ? 'primary' : 'primary'}
            style={{ fontWeight: isPlaying ? '600' : '500' }}
            numberOfLines={1}
          >
            {decodeHtmlEntities(song.title)}
          </Text>
          <View style={styles.metadata}>
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {decodeHtmlEntities(song.artists?.map(a => a.name).join(', ') || song.subtitle)}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <Text variant="caption" color="tertiary">
          {formatDuration(song.duration)}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

SongListItem.displayName = 'SongListItem';
