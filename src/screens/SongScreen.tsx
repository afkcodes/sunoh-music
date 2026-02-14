import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  cancelAnimation,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TurboImage from 'react-native-turbo-image';
import { SafeView } from '../components/common';
import LogoAnimation from '../components/common/Loader';
import {
  ArrowLeft,
  Heart,
  HeartFill,
  MenuDotsVertical,
  Pause,
  Play,
  Share,
} from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { HomeSection } from '../components/home/HomeSection';
import { useSongData } from '../hooks/useSongData';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayer } from '../store/usePlayerStore';
import { borderRadius, fontNames, spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { makeScalingStyles, useScaling, useScalingStyles } from '../utils/style.util';
import { mapSongToTrack } from '../utils/trackMapping';

const HEADER_SCROLL_DISTANCE = 360;

const AnimatedLegendList = Animated.createAnimatedComponent(
  LegendList
) as unknown as typeof LegendList;

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'relative',
    minHeight: s.mScale(500),
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    paddingHorizontal: s.mScale(spacing.lg),
    paddingTop: s.mScale(spacing.xl * 2.5),
    paddingBottom: s.mScale(spacing.lg),
    gap: s.mScale(spacing.md),
  },
  artworkContainer: {
    position: 'relative',
    width: s.mScale(320),
    height: s.mScale(320),
    borderRadius: s.mScale(borderRadius.xl),
    overflow: 'hidden',
    backgroundColor: colors.bgSurfaceHover,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  metadata: {
    alignItems: 'center',
    gap: s.mScale(6),
    paddingHorizontal: s.mScale(spacing.md),
    maxWidth: '90%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.mScale(8),
  },
  dot: {
    width: s.mScale(4),
    height: s.mScale(4),
    borderRadius: s.mScale(2),
    backgroundColor: colors.textTertiary,
  },
  actionButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: s.mScale(spacing.md),
  },
  actionIconsRight: {
    flexDirection: 'row',
    gap: s.mScale(spacing.sm),
    alignItems: 'center',
  },
  iconButton: {
    width: s.touchable(40),
    height: s.touchable(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  playButton: {
    width: s.touchable(64),
    height: s.touchable(64),
    borderRadius: s.mScale(32),
    backgroundColor: colors.primaryBase,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: s.mScale(60),
    backgroundColor: colors.bgPage,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s.mScale(spacing.lg),
    zIndex: 1000,
  },
  headerButton: {
    width: s.mScale(40),
    height: s.mScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionsContainer: {
    gap: s.mScale(spacing.md),
  },
  emptyState: {
    paddingVertical: s.mScale(spacing.xl * 2),
    alignItems: 'center',
  },
}));

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

/**
 * Memoized Song Header Component
 * Only re-renders when song data actually changes
 */
const SongHeader = React.memo<{
  song: any;
  imageUrl: string;
  artworkAnimatedStyle: any;
  colors: ThemeColors;
  styles: any;
  handlePlay: () => void;
  toggleLike: () => void;
  isLiked: boolean;
  isPlaying: boolean;
  isCurrentSong: boolean;
}>(
  ({ song, imageUrl, artworkAnimatedStyle, colors, styles, handlePlay, toggleLike, isLiked, isPlaying, isCurrentSong }) => {
    // Logic: If playing AND this is the current song -> Pause, else Play
    const showPause = isPlaying && isCurrentSong;

    return (
      <View style={styles.header}>
        {/* Hero Background */}
        <View style={styles.heroBackground}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
            blurRadius={25}
          />
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', colors.bgPage]}
          style={styles.heroGradient}
        />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {/* Song Artwork */}
          <Animated.View style={[styles.artworkContainer, artworkAnimatedStyle]}>
            <TurboImage
              source={{ uri: imageUrl }}
              style={styles.artwork}
              cachePolicy="dataCache"
              resizeMode="cover"
            />
          </Animated.View>

          {/* Song Metadata */}
          <View style={styles.metadata}>
            <Text variant="h1" center numberOfLines={2} style={{ fontFamily: fontNames.bold }}>
              {decodeHtmlEntities(song?.title || '')}
            </Text>
            <Text variant="body" style={{ textAlign: 'center' }} color="secondary" numberOfLines={2}>
              {decodeHtmlEntities(song?.subtitle || '')}
            </Text>
            <View style={styles.metaRow}>
              {song?.year && (
                <>
                  <Text variant="caption" color="secondary">
                    {decodeHtmlEntities(song.year)}
                  </Text>
                  <View style={styles.dot} />
                </>
              )}
              {song?.duration && (
                <Text variant="caption" color="secondary">
                  {song.duration}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Left: 3-dot Menu */}
            <Pressable onPress={() => console.log('Menu pressed')} style={styles.iconButton}>
              <MenuDotsVertical size={24} color={colors.textPrimary} />
            </Pressable>

            {/* Right: Icons + Play Button */}
            <View style={styles.actionIconsRight}>
              <Pressable onPress={toggleLike} style={styles.iconButton}>
                {isLiked ? (
                  <HeartFill size={24} color={colors.primaryBase} />
                ) : (
                  <Heart size={24} color={colors.textPrimary} />
                )}
              </Pressable>

              <Pressable onPress={() => console.log('Share pressed')} style={styles.iconButton}>
                <Share size={24} color={colors.textPrimary} />
              </Pressable>

              <Pressable
                onPress={handlePlay}
                style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.8 }]}
              >
                {showPause ? (
                  <Pause size={40} color="#FFFFFF" />
                ) : (
                  <Play size={40} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these change
    return (
      prevProps.song?.id === nextProps.song?.id &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.colors === nextProps.colors &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.isCurrentSong === nextProps.isCurrentSong
    );
  }
);

SongHeader.displayName = 'SongHeader';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SongScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { data, stateNavigator } = useNavigationEvent();
  const songId = data.songId as string;
  const provider = (data.provider as any) || 'saavn';
  const { data: songData, isLoading, error } = useSongData(songId, provider);
  const s = useScaling();

  // Extract song and sections from response
  const song = songData?.data;
  const sections = song?.sections || [];

  console.log('🎵 SongScreen - API Response:', {
    hasSongData: !!song,
    songId: song?.id,
    songTitle: song?.title,
    sectionsCount: sections.length,
    sectionHeadings: sections.map((s: any) => s.heading),
  });

  // Use last item in array for imagery
  const imagery = song?.image || song?.artwork || [];
  const imageUrl = Array.isArray(imagery) ? imagery[imagery.length - 1]?.link || '' : imagery || '';

  // ============================================================================
  // OPTIMIZED SCROLL ANIMATIONS
  // ============================================================================

  const scrollY = useSharedValue(0);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cancelAnimation(scrollY);
    };
  }, [scrollY]);

  // Derived value to determine if hero should animate
  const shouldAnimateHero = useDerivedValue(() => {
    'worklet';
    return scrollY.value < HEADER_SCROLL_DISTANCE;
  }, []);

  // Optimized scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  // Optimized artwork animation - STOPS when off-screen
  const artworkAnimatedStyle = useAnimatedStyle(() => {
    'worklet';

    // Early return if hero is completely off-screen
    if (!shouldAnimateHero.value) {
      return {
        transform: [{ scale: 0.7 }],
        opacity: 0,
      };
    }

    // More efficient calculation than interpolate
    const progress = scrollY.value / HEADER_SCROLL_DISTANCE;
    const scale = 1 - progress * 0.3; // Goes from 1 to 0.7
    const opacityProgress = scrollY.value / (HEADER_SCROLL_DISTANCE * 0.8);
    const opacity = Math.max(0, 1 - opacityProgress);

    return {
      transform: [{ scale }],
      opacity,
    };
  }, []);

  // Optimized header animation
  // 1. Background opacity (0 -> 1)
  const headerBackgroundAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE - 50, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  }, []);

  // 2. Title animation (Opacity 0 -> 1, TranslateY 10 -> 0)
  const headerTitleAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE],
      [10, 0],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  }, []);

  // 3. Icon color cross-fade
  const iconThemeAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE - 50, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  }, []);

  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const { play, playQueue, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { isLiked, toggleLikeSong } = useLibraryStore();

  const isSongLiked = isLiked(songId, 'song');

  // Check if the currently playing track is this song
  const isCurrentSong = useMemo(() => {
    if (!currentTrack || !song) return false;
    return currentTrack.id === song.id;
  }, [currentTrack, song]);

  const toggleFavorite = useCallback(() => {
    if (song) {
      toggleLikeSong({
        id: song.id,
        type: 'song',
        title: song.title || song.name,
        image: imageUrl,
        subtitle: song.subtitle || song.artist || song.description,
        timestamp: Date.now(),
        provider: provider,
      });
    }
  }, [song, imageUrl, toggleLikeSong, provider]);

  const handlePlay = useCallback(() => {
    console.log('Play song:', song?.title);

    // If currently playing this song, just toggle play/pause
    if (isCurrentSong) {
      togglePlayPause();
      return;
    }

    // Otherwise, play this song with a queue from sections
    if (song) {
      const currentSongTrack = mapSongToTrack(song);

      // Build queue from available sections
      // Priority: Top Songs By Same Artists > Currently Trending Songs
      const sectionPriority = ['Top Songs By Same Artists', 'Currently Trending Songs'];
      let targetSection = null;

      for (const sectionName of sectionPriority) {
        targetSection = sections.find(
          (section: any) => section.heading === sectionName
        );
        if (targetSection && targetSection.data && targetSection.data.length > 0) {
          console.log(`🎵 Found "${sectionName}" section with ${targetSection.data.length} songs`);
          break;
        }
      }

      if (targetSection && targetSection.data && targetSection.data.length > 0) {
        const sectionTracks = targetSection.data
          .filter((s: any) => s.id !== song.id)
          .slice(0, 15) // Limit initial queue, auto-queue will add more
          .map(mapSongToTrack);

        const queueTracks = [currentSongTrack, ...sectionTracks];
        console.log(`🎵 Playing with ${queueTracks.length} tracks from "${targetSection.heading}"`);
        playQueue(queueTracks, 0);
      } else {
        // No sections available, play single track - auto-queue will add more
        console.log('🎵 No sections available, playing single track - auto-queue will handle recommendations');
        playQueue([currentSongTrack], 0);
      }
    }
  }, [song, playQueue, isCurrentSong, togglePlayPause, sections]);

  const handleBack = useCallback(() => {
    stateNavigator.navigateBack(1);
  }, [stateNavigator]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // Memoized header
  const listHeader = useMemo(
    () => (
      <SongHeader
        song={song}
        imageUrl={imageUrl}
        artworkAnimatedStyle={artworkAnimatedStyle}
        colors={colors}
        styles={styles}
        handlePlay={handlePlay}
        isLiked={isSongLiked}
        toggleLike={toggleFavorite}
        isPlaying={isPlaying}
        isCurrentSong={isCurrentSong}
      />
    ),
    [song, imageUrl, artworkAnimatedStyle, colors, styles, handlePlay, isSongLiked, toggleFavorite, isPlaying, isCurrentSong]
  );

  // Memoized footer with sections
  const listFooter = useMemo(() => {
    if (!sections || sections.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="body" color="secondary" center>
            No recommendations available
          </Text>
        </View>
      );
    }
    return (
      <View style={{ paddingBottom: s.mScale(spacing.lg) }}>
        {sections.map((section: any, index: number) => (
          <View key={index} style={styles.sectionsContainer}>
            <HomeSection title={section.heading || 'Related'} data={section.data} />
          </View>
        ))}
      </View>
    );
  }, [sections, styles, s]);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <SafeView style={styles.container} applyTopInset={false}>
        <View style={styles.loader}>
          <LogoAnimation />
        </View>
      </SafeView>
    );
  }

  if (error || !songData?.data) {
    return (
      <SafeView style={styles.container} applyTopInset={false}>
        <View style={styles.loader}>
          <Text variant="body" center color="secondary">
            Failed to load song
          </Text>
        </View>
      </SafeView>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeView style={styles.container} applyTopInset={false}>
      {/* Sticky Header Container (Transparent, stuck to top) */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            height: s.mScale(60) + insets.top,
            paddingTop: insets.top,
            backgroundColor: 'transparent',
            borderBottomWidth: 0, // Remove static border
          },
        ]}
      >
        {/* 1. Animated Background Layer (Fades In) */}
        <Animated.View
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              backgroundColor: colors.bgPage,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
            },
            headerBackgroundAnimatedStyle,
          ]}
        />

        {/* 2. Back Button (Persistent) */}
        <Pressable onPress={handleBack} style={styles.headerButton} hitSlop={8}>
          {/* Theme Icon (Scrolled) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { justifyContent: 'center', alignItems: 'center' },
              iconThemeAnimatedStyle,
            ]}
          >
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Animated.View>
        </Pressable>

        {/* 3. Title (Fades In) */}
        <Animated.View style={[{ flex: 1 }, headerTitleAnimatedStyle]}>
          <Text variant="body" style={{ fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
            {decodeHtmlEntities(song?.title || '')}
          </Text>
        </Animated.View>

        {/* 4. Menu Button (Persistent) */}
        <Pressable
          onPress={() => console.log('Menu pressed')}
          style={styles.headerButton}
          hitSlop={8}
        >
          {/* Theme Icon (Scrolled) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { justifyContent: 'center', alignItems: 'center' },
              iconThemeAnimatedStyle,
            ]}
          >
            <MenuDotsVertical size={24} color={colors.textPrimary} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Scrollable Content */}
      <AnimatedLegendList
        data={[]} // No list items, just header and footer
        renderItem={() => null}
        onScroll={scrollHandler}
        estimatedItemSize={s.mScale(60)}
        drawDistance={s.vScale(1000)}
        scrollEventThrottle={32}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        recycleItems={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeView>
  );
};

export default SongScreen;
