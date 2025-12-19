import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2, Lightbulb, CheckSquare, HelpCircle, Layers, GripHorizontal, Sparkles, Feather } from 'lucide-react';
import { NoteType } from '../types';

interface DockProps {
  onSubmit: (content: string) => void;
  isProcessing: boolean;
  onFilterChange: (type: NoteType | 'ALL') => void;
  activeFilter: NoteType | 'ALL';
}

export const InputBar = React.forwardRef<HTMLDivElement, DockProps>(({ onSubmit, isProcessing, onFilterChange, activeFilter }, ref) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
    }
  };

  const FilterButton = ({ type, label, icon: Icon }: { type: NoteType | 'ALL', label: string, icon: any }) => (
    <button
      onClick={() => onFilterChange(type)}
      className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-300 border
        ${activeFilter === type 
          ? 'bg-morandi-sage text-white border-transparent shadow-md shadow-morandi-sage/30' 
          : 'bg-transparent text-gray-500 border-transparent hover:bg-white/50 hover:text-gray-800'}`}
      title={label}
    >
      <Icon className={`w-3.5 h-3.5 transition-colors ${activeFilter === type ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className={activeFilter === type ? 'inline-block' : 'hidden group-hover:inline-block'}>{label}</span>
    </button>
  );

  return (
    <div ref={ref} className="z-[1000] w-[400px] animate-in slide-in-from-bottom-10 fade-in duration-500">
      {/* Main Glass Container - High Blur, White Tint */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] p-1.5 shadow-[0_30px_60px_-15px_rgba(148,159,151,0.25)] ring-1 ring-white/80 relative">
        
        {/* Inner Content Padding */}
        <div className="px-5 pt-4 pb-3">
          
          {/* Header */}
          <div className="input-drag-handle flex justify-between items-center mb-4 cursor-move active:cursor-grabbing group">
             <div className="flex items-center gap-2.5 select-none">
                <div className="w-7 h-7 bg-gradient-to-br from-morandi-mint to-morandi-sage rounded-full flex items-center justify-center shadow-sm text-white">
                    <Feather className="w-3.5 h-3.5" />
                </div>
                <span className="font-serif font-bold tracking-tight text-sm text-gray-800">MindSpark</span>
             </div>
             <GripHorizontal className="w-4 h-4 text-gray-300 group-hover:text-morandi-sage transition-colors" />
          </div>

          {/* Text Input Area - Minimalist */}
          <div className="relative group mb-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Capture a thought..."
                className="w-full bg-white/40 border border-transparent rounded-2xl text-gray-700 placeholder-gray-400 text-[15px] p-4 focus:bg-white focus:border-morandi-sage/30 focus:ring-4 focus:ring-morandi-sage/10 resize-none leading-relaxed transition-all outline-none shadow-inner"
                rows={1}
                disabled={isProcessing}
              />
               
              <div className="absolute right-2 bottom-2 flex gap-1">
                 {text.trim() && (
                   <button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="p-2 rounded-xl bg-morandi-sage text-white hover:bg-[#859188] hover:shadow-lg shadow-morandi-sage/20 transition-all active:scale-95 flex items-center justify-center"
                   >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                   </button>
                 )}
              </div>
          </div>
        </div>

        {/* Bottom Filter Bar - Attached like a pill */}
        <div className="bg-white/40 backdrop-blur-md rounded-[28px] mx-1 mb-1 p-1 flex items-center justify-between border-t border-white/20">
            <FilterButton type="ALL" label="All" icon={Layers} />
            <div className="w-px h-4 bg-gray-300/50"></div>
            <FilterButton type={NoteType.IDEA} label="Idea" icon={Lightbulb} />
            <FilterButton type={NoteType.ACTION} label="Todo" icon={CheckSquare} />
            <FilterButton type={NoteType.QUERY} label="Ask" icon={HelpCircle} />
        </div>

      </div>
    </div>
  );
});