'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, HelpCircle } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  summary: string;
  tags: string[];
  provocativeQuestion: string;
}

export function SummaryCard({ title, summary, tags, provocativeQuestion }: SummaryCardProps) {
  return (
    <div className="rounded-[20px] backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_15px_40px_-10px_rgba(148,159,151,0.25)] ring-1 ring-white/30 p-6 animate-fade-in-up">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-morandi-sage" />
        <h2 className="text-lg font-serif text-gray-800">{title}</h2>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 font-sans leading-relaxed mb-4 prose prose-sm max-w-none prose-p:my-1 prose-li:my-0">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tags.map(tag => (
          <span
            key={tag}
            className="px-3 py-1 text-xs font-sans text-morandi-text-secondary bg-morandi-beige/40 rounded-full border border-morandi-beige/60"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Provocative Question */}
      <div className="flex items-start gap-2 p-4 rounded-2xl bg-morandi-cream/20 border border-morandi-cream/40">
        <HelpCircle className="w-4 h-4 text-[#9C9460] mt-0.5 shrink-0" />
        <p className="text-sm text-[#9C9460] font-sans leading-relaxed italic">
          {provocativeQuestion}
        </p>
      </div>
    </div>
  );
}
