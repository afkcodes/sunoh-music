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
import { useLibraryStore } from '../../store/useLibraryStore';
import { useMenuStore } from '../../store/useMenuStore';
import { springs, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Song } from '../../types/album';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { PlayingIndicator } from '../common/PlayingIndicator';
import { Heart, HeartFill, MenuDots } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';
import { ActiveSongProgress } from './ActiveSongProgress';

interface SongListItemProps {
  song: Song;
  index: number;
  isPlaying?: boolean; // This means "is this the active track"
  isActive?: boolean; // This means "is audio playing"
  onPress: () => void;
}

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(12),
    paddingHorizontal: s.mScale(16),
    gap: s.mScale(12),
    position: 'relative',
    overflow: 'hidden', // Ensure progress bar stays within bounds
  },
  indexContainer: {
    width: s.mScale(32),
    height: s.mScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // playIcon style removed 
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
  },
  actionButton: {
    width: s.mScale(36),
    height: s.mScale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const SongListItem: React.FC<SongListItemProps> = memo(({
  song,
  index,
  isPlaying = false,
  isActive = false,
  onPress
}) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const scale = useSharedValue(1);
  const { toggleLikeSong, isLiked } = useLibraryStore();
  const { showSongMenu } = useMenuStore();

  const liked = isLiked(song.id, 'song');

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

  const onHeartPress = (e: any) => {
    e.stopPropagation();
    toggleLikeSong({
      id: song.id,
      type: 'song',
      title: song.title,
      image: song.image?.[song.image.length - 1]?.link || '',
      subtitle: song.subtitle || song.artists?.map(a => a.name).join(', '),
      timestamp: Date.now(),
      duration: parseInt(song.duration || '0', 10),
      provider: (song as any).provider || song.source || 'saavn',
      fullData: song
    });
  };

  const onMenuPress = (e: any) => {
    e.stopPropagation();
    showSongMenu(song);
  };

  // Format duration from seconds to mm:ss
  const formatDuration = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '--:--';
    const secs = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(secs)) return '--:--';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
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
        {isPlaying && <ActiveSongProgress />}

        {/* Track Number / Play Icon */}
        <View style={styles.indexContainer}>
          {isPlaying ? (
            <PlayingIndicator isPlaying={isActive} />
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

        {/* Actions */}
        <View style={styles.actions}>
          {/* Duration */}
          <Text variant="caption" color="tertiary" style={{ marginRight: 4 }}>
            {formatDuration(song.duration)}
          </Text>

          <Pressable style={styles.actionButton} onPress={onHeartPress}>
            {liked ? (
              <HeartFill size={20} color={colors.primaryBase} />
            ) : (
              <Heart size={20} color={colors.textTertiary} />
            )}
          </Pressable>

          <Pressable style={styles.actionButton} onPress={onMenuPress}>
            <MenuDots size={20} color={colors.textTertiary} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
});

SongListItem.displayName = 'SongListItem';
