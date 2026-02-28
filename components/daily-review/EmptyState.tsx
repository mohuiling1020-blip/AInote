'use client';

import React from 'react';
import { Feather } from 'lucide-react';

interface EmptyStateProps {
  onBack: () => void;
}

export function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-morandi-beige/50 flex items-center justify-center">
        <Feather className="w-8 h-8 text-morandi-sage/60" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-serif text-gray-700">今天还没有笔记</h2>
        <p className="text-sm text-gray-500 font-sans max-w-[280px]">
          先去记录一些想法吧，今日复盘会在这里等你。
        </p>
      </div>

      <button
        onClick={onBack}
        className="px-6 py-2.5 bg-morandi-sage text-white text-sm font-medium rounded-full hover:bg-[#859188] shadow-lg shadow-morandi-sage/20 transition-all active:scale-95"
      >
        去记录想法
      </button>
    </div>
  );
}
