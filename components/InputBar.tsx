import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2, Lightbulb, CheckSquare, HelpCircle, Layers, GripHorizontal, Sparkles } from 'lucide-react';
import { NoteType } from '@/types';

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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
      className={`group relative flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 border
        ${activeFilter === type 
          ? 'bg-morandi-sage text-white border-transparent shadow-md shadow-morandi-sage/30' 
          : 'bg-transparent text-gray-500 border-transparent hover:bg-white/50 hover:text-gray-800'}`}
      title={label}
    >
      <Icon className={`w-3 h-3 transition-colors ${activeFilter === type ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className={activeFilter === type ? 'inline-block' : 'hidden group-hover:inline-block'}>{label}</span>
    </button>
  );

  return (
    <div ref={ref} className="z-[1000] w-[280px] animate-in slide-in-from-bottom-10 fade-in duration-500">
      {/* Main Glass Container - High Blur, White Tint */}
      <div className="bg-white/50 backdrop-blur-2xl border border-white/50 rounded-[20px] p-1 shadow-[0_30px_60px_-15px_rgba(148,159,151,0.3)] ring-1 ring-white/40 relative">
        
        {/* Inner Content Padding */}
        <div className="px-4 pt-3 pb-2.5">
          
          {/* Header */}
          <div className="input-drag-handle flex justify-between items-center mb-3 cursor-move active:cursor-grabbing group">
             <div className="flex items-center select-none">
                <span className="font-sans font-bold text-[13px] text-gray-600 leading-6 tracking-normal">MindSpark</span>
             </div>
             <div className="flex items-center gap-2">
                 {text.trim() && (
                   <button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="p-1.5 rounded-lg bg-morandi-sage text-white hover:bg-[#859188] hover:shadow-lg shadow-morandi-sage/20 transition-all active:scale-95 flex items-center justify-center"
                   >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                   </button>
                 )}
                 <GripHorizontal className="w-3.5 h-3.5 text-gray-300 group-hover:text-morandi-sage transition-colors" />
             </div>
          </div>

          {/* Text Input Area - Multi-line */}
          <div className="relative group mb-1.5">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Capture a thought..."
                className="w-full bg-white/40 border border-transparent rounded-xl text-gray-700 placeholder-gray-400 text-[13px] p-3 focus:bg-white focus:border-morandi-sage/30 focus:ring-3 focus:ring-morandi-sage/10 resize-none leading-relaxed transition-all outline-none shadow-inner min-h-[60px]"
                rows={2}
                disabled={isProcessing}
              />
          </div>
        </div>

        {/* Bottom Filter Bar - Attached like a pill */}
        <div className="bg-white/40 backdrop-blur-md rounded-[18px] mx-1 mb-1 p-0.5 flex items-center justify-between border-t border-white/20">
            <FilterButton type="ALL" label="All" icon={Layers} />
            <div className="w-px h-3 bg-gray-300/50"></div>
            <FilterButton type={NoteType.IDEA} label="Idea" icon={Lightbulb} />
            <FilterButton type={NoteType.ACTION} label="Todo" icon={CheckSquare} />
            <FilterButton type={NoteType.QUERY} label="Ask" icon={HelpCircle} />
        </div>

      </div>
    </div>
  );
});