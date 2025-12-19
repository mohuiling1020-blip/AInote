import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Draggable from 'react-draggable';
import { Settings, Key, X } from 'lucide-react';

import { Note, NoteStatus, NoteType, UserSettings } from './types';
import { processNoteWithGemini } from './services/geminiService';
import { InputBar } from './components/InputBar';
import { NoteCard } from './components/NoteCard';

const STORAGE_KEY_NOTES = 'mindspark_notes_v2';
const STORAGE_KEY_SETTINGS = 'mindspark_settings_v1';

const App: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<NoteType | 'ALL'>('ALL');
  const [settings, setSettings] = useState<UserSettings>({
    apiKey: process.env.API_KEY || '',
    autoProcess: true,
  });

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

  // Load from local storage
  useEffect(() => {
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
        if (process.env.API_KEY) parsed.apiKey = process.env.API_KEY;
        setSettings(parsed);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    } else if (process.env.API_KEY) {
       setSettings(prev => ({...prev, apiKey: process.env.API_KEY || ''}));
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
    const x = (window.innerWidth / 2) - 170;
    const y = (window.innerHeight / 2) - 100;

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

    if (settings.apiKey) {
      processNote(newNote.id, content);
    } else {
       setSettingsOpen(true);
    }
  };

  const processNote = useCallback(async (noteId: string, content: string) => {
    setIsProcessing(true);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: NoteStatus.PROCESSING } : n));

    try {
      const aiResponse = await processNoteWithGemini(content, settings.apiKey);
      
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
  }, [settings.apiKey]);

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
    <div className="relative w-full h-full overflow-hidden bg-[#F2F0E6] selection:bg-morandi-cream/50">
      
      {/* 
        BACKGROUND: Light & Airy Morandi Diffuse
        Key adjustments from user feedback:
        1. Base color is lighter (#F2F0E6).
        2. Removed 'mix-blend-multiply' to avoid heavy/dark colors.
        3. Increased White and Cream presence significantly.
        4. Added distinct Gaussian blur circles (Shapes) that float.
      */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          
          {/* Base Gradient - Very Subtle Warmth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F2F0E6] via-[#EEE9D0] to-[#E6E1C5] opacity-40"></div>

          {/* --- The Gaussian Blur Shapes --- */}

          {/* Shape 1: Large Cream Light (Top Right) - The main light source, dominating the feel */}
          <div className="absolute -top-[20%] -right-[20%] w-[90vw] h-[90vw] rounded-full bg-[#EBE2AA] blur-[160px] opacity-50 animate-float-slow"></div>

          {/* Shape 2: Mint Freshness (Top Left) - Airy and light */}
          <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#C8D5C5] blur-[130px] opacity-60 animate-float-medium"></div>

          {/* Shape 3: Pure White Highlight (Center/Top) - Brightens the middle canvas */}
          <div className="absolute top-[5%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-white blur-[120px] opacity-80 animate-pulse-slow"></div>

          {/* Shape 4: Sage Grounding (Bottom Left) - Kept subtle and transparent to avoid heaviness */}
          <div className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-[#949F97] blur-[180px] opacity-25 animate-float-fast"></div>

          {/* Shape 5: Distinct Mint Accent (Mid Left) - Floating distinct shape */}
          <div className="absolute top-[35%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#C8D5C5] blur-[80px] opacity-50 animate-float-slow" style={{animationDelay: '1s'}}></div>

          {/* Shape 6: Cream/Beige Accent (Bottom Right) - Balancing the sage */}
          <div className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-[#EBE2AA] blur-[120px] opacity-40 animate-float-medium" style={{animationDelay: '3s'}}></div>
          
          {/* Shape 7: Small Sage Accent (Top Right floating) - A touch of contrast */}
          <div className="absolute top-[20%] right-[15%] w-[20vw] h-[20vw] rounded-full bg-[#949F97] blur-[100px] opacity-20 animate-float-fast" style={{animationDelay: '2s'}}></div>


          {/* Texture & Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
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
              To activate the neural engine, please provide your API Key. It remains stored strictly on your device.
            </p>

            <div className="relative">
              <input 
                type="password" 
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-white/50 rounded-xl border border-gray-200/50 shadow-inner focus:border-morandi-sage focus:ring-1 focus:ring-morandi-sage/50 py-3.5 px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 font-mono"
              />
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
                  onRetry={processNote}
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
        defaultPosition={{x: 40, y: window.innerHeight - 300}}
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