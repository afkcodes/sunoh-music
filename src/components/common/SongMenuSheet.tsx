import React from 'react';
import { Pressable, View } from 'react-native';
import ShareModule from 'react-native-share';
import TurboImage from 'react-native-turbo-image';
import { homeNavigator } from '../../app/navigation/navigators';
import { Routes } from '../../app/navigation/routes';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useMenuStore } from '../../store/useMenuStore';
import { usePlayer } from '../../store/usePlayerStore';
import { fontNames } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import { makeScalingStyles, useScalingStyles } from '../../utils/style.util';
import { mapSongToTrack } from '../../utils/trackMapping';
import { Sheet, SheetRef } from './Sheet';
import {
  BillList,
  Heart,
  HeartFill,
  MusicNote,
  Play,
  Share,
  User
} from './SolarIcons.generated';
import { Text } from './Text';

const createStyles = makeScalingStyles((s, _colors) => ({
  content: {
    padding: s.mScale(20),
    paddingBottom: s.vScale(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s.mScale(24),
    gap: s.mScale(16),
  },
  artwork: {
    width: s.mScale(64),
    height: s.mScale(64),
    borderRadius: s.mScale(12),
  },
  headerText: {
    flex: 1,
    gap: s.mScale(4),
  },
  menuList: {
    gap: s.mScale(4),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s.mScale(14),
    paddingHorizontal: s.mScale(12),
    borderRadius: s.mScale(16),
    gap: s.mScale(16),
  },
  menuItemText: {
    fontSize: s.font(16),
    fontFamily: fontNames.semibold,
  }
}));

export const SongMenuSheet = () => {
  const { colors } = useTheme();
  const styles = useScalingStyles(createStyles, colors);
  const { song, visible, hideSongMenu } = useMenuStore();
  const { isLiked, toggleLikeSong } = useLibraryStore();
  const { playNext, addToQueue } = usePlayer();
  const sheetRef = React.useRef<SheetRef>(null);

  // Auto-present when visible becomes true
  React.useEffect(() => {
    if (visible && song) {
      sheetRef.current?.present();
    }
  }, [visible, song]);

  const liked = song ? isLiked(song.id, 'song') : false;

  const handleAction = (action: () => void) => {
    action();
    sheetRef.current?.dismiss();
    // hideSongMenu is called by onDismiss
  };

  const menuItems = song ? [
    {
      label: liked ? 'Remove from Favorites' : 'Add to Favorites',
      icon: liked ? HeartFill : Heart,
      iconColor: liked ? colors.primaryBase : colors.textPrimary,
      onPress: () => toggleLikeSong({
        id: song.id,
        type: 'song',
        title: song.title,
        image: song.image?.[song.image.length - 1]?.link || '',
        subtitle: song.subtitle || song.artists?.map(a => a.name).join(', '),
        timestamp: Date.now(),
        duration: parseInt(song.duration || '0', 10),
        provider: (song as any).provider || song.source || 'saavn',
        fullData: song
      }),
    },
    {
      label: 'Play Next',
      icon: Play,
      onPress: () => playNext(mapSongToTrack(song)),
    },
    {
      label: 'Add to Queue',
      icon: BillList,
      onPress: () => addToQueue(mapSongToTrack(song)),
    },
    {
      label: 'Go to Album',
      icon: MusicNote,
      onPress: () => {
        const albumId = song.albumId;
        if (albumId) {
          homeNavigator.navigate(Routes.Album, {
            albumId,
            provider: (song as any).provider || 'saavn'
          });
        }
      },
    },
    {
      label: 'Go to Artist',
      icon: User,
      onPress: () => {
        // Some songs have multiple artists, we'll take the first one
        if (song.artists && song.artists.length > 0) {
          homeNavigator.navigate(Routes.Artist, {
            artistId: song.artists[0]?.id,
            provider: (song as any).provider || 'saavn'
          });
        }
      },
    },
    {
      label: 'Share',
      icon: Share,
      onPress: async () => {
        try {
          await ShareModule.open({
            message: `Check out ${song.title} on Sunoh!`,
            url: `https://sunoh.codes/song/${song.id}`
          });
        } catch (error) {
          console.log('Error sharing:', error);
        }
      },
    },
  ] : [];

  const handleDismiss = () => {
    hideSongMenu();
  };

  return (
    <Sheet ref={sheetRef} sizes={['auto']} onDidDismiss={handleDismiss}>
      {song && (
        <View style={styles.content}>
          <View style={styles.header}>
            <TurboImage
              source={{ uri: song.image?.[song.image.length - 1]?.link || '' }}
              style={styles.artwork}
            />
            <View style={styles.headerText}>
              <Text variant="h3" numberOfLines={1}>{decodeHtmlEntities(song.title)}</Text>
              <Text variant="body" color="secondary" numberOfLines={1}>
                {decodeHtmlEntities(song.artists?.map(a => a.name).join(', ') || song.subtitle)}
              </Text>
            </View>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: colors.bgSurfaceHover }
                ]}
                onPress={() => handleAction(item.onPress)}
              >
                <item.icon size={24} color={item.iconColor || colors.textPrimary} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Sheet>
  );
};
