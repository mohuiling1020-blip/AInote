'use client';

import React from 'react';
import { NoteType } from '@/types';

interface ClusterNoteCardProps {
  title: string | null;
  content: string;
  type: string;
  tags: string[];
}

const typeColors: Record<string, { text: string; bg: string; border: string }> = {
  [NoteType.IDEA]:     { text: 'text-[#9C9460]', bg: 'bg-[#EBE2AA]/10', border: 'border-[#EBE2AA]/50' },
  [NoteType.ACTION]:   { text: 'text-[#5E6661]', bg: 'bg-[#949F97]/10', border: 'border-[#949F97]/50' },
  [NoteType.QUERY]:    { text: 'text-[#6D7A70]', bg: 'bg-[#C8D5C5]/10', border: 'border-[#C8D5C5]/50' },
  [NoteType.RESOURCE]: { text: 'text-[#8A847C]', bg: 'bg-[#EEE9D0]/20', border: 'border-[#EEE9D0]/50' },
};

const defaultColors = { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200/50' };

export function ClusterNoteCard({ title, content, type, tags }: ClusterNoteCardProps) {
  const colors = typeColors[type] ?? defaultColors;

  return (
    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} transition-all hover:shadow-sm`}>
      {title && (
        <h4 className={`text-sm font-medium ${colors.text} mb-1 line-clamp-1`}>
          {title}
        </h4>
      )}
      <p className="text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed">
        {content}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] text-gray-400 bg-white/50 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
