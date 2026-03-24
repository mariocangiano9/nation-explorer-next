import { useState, useMemo, useEffect } from 'react';
import { CountryData, BaseCountry } from '../types';
import { getCountryData, checkCountryCache } from '../services/claudeDataService';
import { fetchCountries, getCachedCountries, getStaticCountries } from '../services/countriesService';

function getTranslatedName(englishName: string, language: string): string | null {
  try {
    const key = `nation_explorer_v1_${language}_${encodeURIComponent(englishName)}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data } = JSON.parse(raw);
    return data?.name || null;
  } catch {
    return null;
  }
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
  // Fetch fresh country list from RestCountries API once on mount (respects 24h cache)
  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => {});
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return countries
      .filter(c => {
        const translatedName = getTranslatedName(c.name, language);
        return c.name.toLowerCase().includes(query) ||
          (translatedName && translatedName.toLowerCase().includes(query));
      })
      .map(c => {
        const translatedName = getTranslatedName(c.name, language);
        return { ...c, displayName: translatedName || c.name };
      })
      .slice(0, 5);
  }, [searchQuery, countries, language]);

  const handleCountryClick = async (name: string, forcedLanguage?: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    const lang = forcedLanguage || language;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'country_view', {
        country_name: name,
        language: lang,
      });
    }

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
