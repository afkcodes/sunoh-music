import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { useArtworkTheme } from '../../hooks/useArtworkTheme';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import { usePlayer } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Pause, Play, SkipNext, SkipPrevious } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.colors.bgSurface,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 10,
  },
  gradientContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    ...StyleSheet.absoluteFillObject,
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
    gap: s.mScale(16),
  },
  playButton: {
    width: s.mScale(44),
    height: s.mScale(44),
    borderRadius: s.mScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    fontWeight: '500',
  },
}));

export const MiniPlayer = memo(({ onPress }: { onPress?: () => void }) => {
  const { colors, scale: s } = useTheme();
  const theme = { colors, scale: s } as AppTheme;
  const styles = useScalingStyles(createStyles, theme);
  const { currentTrack, isPlaying, togglePlayPause, next, previous } = usePlayer();
  const insets = useSafeAreaInsets();
  const { playerTheme, gradientColors } = useArtworkTheme(currentTrack?.artwork);
  const { position, duration } = useTrackProgress();

  const progress = duration > 0 ? position / duration : 0;
  const miniPlayerBottomOffset = 80 + insets.bottom;

  // Animated progress overlay that reveals from right to left
  const progressBarStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      right: `${100 - progress * 100}%`,
    };
  }, [progress]);

  const handlePlayPause = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    togglePlayPause();
  }, [togglePlayPause]);

  const handleNext = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    next();
  }, [next]);

  const handlePrevious = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    previous();
  }, [previous]);

  const titleStyle = useMemo(
    () => [styles.title, { color: playerTheme?.onSurface ?? colors.textPrimary }],
    [styles.title, playerTheme?.onSurface, colors.textPrimary],
  );
  const subtitleStyle = useMemo(
    () => [styles.subtitle, { color: playerTheme?.onSurfaceVariant ?? colors.textSecondary }],
    [styles.subtitle, playerTheme?.onSurfaceVariant, colors.textSecondary],
  );
  const playBtnStyle = useMemo(
    () => [styles.playButton, playerTheme && { backgroundColor: playerTheme.primaryContainer }],
    [styles.playButton, playerTheme],
  );

  // Rich progress overlay gradient with dynamic theming
  const progressGradient = useMemo(() => {
    const primary = playerTheme?.primary ?? colors.primaryBase;
    const primaryRgb = primary.startsWith('#')
      ? primary.match(/\w\w/g)?.map(x => parseInt(x, 16))
      : [99, 102, 241]; // fallback to indigo

    const r = primaryRgb?.[0] ?? 99;
    const g = primaryRgb?.[1] ?? 102;
    const b = primaryRgb?.[2] ?? 241;

    return [
      `rgba(${r}, ${g}, ${b}, 0.08)`,     // Soft start
      `rgba(${r}, ${g}, ${b}, 0.12)`,     // Build up
      `rgba(255, 255, 255, 0.15)`,        // White shimmer peak
      `rgba(${r}, ${g}, ${b}, 0.18)`,     // Accent color
      `rgba(255, 255, 255, 0.12)`,        // White accent
      `rgba(${r}, ${g}, ${b}, 0.1)`,      // Fade out
    ];
  }, [playerTheme?.primary, colors.primaryBase]);

  if (!currentTrack) return null;
  return (
    <View style={[styles.container, { bottom: miniPlayerBottomOffset }]}>
      <Pressable onPress={() => {
        console.log('[MiniPlayer] Pressed');
        onPress?.();
      }}>
        <View style={styles.gradientContainer}>
          {/* Base gradient background with content */}
          <LinearGradient
            colors={gradientColors}
            style={styles.innerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {currentTrack.artwork ? (
              <TurboImage source={{ uri: currentTrack.artwork }} style={styles.artwork} />
            ) : (
              <View style={styles.artwork} />
            )}

            <View style={styles.infoContainer}>
              <Text variant="body" numberOfLines={1} style={titleStyle}>
                {currentTrack.title}
              </Text>
              <Text variant="caption" numberOfLines={1} style={subtitleStyle}>
                {currentTrack.artist}
              </Text>
            </View>

            <View style={styles.controls}>
              <Pressable onPress={handlePrevious}>
                <SkipPrevious size={28} color={playerTheme?.onSurface ?? colors.textPrimary} />
              </Pressable>

              <Pressable style={playBtnStyle} onPress={handlePlayPause}>
                {isPlaying ? (
                  <Pause size={28} color={playerTheme?.onPrimaryContainer ?? colors.textPrimary} />
                ) : (
                  <Play size={28} color={playerTheme?.onPrimaryContainer ?? colors.textPrimary} />
                )}
              </Pressable>

              <Pressable onPress={handleNext}>
                <SkipNext size={28} color={playerTheme?.onSurface ?? colors.textPrimary} />
              </Pressable>
            </View>
          </LinearGradient>

          {/* Progress bar overlay */}
          <AnimatedLinearGradient
            colors={progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, progressBarStyle]}
            pointerEvents="none"
          />
        </View>
      </Pressable>
    </View>
  );
});

MiniPlayer.displayName = 'MiniPlayer';
