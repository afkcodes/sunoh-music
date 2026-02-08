import React from 'react';
import { Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { useArtworkTheme } from '../../hooks/useArtworkTheme';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Pause, Play, SkipNext } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

// Dummy progress bar for visual -> Real progress bar
const ProgressBar = ({ progress = 0, color }: { progress?: number, color: string }) => (
  <View style={{ height: 2, backgroundColor: color + '30', width: '100%', position: 'absolute', top: 0 }}>
    <View style={{ height: '100%', backgroundColor: color, width: `${progress * 100}%` }} />
  </View>
);

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.colors.bgSurface,
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s.mScale(8),
    paddingRight: s.mScale(16),
  },
  artwork: {
    width: s.mScale(52),
    height: s.mScale(52),
    borderRadius: s.mScale(8),
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
    width: s.mScale(44),
    height: s.mScale(44),
    borderRadius: s.mScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

export const MiniPlayer = ({ onPress }: { onPress?: () => void }) => {
  const { colors, scale: s } = useTheme();
  const theme = { colors, scale: s } as AppTheme;
  const styles = useScalingStyles(createStyles, theme);
  const { currentTrack, isPlaying, togglePlayPause, next } = usePlayerStore();
  const insets = useSafeAreaInsets();
  const { playerTheme, gradientColors } = useArtworkTheme(currentTrack?.artwork);
  const { position, duration } = useTrackProgress();

  const progress = duration > 0 ? position / duration : 0;

  // Total distance from screen bottom = Tab Bar + System Insets
  const miniPlayerBottomOffset = 80 + insets.bottom

  if (!currentTrack) return null;
  return (
    <View style={[styles.container, { bottom: miniPlayerBottomOffset }]}>
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={gradientColors}
          style={styles.innerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ProgressBar color={playerTheme?.primary || colors.primaryBase} progress={progress} />

          {/* Artwork */}
          {currentTrack.artwork ? (
            <TurboImage source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          ) : (
            <View style={styles.artwork} />
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text variant="body" numberOfLines={1} style={{ fontWeight: '700', color: playerTheme?.onSurface || colors.textPrimary, fontSize: 16 }}>
              {currentTrack.title}
            </Text>
            <Text variant="caption" numberOfLines={1} style={{ color: playerTheme?.onSurfaceVariant || colors.textSecondary, fontWeight: '500' }}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Play/Pause */}
            <Pressable
              style={[
                styles.playButton,
                playerTheme && { backgroundColor: playerTheme.primaryContainer }
              ]}
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isPlaying ? (
                <Pause size={28} color={playerTheme?.onPrimaryContainer || colors.textPrimary} />
              ) : (
                <Play size={28} color={playerTheme?.onPrimaryContainer || colors.textPrimary} />
              )}
            </Pressable>

            {/* Next */}
            <Pressable onPress={(e) => {
              e.stopPropagation();
              next();
            }}>
              <SkipNext size={28} color={playerTheme?.onSurface || colors.textPrimary} />
            </Pressable>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};
