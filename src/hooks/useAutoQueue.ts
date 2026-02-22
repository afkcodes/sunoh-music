import { useEffect, useRef } from 'react';
import { AudioPro, useAudioPro } from 'react-native-audio-pro';
import { baseURL, MUSIC_RADIO_PLAY } from '../services/api/endpoints';
import { saavnApi } from '../services/api/saavnApi';
import { audioService } from '../services/audio/AudioService';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUserSettings } from '../store/useUserSettings';
import { debugLogger } from '../utils/debugLogger';
import { cleanTitle, findBestMatch } from '../utils/songMatcher';
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
  const { autoQueueEnabled: enabled, autoQueueThreshold: threshold, languages } = useUserSettings();
  const isFetchingRef = useRef(false);
  const lastFetchedSongIdRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0); // Track when we last fetched
  const addedSongIdsRef = useRef<Set<string>>(new Set());

  // Cooldown period after a successful fetch (ms)
  const FETCH_COOLDOWN = 2000;

  // Get user's selected languages as comma-separated string
  const userLanguages = languages.join(',');

  // Listen to track changes to trigger auto-queue
  const currentTrack = useAudioPro((s) => s.trackPlaying);

  /**
   * Fetch more tracks (either Radio or Recommendations)
   */
  const fetchMoreTracks = async (track: any): Promise<number> => {
    try {
      const { radioId: currentRadioId, radioProvider: currentRadioProvider, queue: storeQueue } = usePlayerStore.getState();
      let apiUrl = '';
      let isRadio = !!currentRadioId; // Use latest from store

      // -----------------------------------------------------------------------
      // GAANA RADIO PIVOT: Gaana radios give repeated songs, so pivot to Saavn
      // Pick a random song from queue, search on Saavn, create new radio
      // -----------------------------------------------------------------------
      if (isRadio && currentRadioId?.startsWith('gaana_')) {
        console.log(`🔄 Auto-Queue: Gaana radio detected - pivoting to Saavn radio`);
        
        // Pick a random song from queue to use as seed (adds variety)
        const randomIndex = storeQueue.length > 0 ? Math.floor(Math.random() * storeQueue.length) : 0;
        const seedTrack = storeQueue[randomIndex] || track;
        console.log(`🎲 Gaana Pivot: Using random seed track [${randomIndex}/${storeQueue.length}]: "${seedTrack.title}"`);
        const cleanedTitle = cleanTitle(seedTrack.title || '');
        const searchQuery = `${cleanedTitle} ${seedTrack.artist || ''}`.trim();
        
        console.log(`🔍 Gaana Pivot: Input track: "${seedTrack.title}" by "${seedTrack.artist}"`);
        console.log(`🔍 Gaana Pivot: Cleaned search query: "${searchQuery}", languages: "${userLanguages}"`);
        
        try {
          const searchResults = await saavnApi.search(searchQuery, userLanguages, 'saavn');
          const searchSongs = searchResults?.data?.list;
          
          console.log(`📦 Gaana Pivot: Search returned ${searchSongs?.length || 0} results`);
          if (searchSongs?.length > 0) {
            console.log(`📦 Gaana Pivot: Top 3 results:`, searchSongs.slice(0, 3).map((s: any) => ({
              title: s.title || s.name,
              artists: Array.isArray(s.artists) 
                ? s.artists.map((a: any) => a.name).join(', ') 
                : s.primaryArtists || s.artist || 'unknown',
              id: s.songId || s.id
            })));
          }
          
          if (Array.isArray(searchSongs) && searchSongs.length > 0) {
            // Use fuzzy matching to find best match instead of just first result
            const { match, score } = findBestMatch(
              { title: seedTrack.title, artist: seedTrack.artist, duration: seedTrack.duration },
              searchSongs,
              0.4 // minimum score threshold
            );
            
            if (match) {
              const saavnSongId = match.songId || match.id;
              console.log(`🎯 Gaana Pivot: Best match "${match.title}" [${saavnSongId}] (score: ${score.toFixed(3)})`);
              
              // Create new Saavn radio session
              const sessionData = await saavnApi.initRadioSession(
                saavnSongId!,
                'song',
                'saavn',
                searchQuery,
                userLanguages
              );
              
              if (sessionData.status === 'success' && sessionData.data?.stationId) {
                const newStationId = sessionData.data.stationId;
                console.log(`📻 Gaana Pivot: Created Saavn station ${newStationId}`);
                
                // Update store to new Saavn radio
                usePlayerStore.getState().setRadio(newStationId, 'unified', userLanguages, 'song');
                
                // Fetch from new station
                apiUrl = `${MUSIC_RADIO_PLAY(newStationId)}?count=${FETCH_LIMIT}&next=1&lang=${encodeURIComponent(userLanguages)}`;
              } else {
                console.warn('⚠️ Gaana Pivot: Failed to create Saavn station');
                return 0;
              }
            } else {
              console.warn(`⚠️ Gaana Pivot: No good match found (best score: ${score.toFixed(3)})`);
              return 0;
            }
          } else {
            console.warn('⚠️ Gaana Pivot: No Saavn results found');
            return 0;
          }
        } catch (pivotErr) {
          console.error('⚠️ Gaana Pivot: Error', pivotErr);
          return 0;
        }
      } else if (isRadio && currentRadioProvider === 'unified') {
        console.log(`📻 Auto-Queue: Fetching next unified batch for "${currentRadioId}"`);
        apiUrl = `${MUSIC_RADIO_PLAY(currentRadioId!)}?count=${FETCH_LIMIT}&next=1&lang=${encodeURIComponent(userLanguages)}`;
      } else if (isRadio) {
        // Legacy fallback
        console.log(`📻 Auto-Queue: Fetching next radio batch for "${currentRadioId}" [${currentRadioProvider}], Type: ${radioType}`);
        apiUrl = `${baseURL}/music/radio/${currentRadioId}?provider=${currentRadioProvider}&lang=${encodeURIComponent(userLanguages)}`;
        if (radioType) apiUrl += `&type=${radioType}`;
        if (currentRadioProvider === 'saavn' || currentRadioProvider === 'unified') {
          apiUrl += `&next=1`;
        }
        console.log(apiUrl)

      } else {
        // -----------------------------------------------------------------------
        // TRANSFORM TO RADIO MODE
        // Instead of simple recommendations, start a persistent Song Radio
        // -----------------------------------------------------------------------
        const provider = track.provider || 'saavn';
        console.log(`✨ Auto-Queue: Converting to Song Radio for "${track.title}" [${track.id}]`);

        try {
          let entityId = track.id;

          // Pivot to Saavn if current track is not from Saavn (e.g. Gaana)
          // This ensures we can get a radio session even for non-Saavn tracks
          if (provider !== 'saavn' && track.title) {
            const cleanedTitle = cleanTitle(track.title);
            const searchQuery = `${cleanedTitle} ${track.artist || ''}`.trim();
            console.log(`🔍 Radio Pivot: Input track: "${track.title}" by "${track.artist}"`);
            console.log(`🔍 Radio Pivot: Cleaned search query: "${searchQuery}", languages: "${userLanguages}"`);
            try {
              const searchResults = await saavnApi.search(searchQuery, userLanguages, 'saavn');
              const searchSongs = searchResults?.data?.list;

              console.log(`📦 Radio Pivot: Search returned ${searchSongs?.length || 0} results`);
              if (searchSongs?.length > 0) {
                console.log(`📦 Radio Pivot: Top 3 results:`, searchSongs.slice(0, 3).map((s: any) => ({
                  title: s.title || s.name,
                  artists: Array.isArray(s.artists)
                    ? s.artists.map((a: any) => a.name).join(', ')
                    : s.primaryArtists || s.artist || 'unknown',
                  id: s.songId || s.id
                })));
              }

              if (Array.isArray(searchSongs) && searchSongs.length > 0) {
                // Use fuzzy matching instead of just first result
                const { match, score } = findBestMatch(
                  { title: track.title, artist: track.artist, duration: track.duration },
                  searchSongs,
                  0.4
                );
                
                if (match) {
                  entityId = match.songId || match.id || entityId;
                  console.log(`🎯 Radio Pivot: Best match "${match.title}" [${entityId}] (score: ${score.toFixed(3)})`);
                } else {
                  console.warn(`⚠️ Radio Pivot: No good match (best: ${score.toFixed(3)}), using first result`);
                  const fallback = searchSongs[0];
                  entityId = fallback.songId || fallback.id;
                }
              }
            } catch (searchErr) {
              console.warn('⚠️ Radio Pivot: Search failed, falling back to original ID', searchErr);
            }
          }

          // 1. Initialize Radio Session
          const sessionData = await saavnApi.initRadioSession(
            entityId,
            'song',
            'saavn', // Prefer Saavn for radio reliability
            `${track.title} ${track.artist || ''}`, // Pass query for pivoting
            userLanguages
          );

          if (sessionData.status === 'success' && sessionData.data?.stationId) {
            const newStationId = sessionData.data.stationId;
            console.log(`📻 Auto-Queue: Created station ${newStationId}. transitioning to Radio Mode.`);

            // 2. Update Store to Radio Mode (without clearing queue)
            usePlayerStore.getState().setRadio(newStationId, 'unified', userLanguages, 'song');

            // 3. Fetch the first batch from this new station
            apiUrl = `${MUSIC_RADIO_PLAY(newStationId)}?count=${FETCH_LIMIT}&next=1&lang=${encodeURIComponent(userLanguages)}`;
          } else {
            console.warn('⚠️ Auto-Queue: Radio creation failed');
            return 0;
          }
        } catch (e) {
          console.error('⚠️ Auto-Queue: Radio init error', e);
          return 0;
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
        let rawTracks = (data.data as any).list || data.data;

        if (!Array.isArray(rawTracks) || rawTracks.length === 0) {
          console.log(`❌ No tracks returned`);
          return 0;
        }

        // Radio often returns the seed song as the first item - remove it
        rawTracks = rawTracks.slice(1);
        
        if (rawTracks.length === 0) {
          console.log(`❌ No tracks after removing seed song`);
          return 0;
        }

        // CRITICAL: Get current queue IDs from NATIVE layer, not stale Zustand store
        // This prevents duplicates when multiple rapid fetches occur
        let currentQueueIds: Set<string>;
        try {
          const nativeQueue = await AudioPro.getMediaItems();
          currentQueueIds = new Set(nativeQueue.map((t) => t.id));
        } catch (e) {
          console.warn('Auto-Queue: Failed to get native queue for dedup, using store fallback');
          currentQueueIds = new Set(queue.map((t) => t.id));
        }
        
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

        if (newSongs.length > 0) {
          console.log(`✅ Auto-Queue: Adding ${newSongs.length} tracks`);
          audioService.addMediaItems(newSongs);

          // Record successful fetch time for cooldown
          lastFetchTimeRef.current = Date.now();

          // Delay sync slightly to allow native layer to update
          setTimeout(() => {
            usePlayerStore.getState().syncQueue();
          }, 300);

          return newSongs.length;
        } else {
          console.log(`⚠️ Auto-Queue: All tracks were duplicates, no new songs to add`);
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

      // Small delay to ensure native layer has updated its index after track change
      // (Common in React Native bridge scenarios, especially in release builds)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 150));

      // Get current index synchronously from native module
      const currentIndex = AudioPro.getCurrentMediaItemIndex();

      // If currentIndex is -1, native layer hasn't synced yet, skip this run
      if (currentIndex === -1) {
        return;
      }

      // CRITICAL: Get actual queue length from native layer, NOT from Zustand store.
      // The store queue might be stale if addMediaItems was called but syncQueue hasn't completed.
      let nativeQueueLength: number;
      try {
        const nativeQueue = await AudioPro.getMediaItems();
        nativeQueueLength = nativeQueue.length;
      } catch (e) {
        console.warn('Auto-Queue: Failed to get native queue, using store fallback');
        nativeQueueLength = queue.length;
      }

      // Calculate remaining songs using NATIVE queue length
      const remainingSongs = nativeQueueLength - currentIndex - 1;

      // Log the check status (persistent so we can see in Debug screen)
      debugLogger.log('AUTO_QUEUE', {
        remaining: remainingSongs,
        threshold,
        index: currentIndex,
        nativeQueueLen: nativeQueueLength,
        storeQueueLen: queue.length,
        track: currentTrack?.title?.slice(0, 20),
        isRadio: !!radioId
      });

      // Trigger condition:
      // If we are at or below the threshold, fetch!
      const shouldFetch = remainingSongs <= threshold;

      if (shouldFetch) {
        // Don't fetch if already fetched for this song (ignoring for Radio mode as we want multiple batches)
        if (!radioId && lastFetchedSongIdRef.current === currentTrack.id) {
          return;
        }

        // Prevent rapid re-fetches: cooldown after a recent successful fetch
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
        if (timeSinceLastFetch < FETCH_COOLDOWN) {
          debugLogger.log('AUTO_QUEUE_COOLDOWN', { 
            timeSinceLastFetch, 
            cooldown: FETCH_COOLDOWN 
          });
          return;
        }

        isFetchingRef.current = true;
        lastFetchedSongIdRef.current = currentTrack.id;

        try {
          const songsAdded = await fetchMoreTracks(currentTrack);
          debugLogger.log('AUTO_QUEUE_SUCCESS', { added: songsAdded });
        } catch (error) {
          debugLogger.log('AUTO_QUEUE_ERROR', { error: String(error) });
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    checkAndFetchSimilar();
  }, [currentTrack?.id, enabled, threshold, radioId]); // Removed queue.length - use native queue instead

  useEffect(() => {
    addedSongIdsRef.current.clear();
    lastFetchTimeRef.current = 0; // Reset cooldown when radio changes
  }, [radioId]);

  // Reset tracking when queue is cleared
  useEffect(() => {
    if (queue.length === 0) {
      console.log('🔄 Auto-Queue: Queue cleared - resetting tracking state');
      addedSongIdsRef.current.clear();
      lastFetchedSongIdRef.current = null;
      lastFetchTimeRef.current = 0;
      usePlayerStore.getState().setRadio(null, null);
    }
  }, [queue.length]);

  return {
    isAutoQueueEnabled: enabled,
  };
};
