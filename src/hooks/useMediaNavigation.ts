import { useNavigationEvent } from 'navigation-react';
import { useCallback } from 'react';
import { Routes } from '../app/navigation/routes';
import { baseURL, MUSIC_SONG } from '../services/api/endpoints';
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
          const { setIsFetching, setOptimisticCurrentTrack, setRadio } = usePlayerStore.getState();

          // Clear radio when starting a direct song (unless you want standard recommendations to kick in)
          // For now, let's keep it simple: new song = auto-queue (recommendations)
          setRadio(null, null);

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

      case 'artist':
        stateNavigator.navigate(Routes.Artist, {
          artistId: props.id,
          provider: props.provider
        });
        break;

      case 'radio_station':
      case 'channel':
        console.log('📻 MediaNav: Starting radio', { title: props.title, id: props.id, type: props.type, provider: props.provider });
        try {
          const { setIsFetching, setRadio } = usePlayerStore.getState();
          setIsFetching(true);

          // Clear existing queue and set new radio with language
          setRadio(props.id, props.provider as any, props.language);

          let url = `${baseURL}/music/radio/${props.id}?provider=${props.provider}`;
          if (props.language) {
            url += `&lang=${props.language}`;
          }
          console.log('📡 MediaNav: Fetching radio tracks from:', url);

          const response = await fetch(url);
          const res = await response.json();

          console.log('📦 MediaNav: Radio response received:', {
            status: res.status,
            hasData: !!res.data,
            itemsCount: Array.isArray(res.data) ? res.data.length : (res.data?.list?.length || 0)
          });

          if (res.status === 'success' && res.data) {
            const tracks = Array.isArray(res.data)
              ? res.data.map(mapSongToTrack)
              : (res.data.list || []).map(mapSongToTrack);

            const realStationId = res.data.stationId || props.id;
            console.log(`🎵 MediaNav: Mapping complete. Derived ${tracks.length} tracks. Real Station ID: ${realStationId}, Language: ${props.language}`);

            if (tracks.length > 0) {
              // Update with real station ID from backend and keep language
              setRadio(realStationId, props.provider as any, props.language);

              const { playQueue } = usePlayerStore.getState();
              playQueue(tracks);
            } else {
              console.warn('⚠️ MediaNav: Radio station returned 0 tracks');
            }
          } else {
            console.error('❌ MediaNav: Radio fetch failed or returned no data', res.message || 'No message');
          }
        } catch (error) {
          console.error('💥 MediaNav: Error playing radio:', error);
        } finally {
          usePlayerStore.getState().setIsFetching(false);
          console.log('🔄 MediaNav: Radio loading state cleared');
        }
        break;
      // Add more cases here as needed (artist, radio, etc.)
      default:
        console.warn(`🚀 MediaNav: Navigation not implemented for type: ${props.type}`, props);
        break;
    }
  }, [stateNavigator, play]);

  return { navigateToItem };
};
