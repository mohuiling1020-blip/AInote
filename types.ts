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

export interface UserSettings {
  apiKey: string;
  autoProcess: boolean;
}