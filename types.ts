export enum NoteType {
  ACTION = 'Action',
  QUERY = 'Query',
  IDEA = 'Idea',
  RESOURCE = 'Resource',
  UNCLASSIFIED = 'Unclassified'
}

export enum NoteStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface AIResponse {
  intent: NoteType;
  title: string;
  content: string; // Markdown content
  meta: {
    tags: string[];
    suggested_action?: string;
    deadline?: string;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Note {
  id: string;
  originalContent: string;
  status: NoteStatus;
  type: NoteType;
  aiResponse?: AIResponse;
  createdAt: number;
  errorMessage?: string;
  position: Position;
  zIndex: number;
  checkedIndices?: number[]; // Track checked todo items
}

export type ModelType = 'gemini-flash' | 'qwen3-max';

export interface UserSettings {
  apiKey: string;
  autoProcess: boolean;
  model: ModelType;
}

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