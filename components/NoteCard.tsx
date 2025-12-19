import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Note, NoteType, NoteStatus } from '@/types';
import { 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Link as LinkIcon, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X // Import X icon
} from 'lucide-react';

interface NoteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note;
  onRetry?: (id: string, content: string) => void;
  onUpdate?: (id: string, updates: Partial<Note>) => void;
  onClose?: (id: string) => void; // Add onClose prop
}

// "Morandi" Strict Palette Config
// #949F97 (Sage)
// #EBE2AA (Cream)
// #C8D5C5 (Mint)
// #EEE9D0 (Beige)
const ThemeConfig = {
  [NoteType.IDEA]: {
    icon: Lightbulb,
    label: 'Idea',
    // Cream Theme
    colorText: 'text-[#9C9460]', 
    borderColor: 'border-[#EBE2AA]/50',
    bgTint: 'bg-[#EBE2AA]/10',
    iconBg: 'bg-[#EBE2AA]',
  },
  [NoteType.ACTION]: {
    icon: CheckCircle2,
    label: 'Action',
    // Sage Theme
    colorText: 'text-[#5E6661]',
    borderColor: 'border-[#949F97]/50',
    bgTint: 'bg-[#949F97]/10',
    iconBg: 'bg-[#949F97]',
  },
  [NoteType.QUERY]: {
    icon: HelpCircle,
    label: 'Query',
    // Mint Theme
    colorText: 'text-[#6D7A70]',
    borderColor: 'border-[#C8D5C5]/50',
    bgTint: 'bg-[#C8D5C5]/10',
    iconBg: 'bg-[#C8D5C5]',
  },
  [NoteType.RESOURCE]: {
    icon: LinkIcon,
    label: 'Link',
    // Beige/Warm Grey Theme
    colorText: 'text-[#8A847C]',
    borderColor: 'border-[#EEE9D0]/50', // Using base beige but slightly darker in UI implies utilizing shadows/borders
    bgTint: 'bg-[#EEE9D0]/20',
    iconBg: 'bg-[#D3C4BE]', // Slightly darker beige for icon visibility
  },
  [NoteType.UNCLASSIFIED]: {
    icon: Sparkles,
    label: 'Note',
    colorText: 'text-gray-500',
    borderColor: 'border-white/50',
    bgTint: 'bg-white/10',
    iconBg: 'bg-white',
  }
};

export const NoteCard = React.forwardRef<HTMLDivElement, NoteCardProps>(({ note, style, className, onRetry, onUpdate, onClose, ...props }, ref) => {
  if (!note) return null;

  const theme = ThemeConfig[note.type] || ThemeConfig[NoteType.UNCLASSIFIED];
  const Icon = theme.icon;
  const isProcessing = note.status === NoteStatus.PROCESSING;
  const isPending = note.status === NoteStatus.PENDING;
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const formattedTime = useMemo(() => {
    try {
      const date = note.createdAt ? new Date(note.createdAt) : new Date();
      if (isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch (e) {
      return '';
    }
  }, [note.createdAt]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (note.aiResponse?.content) {
      navigator.clipboard.writeText(note.aiResponse.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRetry) {
      onRetry(note.id, note.originalContent);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose(note.id);
    }
  };

  const toggleTodoItem = (index: number) => {
    if (!onUpdate) return;
    const currentChecked = note.checkedIndices || [];
    const newChecked = currentChecked.includes(index)
      ? currentChecked.filter(i => i !== index)
      : [...currentChecked, index];
    onUpdate(note.id, { checkedIndices: newChecked });
  };

  const cleanContentString = (text: any) => {
    if (typeof text !== 'string') return "";
    return text.replace(/\\n/g, '\n');
  };

  const renderActionContent = () => {
    if (!note.aiResponse?.content) return null;
    
    const content = cleanContentString(note.aiResponse.content);
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    return (
      <div className="flex flex-col gap-2 mt-2">
        {lines.map((line, idx) => {
          const isChecked = note.checkedIndices?.includes(idx);
          const cleanLine = line.replace(/^[-*]\s/, '').replace(/^\[[ x]\]\s/, '');
          
          return (
            <div 
              key={idx}
              className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent 
                ${isChecked ? 'bg-morandi-sage/10 opacity-60' : 'hover:bg-white/40 hover:shadow-sm'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleTodoItem(idx);
              }}
            >
               <div className={`mt-0.5 w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all duration-300
                  ${isChecked 
                    ? 'bg-morandi-sage border-transparent text-white'
                    : 'bg-transparent border-gray-400 group-hover:border-morandi-sage'
                  }`}
               >
                 {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
               </div>
               
               <div className={`flex-1 text-[13px] leading-relaxed transition-all duration-300 ${isChecked ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                 <ReactMarkdown>{cleanLine}</ReactMarkdown>
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={ref}
      style={style}
      // Card Style: High-End Frosted Glass
      // - Higher backdrop blur (2xl)
      // - Lower opacity background (white/30 to white/40)
      // - Thinner, more transparent borders
      className={`absolute w-[360px] rounded-[24px] backdrop-blur-2xl transition-all duration-300 ease-out cursor-grab active:cursor-grabbing flex flex-col overflow-hidden group 
        bg-white/40 border border-white/50 shadow-[0_15px_40px_-10px_rgba(148,159,151,0.25)] ring-1 ring-white/30
        hover:shadow-[0_25px_50px_-12px_rgba(148,159,151,0.35)] hover:bg-white/50 hover:scale-[1.01]
        ${theme.bgTint}
        ${isExpanded ? '' : ''}
        ${className || ''}`}
      {...props}
    >
      {/* 1. Header Area */}
      <div className="relative px-6 py-5 border-b border-white/10 flex-shrink-0 z-10">
        
        {/* Top Row: Badge & Actions */}
        <div className="flex justify-between items-center mb-3">
          {/* Badge */}
          <div className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm bg-white/40 backdrop-blur-md ring-1 ring-white/60 ${theme.colorText}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-white ${theme.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
             </div>
             {theme.label}
          </div>
          
          {/* Actions - Minimalist dots or glass buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/30 rounded-full p-0.5 border border-white/40 shadow-sm backdrop-blur-sm">
             <button onClick={handleRetry} className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-white/80" title="Retry">
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
             </button>
             <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-white/80" title="Copy Content">
                {isCopied ? <Check className="w-3.5 h-3.5 text-morandi-sage" /> : <Copy className="w-3.5 h-3.5" />}
             </button>
             <button onClick={toggleExpand} className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-white/80" title={isExpanded ? "Collapse" : "Expand"}>
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
             </button>
             {/* Divider */}
             <div className="w-[1px] h-3 bg-gray-400/30 mx-0.5"></div>
             {/* Close Button */}
             <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-white/80" title="Close">
                <X className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        {/* Title */}
        <div className="relative mt-1">
           {isProcessing ? (
             <h3 className="font-medium text-gray-400 animate-pulse text-sm tracking-tight flex items-center gap-2">
               <span className="w-2 h-2 bg-morandi-sage rounded-full animate-bounce"></span>
               Thinking...
             </h3>
           ) : (
             <h3 className="font-serif font-semibold text-[19px] text-gray-800 leading-tight tracking-tight">
                {note.aiResponse?.title || note.originalContent}
             </h3>
           )}
           <div className="absolute right-0 top-1 text-[10px] text-gray-500/80 font-sans tracking-wide">
             {formattedTime}
           </div>
        </div>
      </div>

      {/* 2. Content Body */}
      <div 
        className={`relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
          ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} 
          ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        
        {/* Error State */}
        {note.status === NoteStatus.ERROR && (
           <div className="px-6 py-4 m-4 bg-red-50/50 border border-red-100 rounded-2xl flex gap-3 items-center backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs text-red-600 font-medium">
                 {note.errorMessage || "An unexpected error occurred."}
              </div>
           </div>
        )}

        {/* Pending State - Show original content */}
        {note.status === NoteStatus.PENDING && !note.aiResponse && (
          <div className="px-6 pb-6 pt-2">
            <div className="text-[14px] text-gray-500 leading-7 font-normal font-sans tracking-normal italic">
              {note.originalContent}
            </div>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-morandi-sage rounded-full animate-pulse"></span>
              Waiting for API key...
            </div>
          </div>
        )}

        {/* Success Content */}
        {!isProcessing && note.status !== NoteStatus.ERROR && note.aiResponse && (
          <div className="px-6 pb-6 pt-2">
             
             {/* Divider for Action Items */}
             {note.type === NoteType.ACTION && (
               <div className="w-full h-px bg-black/5 mb-4"></div>
             )}

             {/* Main Text Content */}
             {note.type === NoteType.ACTION ? (
                renderActionContent()
             ) : (
                <div className="text-[14px] text-gray-600 leading-7 font-normal font-sans tracking-normal">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-gray-700" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-4 marker:text-gray-400" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-4 marker:text-gray-400" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1 pl-1" {...props} />,
                      h1: ({node, ...props}) => <h1 className="font-bold text-base text-gray-900 mb-2 mt-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="font-semibold text-sm text-gray-800 mb-2 mt-4" {...props} />,
                      h3: ({node, ...props}) => <h3 className="font-medium text-xs text-gray-500 mb-2 mt-3 uppercase tracking-wider" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className={`border-l-2 pl-4 py-1 italic text-gray-500 my-4 ${theme.borderColor}`} {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                      code: ({node, ...props}) => <code className="bg-white/40 border border-white/40 px-1.5 py-0.5 rounded text-gray-700 font-mono text-[11px] shadow-sm mx-0.5 backdrop-blur-md" {...props} />,
                      a: ({node, ...props}) => <a className={`text-gray-900 hover:text-gray-600 underline decoration-gray-400 underline-offset-4 transition-colors`} {...props} />
                    }}
                  >
                    {cleanContentString(note.aiResponse.content)}
                  </ReactMarkdown>
                </div>
             )}

             {/* Footer Tags - Clean Capsules */}
             {note.aiResponse.meta?.tags && note.aiResponse.meta.tags.length > 0 && (
                <div className="mt-6 flex items-center gap-2 flex-wrap pt-4 border-t border-black/5">
                   {note.aiResponse.meta.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-gray-500 bg-white/30 px-3 py-1 rounded-full border border-white/50 hover:border-black/10 hover:bg-white/60 hover:text-gray-800 transition-all cursor-default select-none shadow-sm backdrop-blur-sm">
                        #{tag}
                      </span>
                   ))}
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
});