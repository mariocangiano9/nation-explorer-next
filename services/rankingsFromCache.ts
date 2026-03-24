import { supabase } from './supabaseClient';

export interface RankingItem {
  name: string;
  code: string;
  value: string;
  numericValue: number;
  unit: string;
}

/**
 * Parse a monetary string like "$2.1T", "$450B", "$32.7B", "€450B" into a
 * numeric value in billions.
 */
function parseMonetary(raw: string): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/[^0-9.,TBMtbm]/g, '');
  const num = parseFloat(cleaned.replace(/,/g, ''));
  if (isNaN(num)) return NaN;
  const upper = raw.toUpperCase();
  if (upper.includes('T')) return num * 1000;
  if (upper.includes('B')) return num;
  if (upper.includes('M')) return num / 1000;
  return num;
}

/**
 * Parse a percentage string like "5.8%", "134.8%" into a number.
 */
function parsePercentage(raw: string): number {
  if (!raw) return NaN;
  return parseFloat(raw.replace(/[^0-9.\-]/g, ''));
}

/**
 * Parse a per-capita string like "$45,230" into a number.
 */
function parsePerCapita(raw: string): number {
  if (!raw) return NaN;
  return parseFloat(raw.replace(/[^0-9.\-]/g, ''));
}

interface IndicatorConfig {
  extract: (data: any) => string | undefined;
  parse: (value: string, data: any) => number;
  unit: string;
}

const INDICATOR_MAP: Record<string, IndicatorConfig> = {
  gdp: {
    extract: (d) => d?.economy?.gdpNominal,
    parse: (v) => parseMonetary(v),
    unit: 'USD (B)',
  },
  gdp_capita: {
    extract: (d) => d?.economy?.gdpPerCapita,
    parse: (v) => parsePerCapita(v),
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
    parse: (v) => parsePercentage(v),
    unit: '%',
  },
  inflation: {
    extract: (d) => d?.economy?.inflation,
    parse: (v) => parsePercentage(v),
    unit: '%',
  },
  debt: {
    extract: (d) => d?.economy?.debtToGdp,
    parse: (v) => parsePercentage(v),
    unit: '% GDP',
  },
  exports: {
    extract: (d) => d?.trade?.exports,
    parse: (v) => parseMonetary(v),
    unit: 'USD (B)',
  },
  imports: {
    extract: (d) => d?.trade?.imports,
    parse: (v) => parseMonetary(v),
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
    .select('data')
    .eq('language', language);

  if (error || !rows) return [];

  const items: RankingItem[] = [];

  for (const row of rows) {
    const d = row.data as any;
    if (!d) continue;

    const rawValue = config.extract(d);
    if (rawValue == null) continue;

    const numericValue = config.parse(rawValue, d);
    if (!numericValue || isNaN(numericValue)) continue;

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
