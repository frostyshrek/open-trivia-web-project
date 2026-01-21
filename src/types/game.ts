export type Cell = {
  points: number;
  prompt: string;
  answer: string;
  imageDataUrl?: string;
};

export type Category = {
  title: string;
  cells: Cell[];
};

export type GameDraft = {
  categories: Category[];
};

export type SavedGame = {
  id: string;
  title: string;
  updatedAt: number;
  draft: GameDraft;
};

export const STORAGE_KEY = 'trivia_saved_games_v1';

export function loadSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedGame[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedGames(list: SavedGame[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function makeDraft(cols: number, rows: number): GameDraft {
  return {
    categories: Array.from({ length: cols }, (_, cIdx) => ({
      title: `Category ${cIdx + 1}`,
      cells: Array.from({ length: rows }, (_, rIdx) => ({
        points: (rIdx + 1) * 100,
        prompt: '',
        answer: '',
        imageDataUrl: undefined,
      })),
    })),
  };
}

export function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now());
}

export function formatDate(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '';
  }
}