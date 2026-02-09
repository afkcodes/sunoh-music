import { useEffect, useRef, useState } from 'react';
import { AudioPro, AudioProEvent, AudioProEventType } from 'react-native-audio-pro';

interface TrackProgress {
  position: number;
  duration: number;
}

/**
 * Returns { position, duration } in milliseconds.
 *
 * Internally deduplicates updates: a re-render only triggers when the
 * *displayed second* changes (i.e. Math.floor(ms / 1000) differs), which
 * prevents 2 unnecessary re-renders per second across every consumer.
 */
export const useTrackProgress = (): TrackProgress => {
  const [progress, setProgress] = useState<TrackProgress>({ position: 0, duration: 0 });
  const lastSecondRef = useRef(-1);
  const lastDurRef = useRef(-1);

  useEffect(() => {
    const handleEvent = (event: AudioProEvent) => {
      if (event.type === AudioProEventType.PROGRESS && event.payload) {
        const pos = event.payload.position ?? 0;
        const dur = event.payload.duration ?? 0;

        // Only trigger a React state update when the displayed second changes
        const posSecond = Math.floor(pos / 1000);
        const durSecond = Math.floor(dur / 1000);

        if (posSecond !== lastSecondRef.current || durSecond !== lastDurRef.current) {
          lastSecondRef.current = posSecond;
          lastDurRef.current = durSecond;
          setProgress({ position: pos, duration: dur });
        }
      }
    };

    const subscription = AudioPro.addEventListener(handleEvent);
    return () => {
      subscription.remove();
    };
  }, []);

  return progress;
};

export const formatTime = (ms: number): string => {
  if (ms <= 0 || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
