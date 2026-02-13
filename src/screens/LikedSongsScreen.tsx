import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { SongListItem } from '../components/album/SongListItem';
import { SafeView } from '../components/common';
import {
  ArrowLeft,
  HeartFill,
  MusicNote,
  Pause,
  Play,
  Shuffle
} from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayer } from '../store/usePlayerStore';
import { borderRadius, fontNames, spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';
import { mapSongToTrack } from '../utils/trackMapping';

const HEADER_HEIGHT = 550;
const STICKY_HEADER_HEIGHT = 60;

const AnimatedLegendList = Animated.createAnimatedComponent(
  LegendList
) as unknown as typeof LegendList;

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  heroContainer: {
    height: s.vScale(HEADER_HEIGHT),
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgSurface,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: s.mScale(spacing.xl),
    paddingBottom: s.mScale(spacing.xl),
    paddingTop: s.mScale(120),
    alignItems: 'center',
  },
  artworkContainer: {
    width: s.mScale(280),
    height: s.mScale(280),
    borderRadius: s.mScale(borderRadius.xl),
    backgroundColor: colors.bgSurfaceHover,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: s.mScale(32),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  artworkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  gridImage: {
    width: '50%',
    height: '50%',
  },
  placeholderArt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBase + '15',
  },
  heartFloating: {
    position: 'absolute',
    bottom: s.mScale(8),
    right: s.mScale(8),
    width: s.mScale(44),
    height: s.mScale(44),
    borderRadius: s.mScale(22),
    backgroundColor: colors.bgPage,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: s.mScale(24),
  },
  title: {
    fontSize: s.font(40),
    fontFamily: fontNames.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: s.font(46),
  },
  subtitle: {
    fontSize: s.font(14),
    fontFamily: fontNames.semibold,
    color: colors.textSecondary,
    marginTop: s.mScale(4),
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(spacing.lg),
    marginTop: s.mScale(8),
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBase,
    paddingHorizontal: s.mScale(40),
    height: s.mScale(60),
    borderRadius: s.mScale(30),
    gap: s.mScale(10),
    shadowColor: colors.primaryBase,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: s.font(16),
    fontFamily: fontNames.bold,
  },
  shuffleBtn: {
    width: s.mScale(60),
    height: s.mScale(60),
    borderRadius: s.mScale(30),
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  listContent: {
    paddingBottom: s.mScale(140),
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: s.mScale(STICKY_HEADER_HEIGHT),
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s.mScale(spacing.md),
  },
  stickyBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgPage,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    width: s.mScale(40),
    height: s.mScale(40),
    borderRadius: s.mScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
  },
  stickyTitleContainer: {
    flex: 1,
    paddingRight: s.mScale(40),
    alignItems: 'center',
  },
  stickyTitle: {
    fontSize: s.font(17),
    fontFamily: fontNames.bold,
    color: colors.textPrimary,
  }
}));

export const LikedSongsScreen = () => {
  const { colors } = useTheme();
  // @ts-ignore
  const styles = useScalingStyles(createStyles, colors);
  const { stateNavigator } = useNavigationEvent();
  const { likedSongs = [] } = useLibraryStore();
  const { playQueue, isPlaying, currentTrack, togglePlayPause } = usePlayer();
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const isPlayingAnyLiked = useMemo(() => {
    if (!currentTrack || !isPlaying) return false;
    return likedSongs.some(ls => ls.id === currentTrack.id);
  }, [currentTrack, isPlaying, likedSongs]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tracks = useMemo(() => {
    return likedSongs.map(item => {
      if (item.fullData) return mapSongToTrack(item.fullData);

      let inferredProvider = item.provider;
      if (!inferredProvider) {
        if (item.image?.includes('gaana') || item.id?.startsWith('gaana-')) {
          inferredProvider = 'gaana';
        } else {
          inferredProvider = 'saavn';
        }
      }

      return {
        id: item.id,
        url: (item as any).url || '',
        title: item.title,
        artist: item.subtitle || 'Unknown Artist',
        artwork: item.image || '',
        duration: (item.duration || 0) * 1000,
        source: inferredProvider,
        provider: inferredProvider,
      } as any;
    });
  }, [likedSongs]);

  const handlePlayAll = useCallback((shuffle = false) => {
    if (tracks.length === 0) return;

    if (isPlayingAnyLiked && !shuffle) {
      togglePlayPause();
      return;
    }

    const sortedTracks = shuffle ? [...tracks].sort(() => Math.random() - 0.5) : tracks;
    playQueue(sortedTracks, 0);
  }, [tracks, playQueue, isPlayingAnyLiked, togglePlayPause]);

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 120, HEADER_HEIGHT - STICKY_HEADER_HEIGHT - 20],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const heroContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - STICKY_HEADER_HEIGHT - 100],
      [1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, 80],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const heroImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-200, 0, HEADER_HEIGHT],
      [1.2, 1, 1.05],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity: interpolate(scrollY.value, [0, HEADER_HEIGHT / 2], [0.35, 0], Extrapolate.CLAMP),
    };
  });

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    let inferredProvider = item.provider;
    if (!inferredProvider) {
      if (item.image?.includes('gaana') || item.id?.startsWith('gaana-')) {
        inferredProvider = 'gaana';
      } else {
        inferredProvider = 'saavn';
      }
    }

    const song = item.fullData || {
      ...item,
      artists: item.artists || [{ name: item.subtitle || 'Unknown' }],
      duration: item.duration,
      source: inferredProvider,
      provider: inferredProvider,
    };

    const isActive = currentTrack?.id === item.id;

    return (
      <SongListItem
        song={song}
        index={index}
        isActive={isActive}
        isPlaying={isActive && isPlaying}
        onPress={() => {
          if (__DEV__) {
            console.log('LikedSongsScreen | Playing track at index:', index, 'URL missing:', !tracks[index]?.url);
          }
          playQueue(tracks, index);
        }}
      />
    );
  }, [tracks, currentTrack, isPlaying, playQueue]);

  const collageImages = useMemo(() => {
    if (likedSongs.length === 0) return [];
    const imgs = likedSongs.slice(0, 4).map(s => s.image).filter(Boolean);
    if (imgs.length === 0) return [];
    const result = [...imgs];
    while (result.length < 4) {
      result.push(imgs[result.length % imgs.length]);
    }
    return result.slice(0, 4);
  }, [likedSongs]);

  const Header = useMemo(() => {
    const hasImages = collageImages.length > 0;

    return (
      <View style={styles.heroContainer}>
        {/* Immersive Background */}
        <View style={styles.heroBackgroundContainer}>
          {hasImages ? (
            <Animated.Image
              source={{ uri: collageImages[0] as string }}
              style={[StyleSheet.absoluteFill, heroImageStyle]}
              blurRadius={60}
            />
          ) : null}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', colors.bgPage]}
            style={styles.heroGradient}
          />
        </View>

        <Animated.View style={[styles.heroContent, heroContentStyle]}>
          <View style={styles.artworkContainer}>
            <View style={styles.artworkGrid}>
              {hasImages ? (
                collageImages.map((img, i) => (
                  <TurboImage key={`grid-${i}`} source={{ uri: img as string }} style={styles.gridImage} />
                ))
              ) : (
                <View style={styles.placeholderArt}>
                  <MusicNote size={64} color={colors.primaryBase} />
                </View>
              )}
            </View>
            <View style={styles.heartFloating}>
              <HeartFill size={24} color="#FF2D55" />
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Liked Songs</Text>
            <Text style={styles.subtitle}>{likedSongs.length} tracks • Your absolute favorites</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.playButton}
              onPress={() => handlePlayAll(false)}
            >
              {isPlayingAnyLiked ? (
                <Pause size={28} color="#FFF" />
              ) : (
                <Play size={28} color="#FFF" />
              )}
              <Text style={styles.playButtonText}>
                {isPlayingAnyLiked ? 'PAUSE' : 'PLAY ALL'}
              </Text>
            </Pressable>
            <Pressable style={styles.shuffleBtn} onPress={() => handlePlayAll(true)}>
              <Shuffle size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }, [styles, likedSongs.length, collageImages, colors, handlePlayAll, isPlayingAnyLiked, heroImageStyle, heroContentStyle]);

  return (
    <SafeView style={styles.container} applyTopInset={false}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { height: STICKY_HEADER_HEIGHT + insets.top, paddingTop: insets.top }]}>
        <Animated.View style={[styles.stickyBackground, stickyHeaderStyle]} />
        <Pressable
          style={styles.backButton}
          onPress={() => stateNavigator.navigateBack(1)}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Animated.View style={[styles.stickyTitleContainer, stickyHeaderStyle]}>
          <Text style={styles.stickyTitle}>Liked Songs</Text>
        </Animated.View>
      </View>

      <AnimatedLegendList
        data={likedSongs}
        renderItem={renderItem}
        keyExtractor={(item: any) => `liked-${item.id}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={Header}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        estimatedItemSize={72}
        showsVerticalScrollIndicator={false}
      />
    </SafeView>
  );
};

export default LikedSongsScreen;
