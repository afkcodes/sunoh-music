import { LegendList } from '@legendapp/list';
import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { Pressable, View } from 'react-native';
import { AudioProTrack } from 'react-native-audio-pro';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Sortable from 'react-native-sortables';
import TurboImage from 'react-native-turbo-image';
import { usePlayer } from '../../store/usePlayerStore';
import { useTheme } from '../../theme/ThemeContext';
import { AppTheme } from '../../theme/types';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { PlayingIndicator } from '../common/PlayingIndicator';
import { Sheet, SheetRef } from '../common/Sheet';
import { GripVertical } from '../common/SolarIcons.generated';
import { Text } from '../common/Text';

const createStyles = makeScalingStyles((s, theme: AppTheme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    paddingHorizontal: s.mScale(8)
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
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(8),
    gap: s.mScale(12),
    backgroundColor: theme.colors.bgSurface,
  },
  artwork: {
    width: s.mScale(48),
    height: s.mScale(48),
    borderRadius: s.mScale(6),
    backgroundColor: theme.colors.bgSurfaceHover,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: s.font(15),
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: s.font(13),
    opacity: 0.6,
    marginTop: s.mScale(2),
  },
  indicatorContainer: {
    width: s.mScale(24),
    height: s.mScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: s.mScale(40),
    height: s.mScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSurfaceHover,
    borderRadius: s.mScale(8),
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: s.mScale(12),
  },
}));

export const QueueSheet = forwardRef<SheetRef, {}>((_, ref) => {
  const theme = useTheme();
  const styles = useScalingStyles(createStyles, theme);
  const { queue, currentTrack, skipToTrack, isPlaying, reorder } = usePlayer();
  const sheetRef = React.useRef<SheetRef>(null);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderItem = useCallback(({ item, index }: { item: AudioProTrack; index: number }) => {
    const isActive = currentTrack?.id === item.id;

    return (
      <View style={styles.trackItem}>
        <Pressable
          style={styles.trackContent}
          onPress={() => skipToTrack(index)}
        >
          <TurboImage source={{ uri: item.artwork }} style={styles.artwork} />
          <View style={styles.infoContainer}>
            <Text
              variant="body"
              numberOfLines={1}
              style={[styles.trackTitle, isActive && { color: theme.colors.primaryBase }]}
            >
              {decodeHtmlEntities(item.title)}
            </Text>
            <Text variant="caption" numberOfLines={1} style={styles.trackArtist}>
              {decodeHtmlEntities(item.artist || '')}
            </Text>
          </View>

          {isActive && (
            <View style={styles.indicatorContainer}>
              <PlayingIndicator isPlaying={isPlaying} />
            </View>
          )}
        </Pressable>

        <Sortable.Handle>
          <View style={styles.dragHandle}>
            <GripVertical size={24} color={theme.colors.textPrimary} />
          </View>
        </Sortable.Handle>
      </View>
    );
  }, [currentTrack, skipToTrack, isPlaying, styles, theme.colors.primaryBase, theme.colors.textSecondary]);

  return (
    <Sheet
      ref={sheetRef}
      sizes={[0.9]}
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
        <LegendList
          style={{ flex: 1 }}
          nestedScrollEnabled renderToHardwareTextureAndroid showsVerticalScrollIndicator={false} recycleItems contentContainerStyle={{ paddingBottom: 32 }}>
          <Sortable.Grid
            data={queue}
            renderItem={renderItem}
            keyExtractor={(item: AudioProTrack) => item.id}
            columns={1}
            rowGap={0}
            columnGap={0}
            customHandle
            dragActivationDelay={150}
            activeItemScale={1.02}
            activeItemOpacity={0.9}
            activeItemShadowOpacity={0.1}
            inactiveItemOpacity={1}
            dropAnimationDuration={50}
            hapticsEnabled
            onOrderChange={({ fromIndex, toIndex }) => {
              reorder(fromIndex, toIndex);
            }}
          />
        </LegendList>
      </GestureHandlerRootView>
    </Sheet>
  );
});

QueueSheet.displayName = 'QueueSheet';
