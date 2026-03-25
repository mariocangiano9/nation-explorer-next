const HISTORY_KEY = 'ne_visit_history';
const MAX_ENTRIES = 10;

interface HistoryEntry {
  countryCode: string;
  countryName: string;
  visitedAt: number;
}

export function addToHistory(countryCode: string, countryName: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(e => e.countryCode !== countryCode);
    filtered.unshift({ countryCode, countryName, visitedAt: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}
