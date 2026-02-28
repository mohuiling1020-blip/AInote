'use client';

import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyReviewHeaderProps {
  date: string; // YYYY-MM-DD
  onBack: () => void;
  onDateChange?: (date: string) => void;
  children?: React.ReactNode;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[d.getDay()];
  return `${month}月${day}日 周${weekday}`;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DailyReviewHeader({ date, onBack, onDateChange, children }: DailyReviewHeaderProps) {
  const today = getTodayDateString();
  const isToday = date === today;

  const handlePrev = () => {
    onDateChange?.(getPrevDay(date));
  };

  const handleNext = () => {
    if (!isToday) {
      onDateChange?.(getNextDay(date));
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-sans">返回</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-white/50 transition-all active:scale-95"
            aria-label="前一天"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-sans text-gray-600 min-w-[5.5rem] text-center">
            {formatDisplayDate(date)}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={isToday}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-white/50 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
            aria-label="后一天"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
