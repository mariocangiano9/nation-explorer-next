import { supabase } from './supabaseClient';

export async function getFavorites(
  userId: string
): Promise<{ country_code: string; country_name: string }[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('country_code, country_name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addFavorite(
  userId: string,
  countryCode: string,
  countryName: string
): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, country_code: countryCode, country_name: countryName });

  if (error) throw error;
}

export async function removeFavorite(
  userId: string,
  countryCode: string
): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('country_code', countryCode);

  if (error) throw error;
}

export async function isFavorite(
  userId: string,
  countryCode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('country_code', countryCode)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
