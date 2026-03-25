import { supabase } from './supabaseClient';

export interface RankingItem {
  name: string;
  code: string;
  value: string;
  numericValue: number;
  unit: string;
}

/**
 * Generic numeric parser that handles commas as decimal separators,
 * extracts the first number from a string, and applies multipliers
 * for "miliardi"/"billion" and "trilioni"/"trillion".
 */
function parseNumericValue(raw: string): number {
  if (!raw) return NaN;
  // Replace comma with dot for decimal separator
  const normalized = raw.replace(',', '.');
  // Extract the first number found in the string
  const match = normalized.match(/[\d]+\.?[\d]*/);
  if (!match) return NaN;
  let num = parseFloat(match[0]);
  if (isNaN(num)) return NaN;
  const lower = raw.toLowerCase();
  if (lower.includes('trilioni') || lower.includes('trillion')) {
    num *= 1000000;
  } else if (lower.includes('miliardi') || lower.includes('billion')) {
    num *= 1000;
  }
  return num;
}

/**
 * Parse a monetary string like "$2.1T", "$450B", "$32.7B", "€450B",
 * or "circa 14,8 miliardi di USD" into a numeric value in billions.
 */
function parseMonetary(raw: string): number {
  if (!raw) return NaN;
  const lower = raw.toLowerCase();
  // If it contains word-based multipliers, use the generic parser
  if (lower.includes('miliardi') || lower.includes('billion') || lower.includes('trilioni') || lower.includes('trillion')) {
    return parseNumericValue(raw);
  }
  // Otherwise handle compact suffixes like T, B, M
  const normalized = raw.replace(',', '.');
  const match = normalized.match(/[\d]+\.?[\d]*/);
  if (!match) return NaN;
  const num = parseFloat(match[0]);
  if (isNaN(num)) return NaN;
  const upper = raw.toUpperCase();
  if (upper.includes('T')) return num * 1000;
  if (upper.includes('B')) return num;
  if (upper.includes('M')) return num / 1000;
  return num;
}

/**
 * Parse a percentage string like "5.8%", "134.8%", "circa 28,0%" into a number.
 */
function parsePercentage(raw: string): number {
  if (!raw) return NaN;
  const normalized = raw.replace(',', '.');
  const match = normalized.match(/[\d]+\.?[\d]*/);
  if (!match) return NaN;
  return parseFloat(match[0]);
}

/**
 * Parse a per-capita string like "$45,230" or "circa 12.500" into a number.
 */
function parsePerCapita(raw: string): number {
  if (!raw) return NaN;
  const normalized = raw.replace(',', '.');
  const match = normalized.match(/[\d]+\.?[\d]*/);
  if (!match) return NaN;
  return parseFloat(match[0]);
}

/**
 * Check if a string value is mostly non-numeric (>50% non-digit characters
 * after removing currency symbols and known prefixes).
 */
function isMostlyNonNumeric(raw: string): boolean {
  // Strip known prefixes/noise
  const stripped = raw.replace(/[$€£¥₹%,.\s\-+~]/g, '').replace(/circa|approx|est\.?|about|ca\.?/gi, '');
  if (stripped.length === 0) return true;
  const digitCount = (stripped.match(/[0-9]/g) || []).length;
  return digitCount / stripped.length < 0.5;
}

interface IndicatorConfig {
  extract: (data: any) => string | undefined;
  parse: (value: string, data: any) => number;
  unit: string;
}

const INDICATOR_MAP: Record<string, IndicatorConfig> = {
  gdp: {
    extract: (d) => d?.economy?.gdpNominal,
    parse: (_v, d) => d?.economy?.gdpNominalNumeric ?? parseMonetary(_v),
    unit: 'USD (B)',
  },
  gdp_capita: {
    extract: (d) => d?.economy?.gdpPerCapita,
    parse: (_v, d) => d?.economy?.gdpPerCapitaNumeric ?? parsePerCapita(_v),
    unit: 'USD',
  },
  population: {
    extract: (d) => d?.population != null ? String(d.population) : undefined,
    parse: (_v, d) => Number(d?.population),
    unit: '',
  },
  area: {
    extract: (d) => d?.area != null ? String(d.area) : undefined,
    parse: (_v, d) => Number(d?.area),
    unit: 'km²',
  },
  unemployment: {
    extract: (d) => d?.economy?.unemployment,
    parse: (_v, d) => d?.economy?.unemploymentNumeric ?? parsePercentage(_v),
    unit: '%',
  },
  inflation: {
    extract: (d) => d?.economy?.inflation,
    parse: (_v, d) => d?.economy?.inflationNumeric ?? parsePercentage(_v),
    unit: '%',
  },
  debt: {
    extract: (d) => d?.economy?.debtToGdp,
    parse: (_v, d) => d?.economy?.debtToGdpNumeric ?? parsePercentage(_v),
    unit: '% GDP',
  },
  exports: {
    extract: (d) => d?.trade?.exports,
    parse: (_v, d) => d?.trade?.exportsNumeric ?? parseMonetary(_v),
    unit: 'USD (B)',
  },
  imports: {
    extract: (d) => d?.trade?.imports,
    parse: (_v, d) => d?.trade?.importsNumeric ?? parseMonetary(_v),
    unit: 'USD (B)',
  },
  democracy: {
    extract: (d) => d?.indicators?.democracyIndex != null ? String(d.indicators.democracyIndex) : undefined,
    parse: (_v, d) => Number(d?.indicators?.democracyIndex),
    unit: '/10',
  },
  hdi: {
    extract: (d) => d?.society?.humanDevelopmentIndex != null ? String(d.society.humanDevelopmentIndex) : undefined,
    parse: (_v, d) => Number(d?.society?.humanDevelopmentIndex),
    unit: '',
  },
  press_freedom: {
    extract: (d) => d?.indicators?.pressFreedom != null ? String(d.indicators.pressFreedom) : undefined,
    parse: (_v, d) => Number(d?.indicators?.pressFreedom),
    unit: '/100',
  },
  corruption: {
    extract: (d) => d?.indicators?.corruptionPerception != null ? String(d.indicators.corruptionPerception) : undefined,
    parse: (_v, d) => Number(d?.indicators?.corruptionPerception),
    unit: '/100',
  },
  military: {
    extract: (d) => d?.defense?.militarySpending,
    parse: (v) => parseMonetary(v),
    unit: 'USD (B)',
  },
  life_expectancy: {
    extract: (d) => d?.society?.lifeExpectancy != null ? String(d.society.lifeExpectancy) : undefined,
    parse: (_v, d) => Number(d?.society?.lifeExpectancy),
    unit: 'years',
  },
  happiness: {
    extract: (d) => d?.society?.happinessIndex != null ? String(d.society.happinessIndex) : undefined,
    parse: (_v, d) => Number(d?.society?.happinessIndex),
    unit: '/10',
  },
};

export async function getRankingFromCountryCache(
  indicatorId: string,
  language: string,
): Promise<RankingItem[]> {
  const config = INDICATOR_MAP[indicatorId];
  if (!config) return [];

  const { data: rows, error } = await supabase
    .from('country_cache')
    .select('data, updated_at')
    .eq('language', language);

  if (error || !rows) return [];

  // Deduplicate by country code — keep most recently updated entry
  const seen = new Map<string, { data: any; updated_at: string }>();
  for (const row of rows) {
    const d = row.data as any;
    if (!d?.code) continue;
    const code = d.code as string;
    const existing = seen.get(code);
    if (!existing || row.updated_at > existing.updated_at) {
      seen.set(code, { data: d, updated_at: row.updated_at });
    }
  }

  const items: RankingItem[] = [];

  for (const { data: d } of seen.values()) {
    const rawValue = config.extract(d);
    if (rawValue == null) continue;

    // Skip entries with mostly non-numeric text (malformed data)
    if (typeof rawValue === 'string' && isMostlyNonNumeric(rawValue)) continue;

    const numericValue = config.parse(rawValue, d);

    // Skip zero, NaN, or invalid values
    if (isNaN(numericValue) || numericValue === 0) continue;

    items.push({
      name: d.name ?? '',
      code: d.code ?? '',
      value: rawValue,
      numericValue,
      unit: config.unit,
    });
  }

  items.sort((a, b) => b.numericValue - a.numericValue);

  return items;
}
