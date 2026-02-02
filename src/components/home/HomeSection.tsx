import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { dataConfigs } from '../../config/dataConfigs';
import { spacing, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { SaavnImage, SaavnItem } from '../../types/saavn';
import { capitalizeFirstLetter } from '../../utils';
import { dataExtractor, NestedObject } from '../../utils/dataExtractor';
import { makeScalingStyles, useScaling, useScalingStyles } from '../../utils/style.util';
import { MediaCard } from '../common/MediaCard';
import { SectionHeader } from '../common/SectionHeader';

interface HomeSectionProps {
  title: string;
  data: SaavnItem[];
  style?: StyleProp<ViewStyle>;
}

const createStyles = makeScalingStyles((s, _colors: ThemeColors) => ({
  sectionList: {
    paddingHorizontal: s.mScale(spacing.lg),
  },
  separator: {
    width: s.mScale(spacing.lg),
  },
}));

export const HomeSection: React.FC<HomeSectionProps> = React.memo(({ title, data, style }) => {
  const { colors } = useTheme();
  const s = useScaling();
  const styles = useScalingStyles(createStyles, colors);

  const renderInnerItem = useCallback(({ item }: { item: SaavnItem }) => {
  
    const itemType = (item.type || 'album'); 
    const isConfigType = (key: string): key is keyof typeof dataConfigs => key in dataConfigs;
    const config = isConfigType(itemType) ? dataConfigs[itemType] : dataConfigs.album;

    const title = dataExtractor<string>(item as unknown as NestedObject, config.title) || '';
    
    const subtitleRaw = dataExtractor<string>(item as unknown as NestedObject, config.subtitle) || '';
    const subtitle = capitalizeFirstLetter(subtitleRaw);

    // Image logic
    const imageUrl = dataExtractor<string>(item as unknown as NestedObject, config.image, '.', (images: any[]) => {
        const highQuality = images.find((img: SaavnImage) => img.quality === '500x500');
        if (highQuality) return highQuality.link;
        return images[images.length - 1]?.link || '';
    }) || '';
    const isCircle = ['radio_station'].includes(itemType);

    return (
        <MediaCard 
            title={title} 
            subtitle={subtitle}
            imageUrl={imageUrl}
            style={{ marginRight: 0 }} 
            variant={isCircle ? 'circle' : 'default'}
        />
    );
  }, []);

  const InnerSeparator = useCallback(() => <View style={styles.separator} />, [styles]);

  return (
    <View style={style}>
        <SectionHeader title={title} action="More" />
        <View style={{ height: s.mScale(200) }}>
            <FlashList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectionList}
                keyExtractor={item => item.id}
                renderItem={renderInnerItem}
                ItemSeparatorComponent={InnerSeparator}
            />
        </View>
    </View>
  );
});
