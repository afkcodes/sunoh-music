/**
 * Hook to check if the audio player is initialized and ready
 * 
 * @returns boolean indicating if the player is ready to use
 */

import { usePlayerStore } from '../store/usePlayerStore';

export function usePlayerInitialized(): boolean {
  return usePlayerStore(state => state.isInitialized);
}