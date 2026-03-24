import { supabase } from './supabaseClient';

const CACHE_MAX_AGE_DAYS = 30;

/**
 * Returns cached country data from Supabase if it exists and is less than 30 days old.
 * Returns null on miss or error.
 */
export async function getFromSupabaseCache(countryName, language) {
  try {
    const { data, error } = await supabase
      .from('country_cache')
      .select('data, updated_at')
      .eq('country_code', countryName)
      .eq('language', language)
      .maybeSingle();

    if (error || !data) return null;

    const ageMs = Date.now() - new Date(data.updated_at).getTime();
    if (ageMs > CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return null;

    return data.data;
  } catch {
    return null;
  }
}

/**
 * Saves country data to Supabase cache. Silently ignores errors.
 */
export async function saveToSupabaseCache(countryName, language, data) {
  try {
    await supabase
      .from('country_cache')
      .upsert(
        { country_code: countryName, language, data, updated_at: new Date().toISOString() },
        { onConflict: 'country_code,language' }
      );
  } catch {
    // non-fatal — local cache still works
  }
}
