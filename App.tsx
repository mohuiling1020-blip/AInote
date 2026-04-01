'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import Draggable from 'react-draggable';
import { Settings, Loader2, Telescope } from 'lucide-react';

import { Note, NoteStatus, NoteType, DbNote, dbNoteToNote, noteToDbFields } from '@/types';
import { processNote, fetchNotes, createNote, updateNote as apiUpdateNote, deleteNote as apiDeleteNote, batchCreateNotes } from '@/services/apiService';
import { InputBar } from '@/components/InputBar';
import { NoteCard } from '@/components/NoteCard';
import AccountOverview from '@/components/settings/AccountOverview';

const STORAGE_KEY_NOTES_LEGACY = 'mindspark_notes_v2';
const STORAGE_KEY_MIGRATED = 'mindspark_migrated';

const App: React.FC = () => {
  const { user, isLoaded: isUserLoaded } = useUser();

  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<NoteType | 'ALL'>('ALL');
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


  // Load notes from Supabase + migrate localStorage if needed
  useEffect(() => {
    if (!isUserLoaded || !user) return;

    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // Check if we need to migrate localStorage data
        const hasMigrated = localStorage.getItem(STORAGE_KEY_MIGRATED);
        const legacyNotes = localStorage.getItem(STORAGE_KEY_NOTES_LEGACY);

        if (!hasMigrated && legacyNotes) {
          try {
            const parsed: Note[] = JSON.parse(legacyNotes);
            if (parsed.length > 0) {
              const dbFields = parsed.map(note => noteToDbFields(note));
              await batchCreateNotes(dbFields);
              localStorage.setItem(STORAGE_KEY_MIGRATED, 'true');
              localStorage.removeItem(STORAGE_KEY_NOTES_LEGACY);
            }
          } catch (e) {
            console.error('Migration failed:', e);
          }
        }

        // Fetch notes from API
        const dbNotes = await fetchNotes();
        const frontendNotes = dbNotes.map(dbNoteToNote);
        setNotes(frontendNotes);
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [isUserLoaded, user]);

  const getMaxZIndex = () => {
    if (notes.length === 0) return 1;
    return Math.max(...notes.map(n => n.zIndex || 1));
  };

  const handleCreateNote = async (content: string) => {
    const cardWidth = 280;
    const cardHeight = 180;
    const x = Math.max(20, Math.min(windowSize.width / 2 - cardWidth / 2, windowSize.width - cardWidth - 20));
    const y = Math.max(20, Math.min(windowSize.height / 2 - cardHeight / 2, windowSize.height - cardHeight - 20));
    const zIndex = getMaxZIndex() + 1;

    try {
      // Create note in database first
      const dbNote = await createNote({
        content,
        type: 'Unclassified',
        status: 'pending',
        position_x: x,
        position_y: y,
        z_index: zIndex,
      });

      const newNote = dbNoteToNote(dbNote);
      setNotes(prev => [...prev, newNote]);

      // Process with AI
      processNoteHandler(newNote.id, content).catch(console.error);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const processNoteHandler = useCallback(async (noteId: string, content: string) => {
    setIsProcessing(true);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: NoteStatus.PROCESSING } : n));

    // Update status in DB
    apiUpdateNote(noteId, { status: 'processing' }).catch(console.error);

    try {
      const aiResponse = await processNote(content, 'gemini-flash');

      const updatedNote: Partial<Note> = {
        status: NoteStatus.COMPLETED,
        type: aiResponse.intent,
        aiResponse,
      };

      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updatedNote } : n));

      // Persist AI result to DB
      await apiUpdateNote(noteId, {
        status: 'completed',
        type: aiResponse.intent,
        title: aiResponse.title,
        processed_content: aiResponse.content,
        tags: aiResponse.meta.tags,
        suggested_action: aiResponse.meta.suggested_action ?? null,
        deadline: aiResponse.meta.deadline ?? null,
      });
    } catch (error: any) {
      setNotes(prev => prev.map(n =>
        n.id === noteId ? { ...n, status: NoteStatus.ERROR, errorMessage: error.message || 'Unknown error' } : n
      ));
      apiUpdateNote(noteId, { status: 'error' }).catch(console.error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));

    // Persist relevant updates to DB
    const dbUpdates: Record<string, unknown> = {};
    if (updates.checkedIndices !== undefined) dbUpdates.checked_items = updates.checkedIndices;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    if (Object.keys(dbUpdates).length > 0) {
      apiUpdateNote(id, dbUpdates).catch(console.error);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    notesRefs.current.delete(id);
    apiDeleteNote(id).catch(console.error);
  };

  const handleDragStop = (id: string, _e: any, data: { x: number; y: number }) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, position: { x: data.x, y: data.y } } : n
    ));
    apiUpdateNote(id, { position_x: data.x, position_y: data.y }).catch(console.error);
  };

  const bringToFront = (id: string) => {
    const newZ = getMaxZIndex() + 1;
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (note && note.zIndex >= newZ) return prev;
      return prev.map(n => n.id === id ? { ...n, zIndex: newZ } : n);
    });
    apiUpdateNote(id, { z_index: newZ }).catch(console.error);
  };

  const filteredNotes = filter === 'ALL' ? notes : notes.filter(n => n.type === filter);

  // Loading state
  if (!isUserLoaded || isLoading) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
          <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60" />
          <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60" />
          <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80" />
          <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-morandi-sage animate-spin" />
          <span className="text-gray-500 text-sm font-sans">Loading your notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden overflow-y-auto selection:bg-morandi-cream/50">

      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">

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

      {/* Top Right: Daily Review + Settings */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => { window.location.href = '/daily-review'; }}
          className="p-3 bg-white/30 backdrop-blur-md hover:bg-white/60 rounded-full text-gray-600 hover:text-gray-900 transition-all shadow-sm border border-white/40 active:scale-95 group ring-1 ring-white/40"
          title="每日复盘"
        >
          <Telescope className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-3 bg-white/30 backdrop-blur-md hover:bg-white/60 rounded-full text-gray-600 hover:text-gray-900 transition-all shadow-sm border border-white/40 active:scale-95 group ring-1 ring-white/40"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-700 ease-out" />
        </button>
      </div>

      {/* Bottom Left: User Avatar */}
      <div className="fixed bottom-6 left-6 z-50">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9 ring-2 ring-white/40 shadow-sm',
            },
          }}
        />
      </div>

      {/* Account Overview Modal */}
      <AccountOverview isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
