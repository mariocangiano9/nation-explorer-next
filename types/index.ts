export interface BaseCountry {
  name: string;
  code: string;
  capital?: string;
  population?: number;
  area?: number;
  flagUrl?: string;
  languages?: string[];
  currency?: string;
  region?: string;
  subregion?: string;
}

export interface CountryData {
  code: string;
  id: string;
  name: string;
  officialName: string;
  flag: string;
  coatOfArms?: string;
  capital: string;
  region: string;
  subregion: string;
  continent: string;
  population: number;
  populationDensity: number;
  area: number;
  languages: string[];
  currency: string;
  timezones: string[];
  tld: string;
  callingCode: string;
  independenceDate?: string;
  motto?: string;
  summary: string;
  overview: string;
  lastUpdated: string;

  // Political
  governmentForm: string;
  politicalSystem: string;
  leadership: {
    headOfState: Leader;
    headOfGovernment: Leader;
  };
  internalPolitics: {
    rulingParty: string;
    opposition: string;
    stability: string;
    recentElections: string;
    nextElections: string;
    parliamentStructure: string;
    politicalOrientation: string;
  };

  // Indicators
  indicators: {
    democracyIndex: number;
    pressFreedom: number;
    corruptionPerception: number;
    economicFreedom: number;
  };

  // Economy
  economy: {
    gdpNominal: string;
    gdpPerCapita: string;
    growth: string;
    inflation: string;
    unemployment: string;
    debtToGdp: string;
    rating: string;
    giniIndex: string;
    fdi: string;
    sectors: { name: string; share: number; description: string }[];
  };

  // Trade
  trade: {
    imports: string;
    exports: string;
    balance: string;
    partners: { name: string; code: string; share: number }[];
    importSectors: { name: string; share: number }[];
    exportSectors: { name: string; share: number }[];
  };

  // Geopolitics
  geopolitics: {
    position: string;
    allies: { name: string; code: string }[];
    rivals: { name: string; code: string }[];
    strategicImportance: string;
    treaties: string[];
    disputes: string[];
    conflicts: string[];
    influence: string;
    softPower: string;
  };

  // Organizations
  organizations: string[];

  // Defense
  defense: {
    militarySpending: string;
    personnel: {
      active: string;
      reserve: string;
    };
    nuclear: {
      present: boolean;
      capacity: string;
    };
    internationalMissions: string[];
  };

  // Society
  society: {
    demographics: {
      medianAge: number;
      urbanization: string;
      growthRate: string;
    };
    education: string;
    healthcare: string;
    humanDevelopmentIndex: number;
    lifeExpectancy: number;
    happinessIndex: number;
    socialCohesion: string;
  };

  // SWOT
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Energy
  energy: {
    totalProduction: string;
    mix: { source: string; share: number }[];
    dependence: string;
    resources: string[];
    capacity: string;
    emissions: string;
    policies: string[];
    mainProviders: string[];
  };

  // Arsenal
  arsenal: {
    militaryPowerIndex: string;
    spending: {
      total: string;
      gdpShare: string;
    };
    personnel: {
      active: string;
      reserve: string;
    };
    equipment: {
      tanks: string;
      aircraft: string;
      ships: string;
    };
    nuclearWeapons?: string;
    militaryTech: string;
    missilesAndDefense: string;
    vehiclesAndInfrastructure: string;
    internationalMissions: string[];
  };

  // Strategic Reserves
  strategicReserves: {
    goldReserves: string;
    foreignExchangeReserves: string;
    rawMaterials: string[];
    miningProduction: string;
    sovereignWealthFunds: string;
    economicSecurity: string;
  };
}

export interface Leader {
  name: string;
  title: string;
  photo: string;
  party: string;
  termStart: string;
  bio: string;
}
