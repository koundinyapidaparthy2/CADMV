/**
 * Utility to manage question history in LocalStorage.
 * This helps avoid repeating the exact same questions across sessions.
 */

const HISTORY_KEY = 'dmv_prep_seen_hashes';

// Simple hash function for strings
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export const saveQuestionsToHistory = (questions: { question: string }[]) => {
  try {
    const existing = localStorage.getItem(HISTORY_KEY);
    const history: string[] = existing ? JSON.parse(existing) : [];
    
    // Add new hashes
    const newHashes = questions.map(q => simpleHash(q.question));
    
    // Merge and keep unique (Set)
    const updatedHistory = Array.from(new Set([...history, ...newHashes]));
    
    // Limit history size to avoid "eating up space" (e.g., keep last 500)
    const trimmedHistory = updatedHistory.slice(-500);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (e) {
    console.warn('Failed to save question history', e);
  }
};

export const getQuestionHistoryCount = (): number => {
  try {
    const existing = localStorage.getItem(HISTORY_KEY);
    return existing ? JSON.parse(existing).length : 0;
  } catch {
    return 0;
  }
};