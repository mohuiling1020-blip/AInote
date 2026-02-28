'use client';

import React, { useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { DbNote } from '@/types';
import { ClusterNoteCard } from './ClusterNoteCard';

interface ThemeClusterCardProps {
  theme: string;
  summary: string;
  notes: DbNote[];
}

export function ThemeClusterCard({ theme, summary, notes }: ThemeClusterCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[16px] backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm ring-1 ring-white/20 overflow-hidden transition-all">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-morandi-sage shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">{theme}</span>
          <span className="text-xs text-gray-400 font-sans shrink-0">
            {notes.length}条
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Summary - always visible */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 font-sans leading-relaxed">{summary}</p>
      </div>

      {/* Expandable note list */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-2">
          {notes.map(note => (
            <ClusterNoteCard
              key={note.id}
              title={note.title}
              content={note.processed_content || note.content}
              type={note.type}
              tags={note.tags ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
