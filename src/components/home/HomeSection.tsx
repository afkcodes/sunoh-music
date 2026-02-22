import { useNavigationEvent } from 'navigation-react';
import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
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
  scrollView: {
    paddingHorizontal: s.mScale(spacing.lg),
  },
  cardWrapper: {
    marginRight: s.mScale(spacing.lg),
  },
  lastCard: {
    marginRight: 0,
  },
  header: {
    marginBottom: s.mScale(12),
    marginTop: s.mScale(16),
  },
}));

export const HomeSection: React.FC<HomeSectionProps> = React.memo(({
  title,
  data,
  provider: sectionProvider,
  style
}) => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { navigateToItem } = useMediaNavigation();
  const { stateNavigator } = useNavigationEvent();

  const limitedData = useMemo(() => data.slice(0, 8), [data]);

  const renderInnerItem = useCallback((item: SaavnItem, index: number) => {
    const props = getMediaItemProps(item, sectionProvider);
    const isLast = index === limitedData.length - 1;

    return (
      <View
        key={String(item.id + index)}
        style={[styles.cardWrapper, isLast && styles.lastCard]}
      >
        <MediaCard
          title={props.title}
          subtitle={props.subtitle}
          imageUrl={props.imageUrl}
          variant={props.isCircle ? 'circle' : 'default'}
          onPress={() => navigateToItem(item, sectionProvider)}
        />
      </View>
    );
  }, [sectionProvider, navigateToItem, limitedData.length, styles]);

  const handleMore = useCallback(() => {
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
      <SectionHeader
        title={title}
        action={data.length > 10 ? 'More' : undefined}
        onActionPress={handleMore}
        style={styles.header}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
        renderToHardwareTextureAndroid
        removeClippedSubviews
        scrollEventThrottle={64}
      >
        {limitedData.map((item, index) => renderInnerItem(item, index))}
      </ScrollView>
    </View>
  );
});