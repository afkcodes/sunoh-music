import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Pause, Play, SkipNext } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

// Dummy progress bar for visual
const ProgressBar = ({ progress = 0.3, color }: { progress?: number, color: string }) => (
  <View style={{ height: 2, backgroundColor: color + '30', width: '100%', position: 'absolute', top: 0 }}>
    <View style={{ height: '100%', backgroundColor: color, width: `${progress * 100}%` }} />
  </View>
);

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.colors.bgSurface, // Or a specific player background color
    flexDirection: 'row',
    alignItems: 'center',
    padding: s.mScale(6),
    paddingRight: s.mScale(16),
    overflow: 'hidden',
    paddingHorizontal: s.mScale(12)
  },
  artwork: {
    width: s.mScale(48), // Slightly larger
    height: s.mScale(48),
    borderRadius: s.mScale(6),
    backgroundColor: theme.colors.bgSurfaceHover,
  },
  infoContainer: {
    flex: 1,
    marginLeft: s.mScale(12),
    justifyContent: 'center',
    gap: s.mScale(2),
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(20), // More breathing room
  },
  playButton: {
    // Removed background circle for cleaner look, or keep it minimal
    width: s.mScale(32),
    height: s.mScale(32),
    borderRadius: s.mScale(16),
    backgroundColor: 'transparent', // Minimalist
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

export const MiniPlayer = ({ onPress }: { onPress?: () => void }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);
  const { currentTrack, isPlaying, togglePlayPause } = usePlayerStore();
  const insets = useSafeAreaInsets();

  // Total distance from screen bottom = Tab Bar + System Insets
  const miniPlayerBottomOffset = 80 + insets.bottom

  if (!currentTrack) return null;

  return (
    <Pressable style={[styles.container, { bottom: miniPlayerBottomOffset }]} onPress={onPress}>
      <ProgressBar color={colors.primaryBase} />

      {/* Artwork */}
      {currentTrack.artwork ? (
        <TurboImage source={{ uri: currentTrack.artwork }} style={styles.artwork} />
      ) : (
        <View style={styles.artwork} />
      )}

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text variant="body" numberOfLines={1} style={{ fontWeight: '600' }}>
          {currentTrack.title}
        </Text>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Play/Pause */}
        <Pressable
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          {isPlaying ? (
            <Pause size={34} color={colors.textPrimary} />
          ) : (
            <Play size={34} color={colors.textPrimary} />
          )}
        </Pressable>

        {/* Next */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <SkipNext size={28} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
};
