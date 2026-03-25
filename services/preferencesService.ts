import { supabase } from './supabaseClient';

export async function saveLanguagePreference(userId: string, language: string): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        language,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function getLanguagePreference(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('language')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.language ?? null;
}
