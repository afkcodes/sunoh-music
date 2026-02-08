import React, { forwardRef } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TurboImage from 'react-native-turbo-image';
import { useArtworkTheme } from '../../hooks/useArtworkTheme';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { SafeView } from '../common';
import { Sheet, SheetRef } from '../common/Sheet';
import { BillList, Heart, MenuDots, Pause, Play, Repeat, Shuffle, SkipNext, SkipPrevious } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

import { AudioProRepeatMode } from 'react-native-audio-pro';
import { formatTime, useTrackProgress } from '../../hooks/useTrackProgress';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.bgSurface,

  },
  gradient: {
    flex: 1,
    paddingHorizontal: s.mScale(20),
    paddingTop: s.vScale(16),
  },
  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },


  // Artwork
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
  // Info
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
  // Progress
  progressContainer: {
    marginBottom: s.mScale(28),
  },
  progressBarBg: {
    height: s.mScale(5),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: s.mScale(2.5),
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: s.mScale(2.5),
    width: '35%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: s.mScale(8),
  },
  // Controls
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
  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: s.mScale(48),
    height: s.mScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  }
}));

export const PlayerSheet = forwardRef<SheetRef, {}>((_, ref) => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    repeatMode,
    shuffleMode,
    setRepeatMode,
    setShuffleMode,
    // seekTo - implement later
  } = usePlayerStore();
  const { playerTheme, gradientColors } = useArtworkTheme(currentTrack?.artwork);
  const { position, duration } = useTrackProgress();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const toggleRepeat = () => {
    // Cycle: OFF -> ALL -> ONE -> OFF
    if (repeatMode === AudioProRepeatMode.OFF) setRepeatMode(AudioProRepeatMode.ALL);
    else if (repeatMode === AudioProRepeatMode.ALL) setRepeatMode(AudioProRepeatMode.ONE);
    else setRepeatMode(AudioProRepeatMode.OFF);
  };

  return (
    <Sheet
      ref={ref}
      sizes={[1]}
      cornerRadius={theme.borderRadius.lg}
      grabber={false}
    >

      <View style={styles.container}>
        <LinearGradient
          colors={[...gradientColors, theme.colors.bgPage,]}
          style={[styles.gradient]}
        >
          <SafeView backgroundColor='transparent'>
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
                <Text
                  variant="h2"
                  numberOfLines={1}
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: playerTheme?.onSurface || '#FFF',
                    marginBottom: 6,
                    letterSpacing: -0.5
                  }}
                >
                  {currentTrack.title}
                </Text>
                <Text
                  variant="body"
                  numberOfLines={1}
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    color: playerTheme?.onSurfaceVariant || 'rgba(255, 255, 255, 0.65)'
                  }}
                >
                  {currentTrack.artist}
                </Text>
              </View>
              <Pressable style={styles.heartButton}>
                <Heart size={26} color={playerTheme?.primary || "rgba(255, 255, 255, 0.8)"} />
              </Pressable>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <Pressable
                onPressIn={(e) => {
                  const { locationX } = e.nativeEvent;
                  // Placeholder for seek logic
                  console.log(`Seek to position: ${locationX}`);
                  // if (width > 0) seekTo((locationX / width) * duration);
                }}
                onLayout={(e) => {
                  // Placeholder for layout capture
                  console.log(`Progress bar width: ${e.nativeEvent.layout.width}`);
                }}
                style={[styles.progressBarBg, playerTheme && { backgroundColor: playerTheme.surfaceVariant }]}
              >
                <View style={[styles.progressBarFill, playerTheme && { backgroundColor: playerTheme.primary, width: `${progressPercent}%` }]} />
              </Pressable>

              {/* Seeking interaction is tricky with just Views. 
                  Ideally we replace this with @react-native-community/slider or similar.
                  For now we just suppress the unused seekTo warning by using it in a dummy function or leaving it for now.
               */}

              <View style={styles.timeRow}>
                <Text variant="caption" style={{ color: playerTheme?.onSurfaceVariant || 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: '500' }}>
                  {formatTime(position)}
                </Text>
                <Text variant="caption" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: '500' }}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <Pressable style={styles.secondaryControlButton} onPress={() => setShuffleMode(!shuffleMode)}>
                <Shuffle size={22} color={shuffleMode ? (playerTheme?.primary || "#FFF") : (playerTheme?.onSurfaceVariant || "rgba(255, 255, 255, 0.75)")} />
              </Pressable>

              <Pressable style={styles.controlButton} onPress={previous}>
                <SkipPrevious size={38} color={playerTheme?.onSurface || "#FFF"} />
              </Pressable>

              <Pressable
                style={[
                  styles.playButton,
                  playerTheme && { backgroundColor: playerTheme.primaryContainer }
                ]}
                onPress={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause size={44} color={playerTheme?.onPrimaryContainer || '#000'} />
                ) : (
                  <Play size={44} color={playerTheme?.onPrimaryContainer || '#000'} />
                )}
              </Pressable>

              <Pressable style={styles.controlButton} onPress={next}>
                <SkipNext size={38} color={playerTheme?.onSurface || "#FFF"} />
              </Pressable>

              <Pressable style={styles.secondaryControlButton} onPress={toggleRepeat}>
                <Repeat size={22} color={repeatMode !== AudioProRepeatMode.OFF ? (playerTheme?.primary || "#FFF") : (playerTheme?.onSurfaceVariant || "rgba(255, 255, 255, 0.75)")} />
              </Pressable>
            </View>

            {/* Footer - Queue & Menu */}
            <View style={styles.footerRow}>
              <Pressable style={styles.footerButton}>
                <BillList size={26} color={playerTheme?.onSurfaceVariant || "rgba(255, 255, 255, 0.8)"} />
              </Pressable>

              <Pressable style={styles.footerButton}>
                <MenuDots size={26} color={playerTheme?.onSurfaceVariant || "rgba(255, 255, 255, 0.8)"} />
              </Pressable>
            </View>
          </SafeView>
        </LinearGradient>
      </View>
    </Sheet>
  );
});

PlayerSheet.displayName = 'PlayerSheet';