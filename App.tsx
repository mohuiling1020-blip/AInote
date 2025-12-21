'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Draggable from 'react-draggable';
import { Settings, Key, X } from 'lucide-react';

import { Note, NoteStatus, NoteType, UserSettings, ModelType } from '@/types';
import { processNote } from '@/services/apiService';
import { InputBar } from '@/components/InputBar';
import { NoteCard } from '@/components/NoteCard';

const STORAGE_KEY_NOTES = 'mindspark_notes_v2';
const STORAGE_KEY_SETTINGS = 'mindspark_settings_v1';

const App: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<NoteType | 'ALL'>('ALL');
  const [settings, setSettings] = useState<UserSettings>({
    apiKey: '',
    autoProcess: true,
    model: 'gemini-flash',
  });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  // Manage refs for draggable items
  const notesRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());
  const inputBarRef = useRef<HTMLDivElement>(null);

  // Helper to ensure we have a stable ref for each ID
  const getNoteRef = (id: string) => {
    if (!notesRefs.current.has(id)) {
      notesRefs.current.set(id, React.createRef());
    }
    return notesRefs.current.get(id)!;
  };

  // Set window size on client side
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load from local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }

    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Ensure model is set, default to gemini-flash
        if (!parsed.model) parsed.model = 'gemini-flash';
        setSettings(parsed);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Save notes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  };

  const getMaxZIndex = () => {
    if (notes.length === 0) return 1;
    return Math.max(...notes.map(n => n.zIndex || 1));
  };

  const handleCreateNote = async (content: string) => {
    // Ensure card is visible in viewport
    const cardWidth = 280;
    const cardHeight = 180;
    const x = Math.max(20, Math.min(windowSize.width / 2 - cardWidth / 2, windowSize.width - cardWidth - 20));
    const y = Math.max(20, Math.min(windowSize.height / 2 - cardHeight / 2, windowSize.height - cardHeight - 20));

    const newNote: Note = {
      id: uuidv4(),
      originalContent: content,
      status: NoteStatus.PENDING,
      type: NoteType.UNCLASSIFIED,
      createdAt: Date.now(),
      position: { x, y },
      zIndex: getMaxZIndex() + 1
    };

    setNotes(prev => [...prev, newNote]);

    // Always process note (API key is stored on backend)
    processNoteHandler(newNote.id, content);
  };

  const processNoteHandler = useCallback(async (noteId: string, content: string) => {
    setIsProcessing(true);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: NoteStatus.PROCESSING } : n));

    try {
      const aiResponse = await processNote(content, settings.model);
      
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            status: NoteStatus.COMPLETED,
            type: aiResponse.intent, 
            aiResponse: aiResponse
          };
        }
        return n;
      }));
    } catch (error: any) {
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            status: NoteStatus.ERROR,
            errorMessage: error.message || "Unknown error"
          };
        }
        return n;
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [settings.model]);

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (notesRefs.current.has(id)) {
        notesRefs.current.delete(id);
    }
  };

  const handleDragStop = (id: string, e: any, data: {x: number, y: number}) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, position: { x: data.x, y: data.y } } : n
    ));
  };

  const bringToFront = (id: string) => {
    const maxZ = getMaxZIndex();
    setNotes(prev => {
        const note = prev.find(n => n.id === id);
        if (note && note.zIndex === maxZ) return prev; 
        return prev.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n);
    });
  };

  const filteredNotes = filter === 'ALL' ? notes : notes.filter(n => n.type === filter);

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-morandi-cream/50" style={{ minHeight: '100vh' }}>
      
      {/* 
        BACKGROUND: 4 Specific Gaussian Blur Circles on Transparent Base
        Colors: 
        1. Sage: #949F97
        2. Cream: #EBE2AA
        3. Mint: #C8D5C5
        4. Beige: #EEE9D0
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
          
          {/* 0. Small Cream (#EBE2AA) - Top Left accent */}
          <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60"></div>

          {/* 1. Sage (#949F97浅绿) - Deepest tone, Bottom Left anchor */}
          <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60 animate-float-slow"></div>

          {/* 2. Cream (#EBE2AA深黄) - Warm light, Top Right */}
          <div className="absolute top-[8%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#EBE2AA] blur-[150px] opacity-85 animate-float-medium"></div>

          {/* 3. Mint (#C8D5C5深绿) - Fresh tone, Top Left */}
          <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80 animate-float-fast"></div>

          {/* 4. Beige (#EEE9D0奶黄) - Subtle base, Bottom Right */}
          <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60 animate-float-slow"></div>

          {/* Texture Overlay - Subtle Grain */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
          
      </div>

      {/* Settings Button */}
      <button 
        onClick={() => setSettingsOpen(true)}
        className="absolute top-6 right-6 z-50 p-3 bg-white/30 backdrop-blur-md hover:bg-white/60 rounded-full text-gray-600 hover:text-gray-900 transition-all shadow-sm border border-white/40 active:scale-95 group ring-1 ring-white/40"
      >
        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-700 ease-out" />
      </button>

      {/* Settings Modal - Glass */}
      {settingsOpen && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-morandi-sage/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(148,159,151,0.2)] p-8 w-[420px] max-w-[90%] border border-white/60 ring-1 ring-white/80">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-serif text-gray-800 flex items-center gap-2">
                 <span>Settings</span>
               </h2>
               <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-black/5 rounded-full">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 font-sans leading-relaxed">
              Select the AI model to use for processing your notes. API keys are securely stored on the server.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSettings({ model: 'gemini-flash' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                      settings.model === 'gemini-flash'
                        ? 'bg-morandi-sage text-white border-transparent shadow-md'
                        : 'bg-white/50 border-gray-200/50 text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <div className="font-medium">Gemini Flash</div>
                    <div className="text-xs opacity-80 mt-1">Fast & efficient</div>
                  </button>
                  <button
                    onClick={() => updateSettings({ model: 'qwen3-max' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                      settings.model === 'qwen3-max'
                        ? 'bg-morandi-sage text-white border-transparent shadow-md'
                        : 'bg-white/50 border-gray-200/50 text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <div className="font-medium">Qwen3 Max</div>
                    <div className="text-xs opacity-80 mt-1">Advanced reasoning</div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button 
                onClick={() => setSettingsOpen(false)}
                className="px-8 py-2.5 bg-morandi-sage text-white text-sm font-medium rounded-full hover:bg-[#859188] shadow-lg shadow-morandi-sage/20 transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="absolute inset-0 z-10 w-full h-full">
         {filteredNotes.map(note => {
            const nodeRef = getNoteRef(note.id);
            return (
              <Draggable
                key={note.id}
                defaultPosition={note.position}
                onStop={(e, data) => handleDragStop(note.id, e, data)}
                nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                onMouseDown={() => bringToFront(note.id)}
              >
                <NoteCard 
                  ref={nodeRef}
                  note={note} 
                  style={{ zIndex: note.zIndex }}
                  onRetry={processNoteHandler}
                  onUpdate={handleUpdateNote}
                  onClose={handleDeleteNote}
                />
              </Draggable>
            );
         })}
      </div>

      {/* Input Dock */}
      <Draggable 
        nodeRef={inputBarRef}
        handle=".input-drag-handle"
        defaultPosition={{x: 40, y: windowSize.height - 800}}
      >
         <div ref={inputBarRef} className="absolute z-[1500]">
            <InputBar 
              onSubmit={handleCreateNote} 
              isProcessing={isProcessing} 
              onFilterChange={setFilter}
              activeFilter={filter}
            />
         </div>
      </Draggable>

    </div>
  );
};

export default App;