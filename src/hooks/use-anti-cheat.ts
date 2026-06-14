'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useExamStore } from '@/lib/store';

interface UseAntiCheatReturn {
  strikes: number;
  showOverlay: boolean;
  dismissOverlay: () => void;
}

export function useAntiCheat(): UseAntiCheatReturn {
  const { antiCheatStrikes, addStrike, showAntiCheatOverlay, setShowAntiCheatOverlay } = useExamStore();
  const hasAutoSubmitted = useRef(false);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !hasAutoSubmitted.current) {
      addStrike();
      setShowAntiCheatOverlay(true);
    }
  }, [addStrike, setShowAntiCheatOverlay]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Auto-submit after 3 strikes
  useEffect(() => {
    if (antiCheatStrikes >= 3 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      // The ExamView component will handle the actual submission
    }
  }, [antiCheatStrikes]);

  const dismissOverlay = useCallback(() => {
    if (antiCheatStrikes < 3) {
      setShowAntiCheatOverlay(false);
    }
  }, [antiCheatStrikes, setShowAntiCheatOverlay]);

  return {
    strikes: antiCheatStrikes,
    showOverlay: showAntiCheatOverlay,
    dismissOverlay,
  };
}
