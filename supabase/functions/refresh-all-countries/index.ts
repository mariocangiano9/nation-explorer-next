import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Country + language data ────────────────────────────────────────────────────

const ALL_COUNTRIES: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
  "Democratic Republic of the Congo",
];

const LANGUAGES = ["it", "en", "fr", "es", "de"] as const;

const LANG_NAMES: Record<string, string> = {
  it: "Italian", en: "English", fr: "French", es: "Spanish", de: "German",
};

const LANG_LOCALES: Record<string, string> = {
  it: "it-IT", en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE",
};

// Flat list: 195 countries × 5 languages = 975 combinations
const ALL_COMBINATIONS: { country: string; language: string }[] = [];
for (const country of ALL_COUNTRIES) {
  for (const language of LANGUAGES) {
    ALL_COMBINATIONS.push({ country, language });
  }
}

// ── Prompt ─────────────────────────────────────────────────────────────────────

function buildPrompt(countryName: string, language: string): string {
  const langName = LANG_NAMES[language] || "English";
  const currentDate = new Date().toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });

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
      "ships": "DIGITS ONLY — total principal naval vessels as a formatted integer (e.g. 90). No vessel types, no parentheses."
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

function parseJsonResponse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch { /* fall through */ }
    }
    return null;
  }
}

// ── Core generation — calls Anthropic directly, saves to Supabase ─────────────

async function generateAndSave(
  country: string,
  language: string,
  anthropicKey: string,
  supabase: ReturnType<typeof createClient>,
): Promise<{ ok: boolean; reason?: string }> {
  const langName = LANG_NAMES[language] || "English";

  const requestBody = JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: `You are an expert geopolitical and economic analyst. Reply ONLY with a valid JSON object, without additional text, comments, or markdown formatting. All text values must be in ${langName}.`,
    messages: [{ role: "user", content: buildPrompt(country, language) }],
  });

  let claudeRes: Response | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: requestBody,
      });
    } catch (err) {
      return { ok: false, reason: `fetch error: ${String(err)}` };
    }

    if (claudeRes.status === 529) {
      const text = await claudeRes.text();
      console.warn(
        `[refresh-all-countries] 529 overloaded for ${country} (${language}), ` +
        `attempt ${attempt}/${MAX_RETRIES}. Waiting ${RETRY_DELAY_MS}ms... ${text}`,
      );
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
      return { ok: false, reason: `529 overloaded after ${MAX_RETRIES} attempts` };
    }

    break; // non-529 response — proceed
  }

  if (!claudeRes!.ok) {
    const text = await claudeRes!.text();
    return { ok: false, reason: `Anthropic ${claudeRes!.status}: ${text}` };
  }

  const claudeData = await claudeRes!.json();
  const textBlock = claudeData.content?.find(
    (b: { type: string }) => b.type === "text",
  );
  const parsed = parseJsonResponse(textBlock?.text || "{}");
  if (!parsed) {
    return { ok: false, reason: "JSON parse failed" };
  }

  const result = {
    ...(parsed as Record<string, unknown>),
    lastUpdated: new Date().toLocaleString(LANG_LOCALES[language] || "en-US"),
  };

  const { error } = await supabase
    .from("country_cache")
    .upsert(
      { country_code: country, language, data: result, updated_at: new Date().toISOString() },
      { onConflict: "country_code,language" },
    );

  if (error) {
    return { ok: false, reason: `upsert error: ${error.message}` };
  }

  return { ok: true };
}

// ── Batch processor with self-chaining ────────────────────────────────────────

const DEFAULT_BATCH_SIZE = 8;
const DELAY_MS = 8000;
const RETRY_DELAY_MS = 15000;
const MAX_RETRIES = 3;
const FRESH_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch(
  offset: number,
  batchSize: number,
  supabaseUrl: string,
  serviceRoleKey: string,
  anthropicKey: string,
): Promise<void> {
  const batch = ALL_COMBINATIONS.slice(offset, offset + batchSize);

  if (batch.length === 0) {
    console.log("[refresh-all-countries] No items in batch — all combinations processed.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Check freshness only for countries in this batch
  const batchCountries = [...new Set(batch.map((b) => b.country))];
  const { data: existingRows } = await supabase
    .from("country_cache")
    .select("country_code, language, updated_at")
    .in("country_code", batchCountries);

  const freshKeys = new Set<string>();
  for (const row of existingRows ?? []) {
    const ageMs = Date.now() - new Date(row.updated_at).getTime();
    if (ageMs < FRESH_THRESHOLD_MS) {
      freshKeys.add(`${row.country_code}::${row.language}`);
    }
  }

  let refreshed = 0;
  let skipped = 0;
  let failed = 0;

  for (const { country, language } of batch) {
    if (freshKeys.has(`${country}::${language}`)) {
      skipped++;
      continue;
    }

    const result = await generateAndSave(country, language, anthropicKey, supabase);
    if (result.ok) {
      refreshed++;
      console.log(`[refresh-all-countries] ✓ ${country} (${language})`);
    } else {
      failed++;
      console.error(`[refresh-all-countries] ✗ ${country} (${language}): ${result.reason}`);
    }

    await delay(DELAY_MS);
  }

  console.log(
    `[refresh-all-countries] Batch offset=${offset} done. ` +
    `refreshed=${refreshed} skipped=${skipped} failed=${failed} / total=${ALL_COMBINATIONS.length}`,
  );

  // Self-chain: trigger next batch if more remain
  const nextOffset = offset + batchSize;
  if (nextOffset < ALL_COMBINATIONS.length) {
    console.log(`[refresh-all-countries] Chaining offset=${nextOffset}...`);
    try {
      const chainRes = await fetch(
        `${supabaseUrl}/functions/v1/refresh-all-countries`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ offset: nextOffset, batchSize }),
        },
      );
      if (!chainRes.ok) {
        const text = await chainRes.text();
        console.error(`[refresh-all-countries] Chain call failed: ${chainRes.status} ${text}`);
      }
    } catch (err) {
      console.error(`[refresh-all-countries] Chain call threw: ${String(err)}`);
    }
  } else {
    console.log("[refresh-all-countries] ✅ All batches complete.");
  }
}

// ── HTTP handler ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

  const validTokens = new Set<string>(
    [cronSecret ? `Bearer ${cronSecret}` : null, `Bearer ${serviceRoleKey}`]
      .filter(Boolean) as string[],
  );

  if (!authHeader || !validTokens.has(authHeader)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY secret not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let offset = 0;
  let batchSize = DEFAULT_BATCH_SIZE;
  try {
    const body = await req.json();
    if (typeof body.offset === "number" && body.offset >= 0) offset = body.offset;
    if (typeof body.batchSize === "number" && body.batchSize > 0) batchSize = body.batchSize;
  } catch { /* use defaults */ }

  console.log(
    `[refresh-all-countries] Starting batch offset=${offset} batchSize=${batchSize} ` +
    `(${ALL_COMBINATIONS.length - offset} remaining)`,
  );

  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime?.waitUntil(
    processBatch(offset, batchSize, supabaseUrl, serviceRoleKey, anthropicKey),
  );

  return new Response(
    JSON.stringify({
      message: "Batch accepted",
      offset,
      batchSize,
      totalCombinations: ALL_COMBINATIONS.length,
      remaining: ALL_COMBINATIONS.length - offset,
      estimatedBatches: Math.ceil((ALL_COMBINATIONS.length - offset) / batchSize),
    }),
    { status: 202, headers: { "Content-Type": "application/json" } },
  );
});
