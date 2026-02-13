/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { AudioPro, AudioProContentType } from 'react-native-audio-pro';
import { name as appName } from './app.json';
import { App } from './src/app/App';
import { audioService, AudioService } from './src/services/audio/AudioService';
import { urlRefreshLogic } from './src/services/audio/URLRefreshLogic';
import { debugLogger } from './src/utils/debugLogger';

// ---------------------------------------------------------------------------
// Configure AudioPro BEFORE App mounts (runs once on JS bundle load)
// ---------------------------------------------------------------------------
AudioPro.configure({
  progressIntervalMs: 1000,
  debug: __DEV__,
  contentType: AudioProContentType.MUSIC,
  cacheEnabled: true,
  maxCacheSize: 2048 * 1024 * 1024,
});

debugLogger.log('SYSTEM', 'AudioPro Configured');

AudioPro.setNotificationButtons(['NEXT', 'PLAY', 'PREV', 'LIKE']);

// Restore settings
const settings = AudioService.getPersistedSettings();
if (settings.repeatMode) AudioPro.setRepeatMode(settings.repeatMode);
if (settings.shuffleMode !== undefined) AudioPro.setShuffleModeEnabled(settings.shuffleMode);
if (settings.playbackSpeed && settings.playbackSpeed > 0) AudioPro.setPlaybackSpeed(settings.playbackSpeed);

// Restore queue if native service is empty (cold start or service was killed)
AudioPro.getMediaItems().then((nativeQueue) => {
  debugLogger.log('RESTORE', { nativeQueueLength: nativeQueue.length });
  if (nativeQueue.length === 0) {
    // Native service has no queue - restore from MMKV
    const persisted = AudioService.getPersistedQueue();
    if (persisted) {
      debugLogger.log('RESTORE', { 
        queueSize: persisted.queue.length, 
        index: persisted.index, 
        position: persisted.position 
      });
    }
    if (persisted && persisted.queue.length > 0) {
      if (__DEV__) console.log('[index.js] Restoring queue from MMKV:', persisted.queue.length, 'tracks');
      AudioPro.addMediaItems(persisted.queue);
      if (persisted.position > 0) {
        debugLogger.log('RESTORE', { action: 'seekToMediaItem', index: persisted.index, position: persisted.position });
        AudioPro.seekToMediaItem(persisted.index, persisted.position);
      } else {
        debugLogger.log('RESTORE', { action: 'seekToMediaItem', index: persisted.index });
        AudioPro.seekToMediaItem(persisted.index);
      }
    }
  } else {
    // Native service has queue - sync JS store from native state (position, track, etc.)
    if (__DEV__) console.log('[index.js] Native has', nativeQueue.length, 'tracks - syncing state from native');
    debugLogger.log('RESTORE', { action: 'syncFromNative' });
    AudioPro.syncFromNative();
  }
});



AppRegistry.registerComponent(appName, () => App);
// Start persistence listener
audioService.startPersistence();

// Initialize URL refresh logic for expired stream URLs (Gaana)
urlRefreshLogic.initialize();
