import { AIResponse, ModelType } from '@/types';

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

