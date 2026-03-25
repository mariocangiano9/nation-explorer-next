import { supabase } from './supabaseClient';

const HISTORY_KEY = 'ne_visit_history';
const MAX_ENTRIES = 10;

interface HistoryEntry {
  countryCode: string;
  countryName: string;
  visitedAt: number;
}

// localStorage functions (fallback for non-logged users)

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

// Supabase functions (for logged-in users)

export async function addToHistorySupabase(userId: string, countryCode: string, countryName: string): Promise<void> {
  const { error } = await supabase
    .from('user_visit_history')
    .upsert(
      {
        user_id: userId,
        country_code: countryCode,
        country_name: countryName,
        visited_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,country_code' }
    );
  if (error) throw error;
}

export async function getHistorySupabase(userId: string): Promise<{ country_code: string; country_name: string; visited_at: string }[]> {
  const { data, error } = await supabase
    .from('user_visit_history')
    .select('country_code, country_name, visited_at')
    .eq('user_id', userId)
    .order('visited_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
