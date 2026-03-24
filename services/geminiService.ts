import Anthropic from "@anthropic-ai/sdk";
import { CountryData } from "../types";
import { db } from "./firebase";
import { serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

// Simple in-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_VERSION = 'v9';

function getCachedData(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Try localStorage
  try {
    const localCached = localStorage.getItem(`geopulse_cache_${key}`);
    if (localCached) {
      const parsed = JSON.parse(localCached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        cache[key] = parsed;
        return parsed.data;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export function checkCache(countryName: string, language: 'it' | 'en' = 'it'): any {
  const cacheKey = `analysis_${CACHE_VERSION}_${countryName}_${language}`;
  return getCachedData(cacheKey);
}

function setCachedData(key: string, data: any) {
  const cacheEntry = { data, timestamp: Date.now() };
  cache[key] = cacheEntry;
  try {
    localStorage.setItem(`geopulse_cache_${key}`, JSON.stringify(cacheEntry));
  } catch {
    // ignore
  }
}

function parseJsonResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from a markdown code block
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

export async function getCountryAnalysis(countryName: string, language: 'it' | 'en' = 'it'): Promise<CountryData & { lastUpdated: string }> {
  const cacheKey = `analysis_${CACHE_VERSION}_${countryName}_${language}`;
  const localCached = getCachedData(cacheKey);
  if (localCached) return localCached;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const firestoreId = `${countryName}_${language}_${today}`;

  // Check Firestore first for daily consistency across devices
  try {
    const docRef = doc(db, 'country_analysis', firestoreId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      const result = { ...firestoreData.data, lastUpdated: firestoreData.lastUpdated };
      setCachedData(cacheKey, result);
      return result;
    }
  } catch {
    // fall through to API
  }

  const currentDate = "20 Marzo 2026";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    system: `You are a geopolitical and economic analyst. Respond ONLY with valid JSON, no additional text or markdown formatting.`,
    messages: [{
      role: "user",
      content: `Generate a comprehensive geopolitical and economic profile for ${countryName} in JSON format.
Current date: ${currentDate}. Ensure all data reflects the situation as of today.
Response language: ${language === 'it' ? 'Italian' : 'English'}.
Structure:
{
  "code": "ISO 2", "id": "ISO 3", "name": "Common Name", "officialName": "Official Name", "flag": "emoji",
  "capital": "Capital", "region": "Region", "subregion": "Subregion", "continent": "Continent",
  "population": number, "populationDensity": number, "area": number, "languages": [], "currency": "",
  "timezones": [], "tld": "", "callingCode": "", "governmentForm": "", "politicalSystem": "",
  "leadership": {
    "headOfState": { "name": "", "title": "", "photo": "", "party": "", "termStart": "", "bio": "" },
    "headOfGovernment": { "name": "", "title": "", "photo": "", "party": "", "termStart": "", "bio": "" }
  },
  "internalPolitics": { "rulingParty": "", "opposition": "", "stability": "", "recentElections": "", "nextElections": "", "parliamentStructure": "", "politicalOrientation": "" },
  "indicators": { "democracyIndex": 0-10, "pressFreedom": 0-100, "corruptionPerception": 0-100, "economicFreedom": 0-100 },
  "economy": {
    "gdpNominal": "", "gdpPerCapita": "", "growth": "", "inflation": "", "unemployment": "", "debtToGdp": "", "rating": "", "giniIndex": "", "fdi": "",
    "sectors": [{"name": "", "share": number, "description": ""}]
  },
  "trade": { "imports": "", "exports": "", "balance": "", "partners": [{"name": "", "code": "", "share": number}], "importSectors": [{"name": "", "share": number}], "exportSectors": [{"name": "", "share": number}] },
  "geopolitics": {
    "position": "", "allies": [{"name": "", "code": ""}], "rivals": [{"name": "", "code": ""}], "strategicImportance": "", "treaties": [], "disputes": [], "conflicts": [], "influence": "", "softPower": ""
  },
  "organizations": [],
  "defense": { "militarySpending": "", "personnel": { "active": "", "reserve": "" }, "nuclear": { "present": boolean, "capacity": "" }, "internationalMissions": [] },
  "society": { "demographics": { "medianAge": number, "urbanization": "", "growthRate": "" }, "education": "", "healthcare": "", "humanDevelopmentIndex": 0-1, "lifeExpectancy": number, "happinessIndex": 0-10, "socialCohesion": "" },
  "swot": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
  "energy": { "totalProduction": "", "mix": [{"source": "", "share": number}], "dependence": "", "resources": [], "capacity": "", "emissions": "", "policies": [], "mainProviders": [] },
  "arsenal": {
    "militaryPowerIndex": "",
    "spending": { "total": "", "gdpShare": "" },
    "personnel": { "active": "", "reserve": "" },
    "equipment": { "tanks": "", "aircraft": "", "ships": "" },
    "nuclearWeapons": "",
    "militaryTech": "",
    "missilesAndDefense": "",
    "vehiclesAndInfrastructure": "",
    "internationalMissions": []
  },
  "strategicReserves": { "goldReserves": "", "foreignExchangeReserves": "", "rawMaterials": [], "miningProduction": "", "sovereignWealthFunds": "", "economicSecurity": "" },
  "summary": ""
}`
    }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  const data = parseJsonResponse(textBlock?.text || '{}') || {};
  const lastUpdated = new Date().toLocaleString(language === 'it' ? 'it-IT' : 'en-US');
  const result = { ...data, lastUpdated };

  // Save to Firestore for daily consistency across devices
  try {
    const docRef = doc(db, 'country_analysis', firestoreId);
    await setDoc(docRef, {
      countryName,
      language,
      data,
      lastUpdated,
      dateKey: today,
      createdAt: serverTimestamp()
    });
  } catch {
    // non-fatal
  }

  setCachedData(cacheKey, result);
  return result;
}

// Claude does not support image generation.
// Returns an empty string; the UI will display a placeholder instead.
export async function generateLeaderImage(_name: string, _title: string, _country: string): Promise<string> {
  return '';
}

const LANG_NAMES: Record<string, string> = { it: 'Italian', en: 'English', fr: 'French', es: 'Spanish', de: 'German' };

export async function getRankingData(indicatorId: string, language: 'it' | 'en' | 'fr' | 'es' | 'de' = 'it'): Promise<any[]> {
  const cacheKey = `ranking_${CACHE_VERSION}_${indicatorId}_${language}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const currentDate = "20 Marzo 2026";
  const langName = LANG_NAMES[language] || 'English';

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    thinking: { type: "enabled", budget_tokens: 4000 },
    system: `You are a data analyst. Respond ONLY with a valid JSON array, no additional text or markdown formatting.`,
    messages: [{
      role: "user",
      content: `Generate a ranking of the top 30 countries for the indicator: ${indicatorId} in JSON format.
The current date is ${currentDate}. Ensure data is the most recent available as of today.
The response MUST be in ${langName}.
Return an array of objects with this structure:
[
  {
    "name": "Country Name",
    "code": "ISO 2-letter code",
    "value": "Formatted value string (e.g. $2.5 Trillion, 4.5%, etc). For indicators with a scale, include it (e.g. 8.5/10, 75/100)",
    "numericValue": number,
    "unit": "Unit name"
  }
]
Use the most recent available data (2025/2026).`
    }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  const result = parseJsonResponse(textBlock?.text || '[]') || [];
  setCachedData(cacheKey, result);
  return result;
}
