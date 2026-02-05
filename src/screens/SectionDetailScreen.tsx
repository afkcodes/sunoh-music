/**
 * SectionDetailScreen Component
 *
 * Displays all items from a specific section in a grid layout
 * Used when user taps "More" on a HomeSection
 */

import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import { default as React, useCallback } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { MediaCard } from '../components/common/MediaCard';
import { SafeView } from '../components/common/SafeView';
import { Text } from '../components/common/Text';
import { useMediaNavigation } from '../hooks/useMediaNavigation';
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
    paddingBottom: s.mScale(spacing.sm),
  },
  listContent: {
    paddingHorizontal: s.mScale(spacing.lg),
    paddingBottom: s.mScale(spacing.xl),
  },
  itemContainer: {
    width: '50%',
    paddingBottom: s.mScale(spacing.lg),
  },
  itemInner: {
    marginHorizontal: s.mScale(spacing.xs),
  },
}));

export const SectionDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { data } = useNavigationEvent();
  const { navigateToItem } = useMediaNavigation();

  const sectionTitle = data.title as string;
  const sectionId = data.sectionId as string;
  const sectionData = React.useMemo(() => {
    return sectionDataStore.getData(sectionId) || [];
  }, [sectionId]);
  const sectionProvider = data.provider as any;

  const { width } = useWindowDimensions();
  const s = useScaling();

  const cardSize = React.useMemo(() => {
    // Calculate available width for each card
    // Screen width - List Padding (lg * 2) - Item Inner Margin (xs * 2 * columns)
    // Actually simpler: (Width - ListPadding) / Columns - ItemMargins
    // Let's ensure we fit within the 50% container
    const listPadding = s.mScale(spacing.lg) * 2;
    const availableWidth = width - listPadding;
    const columnWidth = availableWidth / NUM_COLUMNS;
    // Remove margins
    return columnWidth - s.mScale(spacing.xs) * 2 - s.mScale(2); // -2 for rounding safety
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

  return (
    <SafeView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" color="primary">
          {sectionTitle}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
          {sectionData.length} items
        </Text>
      </View>

      <LegendList
        data={sectionData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
      />
    </SafeView>
  );
};
