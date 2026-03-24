import Anthropic from '@anthropic-ai/sdk';
import { getFromSupabaseCache, saveToSupabaseCache } from './supabaseService.js';

const CACHE_VERSION = 'v1';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_PREFIX = 'nation_explorer_';
const APP_CACHE_VERSION = '2.0';
const APP_CACHE_VERSION_KEY = 'nation_explorer_cache_version';

// On module load: clear all country cache entries if version changed
(function clearStaleCache() {
  try {
    const stored = localStorage.getItem(APP_CACHE_VERSION_KEY);
    if (stored !== APP_CACHE_VERSION) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(APP_CACHE_VERSION_KEY, APP_CACHE_VERSION);
    }
  } catch {
    // ignore — localStorage may be unavailable
  }
})();

const LANG_NAMES = { it: 'Italian', en: 'English', fr: 'French', es: 'Spanish', de: 'German' };
const LANG_LOCALES = { it: 'it-IT', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE' };

function getCacheKey(countryName, language) {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${language}_${encodeURIComponent(countryName)}`;
}

/**
 * Returns cached country data if fresh (< 30 days old), otherwise null.
 */
export function checkCountryCache(countryName, language = 'it') {
  try {
    const raw = localStorage.getItem(getCacheKey(countryName, language));
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      return data;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveToCache(countryName, data, language) {
  try {
    localStorage.setItem(
      getCacheKey(countryName, language),
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // ignore storage quota errors
  }
}

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from a markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // fall through
      }
    }
    return null;
  }
}

function buildPrompt(countryName, language) {
  const langName = LANG_NAMES[language] || 'English';
  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Generate a complete country profile for "${countryName}" in ${langName}. Return ONLY a valid JSON object matching the schema below exactly. Current date: ${currentDate}.

GENERAL RULES:
- All descriptive text must be a short phrase (max 8 words)
- Main overview is the only exception (3-4 sentences)
- For international organizations use ONLY acronyms (UN, NATO, G20, IMF, WTO, EU, BRICS, etc.) — never full names
- All text values must be written in ${langName}

{
  "code": "ISO 3166-1 alpha-2 (e.g. IT)",
  "id": "ISO 3166-1 alpha-3 (e.g. ITA)",
  "name": "common country name in ${langName}",
  "officialName": "full official name in ${langName}",
  "flag": "national flag emoji",
  "capital": "capital city name",
  "region": "geographic region in ${langName}",
  "subregion": "subregion in ${langName}",
  "continent": "continent in ${langName}",
  "population": integer (total population),
  "populationDensity": decimal (inhabitants per km²),
  "area": integer (total area in km²),
  "languages": ["official language 1", "official language 2"],
  "currency": "currency name and symbol (e.g. Euro €)",
  "timezones": ["UTC+1"],
  "tld": ".xx",
  "callingCode": "+XX",
  "independenceDate": "independence date or N/A",
  "motto": "national motto in ${langName} or N/A",
  "governmentForm": "government form in ${langName} (e.g. Parliamentary Republic)",
  "politicalSystem": "political system in ${langName} (e.g. Multiparty Representative Democracy)",

  "summary": "short phrase: country identity in ${langName} (max 8 words)",
  "overview": "3-4 sentences covering: current political situation, economic state, and main geopolitical dynamics in ${langName}. Max 4 sentences, no filler.",

  "leadership": {
    "headOfState": {
      "name": "full name",
      "title": "title in ${langName}",
      "photo": "",
      "party": "party or movement",
      "termStart": "year term began (e.g. 2022)",
      "bio": "short phrase: role in ${langName} (max 8 words)"
    },
    "headOfGovernment": {
      "name": "full name (same as headOfState if identical)",
      "title": "title in ${langName}",
      "photo": "",
      "party": "party or coalition",
      "termStart": "year term began",
      "bio": "short phrase: role in ${langName} (max 8 words)"
    }
  },

  "internalPolitics": {
    "rulingParty": "ruling party or coalition",
    "opposition": "main opposition parties",
    "stability": "short phrase: stability level in ${langName} (max 8 words)",
    "recentElections": "last major election: type, year, result",
    "nextElections": "next scheduled elections with approximate date",
    "parliamentStructure": "1 sentence parliament description in ${langName}",
    "politicalOrientation": "current government political orientation in ${langName}"
  },

  "indicators": {
    "democracyIndex": decimal 0.0–10.0 (Economist Democracy Index),
    "pressFreedom": integer 0–100 (RSF Press Freedom Index; 100 = most free),
    "corruptionPerception": integer 0–100 (Transparency International CPI; 100 = least corrupt),
    "economicFreedom": integer 0–100 (Heritage Foundation Economic Freedom Index)
  },

  "economy": {
    "gdpNominal": "formatted nominal GDP (e.g. $2.1T, €450B)",
    "gdpPerCapita": "formatted GDP per capita (e.g. $45,230)",
    "growth": "annual GDP growth rate (e.g. 2.1%)",
    "inflation": "annual inflation rate (e.g. 3.2%)",
    "unemployment": "unemployment rate (e.g. 5.8%)",
    "debtToGdp": "public debt as % of GDP (e.g. 134.8%)",
    "rating": "sovereign credit rating (e.g. BBB, AA-)",
    "giniIndex": "Gini index (e.g. 35)",
    "fdi": "net annual FDI formatted",
    "sectors": [
      { "name": "sector name in ${langName}", "share": percentage number, "description": "short phrase: sector role (max 6 words)" }
    ]
  },

  "trade": {
    "imports": "total imports formatted (e.g. $420B)",
    "exports": "total exports formatted (e.g. $380B)",
    "balance": "trade balance formatted (e.g. -$40B)",
    "partners": [
      { "name": "partner country name", "code": "XX", "share": percentage number }
    ],
    "importSectors": [
      { "name": "import category in ${langName}", "share": percentage number }
    ],
    "exportSectors": [
      { "name": "export category in ${langName}", "share": percentage number }
    ]
  },

  "geopolitics": {
    "position": "1 sentence strategic geopolitical position in ${langName}",
    "allies": [{ "name": "ally country name", "code": "XX" }],
    "rivals": [{ "name": "rival country name", "code": "XX" }],
    "strategicImportance": "short phrase: strategic role (max 8 words)",
    "treaties": ["treaty or agreement name", "treaty 2"],
    "disputes": ["brief territorial or political dispute in ${langName}", "dispute 2"],
    "conflicts": ["brief active conflict or tension in ${langName}", "conflict 2"],
    "influence": "short phrase: sphere of influence (max 8 words)",
    "softPower": "short phrase: soft power strengths (max 8 words)"
  },

  "organizations": ["ACRONYM1", "ACRONYM2", "ACRONYM3"],

  "defense": {
    "militarySpending": "annual military spending formatted (e.g. $32B)",
    "personnel": {
      "active": "active military personnel formatted (e.g. 180,000)",
      "reserve": "reserve personnel formatted (e.g. 42,000)"
    },
    "nuclear": {
      "present": true or false,
      "capacity": "short phrase: nuclear status (max 6 words)"
    },
    "internationalMissions": ["mission name and brief description", "mission 2"]
  },

  "society": {
    "demographics": {
      "medianAge": decimal (median age),
      "urbanization": "urban population % (e.g. 72%)",
      "growthRate": "annual demographic growth rate (e.g. 0.2%)"
    },
    "education": "short phrase: education level and literacy (max 8 words)",
    "healthcare": "short phrase: healthcare system type (max 8 words)",
    "humanDevelopmentIndex": decimal 0.000–1.000 (UNDP HDI),
    "lifeExpectancy": decimal (life expectancy in years),
    "happinessIndex": decimal 0.0–10.0 (World Happiness Report),
    "socialCohesion": "short phrase: social cohesion level (max 8 words)"
  },

  "swot": {
    "strengths": ["strength 1 in ${langName}", "strength 2", "strength 3", "strength 4"],
    "weaknesses": ["weakness 1 in ${langName}", "weakness 2", "weakness 3"],
    "opportunities": ["opportunity 1 in ${langName}", "opportunity 2", "opportunity 3"],
    "threats": ["threat 1 in ${langName}", "threat 2", "threat 3"]
  },

  "energy": {
    "totalProduction": "total primary energy production formatted (e.g. 320 Mtoe, 1,200 TWh)",
    "mix": [
      { "source": "energy source in ${langName} (e.g. Natural Gas, Renewables, Nuclear, Coal, Oil, Hydro)", "share": percentage number }
    ],
    "dependence": "energy import dependency (e.g. 75% import dependent)",
    "resources": ["strategic energy or mineral resource 1", "resource 2"],
    "capacity": "installed electricity generation capacity (e.g. 120 GW)",
    "emissions": "total CO₂ emissions formatted (e.g. 320 Mt CO₂/yr)",
    "policies": ["key energy or climate policy in ${langName}", "policy 2"],
    "mainProviders": ["main energy supplier (country or company)", "supplier 2"]
  },

  "arsenal": {
    "militaryPowerIndex": "Global Firepower Index value (e.g. 0.0342; lower = stronger)",
    "spending": {
      "total": "total annual military spending formatted (e.g. $32.7B)",
      "gdpShare": "defence spending as % of GDP (e.g. 2.1%)"
    },
    "personnel": {
      "active": "active military personnel formatted (e.g. 180,000)",
      "reserve": "reserve personnel formatted (e.g. 42,000)"
    },
    "equipment": {
      "tanks": "DIGITS ONLY — total tanks and armoured vehicles as a formatted integer (e.g. 2,100). No words, no model names, no parentheses.",
      "aircraft": "DIGITS ONLY — total military aircraft as a formatted integer (e.g. 310). No words, no model names, no parentheses.",
      "ships": "DIGITS ONLY — total principal naval vessels as a formatted integer (e.g. 90). No words, no vessel types, no parentheses."
    },
    "nuclearWeapons": "DIGITS ONLY or the word None — formatted integer warhead count (e.g. 5,977) or exactly 'None'. No parentheses, no qualifiers.",
    "militaryTech": "short phrase: key tech capabilities (max 6 words)",
    "missilesAndDefense": "short phrase: missile systems (max 6 words)",
    "vehiclesAndInfrastructure": "short phrase: vehicle fleet type (max 6 words)",
    "internationalMissions": ["active mission name and brief description", "mission 2"]
  },

  "strategicReserves": {
    "goldReserves": "official gold reserves formatted (e.g. 2,452 tonnes, $145B)",
    "foreignExchangeReserves": "international currency reserves formatted (e.g. $170B)",
    "rawMaterials": ["strategic raw material 1", "material 2", "material 3"],
    "miningProduction": "short phrase: key minerals produced (max 8 words)",
    "sovereignWealthFunds": "short phrase: fund name and size (max 8 words)",
    "economicSecurity": "short phrase: resilience level (max 8 words)"
  }
}`;
}

/**
 * Fetches complete country data from Claude API (claude-sonnet-4-6).
 * Checks localStorage cache first (30-day TTL). On cache miss, calls the API,
 * persists the result to localStorage, and returns it.
 *
 * @param {string} countryName - The country name to fetch data for.
 * @returns {Promise<object>} The country data object matching CountryData schema.
 */
export async function getCountryData(countryName, language = 'it') {
  // Layer 1: localStorage (sync, instant)
  const localCached = checkCountryCache(countryName, language);
  if (localCached) return localCached;

  // Layer 2: Supabase shared cache (async, cross-device)
  const supabaseCached = await getFromSupabaseCache(countryName, language);
  if (supabaseCached) {
    saveToCache(countryName, supabaseCached, language);
    return supabaseCached;
  }

  // Layer 3: Claude API
  const langName = LANG_NAMES[language] || 'English';

  const client = new Anthropic({
    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: `You are an expert geopolitical and economic analyst. Reply ONLY with a valid JSON object, without additional text, comments, or markdown formatting. All text values must be in ${langName}.`,
    messages: [
      {
        role: 'user',
        content: buildPrompt(countryName, language),
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const parsed = parseJsonResponse(textBlock?.text || '{}');

  const result = {
    ...(parsed || {}),
    lastUpdated: new Date().toLocaleString(LANG_LOCALES[language] || 'en-US'),
  };

  // Save to both Supabase and localStorage
  await saveToSupabaseCache(countryName, language, result);
  saveToCache(countryName, result, language);

  return result;
}
