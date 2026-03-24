import { supabase } from './supabaseClient';

export interface RankingItem {
  name: string;
  code: string;
  value: string;
  numericValue: number;
  unit: string;
}

/**
 * Fetches a pre-built ranking from the Supabase rankings_cache table.
 * Returns null on cache miss or error so the caller can fall back.
 */
export async function getRankingFromCache(
  category: string,
  language: string,
): Promise<RankingItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('rankings_cache')
      .select('data')
      .eq('category', category)
      .eq('language', language)
      .maybeSingle();

    if (error || !data) return null;
    return data.data as RankingItem[];
  } catch {
    return null;
  }
}
