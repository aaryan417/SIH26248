import { useEffect, useRef } from 'react';
import { useVRStore } from '../store/useVRStore';

export function useGazeInteraction(
  targetId: string,
  onSelect: () => void,
  dwellTimeMs = 1700
) {
  const { activeGazeTargetId, setGazeTarget, setGazeProgress, resetGaze } = useVRStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const isBeingGazedAt = activeGazeTargetId === targetId;

  useEffect(() => {
    if (isBeingGazedAt) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(100, Math.round((elapsed / dwellTimeMs) * 100));
        setGazeProgress(progress);

        if (progress >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          resetGaze();
          onSelect();
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBeingGazedAt, dwellTimeMs, onSelect, resetGaze, setGazeProgress]);

  const handleMouseEnter = () => {
    setGazeTarget(targetId);
  };

  const handleMouseLeave = () => {
    if (activeGazeTargetId === targetId) {
      resetGaze();
    }
  };

  return {
    isBeingGazedAt,
    handleMouseEnter,
    handleMouseLeave,
  };
}
