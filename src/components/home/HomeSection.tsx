import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import { useNavigationEvent } from 'navigation-react';
import { Routes } from '../../app/navigation/routes';
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
  const { stateNavigator } = useNavigationEvent();

  const limitedData = useMemo(() => data.slice(0, 10), [data]);

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

    const handlePress = () => {
      if (itemType === 'album') {
        stateNavigator.navigate(Routes.Album, { albumId: item.token });
      }
    };

    return (
      <MediaCard
        title={title}
        subtitle={subtitle}
        imageUrl={imageUrl}
        style={{ marginRight: 0 }}
        variant={isCircle ? 'circle' : 'default'}
        onPress={handlePress}
      />
    );
  }, [stateNavigator]);



  const handleMore = useCallback(() => {
    stateNavigator.navigate(Routes.SectionDetail, {
      title,
      data, // Pass full data array
    });
  }, [stateNavigator, title, data]);

  return (
    <View style={style}>
      <SectionHeader title={title} action="More" onActionPress={handleMore} />
      <View style={{ height: s.mScale(200) }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionList}
        >
          {limitedData.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.separator} />}
              {renderInnerItem({ item })}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
