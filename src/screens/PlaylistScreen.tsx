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
import { SongListItem } from '../components/album/SongListItem';
import { SafeView } from '../components/common';
import LogoAnimation from '../components/common/Loader';
import {
  ArrowLeft,
  Heart,
  MenuDots,
  Play,
  Share,
  Shuffle,
} from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { HomeSection } from '../components/home/HomeSection';
import { usePlaylistData } from '../hooks/usePlaylistData';
import { usePlayerStore } from '../store/usePlayerStore';
import { borderRadius, fontNames, spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Song } from '../types/album';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { getMediaItemProps } from '../utils/media';
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
  songList: {
    flex: 1,
  },
  songListContent: {
    paddingBottom: s.mScale(spacing.xl),
  },
  separator: {
    height: s.mScale(1),
    backgroundColor: colors.borderSubtle,
    marginLeft: s.mScale(60),
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
}));

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

/**
 * Memoized Playlist Header Component
 * Only re-renders when playlist data actually changes
 */
const PlaylistHeader = React.memo<{
  playlist: any;
  imageUrl: string;
  artworkAnimatedStyle: any;
  colors: ThemeColors;
  styles: any;
  handlePlayAll: () => void;
}>(
  ({ playlist, imageUrl, artworkAnimatedStyle, colors, styles, handlePlayAll }) => {
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
          {/* Playlist Artwork */}
          <Animated.View style={[styles.artworkContainer, artworkAnimatedStyle]}>
            <TurboImage
              source={{ uri: imageUrl }}
              style={styles.artwork}
              cachePolicy="dataCache"
              resizeMode="cover"
            />
          </Animated.View>

          {/* Playlist Metadata */}
          <View style={styles.metadata}>
            <Text variant="h1" center numberOfLines={2} style={{ fontFamily: fontNames.bold }}>
              {decodeHtmlEntities(playlist?.title || '')}
            </Text>
            <Text variant="body" style={{ textAlign: 'center' }} color="secondary">
              {decodeHtmlEntities(playlist?.subtitle || '')}
            </Text>
            <View style={styles.metaRow}>
              {(playlist?.year || playlist?.releaseDate) && (
                <>
                  <Text variant="caption" color="secondary">
                    {decodeHtmlEntities(playlist?.year || playlist?.releaseDate || '')}
                  </Text>
                  <View style={styles.dot} />
                </>
              )}
              <Text variant="caption" color="secondary">
                {(playlist?.songs?.length || 0).toString()}{' '}
                {parseInt((playlist?.songs?.length || 0).toString()) === 1 ? 'Song' : 'Songs'}
              </Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Left: 3-dot Menu */}
            <Pressable onPress={() => console.log('Menu pressed')} style={styles.iconButton}>
              <MenuDots size={24} color={colors.textPrimary} />
            </Pressable>

            {/* Right: Icons + Play Button */}
            <View style={styles.actionIconsRight}>
              <Pressable onPress={() => console.log('Favorite pressed')} style={styles.iconButton}>
                <Heart size={24} color={colors.textPrimary} />
              </Pressable>
              <Pressable onPress={() => console.log('Shuffle pressed')} style={styles.iconButton}>
                <Shuffle size={24} color={colors.textPrimary} />
              </Pressable>
              <Pressable onPress={() => console.log('Share pressed')} style={styles.iconButton}>
                <Share size={24} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                onPress={handlePlayAll}
                style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.8 }]}
              >
                <Play size={32} color="#FFFFFF" />
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
      prevProps.playlist?.id === nextProps.playlist?.id &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.colors === nextProps.colors
    );
  }
);

PlaylistHeader.displayName = 'PlaylistHeader';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PlaylistScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { data, stateNavigator } = useNavigationEvent();
  const playlistId = data.playlistId as string;
  const provider = (data.provider as any) || 'saavn';
  const { data: playlistData, isLoading, error } = usePlaylistData(playlistId, provider);
  const s = useScaling();

  const finalPlaylist = playlistData?.data?.playlist || playlistData?.data?.album || playlistData?.data;
  const sections = playlistData?.data?.sections || finalPlaylist?.sections || [];


  // Use standardized media props
  const mediaProps = useMemo(
    () => (finalPlaylist ? getMediaItemProps(finalPlaylist, provider) : null),
    [finalPlaylist, provider]
  );
  const imageUrl = mediaProps?.imageUrl || '';

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

  // Theme/Dark icon fades IN as we scroll UP past threshold
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
  // MEMOIZED CALLBACKS
  // ============================================================================

  const { playQueue } = usePlayerStore();

  const handlePlaySong = useCallback((song: Song) => {
    console.log('Play song:', song.title);

    // 1. Get all songs as tracks
    const allSongs = finalPlaylist?.songs || finalPlaylist?.list || [];
    const tracks = allSongs.map(mapSongToTrack);

    // 2. Find index of clicked song
    const index = tracks.findIndex((t: any) => t.id === song.id);

    // 3. Play queue starting from index
    if (index !== -1) {
      playQueue(tracks, index);
    }
  }, [finalPlaylist, playQueue]);

  const handlePlayAll = useCallback(() => {
    console.log('Play all songs');
    const allSongs = finalPlaylist?.songs || finalPlaylist?.list || [];
    if (allSongs.length > 0) {
      const tracks = allSongs.map(mapSongToTrack);
      playQueue(tracks, 0);
    }
  }, [finalPlaylist, playQueue]);

  const handleBack = useCallback(() => {
    stateNavigator.navigateBack(1);
  }, [stateNavigator]);

  // ============================================================================
  // UNIFIED DATA SOURCE
  // ============================================================================

  type ListItem = { type: 'song'; data: Song; id: string };

  const listData = useMemo(() => {
    const songs = finalPlaylist?.songs || finalPlaylist?.list || [];
    return songs.map((song: Song) => ({
      type: 'song' as const,
      data: song,
      id: song.id,
    }));
  }, [finalPlaylist?.songs, finalPlaylist?.list]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      return (
        <SongListItem song={item.data} index={index} onPress={() => handlePlaySong(item.data)} />
      );
    },
    [handlePlaySong]
  );

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  // Memoized header
  const listHeader = useMemo(
    () => (
      <PlaylistHeader
        playlist={finalPlaylist}
        imageUrl={imageUrl}
        artworkAnimatedStyle={artworkAnimatedStyle}
        colors={colors}
        styles={styles}
        handlePlayAll={handlePlayAll}
      />
    ),
    [finalPlaylist, imageUrl, artworkAnimatedStyle, colors, styles, handlePlayAll]
  );

  // Memoized footer
  const listFooter = useMemo(() => {
    if (!sections || sections.length === 0) return null;
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
  // LOADING
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

  if (error || !playlistData?.data) {
    return (
      <SafeView style={styles.container} applyTopInset={false}>
        <View style={styles.loader}>
          <Text variant="body" center color="secondary">
            Failed to load playlist
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
            {decodeHtmlEntities(finalPlaylist?.title || '')}
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
            <MenuDots size={24} color={colors.textPrimary} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Optimized List */}
      <AnimatedLegendList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={scrollHandler}
        estimatedItemSize={s.mScale(60)}
        drawDistance={s.vScale(1000)}
        scrollEventThrottle={32}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        recycleItems={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeView>
  );
};
