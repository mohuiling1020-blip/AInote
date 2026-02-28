'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';

type ParticleShape = 'circle' | 'bar' | 'square';

interface Particle {
  id: number;
  left: number;
  delay: number;
  color: string;
  shape: ParticleShape;
  rotate: number;
}

interface CompletionOverlayProps {
  streakCount: number;
  onClose: () => void;
}

function getStreakMessage(count: number): string {
  if (count <= 1) return '蒸蚌，今天深度思考了 🧠';
  if (count <= 3) return `蒸蚌，连续思考了 ${count} 天 🔥`;
  if (count <= 6) return `蒸蚌，连续 ${count} 天没停过 🫡`;
  if (count <= 13) return `蒸蚌，${count} 天连续复盘，卷王本王 👑`;
  return `蒸蚌，${count} 天不间断，你是思考永动机 🚀`;
}

function getParticleClass(shape: ParticleShape): string {
  switch (shape) {
    case 'circle':
      return 'w-2 h-2 rounded-full';
    case 'bar':
      return 'w-3 h-1 rounded-sm';
    case 'square':
      return 'w-2.5 h-2.5 rounded-sm';
  }
}

export function CompletionOverlay({ streakCount, onClose }: CompletionOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<Particle[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const colors = ['#949F97', '#EBE2AA', '#C8D5C5', '#EEE9D0', '#D3C4BE'];
    const shapes: ParticleShape[] = ['circle', 'bar', 'square'];
    const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
      rotate: Math.random() * 360,
    }));
    setConfetti(particles);

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
          className={`absolute ${getParticleClass(p.shape)} animate-confetti-fall`}
          style={{
            left: `${p.left}%`,
            top: '-10px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      {/* Content */}
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <Sparkles className="w-14 h-14 text-morandi-sage" />

        <h2 className="text-2xl font-serif text-gray-800">今日复盘已完成</h2>

        {streakCount >= 1 && (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-lg">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-gray-700">
              {getStreakMessage(streakCount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
