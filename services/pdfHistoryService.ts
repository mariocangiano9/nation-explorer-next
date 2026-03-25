import { supabase } from './supabaseClient';

const PDF_HISTORY_KEY = 'ne_pdf_history';
const MAX_ENTRIES = 20;

interface PdfHistoryEntry {
  countryCode: string;
  countryName: string;
  downloadedAt: number;
}

export function addToPdfHistory(countryCode: string, countryName: string): void {
  try {
    const history = getPdfHistory();
    const filtered = history.filter(e => e.countryCode !== countryCode);
    filtered.unshift({ countryCode, countryName, downloadedAt: Date.now() });
    localStorage.setItem(PDF_HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function getPdfHistory(): PdfHistoryEntry[] {
  try {
    const raw = localStorage.getItem(PDF_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PdfHistoryEntry[];
  } catch {
    return [];
  }
}

export function clearPdfHistory(): void {
  try {
    localStorage.removeItem(PDF_HISTORY_KEY);
  } catch {}
}

export async function addToPdfHistorySupabase(userId: string, countryCode: string, countryName: string): Promise<void> {
  try {
    await supabase
      .from('user_pdf_downloads')
      .upsert(
        { user_id: userId, country_code: countryCode, country_name: countryName, downloaded_at: new Date().toISOString() },
        { onConflict: 'user_id,country_code' }
      );
  } catch {
    // non-fatal
  }
}

export async function getPdfHistorySupabase(userId: string): Promise<{ country_code: string; country_name: string; downloaded_at: string }[]> {
  try {
    const { data } = await supabase
      .from('user_pdf_downloads')
      .select('country_code, country_name, downloaded_at')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false })
      .limit(20);
    return data || [];
  } catch {
    return [];
  }
}
