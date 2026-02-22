/**
 * SectionDetailScreen Component
 *
 * Displays all items from a specific section in a grid layout
 * Used when user taps "More" on a HomeSection
 */

import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, useWindowDimensions, View } from 'react-native';
import { MediaCard } from '../components/common/MediaCard';
import { SafeView } from '../components/common/SafeView';
import { Text } from '../components/common/Text';
import { HomeSection } from '../components/home/HomeSection';
import { useMediaNavigation } from '../hooks/useMediaNavigation';
import { useOccasionDetails } from '../hooks/useOccasionDetails';
import { sectionDataStore } from '../services/stores/SectionDataStore';
import { spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { SaavnItem } from '../types/saavn';
import { getMediaItemProps } from '../utils/media';
import { makeScalingStyles, useScaling, useScalingStyles } from '../utils/style.util';

const NUM_COLUMNS = 2;

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  header: {
    paddingHorizontal: s.mScale(spacing.lg),
    paddingTop: s.mScale(spacing.md),
    paddingBottom: s.mScale(spacing.xl),
  },
  listContent: {
    paddingHorizontal: s.mScale(spacing.lg),
    paddingBottom: s.mScale(100),
  },
  itemContainer: {
    width: '50%',
    paddingBottom: s.mScale(spacing.lg),
  },
  itemInner: {
    marginHorizontal: s.mScale(spacing.sm),
  },
  loadingContainer: {
    padding: s.mScale(spacing.xl),
    alignItems: 'center',
  },
}));

export const SectionDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { data: navData } = useNavigationEvent();
  const { navigateToItem } = useMediaNavigation();

  const sectionTitle = (navData.title as string) || 'Details';
  const sectionId = (navData.sectionId as any)?.toString();
  const sectionProvider = (navData.provider as any) || 'saavn';
  // Check both boolean and string "true"
  const isOccasion = navData.isOccasion === true || navData.isOccasion === 'true';

  console.log('📱 SectionDetail: Mounted', { sectionId, sectionProvider, isOccasion, sectionTitle });

  const { data: occasionData, isLoading, error } = useOccasionDetails(
    sectionId,
    sectionProvider,
    isOccasion
  );

  const sectionData = useMemo(() => {
    if (!isOccasion) {
      return sectionDataStore.getData(sectionId) || [];
    }

    if (!occasionData) return [];

    console.log('📦 SectionDetail: Parsing Occasion Data', {
      hasStatus: !!(occasionData as any).status,
      hasData: !!(occasionData as any).data,
      isRawArray: Array.isArray(occasionData)
    });

    // Strategy 1: Saavn provider usually wraps in { status: 'success', data: [...] }
    const resData = (occasionData as any).data;
    if (Array.isArray(resData)) return resData;

    // Strategy 2: Gaana or raw array response
    if (Array.isArray(occasionData)) return occasionData;

    // Strategy 3: Nested data { data: { data: [...] } }
    if (resData && Array.isArray((resData as any).data)) return (resData as any).data;

    return [];
  }, [sectionId, isOccasion, occasionData]);

  const { width } = useWindowDimensions();
  const s = useScaling();

  const cardSize = useMemo(() => {
    // List has horizontal padding on both sides
    const listPadding = s.mScale(spacing.lg) * 2;
    // Each item has marginHorizontal (left + right)
    const itemMargin = s.mScale(spacing.sm) * 2;
    // Available width after list padding, divided by columns, minus item margins
    const availableWidth = width - listPadding;
    const columnWidth = availableWidth / NUM_COLUMNS;
    // Subtract item margins and a buffer for gap
    return Math.floor(columnWidth - itemMargin - 4);
  }, [width, s]);

  const renderItem = useCallback(
    ({ item }: { item: SaavnItem }) => {
      const props = getMediaItemProps(item, sectionProvider);

      return (
        <View style={styles.itemContainer}>
          <View style={styles.itemInner}>
            <MediaCard
              title={props.title}
              subtitle={props.subtitle}
              imageUrl={props.imageUrl}
              variant={props.isCircle ? 'circle' : 'default'}
              onPress={() => navigateToItem(item, sectionProvider)}
              size={cardSize}
            />
          </View>
        </View>
      );
    },
    [navigateToItem, sectionProvider, styles, cardSize]
  );

  // If the API returns categorized sections (common in Occasions details)
  const isCategorized = useMemo(() => {
    if (!isOccasion || sectionData.length === 0) return false;

    const first = sectionData[0];
    // A section usually has a heading/title AND a data array
    const detected = !!(first && (first.heading || first.title) && Array.isArray(first.data));

    // Fallback: if it's an occasion and EVERY item has a data array, it's categorized
    const alternateDetected = detected || (sectionData.length > 0 && sectionData.every((item: any) => Array.isArray(item.data)));

    console.log('📂 SectionDetail: Categorization check', {
      isCategorized: detected || alternateDetected,
      detected,
      alternateDetected,
      firstItemHeading: first?.heading || first?.title
    });
    return detected || alternateDetected;
  }, [isOccasion, sectionData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primaryBase} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">Failed to load: {(error as Error).message}</Text>
        </View>
      );
    }

    if (sectionData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">No content found</Text>
        </View>
      );
    }

    if (isCategorized) {
      // Use standard ScrollView for categorized data as it's typically short
      // and nested LegendLists/FlatLists can sometimes be flaky on Android
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {sectionData.map((section: any, idx: number) => (
            <HomeSection
              key={(section.heading || section.title || 'section') + idx}
              title={section.heading || section.title}
              data={section.data}
              provider={sectionProvider}
              style={{ marginBottom: 24 }}
            />
          ))}
        </ScrollView>
      );
    }

    return (
      <LegendList
        data={sectionData}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id || (item as any).url || `item-${index}`)}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={220}
        renderToHardwareTextureAndroid
        recycleItems
      />
    );
  };

  return (
    <SafeView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" color="primary">
          {sectionTitle}
        </Text>
        {!isCategorized && sectionData.length > 0 && (
          <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
            {sectionData.length} items
          </Text>
        )}
      </View>

      {renderContent()}
    </SafeView>
  );
};
