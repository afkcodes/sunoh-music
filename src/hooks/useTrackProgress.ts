import { useEffect, useState } from 'react';
import { AudioPro, AudioProEvent, AudioProEventType } from 'react-native-audio-pro';

export const useTrackProgress = () => {
  const [progress, setProgress] = useState({ position: 0, duration: 0 });

  useEffect(() => {
    const handleEvent = (event: AudioProEvent) => {
      if (event.type === AudioProEventType.PROGRESS && event.payload) {
        setProgress({
          position: event.payload.position || 0,
          duration: event.payload.duration || 0,
        });
      } else if (event.type === AudioProEventType.TRACK_CHANGED) {
          // Reset on track change
          setProgress({ position: 0, duration: 0 });
      }
    };

    const subscription = AudioPro.addEventListener(handleEvent);
    return () => {
      subscription.remove();
    };
  }, []);

  return progress;
};

export const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
