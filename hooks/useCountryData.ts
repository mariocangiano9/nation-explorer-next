import { useState, useMemo, useEffect } from 'react';
import { CountryData, BaseCountry } from '../types';
import { getCountryData, checkCountryCache } from '../services/claudeDataService';
import { fetchCountries, getCachedCountries, getStaticCountries } from '../services/countriesService';

function buildTranslatedNameMap(language: string): Map<string, string> {
  const map = new Map<string, string>();
  if (language === 'en') return map; // English names are already the default
  try {
    const prefix = `nation_explorer_v1_${language}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const { data } = JSON.parse(raw);
        if (data?.name) {
          const englishName = decodeURIComponent(key.slice(prefix.length));
          map.set(englishName, data.name);
        }
      }
    }
  } catch {
    // ignore
  }
  return map;
}

export function useCountryData(language: 'it' | 'en' | 'fr' | 'es' | 'de') {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<(CountryData & { lastUpdated: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Start with cached API data if available, otherwise fall back to static list
  const [countries, setCountries] = useState<BaseCountry[]>(
    () => getCachedCountries() ?? getStaticCountries()
  );
  const [translatedNames, setTranslatedNames] = useState<Map<string, string>>(() => buildTranslatedNameMap(language));

  // Fetch fresh country list from RestCountries API once on mount (respects 24h cache)
  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => {});
  }, []);

  // Rebuild translated name map when language changes
  useEffect(() => {
    setTranslatedNames(buildTranslatedNameMap(language));
  }, [language]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return countries
      .filter(c => {
        const translatedName = translatedNames.get(c.name);
        return c.name.toLowerCase().includes(query) ||
          (translatedName && translatedName.toLowerCase().includes(query));
      })
      .map(c => {
        const translatedName = translatedNames.get(c.name);
        return { ...c, displayName: translatedName || c.name };
      })
      .slice(0, 5);
  }, [searchQuery, countries, translatedNames]);

  const handleCountryClick = async (name: string, forcedLanguage?: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    const lang = forcedLanguage || language;
    const cached = checkCountryCache(name, lang) as (CountryData & { lastUpdated: string }) | null;
    if (cached) {
      setCountryData(cached);
      setSelectedCountry(name);
      setError(null);
      setSearchQuery('');
      return;
    }

    setSelectedCountry(name);
    setCountryData(null);
    setError(null);
    setSearchQuery('');
    setLoading(true);
    try {
      const data = await getCountryData(name, lang) as CountryData & { lastUpdated: string };
      setCountryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const closeProfile = () => {
    setSelectedCountry(null);
    setCountryData(null);
    setError(null);
    setLoading(false);
  };

  return {
    selectedCountry,
    countryData,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredCountries,
    handleCountryClick,
    closeProfile,
  };
}
