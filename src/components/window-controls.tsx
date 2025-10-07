'use client';

import { useState, useEffect } from 'react';
import useResizeObserver from 'use-resize-observer';
import Confetti from 'react-confetti';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function WindowControls() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { ref, width = 0, height = 0 } = useResizeObserver();

  useEffect(() => {
    // This is to ensure the body ref is available on the client
    ref(document.body);
  }, [ref]);

  const handleConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts for 5 seconds
  };

  return (
    <div className="relative">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="flex items-center justify-between h-10 px-4 bg-muted/30 border-b border-border/50">
        <Logo />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary/50" />
          <div className="w-3 h-3 rounded-full bg-secondary/50" />
          <button
            onClick={handleConfetti}
            className="w-3 h-3 rounded-full bg-destructive/50 hover:bg-destructive/80 transition-colors"
            aria-label="Close window"
          />
        </div>
      </div>
    </div>
  );
}
