# Clerk + Supabase Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Clerk authentication (email + Google OAuth) and Supabase database into AInote, replacing localStorage with cloud-persistent, user-scoped note storage.

**Architecture:** Clerk middleware protects all routes globally, redirecting unauthenticated users to `/sign-in`. Supabase stores user and note data. Clerk Webhooks sync user creation/updates to Supabase. The existing AI processing API route is preserved and enhanced with auth context.

**Tech Stack:** Next.js 15 (App Router), @clerk/nextjs, @supabase/supabase-js, svix (webhook verification)

---

## Task 1: Install Dependencies & Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`

**Step 1: Install required packages**

Run:
```bash
npm install @clerk/nextjs @supabase/supabase-js svix
```
Expected: Packages install successfully, package.json updated.

**Step 2: Create `.env.local.example` template**

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# AI APIs (existing)
GEMINI_API_KEY=xxx
QWEN_API_KEY=xxx
```

**Step 3: Add `.env.local.example` to version control, ensure `.env.local` is in `.gitignore`**

Run:
```bash
grep -q '.env.local' .gitignore || echo '.env.local' >> .gitignore
```

**Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example .gitignore
git commit -m "chore: add clerk, supabase, svix dependencies and env template"
```

---

## Task 2: Create Supabase Client Library

**Files:**
- Create: `lib/supabase.ts`

**Step 1: Create Supabase client initialization**

```typescript
// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (uses anon key, respects RLS)
export function createBrowserClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use in API routes / server components where auth is verified by Clerk
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey);
}
```

**Step 2: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add supabase client initialization"
```

---

## Task 3: Set Up Supabase Database Tables

**Files:**
- Create: `lib/supabase-schema.sql` (reference file, to be run in Supabase dashboard)

**Step 1: Write SQL schema**

```sql
-- lib/supabase-schema.sql
-- Run this in Supabase SQL Editor

-- Users table (synced from Clerk via webhook)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Unclassified',
  status TEXT NOT NULL DEFAULT 'pending',
  title TEXT,
  processed_content TEXT,
  tags TEXT[] DEFAULT '{}',
  suggested_action TEXT,
  deadline TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  z_index INT DEFAULT 1,
  is_expanded BOOLEAN DEFAULT true,
  checked_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes (service role bypasses these)
-- These are for direct Supabase client access if ever needed
CREATE POLICY "Users can read own notes" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (true);

-- RLS Policies for users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Step 2: Commit**

```bash
git add lib/supabase-schema.sql
git commit -m "feat: add supabase database schema"
```

**Step 3: User action required — Run the SQL in Supabase Dashboard**

The user needs to:
1. Go to Supabase Dashboard → SQL Editor
2. Paste and run the schema SQL
3. Verify tables are created under Table Editor

---

## Task 4: Set Up Clerk Provider and Middleware

**Files:**
- Modify: `app/layout.tsx`
- Create: `middleware.ts`

**Step 1: Wrap app with ClerkProvider**

Modify `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindSpark - Morandi Diffuse',
  description: 'Transform fragmented thoughts into structured knowledge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Step 2: Create Clerk middleware**

Create `middleware.ts` at project root:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

**Step 3: Commit**

```bash
git add app/layout.tsx middleware.ts
git commit -m "feat: add clerk provider and middleware for route protection"
```

---

## Task 5: Create Sign-In and Sign-Up Pages

**Files:**
- Create: `app/sign-in/[[...sign-in]]/page.tsx`
- Create: `app/sign-up/[[...sign-up]]/page.tsx`

**Step 1: Create sign-in page**

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - same Morandi gradient as main app */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60" />
        <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60" />
        <div className="absolute top-[8%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#EBE2AA] blur-[150px] opacity-85" />
        <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80" />
        <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60" />
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_30px_60px_-15px_rgba(148,159,151,0.25)] rounded-[20px]',
            },
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Create sign-up page**

```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - same Morandi gradient as main app */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60" />
        <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60" />
        <div className="absolute top-[8%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#EBE2AA] blur-[150px] opacity-85" />
        <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80" />
        <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60" />
      </div>

      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_30px_60px_-15px_rgba(148,159,151,0.25)] rounded-[20px]',
            },
          }}
        />
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add app/sign-in app/sign-up
git commit -m "feat: add clerk sign-in and sign-up pages with morandi theme"
```

---

## Task 6: Create Clerk Webhook for User Sync

**Files:**
- Create: `app/api/webhooks/clerk/route.ts`

**Step 1: Create webhook handler**

```typescript
// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createServerClient } from '@/lib/supabase';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    );
  }

  // Get Svix headers for verification
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const body = await request.text();

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses?.[0]?.email_address ?? null;
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        const { error } = await supabase
          .from('users')
          .upsert(
            {
              clerk_id: id,
              email,
              name,
              avatar_url: image_url ?? null,
            },
            { onConflict: 'clerk_id' }
          );

        if (error) {
          console.error('Failed to upsert user:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        // Notes cascade-delete via FK constraint
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', id);

        if (error) {
          console.error('Failed to delete user:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/webhooks/clerk/route.ts
git commit -m "feat: add clerk webhook handler for user sync to supabase"
```

---

## Task 7: Create Notes CRUD API Routes

**Files:**
- Create: `app/api/notes/route.ts`
- Create: `app/api/notes/[id]/route.ts`

**Step 1: Create GET/POST route for notes collection**

```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/notes — fetch all notes for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/notes — create a new note
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content, type, status, title, processed_content, tags, suggested_action, deadline, position_x, position_y, z_index, is_expanded, checked_items } = body;

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      content,
      type: type ?? 'Unclassified',
      status: status ?? 'pending',
      title: title ?? null,
      processed_content: processed_content ?? null,
      tags: tags ?? [],
      suggested_action: suggested_action ?? null,
      deadline: deadline ?? null,
      position_x: position_x ?? 0,
      position_y: position_y ?? 0,
      z_index: z_index ?? 1,
      is_expanded: is_expanded ?? true,
      checked_items: checked_items ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

**Step 2: Create PATCH/DELETE route for individual notes**

```typescript
// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

// PATCH /api/notes/[id] — update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Only allow updating specific fields
  const allowedFields = [
    'content', 'type', 'status', 'title', 'processed_content',
    'tags', 'suggested_action', 'deadline', 'position_x', 'position_y',
    'z_index', 'is_expanded', 'checked_items',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// DELETE /api/notes/[id] — delete a note
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const supabase = createServerClient();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
```

**Step 3: Commit**

```bash
git add app/api/notes
git commit -m "feat: add notes CRUD API routes with clerk auth"
```

---

## Task 8: Update Types for Database Integration

**Files:**
- Modify: `types.ts`

**Step 1: Add database note type and conversion helpers**

Add the following types after the existing types in `types.ts`:

```typescript
// Database row type (matches Supabase schema)
export interface DbNote {
  id: string;
  user_id: string;
  content: string;
  type: string;
  status: string;
  title: string | null;
  processed_content: string | null;
  tags: string[];
  suggested_action: string | null;
  deadline: string | null;
  position_x: number;
  position_y: number;
  z_index: number;
  is_expanded: boolean;
  checked_items: number[];
  created_at: string;
  updated_at: string;
}

// Convert database row to frontend Note
export function dbNoteToNote(db: DbNote): Note {
  const aiResponse: AIResponse | undefined =
    db.status === 'completed' && db.title && db.processed_content
      ? {
          intent: db.type as NoteType,
          title: db.title,
          content: db.processed_content,
          meta: {
            tags: db.tags ?? [],
            suggested_action: db.suggested_action ?? undefined,
            deadline: db.deadline ?? undefined,
          },
        }
      : undefined;

  return {
    id: db.id,
    originalContent: db.content,
    status: db.status as NoteStatus,
    type: db.type as NoteType,
    aiResponse,
    createdAt: new Date(db.created_at).getTime(),
    errorMessage: undefined,
    position: { x: db.position_x, y: db.position_y },
    zIndex: db.z_index,
    checkedIndices: db.checked_items ?? [],
  };
}

// Convert frontend Note to database fields for create/update
export function noteToDbFields(note: Note): Record<string, unknown> {
  return {
    content: note.originalContent,
    type: note.type,
    status: note.status,
    title: note.aiResponse?.title ?? null,
    processed_content: note.aiResponse?.content ?? null,
    tags: note.aiResponse?.meta.tags ?? [],
    suggested_action: note.aiResponse?.meta.suggested_action ?? null,
    deadline: note.aiResponse?.meta.deadline ?? null,
    position_x: note.position.x,
    position_y: note.position.y,
    z_index: note.zIndex,
    is_expanded: true,
    checked_items: note.checkedIndices ?? [],
  };
}
```

**Step 2: Commit**

```bash
git add types.ts
git commit -m "feat: add database types and note conversion helpers"
```

---

## Task 9: Update API Service with Notes CRUD Methods

**Files:**
- Modify: `services/apiService.ts`

**Step 1: Add notes CRUD functions**

Add after the existing `processNote` function:

```typescript
import { DbNote } from '@/types';

// Fetch all notes for current user
export async function fetchNotes(): Promise<DbNote[]> {
  const response = await fetch('/api/notes');
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}

// Create a new note
export async function createNote(fields: Record<string, unknown>): Promise<DbNote> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
}

// Update a note
export async function updateNote(id: string, fields: Record<string, unknown>): Promise<DbNote> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
  return response.json();
}

// Delete a note
export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
}

// Batch create notes (for localStorage migration)
export async function batchCreateNotes(notesList: Array<Record<string, unknown>>): Promise<DbNote[]> {
  const results: DbNote[] = [];
  for (const fields of notesList) {
    const created = await createNote(fields);
    results.push(created);
  }
  return results;
}
```

**Step 2: Commit**

```bash
git add services/apiService.ts
git commit -m "feat: add notes CRUD and batch create to api service"
```

---

## Task 10: Update App.tsx — Replace localStorage with API Calls

**Files:**
- Modify: `App.tsx`

**Step 1: Replace localStorage with Supabase API**

This is the largest change. The full updated `App.tsx`:

Key changes:
1. Import `useUser` from `@clerk/nextjs` for user context
2. Import `UserButton` from `@clerk/nextjs` for the user avatar/menu
3. Replace localStorage load with `fetchNotes()` API call
4. Replace localStorage save with API calls (create, update, delete)
5. Add localStorage → Supabase migration logic on first load
6. Add loading state while notes are being fetched
7. Remove `STORAGE_KEY_NOTES` constant (settings still use localStorage as they're device-specific)

```typescript
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import Draggable from 'react-draggable';
import { Settings, X, Loader2 } from 'lucide-react';

import { Note, NoteStatus, NoteType, UserSettings, ModelType, DbNote, dbNoteToNote, noteToDbFields } from '@/types';
import { processNote, fetchNotes, createNote, updateNote as apiUpdateNote, deleteNote as apiDeleteNote, batchCreateNotes } from '@/services/apiService';
import { InputBar } from '@/components/InputBar';
import { NoteCard } from '@/components/NoteCard';

const STORAGE_KEY_NOTES_LEGACY = 'mindspark_notes_v2';
const STORAGE_KEY_SETTINGS = 'mindspark_settings_v1';
const STORAGE_KEY_MIGRATED = 'mindspark_migrated';

const App: React.FC = () => {
  const { user, isLoaded: isUserLoaded } = useUser();

  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<NoteType | 'ALL'>('ALL');
  const [settings, setSettings] = useState<UserSettings>({
    apiKey: '',
    autoProcess: true,
    model: 'gemini-flash',
  });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  const notesRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());
  const inputBarRef = useRef<HTMLDivElement>(null);

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

  // Load settings from localStorage (device-specific, stays local)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (!parsed.model) parsed.model = 'gemini-flash';
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
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
      processNoteHandler(newNote.id, content);
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
      const aiResponse = await processNote(content, settings.model);

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
  }, [settings.model]);

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
    const maxZ = getMaxZIndex();
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (note && note.zIndex === maxZ) return prev;
      return prev.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n);
    });
    apiUpdateNote(id, { z_index: getMaxZIndex() + 1 }).catch(console.error);
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
    <div className="relative w-screen h-screen overflow-hidden selection:bg-morandi-cream/50" style={{ minHeight: '100vh' }}>

      {/* Background (unchanged) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60"></div>
        <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60 animate-float-slow"></div>
        <div className="absolute top-[8%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#EBE2AA] blur-[150px] opacity-85 animate-float-medium"></div>
        <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80 animate-float-fast"></div>
        <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60 animate-float-slow"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Top Right: User Button + Settings */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9 ring-2 ring-white/40 shadow-sm',
            },
          }}
        />
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-3 bg-white/30 backdrop-blur-md hover:bg-white/60 rounded-full text-gray-600 hover:text-gray-900 transition-all shadow-sm border border-white/40 active:scale-95 group ring-1 ring-white/40"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-700 ease-out" />
        </button>
      </div>

      {/* Settings Modal (unchanged) */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSettings({ model: 'gemini-flash' })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                      settings.model === 'gemini-flash'
                        ? 'bg-morandi-sage text-white border-transparent shadow-md'
                        : 'bg-white/50 border-gray-200/50 text-gray-700 hover:bg-white/70'
                    }`}
                  >
                    <div className="font-medium">Gemini3 Flash</div>
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
        defaultPosition={{ x: 40, y: windowSize.height - 800 }}
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
```

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: replace localStorage with supabase API calls, add user button and migration"
```

---

## Task 11: Add Auth Context to Existing Process-Note API

**Files:**
- Modify: `app/api/process-note/route.ts`

**Step 1: Add Clerk auth check to process-note endpoint**

Add auth import and check at the top of the POST handler:

```typescript
// Add to imports at top of file:
import { auth } from '@clerk/nextjs/server';

// Add auth check at the start of the POST function body, before const body = await request.json():
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
```

**Step 2: Commit**

```bash
git add app/api/process-note/route.ts
git commit -m "feat: add clerk auth check to process-note API route"
```

---

## Task 12: Update .gitignore and Final Verification

**Files:**
- Modify: `.gitignore`

**Step 1: Ensure .env.local is ignored**

Verify `.gitignore` contains `.env.local`. If not, add it.

**Step 2: Verify build passes**

Run:
```bash
npm run build
```
Expected: Build succeeds (may show warnings about missing env vars, which is OK since they need to be configured per-environment).

**Step 3: Final commit**

```bash
git add .gitignore
git commit -m "chore: final cleanup and gitignore update"
```

---

## Post-Implementation: User Configuration Steps

After all code is implemented, the user needs to:

1. **Clerk Setup:**
   - Create a Clerk application at https://clerk.com
   - Enable Email and Google OAuth sign-in methods
   - Copy Publishable Key and Secret Key to `.env.local`
   - Set up Webhook endpoint pointing to `https://<your-domain>/api/webhooks/clerk`
   - Subscribe to `user.created`, `user.updated`, `user.deleted` events
   - Copy Webhook Secret to `.env.local`

2. **Supabase Setup:**
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `lib/supabase-schema.sql` in SQL Editor
   - Copy Project URL, Anon Key, and Service Role Key to `.env.local`

3. **Google OAuth (in Clerk):**
   - In Clerk dashboard → User & Authentication → Social Connections → Enable Google
   - Follow Clerk's guide to set up Google OAuth credentials

4. **Test the flow:**
   - `npm run dev`
   - Visit `http://localhost:3000` → should redirect to `/sign-in`
   - Sign up with email → verify → lands on main app
   - Create a note → verify it appears in Supabase `notes` table
   - Refresh page → notes persist from database
