import { BaseCountry } from '../types';
import { countries as staticCountries } from '../store/countries';

const CACHE_KEY = 'nation_explorer_countries_v1';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const API_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca2,capital,population,area,flags,languages,currencies,region,subregion';

interface RestCountryRaw {
  name: { common: string; official: string };
  cca2: string;
  capital?: string[];
  population: number;
  area: number;
  flags: { svg?: string; png?: string };
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  region: string;
  subregion?: string;
}

function normalize(rc: RestCountryRaw): BaseCountry {
  const currencyList = rc.currencies
    ? Object.values(rc.currencies).map(c => `${c.name} (${c.symbol})`)
    : undefined;

  return {
    name: rc.name.common,
    code: rc.cca2,
    capital: rc.capital?.[0],
    population: rc.population,
    area: rc.area,
    flagUrl: rc.flags?.svg || rc.flags?.png,
    languages: rc.languages ? Object.values(rc.languages) : undefined,
    currency: currencyList?.join(', '),
    region: rc.region,
    subregion: rc.subregion,
  };
}

function readCache(): { data: BaseCountry[]; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(data: BaseCountry[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore quota errors
  }
}

export function getCachedCountries(): BaseCountry[] | null {
  const cached = readCache();
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export async function fetchCountries(): Promise<BaseCountry[]> {
  const cached = getCachedCountries();
  if (cached) return cached;

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`RestCountries API responded with ${response.status}`);
  }

  const raw: RestCountryRaw[] = await response.json();
  const countries = raw.map(normalize).sort((a, b) => a.name.localeCompare(b.name));

  writeCache(countries);
  return countries;
}

export function getStaticCountries(): BaseCountry[] {
  return staticCountries;
}

export function getCacheTimestamp(): Date | null {
  const cached = readCache();
  return cached ? new Date(cached.timestamp) : null;
}
