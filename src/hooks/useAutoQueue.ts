import { useEffect, useRef } from 'react';
import { AudioPro, useAudioPro } from 'react-native-audio-pro';
import { MUSIC_SONG_RECOMMEND } from '../services/api/endpoints';
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
  const { queue } = usePlayerStore();
  const { autoQueueEnabled: enabled, autoQueueThreshold: threshold } = useUserSettings();
  const isFetchingRef = useRef(false);
  const lastFetchedSongIdRef = useRef<string | null>(null);
  const addedSongIdsRef = useRef<Set<string>>(new Set());

  // Listen to track changes to trigger auto-queue
  const currentTrack = useAudioPro((s) => s.trackPlaying);

  /**
   * Fetch recommended songs for current track
   */
  const fetchRecommendations = async (track: any): Promise<number> => {
    try {
      const provider = track.provider || 'saavn';
      console.log(`🔍 Auto-Queue: Fetching recommendations for "${track.title}" [${provider}]`);

      const response = await fetch(`${MUSIC_SONG_RECOMMEND(track.id)}?provider=${provider}`);
      const data: RecommendResponse = await response.json();

      console.log(`📦 Recommend API Response:`, {
        status: data.status,
        songsCount: data.data?.length || 0,
      });

      if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
        const currentQueueIds = new Set(queue.map((t) => t.id));

        console.log(`🔍 Filtering ${data.data.length} recommended songs...`, {
          inQueue: currentQueueIds.size,
          alreadyAdded: addedSongIdsRef.current.size,
        });

        const newSongs = data.data
          .filter((song) => {
            const isDuplicate = currentQueueIds.has(song.id) || addedSongIdsRef.current.has(song.id);
            if (!isDuplicate) {
              addedSongIdsRef.current.add(song.id);
            }
            return !isDuplicate;
          })
          .slice(0, FETCH_LIMIT)
          .map(mapSongToTrack);

        if (newSongs.length > 0) {
          console.log(`✅ Adding ${newSongs.length} recommended songs`);
          console.log(`📋 Songs:`, newSongs.map(s => s.title).slice(0, 3).join(', ') + (newSongs.length > 3 ? '...' : ''));
          audioService.addMediaItems(newSongs);
          usePlayerStore.getState().syncQueue();
          return newSongs.length;
        } else {
          console.log(`⚠️  All recommended songs were duplicates`);
        }
      } else {
        console.log(`❌ No recommendations returned`);
      }

      return 0;
    } catch (error) {
      console.error(`💥 ERROR fetching recommendations:`, error);
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
        // Don't fetch if already fetched for this song
        if (lastFetchedSongIdRef.current === currentTrack.id) {
          return;
        }

        console.log(`🎵 Auto-Queue: TRIGGERED`);
        console.log(`🎵 Auto-Queue: Remaining songs: ${remainingSongs} (threshold: ${threshold})`);

        isFetchingRef.current = true;
        lastFetchedSongIdRef.current = currentTrack.id;

        try {
          const songsAdded = await fetchRecommendations(currentTrack);
          if (songsAdded > 0) {
            console.log(`🎵 Auto-Queue: ✅ SUCCESS - Added ${songsAdded} songs`);
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

  // Reset tracking when queue is cleared
  useEffect(() => {
    if (queue.length === 0) {
      console.log('🔄 Auto-Queue: Queue cleared - resetting tracking state');
      addedSongIdsRef.current.clear();
      lastFetchedSongIdRef.current = null;
    }
  }, [queue.length]);

  return {
    isAutoQueueEnabled: enabled,
  };
};
