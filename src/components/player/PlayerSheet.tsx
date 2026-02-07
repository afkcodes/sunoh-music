import { getPalette } from '@somesoap/react-native-image-palette';
import React, { forwardRef, useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { Sheet, SheetRef } from '../common/Sheet';
import { BillList, Heart, MenuDots, Pause, Play, Repeat, Shuffle, SkipNext, SkipPrevious } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.bgSurface,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: s.mScale(20),
  },


  // Artwork
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: s.mScale(20),
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
    borderRadius: s.mScale(20),
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
    paddingHorizontal: s.mScale(8),
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
    paddingHorizontal: s.mScale(40),
    marginBottom: s.mScale(16),
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
  const { colors } = theme;
  const styles = useScalingStyles(createStyles, theme);
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, togglePlayPause } = usePlayerStore();
  const [gradientColors, setGradientColors] = useState<string[]>([colors.bgSurface, colors.bgPage]);

  // Extract colors from artwork
  useEffect(() => {
    if (currentTrack?.artwork) {
      getPalette(currentTrack.artwork, {
        fallbackColor: colors.bgSurface,
      })
        .then((palette) => {
          if (palette.vibrant) {
            setGradientColors([palette.vibrant, colors.bgPage]);
          }
        })
        .catch((e) => {
          console.warn('Failed to extract palette', e);
        });
    }
  }, [currentTrack, colors.bgPage, colors.bgSurface]);

  if (!currentTrack) return null;

  return (
    <Sheet
      ref={ref}
      detents={[1.0]}
      cornerRadius={32}
      grabberHeader={false}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[
            gradientColors[0],
            colors.bgPage
          ]}
          style={[styles.gradient, { paddingTop: insets.top + 8 }]}
        >

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
                  color: '#FFF',
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
                  color: 'rgba(255, 255, 255, 0.65)'
                }}
              >
                {currentTrack.artist}
              </Text>
            </View>
            <Pressable style={styles.heartButton}>
              <Heart size={26} color="rgba(255, 255, 255, 0.8)" />
            </Pressable>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
            <View style={styles.timeRow}>
              <Text variant="caption" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: '500' }}>
                1:24
              </Text>
              <Text variant="caption" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: '500' }}>
                3:42
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <Pressable style={styles.secondaryControlButton}>
              <Shuffle size={22} color="rgba(255, 255, 255, 0.75)" />
            </Pressable>

            <Pressable style={styles.controlButton} onPress={() => { }}>
              <SkipPrevious size={38} color="#FFF" />
            </Pressable>

            <Pressable style={styles.playButton} onPress={togglePlayPause}>
              {isPlaying ? (
                <Pause size={44} color={gradientColors[0] ?? colors.primaryBase} />
              ) : (
                <Play size={44} color={gradientColors[0] ?? colors.primaryBase} />
              )}
            </Pressable>

            <Pressable style={styles.controlButton} onPress={() => { }}>
              <SkipNext size={38} color="#FFF" />
            </Pressable>

            <Pressable style={styles.secondaryControlButton}>
              <Repeat size={22} color="rgba(255, 255, 255, 0.75)" />
            </Pressable>
          </View>

          {/* Footer - Queue & Menu */}
          <View style={styles.footerRow}>
            <Pressable style={styles.footerButton}>
              <BillList size={26} color="rgba(255, 255, 255, 0.8)" />
            </Pressable>

            <Pressable style={styles.footerButton}>
              <MenuDots size={26} color="rgba(255, 255, 255, 0.8)" />
            </Pressable>
          </View>

        </LinearGradient>
      </View>
    </Sheet>
  );
});

PlayerSheet.displayName = 'PlayerSheet';