import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  Shuffle,
} from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { HomeSection } from '../components/home/HomeSection';
import { useArtistData } from '../hooks/useArtistData';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayer } from '../store/usePlayerStore';
import { fontNames, spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { decodeHtmlEntities } from '../utils/htmlDecode';
import { makeScalingStyles, useScaling, useScalingStyles } from '../utils/style.util';
import { mapSongToTrack } from '../utils/trackMapping';

const HEADER_SCROLL_DISTANCE = 360;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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
    minHeight: s.mScale(450),
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
    width: s.mScale(200),
    height: s.mScale(200),
    borderRadius: s.mScale(100), // Circular for artists
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
  bioContainer: {
    paddingHorizontal: s.mScale(spacing.lg),
    paddingVertical: s.mScale(spacing.md),
  },
  bioText: {
    lineHeight: s.mScale(20),
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
  sectionsContainer: {
    gap: s.mScale(spacing.md),
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
}));

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

const ArtistHeader = React.memo<{
  artist: any;
  imageUrl: string;
  artworkAnimatedStyle: any;
  colors: ThemeColors;
  styles: any;
  handlePlayTop: () => void;
  toggleLike: () => void;
  isLiked: boolean;
  shuffleMode: boolean;
  toggleShuffle: () => void;
  isPlaying: boolean;
  isCurrentArtistContext: boolean;
}>(
  ({ 
    artist, 
    imageUrl, 
    artworkAnimatedStyle, 
    colors, 
    styles, 
    handlePlayTop, 
    toggleLike, 
    isLiked, 
    shuffleMode, 
    toggleShuffle, 
    isPlaying, 
    isCurrentArtistContext 
  }) => {
    const showPause = isPlaying && isCurrentArtistContext;
    
    // Format followers count
    const formatFollowers = (followers: string | number | undefined) => {
      if (!followers) return '';
      const num = typeof followers === 'string' ? parseInt(followers, 10) : followers;
      if (isNaN(num)) return '';
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M Followers`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K Followers`;
      }
      return `${num} Followers`;
    };

    return (
      <View style={styles.header}>
        {/* Hero Background */}
        <View style={styles.heroBackground}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
            blurRadius={30}
          />
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', colors.bgPage]}
          style={styles.heroGradient}
        />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {/* Artist Image (Circular) */}
          <Animated.View style={[styles.artworkContainer, artworkAnimatedStyle]}>
            <TurboImage
              source={{ uri: imageUrl }}
              style={styles.artwork}
              cachePolicy="dataCache"
              resizeMode="cover"
            />
          </Animated.View>

          {/* Artist Metadata */}
          <View style={styles.metadata}>
            <Text variant="h1" center numberOfLines={2} style={{ fontFamily: fontNames.bold }}>
              {decodeHtmlEntities(artist?.name || '')}
            </Text>
            <View style={styles.metaRow}>
              {artist?.followers && (
                <Text variant="body" color="secondary">
                  {formatFollowers(artist.followers)}
                </Text>
              )}
            </View>
            {artist?.subtitle && (
              <Text variant="caption" color="secondary" center>
                {decodeHtmlEntities(artist.subtitle)}
              </Text>
            )}
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

              <Pressable onPress={toggleShuffle} style={styles.iconButton}>
                <Shuffle size={24} color={shuffleMode ? colors.primaryBase : colors.textPrimary} />
              </Pressable>

              <Pressable
                onPress={handlePlayTop}
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
    return (
      prevProps.artist?.id === nextProps.artist?.id &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.colors === nextProps.colors &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.shuffleMode === nextProps.shuffleMode &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.isCurrentArtistContext === nextProps.isCurrentArtistContext
    );
  }
);

ArtistHeader.displayName = 'ArtistHeader';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ArtistScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { data, stateNavigator } = useNavigationEvent();
  const artistId = data.artistId as string;
  const { data: artistData, isLoading, error } = useArtistData(artistId);
  const s = useScaling();
  const insets = useSafeAreaInsets();

  const artist = artistData?.data;
  const sections = artist?.sections || [];

  // Get top songs from sections (first section with "Top Songs" heading)
  const topSongs = useMemo(() => {
    const topSongsSection = sections.find(
      (section: any) => section.heading?.toLowerCase().includes('top songs')
    );
    return topSongsSection?.data || [];
  }, [sections]);

  // Use last item in image array for high quality
  const imagery = artist?.image || [];
  const imageUrl = Array.isArray(imagery) ? imagery[imagery.length - 1]?.link || '' : imagery || '';

  // ============================================================================
  // SCROLL ANIMATIONS
  // ============================================================================

  const scrollY = useSharedValue(0);

  useEffect(() => {
    return () => {
      cancelAnimation(scrollY);
    };
  }, [scrollY]);

  const shouldAnimateHero = useDerivedValue(() => {
    'worklet';
    return scrollY.value < HEADER_SCROLL_DISTANCE;
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const artworkAnimatedStyle = useAnimatedStyle(() => {
    'worklet';

    if (!shouldAnimateHero.value) {
      return {
        transform: [{ scale: 0.7 }],
        opacity: 0,
      };
    }

    const progress = scrollY.value / HEADER_SCROLL_DISTANCE;
    const scale = 1 - progress * 0.3;
    const opacityProgress = scrollY.value / (HEADER_SCROLL_DISTANCE * 0.8);
    const opacity = Math.max(0, 1 - opacityProgress);

    return {
      transform: [{ scale }],
      opacity,
    };
  }, []);

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

  const { playQueue, setShuffleMode, shuffleMode, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { isLiked, toggleLikeArtist } = useLibraryStore();

  const isArtistLiked = isLiked(artistId, 'artist');

  const isCurrentArtistContext = useMemo(() => {
    if (!currentTrack || !topSongs.length) return false;
    return topSongs.some((s: any) => s.id === currentTrack.id);
  }, [currentTrack, topSongs]);

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  const toggleShuffle = useCallback(() => {
    setShuffleMode(!shuffleMode);
  }, [shuffleMode, setShuffleMode]);

  const toggleFavorite = useCallback(() => {
    if (artist) {
      toggleLikeArtist({
        id: artist.id,
        type: 'artist',
        title: artist.name,
        image: imageUrl,
        subtitle: artist.subtitle || '',
        timestamp: Date.now(),
        provider: 'saavn',
      });
    }
  }, [artist, imageUrl, toggleLikeArtist]);

  const handlePlayTop = useCallback(() => {
    if (isCurrentArtistContext) {
      togglePlayPause();
      return;
    }

    if (topSongs.length > 0) {
      const tracks = topSongs.map(mapSongToTrack);
      playQueue(tracks, 0);
    }
  }, [topSongs, playQueue, isCurrentArtistContext, togglePlayPause]);

  const handleBack = useCallback(() => {
    stateNavigator.navigateBack(1);
  }, [stateNavigator]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <SafeView style={styles.container} applyTopInset={false}>
        <View style={styles.loader}>
          <LogoAnimation />
        </View>
      </SafeView>
    );
  }

  if (error || !artistData?.data || !artistId) {
    return (
      <SafeView style={styles.container} applyTopInset={false}>
        <View style={styles.loader}>
          <Text variant="body" center color="secondary">
            {!artistId ? 'Artist not found' : 'Failed to load artist'}
          </Text>
        </View>
      </SafeView>
    );
  }

  // Parse bio text if it's JSON
  let bioText = '';
  if (artist?.bio) {
    try {
      const bioData = typeof artist.bio === 'string' ? JSON.parse(artist.bio) : artist.bio;
      if (Array.isArray(bioData) && bioData[0]?.text) {
        bioText = bioData[0].text;
      } else if (typeof bioData === 'string') {
        bioText = bioData;
      }
    } catch {
      bioText = artist.bio;
    }
  }

  return (
    <SafeView style={styles.container} applyTopInset={false}>
      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            height: s.mScale(60) + insets.top,
            paddingTop: insets.top,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          },
        ]}
      >
        {/* Background */}
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

        {/* Back Button */}
        <Pressable onPress={handleBack} style={styles.headerButton} hitSlop={8}>
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

        {/* Title */}
        <Animated.View style={[{ flex: 1 }, headerTitleAnimatedStyle]}>
          <Text variant="body" style={{ fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
            {decodeHtmlEntities(artist?.name || '')}
          </Text>
        </Animated.View>

        {/* Menu Button */}
        <Pressable
          onPress={() => console.log('Menu pressed')}
          style={styles.headerButton}
          hitSlop={8}
        >
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
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Artist Header */}
        <ArtistHeader
          artist={artist}
          imageUrl={imageUrl}
          artworkAnimatedStyle={artworkAnimatedStyle}
          colors={colors}
          styles={styles}
          handlePlayTop={handlePlayTop}
          isLiked={isArtistLiked}
          toggleLike={toggleFavorite}
          shuffleMode={shuffleMode}
          toggleShuffle={toggleShuffle}
          isPlaying={isPlaying}
          isCurrentArtistContext={isCurrentArtistContext}
        />

        {/* Bio Section */}
        {bioText && (
          <View style={styles.bioContainer}>
            <Text variant="body" color="secondary" numberOfLines={4} style={styles.bioText}>
              {decodeHtmlEntities(bioText)}
            </Text>
          </View>
        )}

        {/* Sections */}
        {sections.map((section: any, index: number) => (
          <View key={index} style={styles.sectionsContainer}>
            <HomeSection title={section.heading || 'Related'} data={section.data} />
          </View>
        ))}
      </AnimatedScrollView>
    </SafeView>
  );
};

export default ArtistScreen;
