import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

import { useNavigationEvent } from 'navigation-react';
import { Routes } from '../../app/navigation/routes';
import { useMediaNavigation } from '../../hooks/useMediaNavigation';
import { sectionDataStore } from '../../services/stores/SectionDataStore';
import { spacing, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { SaavnItem } from '../../types/saavn';
import { getMediaItemProps } from '../../utils/media';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { MediaCard } from '../common/MediaCard';
import { SectionHeader } from '../common/SectionHeader';

interface HomeSectionProps {
  title: string;
  data: SaavnItem[];
  provider?: 'gaana' | 'saavn' | 'spotify' | 'unified';
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

export const HomeSection: React.FC<HomeSectionProps> = React.memo(({ title, data, provider: sectionProvider, style }) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { navigateToItem } = useMediaNavigation();
  const { stateNavigator } = useNavigationEvent();

  const limitedData = useMemo(() => data.slice(0, 10), [data]);

  const renderInnerItem = useCallback(({ item }: { item: SaavnItem }) => {
    const props = getMediaItemProps(item, sectionProvider);

    return (
      <MediaCard
        title={props.title}
        subtitle={props.subtitle}
        imageUrl={props.imageUrl}
        style={{ marginRight: 0 }}
        variant={props.isCircle ? 'circle' : 'default'}
        onPress={() => navigateToItem(item, sectionProvider)}
      />
    );
  }, [sectionProvider, navigateToItem]);



  const handleMore = useCallback(() => {
    // Generate a unique ID for this navigation event to store data
    const sectionId = `${title}-${Date.now()}`;
    sectionDataStore.setData(sectionId, data);

    stateNavigator.navigate(Routes.SectionDetail, {
      title,
      sectionId,
      provider: sectionProvider,
    });
  }, [stateNavigator, title, data, sectionProvider]);

  return (
    <View style={style}>
      <SectionHeader title={title} action="More" onActionPress={handleMore} />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionList}
          renderToHardwareTextureAndroid
          removeClippedSubviews
          scrollEventThrottle={64}
        >
          {limitedData.map((item, index) => (
            <React.Fragment key={String(item.id + index)}>
              {index > 0 && <View style={styles.separator} />}
              {renderInnerItem({ item })}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
