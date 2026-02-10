import { useMemo } from 'react';
import { useAudioPro } from 'react-native-audio-pro';

interface TrackProgress {
  position: number;
  duration: number;
}

// Primitive selectors – stable references, no new objects created per call.
// This avoids the "getSnapshot should be cached" infinite loop in React 19's
// useSyncExternalStore (which Zustand uses internally).
const selectPosition = (s: { position: number }) => s.position;
const selectDuration = (s: { duration: number }) => s.duration;

// Per-second equality: only re-render when the displayed second changes.
// Primitives are inherently referentially stable so this is safe with
// useSyncExternalStore while still throttling renders to ~1/s.
const secondEquality = (a: number, b: number): boolean =>
  Math.floor(a / 1000) === Math.floor(b / 1000);

/**
 * Returns { position, duration } in milliseconds.
 *
 * Reads directly from the library's internalStore via useAudioPro so that
 * optimistic position updates from seekTo() are reflected immediately,
 * preventing the slider from jumping back to the old position during a seek.
 *
 * Re-renders are throttled to once per displayed-second change via a custom
 * equality function, keeping rendering cost identical to the old approach.
 */
export const useTrackProgress = (): TrackProgress => {
  const position = useAudioPro(selectPosition, secondEquality);
  const duration = useAudioPro(selectDuration, secondEquality);
  return useMemo(() => ({ position, duration }), [position, duration]);
};

export const formatTime = (ms: number): string => {
  if (ms <= 0 || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
