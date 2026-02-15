import { useEffect, useRef } from 'react';
import { AudioPro, useAudioPro } from 'react-native-audio-pro';
import { baseURL, MUSIC_RADIO_PLAY, MUSIC_RECOMMEND } from '../services/api/endpoints';
import { saavnApi } from '../services/api/saavnApi';
import { audioService } from '../services/audio/AudioService';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUserSettings } from '../store/useUserSettings';
import { mapSongToTrack } from '../utils/trackMapping';

/**
 * Auto-Queue Hook
 * ...
 */

const FETCH_LIMIT = 20; // Number of recommended songs to add

interface RecommendResponse {
  status: string;
  message: string;
  data: any[]; // Array of songs directly
}

export const useAutoQueue = () => {
  const { queue, radioId, radioProvider, radioLanguage, radioType } = usePlayerStore();
  const { autoQueueEnabled: enabled, autoQueueThreshold: threshold } = useUserSettings();
  const isFetchingRef = useRef(false);
  const lastFetchedSongIdRef = useRef<string | null>(null);
  const addedSongIdsRef = useRef<Set<string>>(new Set());
  const radioNextBatchRef = useRef<number>(1);

  // Listen to track changes to trigger auto-queue
  const currentTrack = useAudioPro((s) => s.trackPlaying);

  /**
   * Fetch more tracks (either Radio or Recommendations)
   */
  const fetchMoreTracks = async (track: any): Promise<number> => {
    try {
      let apiUrl = '';
      let isRadio = !!radioId; // If unified, radioId is the session ID

      if (isRadio && radioProvider === 'unified') {
        console.log(`📻 Auto-Queue: Fetching next unified batch for "${radioId}", Next: ${radioNextBatchRef.current}`);
        apiUrl = `${MUSIC_RADIO_PLAY(radioId!)}?count=${FETCH_LIMIT}&next=${radioNextBatchRef.current}`;
        if (radioLanguage) apiUrl += `&lang=${encodeURIComponent(radioLanguage)}`;
      } else if (isRadio) {
        // Legacy fallback
        console.log(`📻 Auto-Queue: Fetching next radio batch for "${radioId}" [${radioProvider}], Type: ${radioType}, Next: ${radioNextBatchRef.current}`);
        apiUrl = `${baseURL}/music/radio/${radioId}?provider=${radioProvider}`;
        if (radioLanguage) apiUrl += `&lang=${radioLanguage}`;
        if (radioType) apiUrl += `&type=${radioType}`;
        if (radioProvider === 'saavn' || radioProvider === 'unified') {
          apiUrl += `&next=${radioNextBatchRef.current}`;
        }
      } else {
        // -----------------------------------------------------------------------
        // TRANSFORM TO RADIO MODE
        // Instead of simple recommendations, start a persistent Song Radio
        // -----------------------------------------------------------------------
        const provider = track.provider || 'saavn';
        console.log(`✨ Auto-Queue: Converting to Song Radio for "${track.title}" [${track.id}]`);

        try {
          // 1. Initialize Radio Session
          const sessionData = await saavnApi.initRadioSession(
            track.id,
            'song',
            provider as any,
            undefined, // name
            track.language
          );

          if (sessionData.status === 'success' && sessionData.data?.stationId) {
            const newStationId = sessionData.data.stationId;
            console.log(`📻 Auto-Queue: Created station ${newStationId}. transitioning to Radio Mode.`);

            // 2. Update Store to Radio Mode (without clearing queue)
            usePlayerStore.getState().setRadio(newStationId, 'unified', track.language || 'hindi,english', 'song');

            // 3. Update local Ref so we don't re-init immediately
            radioNextBatchRef.current = 1;

            // 4. Fetch the first batch from this new station
            // We recursively call fetchMoreTracks? No, let's just construct the URL here.
            apiUrl = `${MUSIC_RADIO_PLAY(newStationId)}?count=${FETCH_LIMIT}&next=1`;
            if (track.language) apiUrl += `&lang=${encodeURIComponent(track.language)}`;

            // IMPORTANT: Update local isRadio flag for the logging below?
            // Actually, we can just proceed with `apiUrl`.
          } else {
            // Fallback to old recommend if radio creation fails
            console.warn('⚠️ Auto-Queue: Radio creation failed, falling back to recommend');
            apiUrl = `${MUSIC_RECOMMEND(track.id)}&provider=${provider}`;
          }
        } catch (e) {
          console.error('⚠️ Auto-Queue: Radio init error', e);
          apiUrl = `${MUSIC_RECOMMEND(track.id)}&provider=${provider}`;
        }
      }

      console.log(`📡 Auto-Queue API Call:`, apiUrl);

      const response = await fetch(apiUrl);
      const data: RecommendResponse = await response.json();

      console.log(`📦 Auto-Queue API Response:`, {
        status: data.status,
        tracksCount: (data.data as any)?.list?.length || data.data?.length || 0,
      });

      if (data.status === 'success' && data.data) {
        const rawTracks = (data.data as any).list || data.data;

        if (!Array.isArray(rawTracks) || rawTracks.length === 0) {
          console.log(`❌ No tracks returned`);
          return 0;
        }

        const currentQueueIds = new Set(queue.map((t) => t.id));

        const newSongs = rawTracks
          .filter((song: any) => {
            const isDuplicate = currentQueueIds.has(song.id) || addedSongIdsRef.current.has(song.id);
            if (!isDuplicate) {
              addedSongIdsRef.current.add(song.id);
            }
            return !isDuplicate;
          })
          .slice(0, FETCH_LIMIT)
          .map(mapSongToTrack);

        if (newSongs.length > 0) {
          console.log(`✅ Adding ${newSongs.length} tracks`);
          audioService.addMediaItems(newSongs);
          usePlayerStore.getState().syncQueue();

          if (isRadio && (radioProvider === 'saavn' || radioProvider === 'unified')) {
            radioNextBatchRef.current += 1;
          }

          return newSongs.length;
        } else {
          console.log(`⚠️  All fetched tracks were duplicates`);
          // If all duplicates and it's Saavn/Unified radio, maybe try next page immediately?
          if (isRadio && (radioProvider === 'saavn' || radioProvider === 'unified')) {
            radioNextBatchRef.current += 1;
            return fetchMoreTracks(track);
          }
        }
      } else {
        console.log(`❌ API Error or empty data`);
      }

      return 0;
    } catch (error) {
      console.error(`💥 ERROR fetching auto-queue tracks:`, error);
      return 0;
    }
  };

  useEffect(() => {
    if (!enabled || !currentTrack) return;

    const checkAndFetchSimilar = async () => {
      // Don't fetch if already fetching
      if (isFetchingRef.current) return;

      // Get current index synchronously
      const currentIndex = AudioPro.getCurrentMediaItemIndex();

      // Calculate remaining songs
      const remainingSongs = queue.length - currentIndex - 1;

      // Trigger condition:
      // If we are at or below the threshold, fetch!
      // (remainingSongs === 0 means we are playing the very last song)
      const shouldFetch = remainingSongs <= threshold;

      if (shouldFetch) {
        // Don't fetch if already fetched for this song (ignoring for Radio mode as we want multiple batches)
        if (!radioId && lastFetchedSongIdRef.current === currentTrack.id) {
          return;
        }

        console.log(`🎵 Auto-Queue: TRIGGERED [${radioId ? 'Radio: ' + radioId : 'Recommendations'}]`);
        console.log(`🎵 Auto-Queue: Remaining: ${remainingSongs}, Current Song: ${currentTrack.title || 'Unknown'}`);

        isFetchingRef.current = true;
        lastFetchedSongIdRef.current = currentTrack.id;

        try {
          const songsAdded = await fetchMoreTracks(currentTrack);
          if (songsAdded > 0) {
            console.log(`🎵 Auto-Queue: ✅ SUCCESS - Added ${songsAdded} tracks`);
          }
        } catch (error) {
          console.error('🎵 Auto-Queue: 💥 Error:', error);
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    checkAndFetchSimilar();
  }, [currentTrack, queue, enabled, threshold]);

  useEffect(() => {
    radioNextBatchRef.current = 1;
    addedSongIdsRef.current.clear();
  }, [radioId]);

  // Reset tracking when queue is cleared
  useEffect(() => {
    if (queue.length === 0) {
      console.log('🔄 Auto-Queue: Queue cleared - resetting tracking state');
      addedSongIdsRef.current.clear();
      lastFetchedSongIdRef.current = null;
      radioNextBatchRef.current = 1;
      usePlayerStore.getState().setRadio(null, null);
    }
  }, [queue.length]);

  return {
    isAutoQueueEnabled: enabled,
  };
};
