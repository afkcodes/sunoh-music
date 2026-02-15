import { Slider } from '@react-native-assets/slider';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TurboImage from 'react-native-turbo-image';
import { useArtworkTheme } from '../../hooks/useArtworkTheme';
import { usePlayer } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { SafeView } from '../common';
import { Sheet, SheetRef } from '../common/Sheet';
import { Heart, HeartFill, ListMusic, Pause, Play, Repeat, Shuffle, SkipNext, SkipPrevious, Tuning } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

import { AudioProRepeatMode } from 'react-native-audio-pro';
import { formatTime, useTrackProgress } from '../../hooks/useTrackProgress';
import { useLibraryStore } from '../../store/useLibraryStore';
import { fontNames } from '../../theme/tokens';
import { EqualizerSheet } from './EqualizerSheet';
import { QueueSheet } from './QueueSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export { EqualizerSheet, QueueSheet };

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.bgSurface,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: s.mScale(20),
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: fontNames.bold,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: s.mScale(14),
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    marginTop: s.vScale(16),
    marginBottom: s.mScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
    backgroundColor: '#000',
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: s.mScale(20),
  },
  titleContainer: {
    flex: 1,
    paddingRight: s.mScale(16),
  },
  heartButton: {
    width: s.mScale(44),
    height: s.mScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: s.mScale(28),
  },
  progressBar: {
    width: '100%',
    height: s.mScale(20),
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: s.mScale(8),
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s.mScale(32),
  },
  playButton: {
    width: s.mScale(76),
    height: s.mScale(76),
    borderRadius: s.mScale(38),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  controlButton: {
    width: s.mScale(48),
    height: s.mScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControlButton: {
    width: s.mScale(44),
    height: s.mScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: s.mScale(48),
    height: s.mScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Pre-computed text styles (no more inline objects)
  trackTitle: {
    fontFamily: fontNames.bold,
    fontSize: s.mScale(28),
    marginBottom: s.mScale(6),
    letterSpacing: -0.5,
  },
  trackArtist: {
    fontFamily: fontNames.medium,
    fontSize: s.mScale(18),
  },
  timeText: {
    fontFamily: fontNames.medium,
    fontSize: s.mScale(13),
  },
}));

interface PlayerSheetProps {
  onOpenQueue?: () => void;
  onOpenEqualizer?: () => void;
}

export const PlayerSheet = forwardRef<SheetRef, PlayerSheetProps>(({ onOpenQueue, onOpenEqualizer }, ref) => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    seekTo,
    repeatMode,
    shuffleMode,
    setRepeatMode,
    setShuffleMode,
  } = usePlayer();
  const { toggleLikeSong, isLiked } = useLibraryStore();
  const { playerTheme, gradientColors } = useArtworkTheme(currentTrack?.artwork);
  const { position, duration } = useTrackProgress();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [isSheetGestureEnabled, setIsSheetGestureEnabled] = useState(true);

  // Pure state machine: either dragging (use seekPosition) or idle (use position)
  const displayPosition = isSeeking ? seekPosition : position;

  const handleSlidingStart = useCallback(() => {
    setIsSeeking(true);
    setSeekPosition(position);
    setIsSheetGestureEnabled(false);
  }, [position]);

  const handleValueChange = useCallback((value: number) => {
    setSeekPosition(value);
  }, []);

  const handleSlidingComplete = useCallback((value: number) => {
    setIsSeeking(false);
    setIsSheetGestureEnabled(true);
    seekTo(value);
  }, [seekTo]);

  const toggleRepeat = useCallback(() => {
    if (repeatMode === AudioProRepeatMode.OFF) setRepeatMode(AudioProRepeatMode.ALL);
    else if (repeatMode === AudioProRepeatMode.ALL) setRepeatMode(AudioProRepeatMode.ONE);
    else setRepeatMode(AudioProRepeatMode.OFF);
  }, [repeatMode, setRepeatMode]);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(!shuffleMode);
  }, [shuffleMode, setShuffleMode]);

  // Memoised dynamic styles that depend on playerTheme
  const titleStyle = useMemo(
    () => [styles.trackTitle, { color: playerTheme?.onSurface ?? '#FFF' }],
    [styles.trackTitle, playerTheme?.onSurface],
  );
  const artistStyle = useMemo(
    () => [styles.trackArtist, { color: playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.65)' }],
    [styles.trackArtist, playerTheme?.onSurfaceVariant],
  );
  const timeStyle = useMemo(
    () => [styles.timeText, { color: playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.5)' }],
    [styles.timeText, playerTheme?.onSurfaceVariant],
  );
  const playBtnStyle = useMemo(
    () => [styles.playButton, playerTheme && { backgroundColor: playerTheme.primaryContainer }],
    [styles.playButton, playerTheme],
  );

  if (!currentTrack) return null;

  return (
    <Sheet
      ref={ref}
      sizes={[1]}
      cornerRadius={theme.borderRadius.lg}
      grabber={false}
      dismissible={isSheetGestureEnabled}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[...gradientColors, theme.colors.bgPage]}
          style={styles.gradient}
        >
          <SafeView backgroundColor="transparent">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText} variant="h1">NOW PLAYING</Text>
            </View>

            {/* Artwork */}
            <View style={styles.artworkContainer}>
              <TurboImage source={{ uri: currentTrack.artwork }} style={styles.artwork} />
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <View style={styles.titleContainer}>
                <Text variant="h2" numberOfLines={1} style={titleStyle}>
                  {currentTrack.title}
                </Text>
                <Text variant="body" numberOfLines={1} style={artistStyle}>
                  {currentTrack.artist}
                </Text>
              </View>
              <Pressable
                style={styles.heartButton}
                onPress={() => {
                  toggleLikeSong({
                    id: currentTrack.id,
                    type: 'song',
                    title: currentTrack.title,
                    image: currentTrack.artwork,
                    subtitle: currentTrack.artist,
                    timestamp: Date.now(),
                    duration: duration / 1000,
                    fullData: (currentTrack as any).fullData,
                    provider: (currentTrack as any).provider,
                  });
                }}
              >
                {isLiked(currentTrack.id, 'song') ? (
                  <HeartFill size={26} color={playerTheme?.primary ?? '#FFF'} />
                ) : (
                  <Heart size={26} color={playerTheme?.primary ?? 'rgba(255, 255, 255, 0.8)'} />
                )}
              </Pressable>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer} >
              <Slider
                style={styles.progressBar}
                value={displayPosition}
                minimumValue={0}
                maximumValue={duration || 1}
                minimumTrackTintColor={playerTheme?.primary ?? '#FFF'}
                maximumTrackTintColor={playerTheme?.surfaceVariant ?? 'rgba(255, 255, 255, 0.15)'}
                thumbTintColor={playerTheme?.primary ?? '#FFF'} trackHeight={5}
                thumbSize={15}
                slideOnTap={true} onSlidingStart={handleSlidingStart}
                onValueChange={handleValueChange}
                onSlidingComplete={handleSlidingComplete}
              />


              <View style={styles.timeRow}>
                <Text variant="caption" style={timeStyle}>
                  {formatTime(displayPosition)}
                </Text>
                <Text variant="caption" style={timeStyle}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <Pressable style={styles.secondaryControlButton} onPress={toggleShuffle}>
                <Shuffle size={22} color={shuffleMode ? (playerTheme?.primary ?? '#FFF') : (playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.75)')} />
              </Pressable>

              <Pressable style={styles.controlButton} onPress={previous}>
                <SkipPrevious size={38} color={playerTheme?.onSurface ?? '#FFF'} />
              </Pressable>

              <Pressable style={playBtnStyle} onPress={togglePlayPause}>
                {isPlaying ? (
                  <Pause size={44} color={playerTheme?.onPrimaryContainer ?? '#000'} />
                ) : (
                  <Play size={44} color={playerTheme?.onPrimaryContainer ?? '#000'} />
                )}
              </Pressable>

              <Pressable style={styles.controlButton} onPress={next}>
                <SkipNext size={38} color={playerTheme?.onSurface ?? '#FFF'} />
              </Pressable>

              <Pressable style={styles.secondaryControlButton} onPress={toggleRepeat}>
                <Repeat size={22} color={repeatMode !== AudioProRepeatMode.OFF ? (playerTheme?.primary ?? '#FFF') : (playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.75)')} />
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Pressable
                style={styles.footerButton}
                onPress={onOpenEqualizer}
              >
                <Tuning size={26} color={playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.8)'} />
              </Pressable>

              <Pressable
                style={styles.footerButton}
                onPress={onOpenQueue}
              >
                <ListMusic size={26} color={playerTheme?.onSurfaceVariant ?? 'rgba(255, 255, 255, 0.8)'} />
              </Pressable>
            </View>
          </SafeView>
        </LinearGradient>
      </View>
    </Sheet >
  );
});

PlayerSheet.displayName = 'PlayerSheet';