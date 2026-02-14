import { useEffect, useRef } from 'react';
import { AudioPro, useAudioPro } from 'react-native-audio-pro';
import { baseURL, MUSIC_RECOMMEND } from '../services/api/endpoints';
import { audioService } from '../services/audio/AudioService';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUserSettings } from '../store/useUserSettings';
import { mapSongToTrack } from '../utils/trackMapping';

/**
 * Auto-Queue Hook
 * 
 * Automatically fetches and adds recommended songs to the queue when nearing the end,
 * creating an infinite radio-like experience.
 * 
 * Features:
 * - Triggers when current index is 3rd-to-last in queue (or immediately for single-song queues)
 * - Uses new /recommend endpoint for better recommendations
 * - Prevents duplicate songs from being added
 * - Works seamlessly with shuffle and repeat modes
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
      let isRadio = !!radioId;

      if (isRadio) {
        console.log(`📻 Auto-Queue: Fetching next radio batch for "${radioId}" [${radioProvider}]`);
        apiUrl = `${baseURL}/music/radio/${radioId}?provider=${radioProvider}`;
        if (radioLanguage) {
          apiUrl += `&lang=${radioLanguage}`;
        }
        if (radioType) {
          apiUrl += `&type=${radioType}`;
        }
        if (radioProvider === 'saavn' || radioProvider === 'unified') {
          apiUrl += `&next=${radioNextBatchRef.current}`;
        }
      } else {
        const provider = track.provider || 'saavn';
        apiUrl = `${MUSIC_RECOMMEND(track.id)}&provider=${provider}`;
        console.log(`🔍 Auto-Queue: Fetching recommendations for "${track.title}" [${track.id}]`);
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

        console.log(`🎵 Auto-Queue: TRIGGERED (Radio: ${!!radioId})`);
        console.log(`🎵 Auto-Queue: Remaining songs: ${remainingSongs} (threshold: ${threshold})`);

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
