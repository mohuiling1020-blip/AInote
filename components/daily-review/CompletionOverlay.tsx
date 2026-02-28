'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Flame } from 'lucide-react';

interface CompletionOverlayProps {
  streakCount: number;
  onClose: () => void;
}

export function CompletionOverlay({ streakCount, onClose }: CompletionOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));

    // Generate confetti particles
    const colors = ['#949F97', '#EBE2AA', '#C8D5C5', '#EEE9D0', '#D3C4BE'];
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[i % colors.length],
    }));
    setConfetti(particles);

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center bg-morandi-sage/10 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }}
    >
      {/* Confetti */}
      {confetti.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Content */}
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <CheckCircle className="w-16 h-16 text-morandi-sage" />

        <h2 className="text-2xl font-serif text-gray-800">复盘完成</h2>

        {streakCount > 1 && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-lg">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-gray-700">
              连续 {streakCount} 天
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
