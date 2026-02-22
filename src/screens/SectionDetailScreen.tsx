/**
 * SectionDetailScreen Component
 *
 * Displays all items from a specific section in a grid layout
 * Used when user taps "More" on a HomeSection
 */

import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
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

  const sectionTitle = navData.title as string;
  const sectionId = navData.sectionId as string;
  const sectionProvider = navData.provider as any;
  const isOccasion = !!navData.isOccasion;

  const { data: occasionData, isLoading } = useOccasionDetails(
    sectionId,
    sectionProvider,
    isOccasion
  );

  const sectionData = useMemo(() => {
    if (isOccasion) {
      if (!occasionData) return [];
      // Gaana returns raw array or { data: [] }
      if (Array.isArray(occasionData)) return occasionData;
      if (Array.isArray(occasionData.data)) return occasionData.data;
      return [];
    }
    return sectionDataStore.getData(sectionId) || [];
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
    if (!isOccasion || !occasionData) return false;
    // Check if what we got is an array of sections (heading + data)
    const data = Array.isArray(occasionData) ? occasionData : occasionData.data;
    if (Array.isArray(data) && data.length > 0 && data[0].heading && data[0].data) {
      return true;
    }
    return false;
  }, [isOccasion, occasionData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primaryBase} />
        </View>
      );
    }

    if (isCategorized) {
      const sections = Array.isArray(occasionData) ? occasionData : (occasionData as any).data;
      return (
        <LegendList
          data={sections}
          renderItem={({ item: section }: { item: any }) => (
            <HomeSection
              title={section.heading}
              data={section.data}
              provider={sectionProvider}
              style={{ marginBottom: 24 }}
            />
          )}
          keyExtractor={(item, index) => (item.heading || 'section') + index}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={250}
          renderToHardwareTextureAndroid
          recycleItems
        />
      );
    }

    return (
      <LegendList
        data={sectionData}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || (item as any).url || Math.random().toString())}
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
        {!isCategorized && (
          <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
            {sectionData.length} items
          </Text>
        )}
      </View>

      {renderContent()}
    </SafeView>
  );
};
