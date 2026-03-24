import { supabase } from './supabaseClient';
export { supabase };

const PENDING_COUNTRY_KEY = 'ne_pending_country';
const PENDING_EXPLORE_KEY = 'ne_pending_explore';

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://nationexplorer.com' },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://nationexplorer.com/reset-password',
  });
}

export function savePendingCountry(name: string): void {
  sessionStorage.setItem(PENDING_COUNTRY_KEY, name);
}

export function getPendingCountry(): string | null {
  return sessionStorage.getItem(PENDING_COUNTRY_KEY);
}

export function clearPendingCountry(): void {
  sessionStorage.removeItem(PENDING_COUNTRY_KEY);
}

export function savePendingExplore(): void {
  sessionStorage.setItem(PENDING_EXPLORE_KEY, '1');
}

export function getPendingExplore(): boolean {
  return sessionStorage.getItem(PENDING_EXPLORE_KEY) === '1';
}

export function clearPendingExplore(): void {
  sessionStorage.removeItem(PENDING_EXPLORE_KEY);
}
