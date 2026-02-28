'use client';

import React, { useRef } from 'react';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';

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

export function DailyReviewHeader({ date, onBack, onDateChange, children }: DailyReviewHeaderProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate && onDateChange) {
      onDateChange(newDate);
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
        <button
          type="button"
          onClick={handleDateClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-morandi-sage" />
          <span className="text-sm font-sans">{formatDisplayDate(date)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            max={getTodayDateString()}
            onChange={handleDateInputChange}
            className="sr-only"
            tabIndex={-1}
            aria-label="选择日期"
          />
        </button>
        {children}
      </div>
    </div>
  );
}
