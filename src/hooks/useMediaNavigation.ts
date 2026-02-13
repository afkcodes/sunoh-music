import { useNavigationEvent } from 'navigation-react';
import { useCallback } from 'react';
import { Routes } from '../app/navigation/routes';
import { MUSIC_SONG } from '../services/api/endpoints';
import { usePlayer, usePlayerStore } from '../store/usePlayerStore';
import { SaavnItem } from '../types/saavn';
import { getMediaItemProps } from '../utils/media';
import { mapSongToTrack } from '../utils/trackMapping';

export const useMediaNavigation = () => {
  const { stateNavigator } = useNavigationEvent();
  const { play } = usePlayer();

  const navigateToItem = useCallback(async (item: SaavnItem, sectionProvider?: string) => {
    const props = getMediaItemProps(item, sectionProvider);

    switch (props.type) {
      case 'album':
        stateNavigator.navigate(Routes.Album, {
          albumId: props.id,
          provider: props.provider
        });
        break;
      case 'playlist':
        stateNavigator.navigate(Routes.Playlist, {
          playlistId: props.id,
          provider: props.provider
        });
        break;
      case 'song':
        // In search (and general item lists), start playing the song instead of navigating
        console.log('🎵 MediaNav: Playing song', props.title);
        try {
          const { setIsFetching, setOptimisticCurrentTrack } = usePlayerStore.getState();

          // Set optimistic track info immediately so UI updates
          setOptimisticCurrentTrack({
            id: props.id,
            title: props.title,
            artist: props.subtitle,
            artwork: props.imageUrl,
            url: '', // Will be filled once fetched
          });

          setIsFetching(true);

          // Fetch full song details to get mediaUrls
          const url = `${MUSIC_SONG(props.id)}?provider=${props.provider}`;
          const response = await fetch(url);
          const res = await response.json();

          if (res.status === 'success' && res.data) {
            const track = mapSongToTrack(res.data);
            play(track);
          } else {
            console.error('Failed to fetch song details:', res.message);
          }
        } catch (error) {
          console.error('Error playing song from media navigation:', error);
        } finally {
          usePlayerStore.getState().setIsFetching(false);
        }
        break;
      // Add more cases here as needed (artist, radio, etc.)
      default:
        console.warn(`Navigation not implemented for type: ${props.type}`);
        break;
    }
  }, [stateNavigator, play]);

  return { navigateToItem };
};
