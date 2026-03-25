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
