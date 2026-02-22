import { useNavigationEvent } from 'navigation-react';
import { useCallback } from 'react';
import { Routes } from '../app/navigation/routes';
import { MUSIC_SONG } from '../services/api/endpoints';
import { saavnApi } from '../services/api/saavnApi';
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

      case 'occasion':
      case 'channel':
        console.log('📂 MediaNav: Navigating to channel/occasion details', { title: props.title, id: props.id });
        stateNavigator.navigate(Routes.SectionDetail, {
          sectionId: props.id, // token/id of the channel
          title: props.title,
          provider: props.provider,
          isOccasion: true,
        });
        break;

      case 'radio_station':
        console.log('📻 MediaNav: Starting unified radio session', { title: props.title, id: props.id, type: props.type, provider: props.provider });
        try {
          const { setIsFetching, setRadio, playQueue } = usePlayerStore.getState();
          setIsFetching(true);

          // 1. Initialize Radio Session
          // Map internal types to API types if necessary
          let radioType = 'song'; // default
          if (props.stationType === 'artist') radioType = 'artist';
          if (props.stationType === 'featured') radioType = 'featured';

          const sessionData = await saavnApi.initRadioSession(
            props.id,
            radioType,
            props.provider as any,
            props.title, // Name used for featured stations
            props.language
          );

          if (sessionData.status === 'success' && sessionData.data?.stationId) {
            const stationId = sessionData.data.stationId;
            console.log(`📡 MediaNav: Session initialized. Station ID: ${stationId}`);

            // 2. Fetch Initial Songs
            const songsData = await saavnApi.fetchRadioSongs(stationId, 20, 1, props.language);

            if (songsData.status === 'success' && songsData.data) {
              const tracks = Array.isArray(songsData.data)
                ? songsData.data.map(mapSongToTrack)
                : (songsData.data.list || []).map(mapSongToTrack);

              console.log(`🎵 MediaNav: Received ${tracks.length} tracks.`);

              if (tracks.length > 0) {
                // 3. Update Store & Play
                setRadio(stationId, 'unified', props.language, radioType);
                playQueue(tracks, 0, true);
              } else {
                console.warn('⚠️ MediaNav: Radio station returned 0 tracks');
              }
            } else {
              console.error('❌ MediaNav: Failed to fetch radio songs', songsData.message);
            }
          } else {
            console.error('❌ MediaNav: Failed to init radio session', sessionData.message);
          }
        } catch (error) {
          console.error('💥 MediaNav: Error playing radio:', error);
        } finally {
          usePlayerStore.getState().setIsFetching(false);
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
