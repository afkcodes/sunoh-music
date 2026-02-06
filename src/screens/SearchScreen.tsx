import React, { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import SquircleView from 'react-native-fast-squircle';
import LinearGradient from 'react-native-linear-gradient';
import TurboImage from 'react-native-turbo-image';
import { searchNavigator } from '../app/navigation/navigators';
import { Routes } from '../app/navigation/routes';
import { SafeView } from '../components/common/SafeView';
import { SectionHeader } from '../components/common/SectionHeader';
import { Magnifer } from '../components/common/SolarIcons.generated';
import { Text } from '../components/common/Text';
import { HomeSection } from '../components/home/HomeSection';
import { useOccasions } from '../hooks/useOccasions';
import { useSearch } from '../hooks/useSearch';
import { useTrendingSearch } from '../hooks/useTrendingSearch';
import { useTheme } from '../theme/ThemeContext';
import { Occasion, SaavnItem, SaavnSection } from '../types/saavn';
import { getMediaItemProps } from '../utils/media';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

const GAP = 12;

const createStyles = makeScalingStyles((s, theme) => {
  const horizontalPadding = theme.spacing[4] * 2;
  const gap = s.mScale(GAP);
  // Subtract a small buffer (1px) and floor to prevent rounding issues in flex-wrap
  const itemWidth = Math.floor((s.device.width - horizontalPadding - gap) / 2) - 1;

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPage,
    },
    header: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: s.mScale(20),
      paddingBottom: s.mScale(8),
    },
    searchContainer: {
      marginHorizontal: theme.spacing[4],
      marginBottom: s.mScale(12),
      height: s.mScale(54),
      backgroundColor: theme.colors.bgSurfaceHover,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s.mScale(16),
      borderRadius: theme.borderRadius.lg,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.body,
      fontSize: theme.typography.body,
      marginLeft: s.mScale(12),
    },
    // Hero Card
    heroCard: {
      marginHorizontal: theme.spacing[4],
      height: s.mScale(160),
      marginBottom: s.mScale(20),
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    heroImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    heroGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      justifyContent: 'flex-end',
      padding: s.mScale(16),
    },

    railGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
      justifyContent: 'flex-end',
      padding: s.mScale(12),
    },
    // Grid
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing[4],
      gap: gap,
      paddingBottom: s.mScale(44),
    },
    gridCard: {
      width: itemWidth,
      height: s.mScale(100),
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    cardInner: {
      flex: 1,
      backgroundColor: theme.colors.bgSurfaceHover,
    },
    gridImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    gridGradient: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: s.mScale(10),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionSpacing: {
      marginTop: s.mScale(8),
      marginBottom: s.mScale(16),
    },
    trendingContainer: {
      marginBottom: s.mScale(24),
    },
    railList: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: s.mScale(8),
    },
    separator: {
      width: s.mScale(12),
    },
    trendingHeader: {
      marginBottom: s.mScale(4),
    }
  };
});


const BrowseCard = ({ item }: { item: Occasion }) => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const props = getMediaItemProps(item, 'gaana');

  const handlePress = () => {
    searchNavigator.navigate(Routes.SectionDetail, {
      sectionId: props.token, // Standardized from config url/slug/id
      title: props.title,
      provider: 'gaana',
      isOccasion: true,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.gridCard}
      onPress={handlePress}
    >
      <SquircleView style={styles.cardInner} cornerSmoothing={1}>
        <TurboImage
          source={{ uri: props.imageUrl }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.1)']}
          style={styles.gridGradient}
        >
          <Text variant="body" color="onPrimary" style={{ fontWeight: 'bold' }} numberOfLines={1}>
            {props.title}
          </Text>
        </LinearGradient>
      </SquircleView>
    </TouchableOpacity>
  );
};



const SearchScreen = () => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const [query, setQuery] = useState('');

  const { data: occasionsData, isLoading: isLoadingOccasions } = useOccasions('gaana');
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingSearch();
  const { data: searchResults, isLoading: isSearching } = useSearch(query, 'unified');

  const occasions = useMemo(() => {
    if (Array.isArray(occasionsData)) return occasionsData;
    if (occasionsData && typeof occasionsData === 'object') {
      const d = occasionsData as any;
      if (Array.isArray(d.occasions)) return d.occasions;
      if (Array.isArray(d.data)) return d.data;
    }
    return [];
  }, [occasionsData]);

  const trendingSections = useMemo(() => {
    if (!trendingData?.data) return [];
    const sections: SaavnSection[] = trendingData.data;

    // Group and categorize
    const songsMap = new Map<string, SaavnItem>();
    const albumsMap = new Map<string, SaavnItem>();
    const playlistsMap = new Map<string, SaavnItem>();

    sections.forEach(section => {
      const heading = section.heading.toLowerCase();

      section.data.forEach(item => {
        if (!item.id) return;

        // Merge "Trending" results into Songs if they are primarily songs
        if (heading.includes('song') || heading.includes('trending')) {
          if (!songsMap.has(item.id)) songsMap.set(item.id, item);
        } else if (heading.includes('album')) {
          if (!albumsMap.has(item.id)) albumsMap.set(item.id, item);
        } else if (heading.includes('playlist')) {
          if (!playlistsMap.has(item.id)) playlistsMap.set(item.id, item);
        }
      });
    });

    return [
      { heading: 'Trending Songs', data: Array.from(songsMap.values()) },
      { heading: 'Trending Albums', data: Array.from(albumsMap.values()) },
      { heading: 'Trending Playlists', data: Array.from(playlistsMap.values()) },
    ].filter(s => s.data.length > 0);
  }, [trendingData]);

  if (isLoadingOccasions || isLoadingTrending) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primaryBase} />
      </View>
    );
  }

  const isSearchActive = query.length > 2;

  return (
    <SafeView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 44 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Text variant="display" color="primary">Search</Text>
        </View>

        <View style={{ backgroundColor: theme.colors.bgPage, paddingTop: 12 }}>
          <SquircleView style={styles.searchContainer} cornerSmoothing={1}>
            <Magnifer size={22} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Artists, songs, or podcasts"
              placeholderTextColor={theme.colors.textSecondary}
              selectionColor={theme.colors.primaryBase}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </SquircleView>
        </View>

        {!isSearchActive ? (
          <>
            {/* Trending Sections */}
            {trendingSections.map((section, idx) => (
              <HomeSection
                key={section.heading + idx}
                title={section.heading}
                data={section.data}
                provider="gaana"
                style={{ marginBottom: 12 }}
              />
            ))}

            {/* Explore Categories */}
            <View style={styles.sectionSpacing}>
              <SectionHeader title="Explore Categories" />
              <View style={styles.gridContainer}>
                {occasions.map((item: Occasion) => (
                  <BrowseCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.sectionSpacing}>
            {isSearching ? (
              <ActivityIndicator color={theme.colors.primaryBase} style={{ marginTop: 20 }} />
            ) : (
              searchResults?.data?.map((section: SaavnSection, idx: number) => (
                <HomeSection
                  key={section.heading + idx}
                  title={section.heading}
                  data={section.data}
                  provider="unified"
                  style={{ marginBottom: 12 }}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
};

export default memo(SearchScreen);