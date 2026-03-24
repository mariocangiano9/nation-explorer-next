import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LANG_NAMES: Record<string, string> = {
  it: "Italian",
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
};

const LANG_LOCALES: Record<string, string> = {
  it: "it-IT",
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
};

function buildPrompt(countryName: string): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `Generate a complete country profile for "${countryName}" in English. Return ONLY a valid JSON object matching the schema below exactly. Current date: ${currentDate}.

GENERAL RULES:
- All descriptive text must be a short phrase (max 8 words)
- Main overview is the only exception (3-4 sentences)
- For international organizations use ONLY acronyms (UN, NATO, G20, IMF, WTO, EU, BRICS, etc.) — never full names
- All text values must be written in English

{
  "code": "ISO 3166-1 alpha-2 (e.g. IT)",
  "id": "ISO 3166-1 alpha-3 (e.g. ITA)",
  "name": "common country name in English",
  "officialName": "full official name in English",
  "flag": "national flag emoji",
  "capital": "capital city name",
  "region": "geographic region in English",
  "subregion": "subregion in English",
  "continent": "continent in English",
  "population": integer (total population),
  "populationDensity": decimal (inhabitants per km²),
  "area": integer (total area in km²),
  "languages": ["official language 1", "official language 2"],
  "currency": "currency name and symbol (e.g. Euro €)",
  "timezones": ["UTC+1"],
  "tld": ".xx",
  "callingCode": "+XX",
  "independenceDate": "independence date or N/A",
  "motto": "national motto in English or N/A",
  "governmentForm": "government form in English (e.g. Parliamentary Republic)",
  "politicalSystem": "political system in English (e.g. Multiparty Representative Democracy)",

  "summary": "short phrase: country identity in English (max 8 words)",
  "overview": "3-4 sentences covering: current political situation, economic state, and main geopolitical dynamics in English. Max 4 sentences, no filler.",

  "leadership": {
    "headOfState": {
      "name": "full name",
      "title": "title in English",
      "photo": "",
      "party": "party or movement",
      "termStart": "year term began (e.g. 2022)",
      "bio": "short phrase: role in English (max 8 words)"
    },
    "headOfGovernment": {
      "name": "full name (same as headOfState if identical)",
      "title": "title in English",
      "photo": "",
      "party": "party or coalition",
      "termStart": "year term began",
      "bio": "short phrase: role in English (max 8 words)"
    }
  },

  "internalPolitics": {
    "rulingParty": "ruling party or coalition",
    "opposition": "main opposition parties",
    "stability": "short phrase: stability level in English (max 8 words)",
    "recentElections": "last major election: type, year, result",
    "nextElections": "next scheduled elections with approximate date",
    "parliamentStructure": "1 sentence parliament description in English",
    "politicalOrientation": "current government political orientation in English"
  },

  "indicators": {
    "democracyIndex": decimal 0.0–10.0 (Economist Democracy Index),
    "pressFreedom": integer 0–100 (RSF Press Freedom Index; 100 = most free),
    "corruptionPerception": integer 0–100 (Transparency International CPI; 100 = least corrupt),
    "economicFreedom": integer 0–100 (Heritage Foundation Economic Freedom Index)
  },

  "economy": {
    "gdpNominal": "formatted nominal GDP (e.g. $2.1T, €450B)",
    "gdpNominalNumeric": number in billions USD (e.g. 2100 for $2.1T, 450 for $450B),
    "gdpPerCapita": "formatted GDP per capita (e.g. $45,230)",
    "gdpPerCapitaNumeric": number in USD (e.g. 45230),
    "growth": "annual GDP growth rate (e.g. 2.1%)",
    "growthNumeric": number as decimal (e.g. 2.1),
    "inflation": "annual inflation rate (e.g. 3.2%)",
    "inflationNumeric": number as decimal (e.g. 3.2),
    "unemployment": "unemployment rate (e.g. 5.8%)",
    "unemploymentNumeric": number as decimal (e.g. 5.8),
    "debtToGdp": "public debt as % of GDP (e.g. 134.8%)",
    "debtToGdpNumeric": number as decimal (e.g. 134.8),
    "rating": "sovereign credit rating (e.g. BBB, AA-)",
    "giniIndex": "Gini index (e.g. 35)",
    "fdi": "net annual FDI formatted",
    "sectors": [
      { "name": "sector name in English", "share": percentage number, "description": "short phrase: sector role (max 6 words)" }
    ]
  },

  "trade": {
    "imports": "total imports formatted (e.g. $420B)",
    "importsNumeric": number in billions USD,
    "exports": "total exports formatted (e.g. $380B)",
    "exportsNumeric": number in billions USD,
    "balance": "trade balance formatted (e.g. -$40B)",
    "partners": [
      { "name": "partner country name", "code": "XX", "share": percentage number }
    ],
    "importSectors": [
      { "name": "import category in English", "share": percentage number }
    ],
    "exportSectors": [
      { "name": "export category in English", "share": percentage number }
    ]
  },

  "geopolitics": {
    "position": "1 sentence strategic geopolitical position in English",
    "allies": [{ "name": "ally country name", "code": "XX" }],
    "rivals": [{ "name": "rival country name", "code": "XX" }],
    "strategicImportance": "short phrase: strategic role (max 8 words)",
    "treaties": ["treaty or agreement name", "treaty 2"],
    "disputes": ["brief territorial or political dispute in English", "dispute 2"],
    "conflicts": ["brief active conflict or tension in English", "conflict 2"],
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
    "strengths": ["strength 1 in English", "strength 2", "strength 3", "strength 4"],
    "weaknesses": ["weakness 1 in English", "weakness 2", "weakness 3"],
    "opportunities": ["opportunity 1 in English", "opportunity 2", "opportunity 3"],
    "threats": ["threat 1 in English", "threat 2", "threat 3"]
  },

  "energy": {
    "totalProduction": "total primary energy production formatted (e.g. 320 Mtoe, 1,200 TWh)",
    "mix": [
      { "source": "energy source in English (e.g. Natural Gas, Renewables, Nuclear, Coal, Oil, Hydro)", "share": percentage number }
    ],
    "dependence": "energy import dependency (e.g. 75% import dependent)",
    "resources": ["strategic energy or mineral resource 1", "resource 2"],
    "capacity": "installed electricity generation capacity (e.g. 120 GW)",
    "emissions": "total CO₂ emissions formatted (e.g. 320 Mt CO₂/yr)",
    "policies": ["key energy or climate policy in English", "policy 2"],
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
      "tanks": "total tanks and armoured vehicles formatted",
      "aircraft": "total military aircraft (fighters, bombers, helicopters) formatted",
      "ships": "total principal naval vessels formatted"
    },
    "nuclearWeapons": "number of nuclear warheads or 'None'",
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

const importantCountries = [
  "United States", "China", "Russia", "Germany", "France", "United Kingdom",
  "Japan", "India", "Brazil", "Italy", "Canada", "South Korea", "Australia",
  "Spain", "Mexico", "Turkey", "Saudi Arabia", "Israel", "Iran", "Ukraine",
  "North Korea", "Taiwan", "Vatican City", "Switzerland", "Netherlands",
];

function parseJsonResponse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
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

async function callClaude(
  anthropicKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens = 16000,
): Promise<{ parsed: unknown; error?: string }> {
  let claudeResponse: Response;
  try {
    claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    return { parsed: null, error: `Claude API request failed: ${String(err)}` };
  }

  if (!claudeResponse.ok) {
    const errText = await claudeResponse.text();
    return { parsed: null, error: `Claude API error: ${errText}` };
  }

  const claudeData = await claudeResponse.json();
  const textBlock = claudeData.content?.find(
    (b: { type: string }) => b.type === "text",
  );
  const parsed = parseJsonResponse(textBlock?.text || "{}");

  if (!parsed) {
    return { parsed: null, error: "Failed to parse Claude response as JSON" };
  }

  return { parsed };
}

async function generateEnglishData(
  countryName: string,
  anthropicKey: string,
  supabase: ReturnType<typeof createClient>,
): Promise<{ result: Record<string, unknown> | null; error?: string }> {
  const model = importantCountries.includes(countryName)
    ? "claude-sonnet-4-6"
    : "claude-haiku-4-5-20251001";

  const { parsed, error } = await callClaude(
    anthropicKey,
    model,
    "You are an expert geopolitical and economic analyst. Reply ONLY with a valid JSON object, without additional text, comments, or markdown formatting. All text values must be in English.",
    buildPrompt(countryName),
  );

  if (error || !parsed) {
    return { result: null, error: error || "Failed to generate English data" };
  }

  const result = {
    ...(parsed as Record<string, unknown>),
    lastUpdated: new Date().toLocaleString("en-US"),
  };

  // Save English data to Supabase
  const { error: upsertError } = await supabase
    .from("country_cache")
    .upsert(
      {
        country_code: countryName,
        language: "en",
        data: result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "country_code,language" },
    );

  if (upsertError) {
    return { result: null, error: `Supabase upsert failed: ${upsertError.message}` };
  }

  return { result };
}

async function translateData(
  englishData: Record<string, unknown>,
  language: string,
  anthropicKey: string,
): Promise<{ result: Record<string, unknown> | null; error?: string }> {
  const langName = LANG_NAMES[language] || "English";
  const englishJson = JSON.stringify(englishData);

  const translationPrompt = `Translate ONLY the text fields of this JSON to ${langName}. Keep ALL numeric values, codes, acronyms, country names in arrays (allies, rivals, partners), organization acronyms, ISO codes, flag emojis, dates, and percentages exactly as they are. Only translate descriptive text fields like: name, officialName, region, subregion, continent, summary, overview, governmentForm, politicalSystem, leadership bios and titles, internalPolitics fields, economy sector names and descriptions, trade sector names, geopolitics text fields, defense fields, society fields, swot items, energy fields, arsenal text fields, strategicReserves text fields. Return ONLY the complete translated JSON object, no other text.

JSON to translate: ${englishJson}`;

  const { parsed, error } = await callClaude(
    anthropicKey,
    "claude-haiku-4-5-20251001",
    `You are a professional translator. Translate the JSON text fields to ${langName}. Return ONLY a valid JSON object. Keep all numeric values, codes, and structure exactly the same.`,
    translationPrompt,
  );

  if (error || !parsed) {
    return { result: null, error: error || "Failed to translate data" };
  }

  const result = {
    ...(parsed as Record<string, unknown>),
    lastUpdated: new Date().toLocaleString(LANG_LOCALES[language] || "en-US"),
  };

  return { result };
}

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Auth: must be called with the service role key
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let countryName: string;
  let language: string;

  try {
    const body = await req.json();
    countryName = body.countryName;
    language = body.language;
    if (!countryName || !language) throw new Error("Missing fields");
  } catch {
    return new Response(
      JSON.stringify({ error: "Body must contain countryName and language" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceRoleKey ?? "",
  );

  // Step 1: Generate or fetch English data
  if (language === "en") {
    const { result, error } = await generateEnglishData(countryName, anthropicKey, supabase);
    if (error || !result) {
      return new Response(
        JSON.stringify({ error: error || "Failed to generate English data" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, countryName, language }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Step 2: For non-English languages, fetch English data first
  let englishData: Record<string, unknown> | null = null;

  const { data: cachedRow, error: fetchError } = await supabase
    .from("country_cache")
    .select("data")
    .eq("country_code", countryName)
    .eq("language", "en")
    .single();

  if (!fetchError && cachedRow?.data) {
    englishData = cachedRow.data as Record<string, unknown>;
  } else {
    // English data doesn't exist — generate it first
    const { result, error } = await generateEnglishData(countryName, anthropicKey, supabase);
    if (error || !result) {
      return new Response(
        JSON.stringify({ error: error || "Failed to generate English data" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
    englishData = result;
  }

  // Step 3: Translate English data to target language
  const { result: translatedResult, error: translateError } = await translateData(
    englishData,
    language,
    anthropicKey,
  );

  if (translateError || !translatedResult) {
    return new Response(
      JSON.stringify({ error: translateError || "Failed to translate data" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  // Step 4: Save translated data to Supabase
  const { error: upsertError } = await supabase
    .from("country_cache")
    .upsert(
      {
        country_code: countryName,
        language,
        data: translatedResult,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "country_code,language" },
    );

  if (upsertError) {
    return new Response(
      JSON.stringify({ error: "Supabase upsert failed", detail: upsertError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, countryName, language }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
