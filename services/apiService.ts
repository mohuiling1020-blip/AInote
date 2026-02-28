import { AIResponse, ModelType, DbNote } from '@/types';

export const processNote = async (
  content: string,
  model: ModelType
): Promise<AIResponse> => {
  const response = await fetch('/api/process-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      model,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to process note';
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Empty response from server');
  }

  try {
    const result: AIResponse = JSON.parse(responseText);
    return result;
  } catch (e) {
    console.error('Failed to parse response:', responseText);
    throw new Error('Invalid JSON response from server');
  }
};

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

