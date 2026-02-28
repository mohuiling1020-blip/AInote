import { useRef, useCallback, useState } from 'react';

interface SwipeState {
  translateX: number;
  isSwiping: boolean;
}

interface UseSwipeGestureOptions {
  threshold?: number;
  onSwipeLeft: () => void;
}

export function useSwipeGesture({ threshold = 80, onSwipeLeft }: UseSwipeGestureOptions) {
  const startX = useRef(0);
  const [swipeState, setSwipeState] = useState<SwipeState>({ translateX: 0, isSwiping: false });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwipeState({ translateX: 0, isSwiping: true });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;
    // Only track left swipe (negative delta)
    const clampedX = Math.min(0, deltaX);
    setSwipeState({ translateX: clampedX, isSwiping: true });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (swipeState.translateX < -threshold) {
      onSwipeLeft();
    }
    setSwipeState({ translateX: 0, isSwiping: false });
  }, [swipeState.translateX, threshold, onSwipeLeft]);

  return {
    ...swipeState,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
