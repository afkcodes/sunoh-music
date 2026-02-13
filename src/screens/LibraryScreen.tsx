import { LegendList } from '@legendapp/list';
import { useNavigationEvent } from 'navigation-react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import SquircleView from 'react-native-fast-squircle';
import TurboImage from 'react-native-turbo-image';
import { Routes } from '../app/navigation/routes';
import { Button, SafeView, Text } from '../components/common';
import {
  AddSquare,
  AltArrowDown,
  BillList,
  CloseCircle,
  HeartFill,
  Layers,
  Magnifer,
  MenuDots,
  MusicNote,
  User,
  UsersGroupRounded
} from '../components/common/SolarIcons.generated';
import { LibraryItem as LibraryItemType, useLibraryStore } from '../store/useLibraryStore';
import { usePlayer } from '../store/usePlayerStore';
import { borderRadius, fontNames, spacing, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { getMediaItemProps } from '../utils/media';
import { makeScalingStyles, useScaling, useScalingStyles } from '../utils/style.util';
import { mapSongToTrack } from '../utils/trackMapping';

const createStyles = makeScalingStyles((s, colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  header: {
    paddingHorizontal: s.mScale(spacing.lg),
    paddingTop: s.mScale(spacing.lg),
    paddingBottom: s.mScale(spacing.sm),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s.mScale(spacing.md),
    minHeight: s.mScale(44),
  },
  headerTitle: {
    fontSize: s.font(32),
    fontFamily: fontNames.bold,
    color: colors.textPrimary,
    lineHeight: s.font(40),
    includeFontPadding: false,
  },
  profileButton: {
    width: s.mScale(42),
    height: s.mScale(42),
    borderRadius: s.mScale(21),
    backgroundColor: colors.bgSurfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  searchWrapper: {
    paddingHorizontal: s.mScale(spacing.lg),
    marginBottom: s.mScale(spacing.lg),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurfaceHover,
    paddingHorizontal: s.mScale(16),
    height: s.mScale(54),
    borderRadius: s.mScale(borderRadius.lg),
  },
  searchInput: {
    flex: 1,
    marginLeft: s.mScale(12),
    color: colors.textPrimary,
    fontSize: s.font(15),
    fontFamily: fontNames.regular,
    paddingVertical: 0,
  },
  shortcuts: {
    paddingHorizontal: s.mScale(spacing.lg),
    marginBottom: s.mScale(spacing.xl),
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: s.mScale(spacing.md),
    alignItems: 'center',
  },
  shortcutIcon: {
    width: s.mScale(52),
    height: s.mScale(52),
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s.mScale(borderRadius.lg),
  },
  likedIcon: {
    backgroundColor: '#FF2D5512',
  },
  shortcutText: {
    flex: 1,
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: s.font(17),
    fontFamily: fontNames.bold,
    color: colors.textPrimary,
  },
  shortcutSubtitle: {
    fontSize: s.font(14),
    color: colors.textSecondary,
    marginTop: s.mScale(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s.mScale(spacing.lg),
    marginBottom: s.mScale(spacing.md),
    marginTop: s.mScale(spacing.md),
  },
  sectionTitle: {
    fontSize: s.font(22),
    fontFamily: fontNames.bold,
    color: colors.textPrimary,
  },
  filterContent: {
    paddingHorizontal: s.mScale(spacing.lg),
    gap: s.mScale(spacing.sm),
    marginBottom: s.mScale(spacing.lg),
  },
  chip: {
    paddingHorizontal: s.mScale(15),
    paddingVertical: s.mScale(6),
    borderRadius: s.mScale(borderRadius.md),
    backgroundColor: colors.bgSurfaceHover,
  },
  chipActive: {
    backgroundColor: colors.primaryBase,
  },
  chipText: {
    fontSize: s.font(14),
    fontFamily: fontNames.semibold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s.mScale(spacing.lg),
    marginBottom: s.mScale(spacing.md),
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(4),
    gap: s.mScale(6),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s.mScale(spacing.lg),
    paddingVertical: s.mScale(spacing.md),
  },
  gridItem: {
    flex: 0.5,
    padding: s.mScale(spacing.sm),
  },
  itemArtParent: {
    width: s.mScale(60),
    height: s.mScale(60),
    borderRadius: s.mScale(borderRadius.md),
    backgroundColor: colors.bgSurfaceHover,
    overflow: 'hidden',
    marginRight: s.mScale(spacing.md),
  },
  gridArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: s.mScale(borderRadius.lg),
    backgroundColor: colors.bgSurfaceHover,
    overflow: 'hidden',
    marginBottom: s.mScale(spacing.sm),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: s.font(16),
    fontFamily: fontNames.semibold,
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: s.font(13),
    color: colors.textSecondary,
    marginTop: s.mScale(2),
  },
  scrollContent: {
    paddingBottom: s.mScale(140),
  },
  columnWrapper: {
    paddingHorizontal: s.mScale(spacing.lg) - s.mScale(spacing.sm),
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: s.mScale(spacing.xl),
    paddingTop: s.mScale(60),
    alignItems: 'center',
  }
}));

type FilterType = 'All' | 'Playlists' | 'Albums';

const LibraryListItem = memo(({
  item,
  isGridView,
  onPress,
  styles,
  colors,
  s
}: {
  item: LibraryItemType,
  isGridView: boolean,
  onPress: (item: LibraryItemType) => void,
  styles: any,
  colors: ThemeColors,
  s: any
}) => {
  const props = getMediaItemProps(item.fullData || item, item.provider);
  const title = props.title || item.title;
  const subtitle = props.subtitle || item.subtitle;
  const imageUrl = props.imageUrl || item.image;

  if (isGridView) {
    return (
      <Pressable
        style={styles.gridItem}
        onPress={() => onPress(item)}
      >
        <ImageWithMusicNote
          uri={imageUrl}
          style={styles.gridArt}
          imageStyle={styles.image}
          iconSize={s.mScale(36)}
          colors={colors}
        />
        <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.type === 'song' ? 'Track' : item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {subtitle || 'Sunoh'}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.listItem}
      onPress={() => onPress(item)}
    >
      <ImageWithMusicNote
        uri={imageUrl}
        style={styles.itemArtParent}
        imageStyle={styles.image}
        iconSize={s.mScale(28)}
        colors={colors}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {subtitle || 'Sunoh'}
        </Text>
      </View>
      <View style={{ padding: 4 }}>
        <MenuDots size={s.mScale(20)} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
});

const ImageWithMusicNote = ({ uri, style, imageStyle, iconSize, colors }: any) => {
  return (
    <View style={style}>
      {uri ? (
        <TurboImage source={{ uri }} style={imageStyle} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MusicNote size={iconSize} color={colors.textTertiary} />
        </View>
      )}
    </View>
  );
};

export const LibraryScreen = () => {
  const { colors } = useTheme();
  // @ts-ignore
  const styles = useScalingStyles(createStyles, colors);
  const s = useScaling();
  const { stateNavigator } = useNavigationEvent();
  const { playQueue } = usePlayer();

  // Use a ref to always have the latest navigator available to the stable callback
  const navRef = useRef(stateNavigator);
  navRef.current = stateNavigator;

  const { likedSongs = [], likedAlbums = [], likedPlaylists = [] } = useLibraryStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isGridView, setIsGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filteredItems = useMemo(() => {
    let items: LibraryItemType[] = [];
    if (activeFilter === 'All' || activeFilter === 'Playlists') items = [...items, ...likedPlaylists];
    if (activeFilter === 'All' || activeFilter === 'Albums') items = [...items, ...likedAlbums];
    if (activeFilter === 'All') items = [...items, ...likedSongs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        (i.title?.toLowerCase().includes(q)) ||
        (i.subtitle?.toLowerCase().includes(q))
      );
    }
    return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [activeFilter, likedAlbums, likedPlaylists, likedSongs, searchQuery]);

  // STABLE CALLBACK: Prevents stale closures in the list
  const handleItemPress = useCallback((item: LibraryItemType) => {
    console.log('LibraryScreen | Pressed:', item.type, item.id);
    const navigator = navRef.current;

    if (item.type === 'song') {
      const track = mapSongToTrack(item.fullData || item as any);
      playQueue([track], 0);
    } else {
      const route = item.type === 'album' ? Routes.Album : Routes.Playlist;

      // Use the ID and provider directly from the library item 
      // This is crucial for consistency (e.g., keeping 'gaana-' prefix)
      const navParams = item.type === 'album'
        ? {
          albumId: item.id,
          title: item.title,
          provider: item.provider || 'saavn'
        }
        : {
          playlistId: item.id,
          title: item.title,
          provider: item.provider || 'saavn'
        };

      console.log('LibraryScreen | Navigating to:', route, navParams);
      navigator.navigate(route, navParams);
    }
  }, [playQueue]); // NO dependency on stateNavigator!

  const renderItem = useCallback(({ item }: { item: LibraryItemType }) => (
    <LibraryListItem
      item={item}
      isGridView={isGridView}
      onPress={handleItemPress} // Stable function reference
      styles={styles}
      colors={colors}
      s={s}
    />
  ), [isGridView, handleItemPress, styles, colors, s]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle} numberOfLines={1}>Library</Text>
          <Pressable
            style={styles.profileButton}
            onPress={() => navRef.current.navigate(Routes.Settings)}
          >
            <User size={s.mScale(22)} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Pressable onPress={() => inputRef.current?.focus()}>
          <SquircleView style={styles.searchContainer} cornerSmoothing={1}>
            <Magnifer size={22} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              placeholder="Search library"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              underlineColorAndroid="transparent"
              autoCorrect={false}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }} hitSlop={10}>
                <CloseCircle size={20} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </SquircleView>
        </Pressable>
      </View>

      <View style={styles.shortcuts}>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => navRef.current.navigate(Routes.LikedSongs)}
        >
          <SquircleView style={[styles.shortcutIcon, styles.likedIcon]} cornerSmoothing={1}>
            <HeartFill size={26} color="#FF2D55" />
          </SquircleView>
          <View style={styles.shortcutText}>
            <Text style={styles.shortcutTitle}>Liked Songs</Text>
            <Text style={styles.shortcutSubtitle}>{likedSongs.length} tracks</Text>
          </View>
        </Pressable>

        <View style={{ height: s.mScale(spacing.md) }} />

        <Pressable style={styles.shortcutRow}>
          <SquircleView style={styles.shortcutIcon} cornerSmoothing={1}>
            <UsersGroupRounded size={26} color={colors.primaryBase} />
          </SquircleView>
          <View style={styles.shortcutText}>
            <Text style={styles.shortcutTitle}>Artists</Text>
            <Text style={styles.shortcutSubtitle}>Following</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Collection</Text>
        <Pressable hitSlop={10}>
          <AddSquare size={s.mScale(26)} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {['All', 'Playlists', 'Albums'].map((f) => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(f as any)}
          >
            <SquircleView
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              cornerSmoothing={1}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </SquircleView>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable style={styles.sortBtn}>
          <AltArrowDown size={14} color={colors.textSecondary} />
          <Text variant="tiny" color="secondary" style={{ fontWeight: '700' }}>Recently Added</Text>
        </Pressable>
        <Pressable onPress={() => setIsGridView(!isGridView)} hitSlop={12} style={{ padding: 4 }}>
          {isGridView ? (
            <BillList size={22} color={colors.textPrimary} />
          ) : (
            <Layers size={22} color={colors.textPrimary} />
          )}
        </Pressable>
      </View>
    </View>
  ), [styles, s, colors, searchQuery, likedSongs.length, activeFilter, isGridView]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <MusicNote size={s.mScale(60)} color={colors.textTertiary} />
      <Text style={{ marginTop: s.mScale(20), color: colors.textSecondary }}>No items found in your library</Text>
      <Button
        onPress={() => navRef.current.navigate(Routes.Home)}
        variant="primary"
        style={{ marginTop: s.mScale(20), paddingHorizontal: s.mScale(32) }}
      >
        Browse Music
      </Button>
    </View>
  ), [colors, s, styles]);

  return (
    <SafeView style={styles.container}>
      <LegendList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        key={isGridView ? 'g' : 'l'}
        numColumns={isGridView ? 2 : 1}
        estimatedItemSize={isGridView ? 220 : 80}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={isGridView ? (styles.columnWrapper as any) : undefined}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={filteredItems.length === 0 ? ListEmptyComponent : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeView>
  );
};

export default LibraryScreen;