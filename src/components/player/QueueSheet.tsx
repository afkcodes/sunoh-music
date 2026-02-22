import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable, { SortableFlexDragEndParams } from 'react-native-sortables';
import { usePlayer } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { ExtendedTrack } from '../../utils/trackMapping';
import { SongListItem } from '../album/SongListItem';
import { Sheet, SheetRef } from '../common/Sheet';
import { Text } from '../common/Text';

const SCREEN_WIDTH = Dimensions.get('window').width;

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
  },
  header: {
    paddingHorizontal: s.mScale(20),
    paddingTop: s.mScale(16),
    paddingBottom: s.mScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    marginBottom: s.mScale(8),
  },
  title: {
    fontWeight: '800',
    fontSize: s.font(20),
  },
  doneButton: {
    paddingVertical: s.mScale(6),
    paddingHorizontal: s.mScale(12),
    borderRadius: s.mScale(20),
    backgroundColor: theme.colors.bgSurfaceHover,
  },
  doneText: {
    fontWeight: '700',
    fontSize: s.font(14),
    color: theme.colors.primaryBase,
  },
  scrollView: {
    flex: 1,
  },
}));

interface QueueItemProps {
  item: ExtendedTrack;
  index: number;
  currentTrackId: string | undefined;
  skipToTrack: (index: number) => void;
  isAudioPlaying: boolean;
}

const QueueItem = React.memo(({ item, index, currentTrackId, skipToTrack, isAudioPlaying }: QueueItemProps) => {
  const song = item.fullData;
  const isCurrentTrack = currentTrackId === item.id;

  if (!song) {
    return null;
  }

  return (
    <View style={{ width: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH, overflow: 'hidden' }}>
      <SongListItem
        song={song}
        index={index}
        isPlaying={isCurrentTrack}
        isActive={isAudioPlaying}
        onPress={() => skipToTrack(index)}
      />
    </View>
  );
});

QueueItem.displayName = 'QueueItem';

export const QueueSheet = forwardRef<SheetRef, {}>((_, ref) => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const { queue, currentTrack, skipToTrack, isPlaying, reorder } = usePlayer();
  const sheetRef = React.useRef<SheetRef>(null);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleDragEnd = useCallback(({ fromIndex, toIndex }: SortableFlexDragEndParams) => {
    if (fromIndex !== toIndex) {
      reorder(fromIndex, toIndex);
    }
  }, [reorder]);

  // Memoize queue items to prevent unnecessary re-renders
  const queueItems = useMemo(() => {
    return (queue as ExtendedTrack[]).map((item, index) => (
      <QueueItem
        key={item.id}
        item={item}
        index={index}
        currentTrackId={currentTrack?.id}
        skipToTrack={skipToTrack}
        isAudioPlaying={isPlaying}
      />
    ));
  }, [queue, currentTrack?.id, skipToTrack, isPlaying]);

  return (
    <Sheet
      ref={sheetRef}
      sizes={[1]}
      cornerRadius={theme.borderRadius.lg}
      scrollable
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Queue</Text>
            <Text variant="caption" color="secondary">{queue.length} songs</Text>
          </View>
          <Pressable style={styles.doneButton} onPress={() => sheetRef.current?.dismiss()}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 32 }}
          nestedScrollEnabled
          renderToHardwareTextureAndroid
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
        >
          <Sortable.Flex
            onDragEnd={handleDragEnd}
            flexDirection="column"
            gap={0}
            width="fill"
            hapticsEnabled
            activeItemScale={1.02}
            activeItemOpacity={0.9}
            activeItemShadowOpacity={0.3}
            inactiveItemOpacity={1}
            inactiveItemScale={1}
            dragActivationDelay={200}
            dropAnimationDuration={250}
            autoScrollDirection="vertical"
            autoScrollEnabled
            scrollableRef={scrollRef}
          >
            {queueItems}
          </Sortable.Flex>
        </Animated.ScrollView>
      </GestureHandlerRootView>
    </Sheet>
  );
});

QueueSheet.displayName = 'QueueSheet';
