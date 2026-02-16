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
  const { queue, radioId, radioType } = usePlayerStore();
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
      const { radioId: currentRadioId, radioProvider: currentRadioProvider, radioLanguage: currentRadioLanguage } = usePlayerStore.getState();
      let apiUrl = '';
      let isRadio = !!currentRadioId; // Use latest from store

      if (isRadio && currentRadioProvider === 'unified') {
        console.log(`📻 Auto-Queue: Fetching next unified batch for "${currentRadioId}", Next: ${radioNextBatchRef.current}`);
        apiUrl = `${MUSIC_RADIO_PLAY(currentRadioId!)}?count=${FETCH_LIMIT}&next=${radioNextBatchRef.current}`;
        if (currentRadioLanguage) apiUrl += `&lang=${encodeURIComponent(currentRadioLanguage)}`;
      } else if (isRadio) {
        // Legacy fallback
        console.log(`📻 Auto-Queue: Fetching next radio batch for "${currentRadioId}" [${currentRadioProvider}], Type: ${radioType}, Next: ${radioNextBatchRef.current}`);
        apiUrl = `${baseURL}/music/radio/${currentRadioId}?provider=${currentRadioProvider}`;
        if (currentRadioLanguage) apiUrl += `&lang=${currentRadioLanguage}`;
        if (radioType) apiUrl += `&type=${radioType}`;
        if (currentRadioProvider === 'saavn' || currentRadioProvider === 'unified') {
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
        raw: data.data
      });

      if (data.status === 'success' && data.data) {
        const rawTracks = (data.data as any).list || data.data;

        if (!Array.isArray(rawTracks) || rawTracks.length === 0) {
          console.log(`❌ No tracks returned`);
          return 0;
        }

        const currentQueueIds = new Set(queue.map((t) => t.id));
        let duplicateCount = 0;

        const newSongs = rawTracks
          .filter((song: any) => {
            const isQueueDuplicate = currentQueueIds.has(song.id);
            const isAddedDuplicate = addedSongIdsRef.current.has(song.id);
            const isDuplicate = isQueueDuplicate || isAddedDuplicate;

            if (isDuplicate) {
              duplicateCount++;
            } else {
              addedSongIdsRef.current.add(song.id);
            }
            return !isDuplicate;
          })
          .slice(0, FETCH_LIMIT)
          .map(mapSongToTrack);

        console.log(`📡 Auto-Queue: Response processed. New: ${newSongs.length}, Duplicates: ${duplicateCount} (Queue: ${currentQueueIds.size})`);

        const latestStore = usePlayerStore.getState();
        const effectiveRadioId = latestStore.radioId;
        const effectiveProvider = latestStore.radioProvider;

        if (newSongs.length > 0) {
          console.log(`✅ Auto-Queue: Adding ${newSongs.length} tracks`);
          audioService.addMediaItems(newSongs);

          // Delay sync slightly to allow native layer to update
          setTimeout(() => {
            latestStore.syncQueue();
          }, 300);

          if (effectiveRadioId && (effectiveProvider === 'saavn' || effectiveProvider === 'unified')) {
            radioNextBatchRef.current += 1;
            console.log(`📻 Auto-Queue: Next batch will be ${radioNextBatchRef.current}`);
          }

          return newSongs.length;
        } else {
          console.log(`⚠️ Auto-Queue: All tracks were duplicates. Current Batch: ${radioNextBatchRef.current}`);
          if (effectiveRadioId && (effectiveProvider === 'saavn' || effectiveProvider === 'unified')) {
            radioNextBatchRef.current += 1;
            console.log(`📻 Auto-Queue: Retrying with next batch: ${radioNextBatchRef.current}`);
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
          console.log(`🎵 Auto-Queue: Skipping - already fetched for ${currentTrack.title}`);
          return;
        }

        console.log(`🎵 Auto-Queue: TRIGGERED`, {
          mode: radioId ? 'Radio' : 'Recommendations',
          radioId,
          remainingSongs,
          threshold,
          currentSong: currentTrack.title
        });

        isFetchingRef.current = true;
        lastFetchedSongIdRef.current = currentTrack.id;

        try {
          const songsAdded = await fetchMoreTracks(currentTrack);
          console.log(`🎵 Auto-Queue: API Result - Added ${songsAdded} tracks`);
        } catch (error) {
          console.error('🎵 Auto-Queue: 💥 Error in checkAndFetchSimilar:', error);
        } finally {
          isFetchingRef.current = false;
        }
      } else {
        // Debug log for why it DIDN'T trigger
        if (remainingSongs % 5 === 0 || remainingSongs <= 10) {
          console.log(`🎵 Auto-Queue: Waiting... (${remainingSongs} remaining, threshold ${threshold})`);
        }
      }
    };

    checkAndFetchSimilar();
  }, [currentTrack, queue, enabled, threshold, radioId]); // Added radioId as dependency

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
