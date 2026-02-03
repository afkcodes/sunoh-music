/**
 * SectionDetailScreen Component
 * 
 * Displays all items from a specific section in a grid layout
 * Used when user taps "More" on a HomeSection
 */

import { FlashList } from '@shopify/flash-list';
import { useNavigationEvent } from 'navigation-react';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Routes } from '../app/navigation/routes';
import { MediaCard } from '../components/common/MediaCard';
import { SafeView } from '../components/common/SafeView';
import { Text } from '../components/common/Text';
import { dataConfigs } from '../config/dataConfigs';
import { spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { SaavnImage, SaavnItem } from '../types/saavn';
import { capitalizeFirstLetter } from '../utils';
import { dataExtractor, NestedObject } from '../utils/dataExtractor';
import { makeScalingStyles, useScalingStyles } from '../utils/style.util';

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
  const { stateNavigator } = useNavigationEvent();

  const sectionTitle = data.title as string;
  const sectionData = data.data as SaavnItem[];

  const renderItem = useCallback(({ item }: { item: SaavnItem }) => {
    const itemType = (item.type || 'album');
    const isConfigType = (key: string): key is keyof typeof dataConfigs => key in dataConfigs;
    const config = isConfigType(itemType) ? dataConfigs[itemType] : dataConfigs.album;

    const title = dataExtractor<string>(item as unknown as NestedObject, config.title) || '';
    const subtitleRaw = dataExtractor<string>(item as unknown as NestedObject, config.subtitle) || '';
    const subtitle = capitalizeFirstLetter(subtitleRaw);

    const imageUrl = dataExtractor<string>(item as unknown as NestedObject, config.image, '.', (images: any[]) => {
      const highQuality = images.find((img: SaavnImage) => img.quality === '500x500');
      if (highQuality) return highQuality.link;
      return images[images.length - 1]?.link || '';
    }) || '';

    const isCircle = ['radio_station'].includes(itemType);

    const handlePress = () => {
      if (itemType === 'album') {
        stateNavigator.navigate(Routes.Album, { albumId: item.token });
      }
    };

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInner}>
          <MediaCard
            title={title}
            subtitle={subtitle}
            imageUrl={imageUrl}
            variant={isCircle ? 'circle' : 'default'}
            onPress={handlePress}
          />
        </View>
      </View>
    );
  }, [stateNavigator, styles]);

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

      <FlashList
        data={sectionData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
      />
    </SafeView>
  );
};
