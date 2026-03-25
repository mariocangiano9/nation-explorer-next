import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Globe, Landmark, TrendingUp, Users, Shield, Zap,
  Briefcase, Info, ChevronRight, BarChart3, HeartPulse,
  Smile, BookOpen, Activity, Clock, Phone, Map, Crosshair, User, Compass,
  Sword, Target, Cpu, Anchor, Plane, Truck, ShieldAlert,
  Coins, Gem, Pickaxe, Wallet, Landmark as Bank, Loader2, RefreshCw, Heart, FileDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Sector
} from 'recharts';
import { CountryData } from '../types';
import { cn, getFlagEmoji } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { getCountryData } from '../services/claudeDataService.js';
import { saveToSupabaseCache } from '../services/supabaseService.js';
import { isFavorite, addFavorite, removeFavorite } from '../services/favoritesService';
import { addToPdfHistory } from '../services/pdfHistoryService';

interface CountryProfileProps {
  countryName: string;
  data: CountryData | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCountryClick?: (name: string) => void;
  onShowAuth?: () => void;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const translations = {
  it: {
    loading: "Analisi Geopolitica in corso...",
    analyzing: "Interrogazione database Nation Explorer...",
    overview: "Panoramica",
    politics: "Politica",
    economy: "Economia",
    geopolitics: "Geopolitica",
    society: "Società",
    energy: "Energia",
    capital: "Capitale",
    continent: "Continente",
    region: "Regione",
    population: "Popolazione",
    popDensity: "Densità abitativa",
    area: "Superficie",
    currency: "Valuta",
    languages: "Lingue",
    indicators: "Indicatori di Governance",
    democracy: "Indice Democrazia",
    press: "Libertà Stampa",
    corruption: "Percezione Corruzione",
    econFreedom: "Libertà Economica",
    headOfState: "Capo di Stato",
    headOfGov: "Capo del Governo",
    politicalSystem: "Sistema Politico",
    form: "Forma di Stato",
    system: "Sistema",
    stability: "Stabilità Interna",
    elections: "Ultime Elezioni",
    gdpNominal: "PIL Nominale",
    gdpCapita: "PIL Pro Capite",
    growth: "Crescita PIL",
    inflation: "Inflazione",
    unemployment: "Disoccupazione",
    debtGdp: "Debito/PIL",
    giniIndex: "Indice Gini",
    fdi: "IDE (Investimenti Esteri)",
    partners: "Principali Partner Commerciali",
    economicSectors: "Composizione Settoriale Economia",
    importSectors: "Composizione Importazioni",
    exportSectors: "Composizione Esportazioni",
    strategicPosition: "Posizionamento Strategico",
    alliances: "Alleanze Principali",
    conflicts: "Conflitti e Tensioni",
    swotAnalysis: "Analisi SWOT",
    strengths: "Punti di Forza",
    weaknesses: "Punti di Debolezza",
    energyResources: "Risorse Energetiche",
    energyMix: "Mix Energetico",
    nextElections: "Prossime Elezioni",
    parliament: "Struttura Parlamentare",
    orientation: "Orientamento Politico",
    treaties: "Trattati Internazionali",
    disputes: "Contenziosi Territoriali",
    influence: "Sfera d'Influenza",
    demographics: "Demografia",
    medianAge: "Età Media",
    urbanization: "Urbanizzazione",
    growthRate: "Tasso di Crescita",
    education: "Sistema Educativo",
    healthcare: "Sanità",
    hdi: "Indice Sviluppo Umano (ISU)",
    lifeExpectancy: "Aspettativa di Vita",
    happinessIndex: "Indice di Felicità",
    socialCohesion: "Coesione Sociale",
    renewableShare: "Quota Rinnovabili",
    energySecurity: "Sicurezza Energetica",
    mainProviders: "Principali Fornitori",
    totalProduction: "Produzione Totale",
    energyDependence: "Dipendenza Energetica",
    productionCapacity: "Capacità Produttiva",
    co2Emissions: "Emissioni CO2",
    energyPolicies: "Politiche Energetiche",
    activePersonnel: "Personale Attivo",
    reservePersonnel: "Riserve",
    nuclearWeapons: "Armi Nucleari",
    militaryEquipment: "Equipaggiamento Militare",
    tanks: "Carri Armati",
    aircraft: "Aerei Militari",
    ships: "Unità Navali",
    militaryTech: "Tecnologia Militare",
    internationalMissions: "Missioni Internazionali",
    nuclearCapacity: "Capacità Nucleare",
    strategicReserves: "Riserve Strategiche",
    goldReserves: "Riserve Auree",
    foreignExchangeReserves: "Riserve Valutarie",
    rawMaterials: "Materie Prime Strategiche",
    miningProduction: "Produzione Mineraria",
    sovereignWealthFunds: "Fondi Sovrani",
    economicSecurity: "Sicurezza Economica",
    arsenal: "Arsenale",
    militarySpending: "Spesa Militare",
    militaryPersonnel: "Personale Militare",
    militaryPowerIndex: "Indice Forza Militare",
    gdp: "PIL",
    none: "Nessuna",
    landWeapons: "Armi Terrestri",
    airWeapons: "Armi Aeree",
    navalWeapons: "Armi Navali",
    missilesAndDefense: "Missili e Sistemi di Difesa",
    vehiclesAndInfrastructure: "Mezzi e Infrastrutture Militari",
    nuclearBombs: "Bombe Nucleari",
    softPower: "Soft Power",
    keyRelations: "Relazioni Chiave",
    allies: "Alleati",
    rivals: "Rivali",
    lastUpdated: "Ultimo aggiornamento",
    politicsDesc: "Descrive come è organizzato il potere.",
    organizations: "Organizzazioni Internazionali",
    errorTitle: "Errore nel caricamento",
    close: "Chiudi",
    noSectorData: "Dati settoriali non disponibili",
    noPartnerData: "Dati partner commerciali non disponibili",
    noOrganizations: "Nessuna organizzazione rilevata",
    noAllies: "Nessun alleato principale",
    noRivals: "Nessun rivale principale",
    noEnergyPolicies: "Politiche energetiche non disponibili",
    noMissions: "Missioni internazionali non disponibili",
    pdfReport: "Report PDF",
    refreshData: "Aggiorna dati",
    refreshing: "Aggiornamento...",
    recentlyRefreshed: "Aggiornato di recente",
    refreshSuccess: "Dati aggiornati!",
    addFavorite: "Aggiungi ai preferiti",
    removeFavorite: "Rimuovi dai preferiti",
    favLoginPrompt: "Accedi per salvare i tuoi paesi preferiti e sbloccare funzionalità esclusive come il confronto tra paesi, lo storico visite e gli aggiornamenti personalizzati.",
    favSignIn: "Accedi",
    definitions: {
      democracy: "Misura lo stato della democrazia basandosi su processo elettorale, libertà civili e partecipazione politica.",
      press: "Valuta il grado di libertà di cui godono giornalisti e media, e gli sforzi delle autorità per rispettarla.",
      corruption: "Classifica i paesi in base a quanto il loro settore pubblico è percepito come corrotto da esperti e imprese.",
      econFreedom: "Misura il diritto fondamentale di ogni individuo di controllare il proprio lavoro e la propria proprietà.",
      gdpNominal: "Il valore totale di mercato di tutti i beni e servizi finali prodotti all'interno di un paese in un anno.",
      gdpCapita: "Il PIL diviso per la popolazione media, indicando la ricchezza media per persona.",
      growth: "La variazione percentuale annua del PIL, indicando la velocità di espansione dell'economia.",
      inflation: "Il tasso di aumento dei prezzi di beni e servizi, che riduce il potere d'acquisto della moneta.",
      unemployment: "La percentuale di persone nella forza lavoro che sono senza impiego ma lo stanno cercando.",
      debtGdp: "Il rapporto tra il debito pubblico e il PIL, indicando la capacità di un paese di ripagare il debito.",
      giniIndex: "Misura la disuguaglianza nella distribuzione del reddito. 0 rappresenta la perfetta uguaglianza, 100 la perfetta disuguaglianza.",
      fdi: "Investimenti effettuati da un'impresa o individuo in un paese nelle attività commerciali di un altro paese.",
      population: "Il numero totale di persone che vivono permanentemente in un determinato territorio.",
      popDensity: "Il numero medio di persone che vivono per chilometro quadrato di superficie terrestre.",
      area: "La dimensione totale del territorio di un paese, inclusi i corpi idrici interni (laghi, fiumi).",
      hdi: "Indice composito che misura i risultati medi in tre dimensioni fondamentali dello sviluppo umano: una vita lunga e sana, la conoscenza e uno standard di vita dignitoso.",
      lifeExpectancy: "Il numero medio di anni che un neonato potrebbe aspettarsi di vivere se i modelli di mortalità prevalenti al momento della sua nascita rimanessero gli stessi per tutta la sua vita.",
      happinessIndex: "Misura del benessere soggettivo basata sulle valutazioni dei cittadini sulla propria vita, supportata da indicatori economici e sociali.",
      militarySpending: "La spesa totale del governo per le forze armate e le attività di difesa.",
      militaryPowerIndex: "Indice che classifica la potenza militare globale basandosi su oltre 60 fattori individuali.",
      renewableShare: "La percentuale di energia prodotta da fonti rinnovabili rispetto al consumo totale.",
      energySecurity: "La disponibilità ininterrotta di fonti energetiche a un prezzo accessibile.",
      medianAge: "L'età che divide la popolazione in due gruppi numericamente uguali.",
      urbanization: "La percentuale della popolazione totale che vive in aree urbane.",
      growthRate: "La variazione percentuale annua della popolazione.",
      form: "Descrive la struttura istituzionale e l'organizzazione del potere politico di un paese (es. Repubblica, Monarchia, Federazione).",
      politicalSystem: "Classifica il regime politico in base al livello di democrazia e libertà (es. Democrazia, Autoritarismo).",
      governmentForm: "Specifica il tipo di governo e la relazione tra i poteri (es. Presidenziale, Parlamentare).",
      strategicPosition: "Analisi della posizione geografica in relazione a rotte commerciali, colli di bottiglia (chokepoints) e importanza militare.",
      alliances: "Principali organizzazioni e alleanze internazionali di cui il paese fa parte (es. NATO, UE, BRICS).",
      influence: "La capacità del paese di proiettare potere e influenzare decisioni a livello regionale o globale.",
      conflicts: "Tensioni diplomatiche, conflitti armati o instabilità che coinvolgono direttamente il paese.",
      softPower: "L'influenza esercitata attraverso la cultura, la diplomazia, i valori politici e l'attrattività del modello sociale.",
      disputes: "Controversie riguardanti la sovranità su specifici territori o confini terrestri e marittimi.",
      totalProduction: "La quantità totale di energia prodotta dal paese da tutte le fonti.",
      energyDependence: "La percentuale di energia che il paese deve importare per soddisfare il proprio fabbisogno.",
      productionCapacity: "La potenza massima che gli impianti di generazione elettrica del paese possono produrre.",
      co2Emissions: "La quantità totale di anidride carbonica rilasciata nell'atmosfera a causa delle attività umane nel paese.",
      energyPolicies: "Le strategie e le leggi adottate dal governo per gestire la produzione, il consumo e la sostenibilità dell'energia.",
      activePersonnel: "Il numero di soldati attualmente in servizio attivo nelle forze armate.",
      reservePersonnel: "Il numero di soldati addestrati pronti a essere richiamati in caso di necessità.",
      militaryEquipment: "Il conteggio dei principali mezzi di combattimento terrestri, aerei e navali.",
      militaryTech: "Il livello di avanzamento tecnologico, ricerca e sviluppo nel settore della difesa.",
      internationalMissions: "Le operazioni di peacekeeping o interventi militari all'estero a cui il paese partecipa.",
      nuclearCapacity: "Lo stato e la consistenza dell'arsenale atomico o delle capacità di deterrenza nucleare.",
      goldReserves: "La quantità di oro detenuta dalla banca centrale come riserva di valore.",
      foreignExchangeReserves: "Le attività in valuta estera detenute dalla banca centrale (es. USD, EUR).",
      rawMaterials: "Riserve di risorse naturali critiche come petrolio, gas e minerali rari.",
      miningProduction: "Il volume e il valore dell'estrazione di minerali e risorse dal sottosuolo.",
      sovereignWealthFunds: "Fondi di investimento di proprietà dello Stato finanziati dalle riserve o dalle esportazioni.",
      economicSecurity: "La resilienza dell'economia nazionale a shock esterni e la protezione delle infrastrutture critiche.",
    }
  },
  en: {
    loading: "Geopolitical Analysis in progress...",
    analyzing: "Querying Nation Explorer database...",
    overview: "Overview",
    politics: "Politics",
    economy: "Economy",
    geopolitics: "Geopolitics",
    society: "Society",
    energy: "Energy",
    capital: "Capital",
    continent: "Continent",
    region: "Region",
    population: "Population",
    popDensity: "Population Density",
    area: "Area",
    currency: "Currency",
    languages: "Languages",
    indicators: "Governance Indicators",
    democracy: "Democracy Index",
    press: "Press Freedom",
    corruption: "Corruption Perception",
    econFreedom: "Economic Freedom",
    headOfState: "Head of State",
    headOfGov: "Head of Government",
    politicalSystem: "Political System",
    form: "Form of State",
    system: "System",
    stability: "Internal Stability",
    elections: "Recent Elections",
    gdpNominal: "Nominal GDP",
    gdpCapita: "GDP per Capita",
    growth: "GDP Growth",
    inflation: "Inflation",
    unemployment: "Unemployment",
    debtGdp: "Debt/GDP",
    giniIndex: "Gini Index",
    fdi: "FDI (Foreign Direct Investment)",
    partners: "Main Trading Partners",
    economicSectors: "Economic Sector Composition",
    importSectors: "Import Composition",
    exportSectors: "Export Composition",
    strategicPosition: "Strategic Positioning",
    alliances: "Main Alliances",
    conflicts: "Conflicts and Tensions",
    swotAnalysis: "SWOT Analysis",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    energyResources: "Energy Resources",
    energyMix: "Energy Mix",
    nextElections: "Next Elections",
    parliament: "Parliamentary Structure",
    orientation: "Political Orientation",
    treaties: "International Treaties",
    disputes: "Territorial Disputes",
    influence: "Sphere of Influence",
    demographics: "Demographics",
    medianAge: "Median Age",
    urbanization: "Urbanization",
    growthRate: "Growth Rate",
    education: "Education System",
    healthcare: "Healthcare",
    hdi: "Human Development Index (HDI)",
    lifeExpectancy: "Life Expectancy",
    happinessIndex: "Happiness Index",
    socialCohesion: "Social Cohesion",
    renewableShare: "Renewable Share",
    energySecurity: "Energy Security",
    mainProviders: "Main Providers",
    totalProduction: "Total Production",
    energyDependence: "Energy Dependence",
    productionCapacity: "Production Capacity",
    co2Emissions: "CO2 Emissions",
    energyPolicies: "Energy Policies",
    activePersonnel: "Active Personnel",
    reservePersonnel: "Reserve Personnel",
    nuclearWeapons: "Nuclear Weapons",
    militaryEquipment: "Military Equipment",
    tanks: "Tanks",
    aircraft: "Aircraft",
    ships: "Ships",
    militaryTech: "Military Technology",
    internationalMissions: "International Missions",
    nuclearCapacity: "Nuclear Capacity",
    strategicReserves: "Strategic Reserves",
    goldReserves: "Gold Reserves",
    foreignExchangeReserves: "Foreign Exchange Reserves",
    rawMaterials: "Strategic Raw Materials",
    miningProduction: "Mining Production",
    sovereignWealthFunds: "Sovereign Wealth Funds",
    economicSecurity: "Economic Security",
    arsenal: "Arsenal",
    militarySpending: "Military Spending",
    militaryPersonnel: "Military Personnel",
    militaryPowerIndex: "Military Power Index",
    gdp: "GDP",
    none: "None",
    landWeapons: "Land Weapons",
    airWeapons: "Air Weapons",
    navalWeapons: "Naval Weapons",
    missilesAndDefense: "Missiles and Defense Systems",
    vehiclesAndInfrastructure: "Military Vehicles and Infrastructure",
    nuclearBombs: "Nuclear Bombs",
    softPower: "Soft Power",
    keyRelations: "Key Relations",
    allies: "Allies",
    rivals: "Rivals",
    lastUpdated: "Last updated",
    politicsDesc: "Describes how power is organized.",
    organizations: "International Organizations",
    errorTitle: "Loading error",
    close: "Close",
    noSectorData: "Sector data not available",
    noPartnerData: "Trading partner data not available",
    noOrganizations: "No organizations detected",
    noAllies: "No major allies",
    noRivals: "No major rivals",
    noEnergyPolicies: "Energy policies not available",
    noMissions: "International missions not available",
    pdfReport: "PDF Report",
    refreshData: "Refresh data",
    refreshing: "Refreshing...",
    recentlyRefreshed: "Recently refreshed",
    refreshSuccess: "Data updated!",
    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",
    favLoginPrompt: "Sign in to save your favorite countries and unlock exclusive features like country comparison, visit history, and personalized updates.",
    favSignIn: "Sign In",
    definitions: {
      democracy: "Measures the state of democracy based on electoral process, civil liberties, and political participation.",
      press: "Assesses the degree of freedom enjoyed by journalists and media, and the efforts of authorities to respect it.",
      corruption: "Ranks countries based on how corrupt their public sector is perceived to be by experts and businesspeople.",
      econFreedom: "Measures the fundamental right of every human to control his or her own labor and property.",
      gdpNominal: "The total market value of all final goods and services produced within a country in a year.",
      gdpCapita: "GDP divided by average population, indicating average wealth per person.",
      growth: "The annual percentage change in GDP, indicating the speed of economic expansion.",
      inflation: "The rate of increase in prices for goods and services, reducing the purchasing power of money.",
      unemployment: "The percentage of people in the labor force who are without a job but are seeking one.",
      debtGdp: "The ratio of public debt to GDP, indicating a country's ability to repay its debt.",
      giniIndex: "Measures the inequality in income distribution. 0 represents perfect equality, 100 perfect inequality.",
      fdi: "Investment made by a firm or individual in one country into business interests located in another country.",
      population: "The total number of people permanently living in a given territory.",
      popDensity: "The average number of people living per square kilometer of land area.",
      area: "The total size of a country's territory, including inland water bodies (lakes, rivers).",
      hdi: "Composite index measuring average achievement in three basic dimensions of human development: a long and healthy life, knowledge, and a decent standard of living.",
      lifeExpectancy: "The average number of years a newborn could expect to live if prevailing mortality patterns at the time of birth were to stay the same throughout its life.",
      happinessIndex: "Measure of subjective well-being based on citizens' evaluations of their own lives, supported by economic and social indicators.",
      militarySpending: "Total government spending on armed forces and defense activities.",
      militaryPowerIndex: "Index ranking global military power based on over 60 individual factors.",
      renewableShare: "Percentage of energy produced from renewable sources relative to total consumption.",
      energySecurity: "Uninterrupted availability of energy sources at an affordable price.",
      medianAge: "The age that divides a population into two numerically equal groups.",
      urbanization: "The percentage of the total population living in urban areas.",
      growthRate: "The annual percentage change in the population.",
      form: "Describes the institutional structure and organization of political power in a country (e.g., Republic, Monarchy, Federation).",
      politicalSystem: "Classifies the political regime based on the level of democracy and freedom (e.g., Democracy, Authoritarianism).",
      governmentForm: "Specifies the type of government and the relationship between powers (e.g., Presidential, Parliamentary).",
      strategicPosition: "Analysis of geographic position in relation to trade routes, chokepoints, and military importance.",
      alliances: "Main international organizations and alliances the country belongs to (e.g., NATO, EU, BRICS).",
      influence: "The country's ability to project power and influence decisions at a regional or global level.",
      conflicts: "Diplomatic tensions, armed conflicts, or instability directly involving the country.",
      softPower: "Influence exerted through culture, diplomacy, political values, and the attractiveness of the social model.",
      disputes: "Controversies regarding sovereignty over specific territories or land and sea borders.",
      totalProduction: "The total amount of energy produced by the country from all sources.",
      energyDependence: "The percentage of energy that the country must import to meet its needs.",
      productionCapacity: "The maximum power that the country's electricity generation plants can produce.",
      co2Emissions: "The total amount of carbon dioxide released into the atmosphere due to human activities in the country.",
      energyPolicies: "The strategies and laws adopted by the government to manage energy production, consumption, and sustainability.",
      activePersonnel: "The number of soldiers currently in active service in the armed forces.",
      reservePersonnel: "The number of trained soldiers ready to be called up in case of need.",
      militaryEquipment: "The count of main land, air, and naval combat assets.",
      militaryTech: "The level of technological advancement, research, and development in the defense sector.",
      internationalMissions: "Peacekeeping operations or military interventions abroad in which the country participates.",
      nuclearCapacity: "The status and size of the atomic arsenal or nuclear deterrence capabilities.",
      goldReserves: "The amount of gold held by the central bank as a store of value.",
      foreignExchangeReserves: "Foreign currency assets held by the central bank (e.g., USD, EUR).",
      rawMaterials: "Reserves of critical natural resources such as oil, gas, and rare minerals.",
      miningProduction: "The volume and value of mineral and resource extraction from the subsoil.",
      sovereignWealthFunds: "State-owned investment funds financed by reserves or exports.",
      economicSecurity: "The resilience of the national economy to external shocks and the protection of critical infrastructure.",
    }
  },
  fr: {
    loading: "Analyse géopolitique en cours...",
    analyzing: "Interrogation de la base de données Nation Explorer...",
    overview: "Aperçu", politics: "Politique", economy: "Économie", geopolitics: "Géopolitique",
    society: "Société", energy: "Énergie", capital: "Capitale", continent: "Continent",
    region: "Région", population: "Population", popDensity: "Densité de population",
    area: "Superficie", currency: "Monnaie", languages: "Langues",
    indicators: "Indicateurs de gouvernance", democracy: "Indice de démocratie",
    press: "Liberté de la presse", corruption: "Perception de la corruption",
    econFreedom: "Liberté économique", headOfState: "Chef d'État",
    headOfGov: "Chef du gouvernement", politicalSystem: "Système politique",
    form: "Forme de l'État", system: "Système", stability: "Stabilité interne",
    elections: "Dernières élections", gdpNominal: "PIB nominal", gdpCapita: "PIB par habitant",
    growth: "Croissance du PIB", inflation: "Inflation", unemployment: "Chômage",
    debtGdp: "Dette/PIB", giniIndex: "Indice de Gini",
    fdi: "IDE (Investissements directs étrangers)",
    partners: "Principaux partenaires commerciaux",
    economicSectors: "Composition des secteurs économiques",
    importSectors: "Composition des importations", exportSectors: "Composition des exportations",
    strategicPosition: "Positionnement stratégique", alliances: "Principales alliances",
    conflicts: "Conflits et tensions", swotAnalysis: "Analyse SWOT",
    strengths: "Points forts", weaknesses: "Faiblesses",
    energyResources: "Ressources énergétiques", energyMix: "Mix énergétique",
    nextElections: "Prochaines élections", parliament: "Structure parlementaire",
    orientation: "Orientation politique", treaties: "Traités internationaux",
    disputes: "Différends territoriaux", influence: "Sphère d'influence",
    demographics: "Démographie", medianAge: "Âge médian", urbanization: "Urbanisation",
    growthRate: "Taux de croissance", education: "Système éducatif", healthcare: "Santé",
    hdi: "Indice de développement humain (IDH)", lifeExpectancy: "Espérance de vie",
    happinessIndex: "Indice de bonheur", socialCohesion: "Cohésion sociale",
    renewableShare: "Part des renouvelables", energySecurity: "Sécurité énergétique",
    mainProviders: "Principaux fournisseurs", totalProduction: "Production totale",
    energyDependence: "Dépendance énergétique", productionCapacity: "Capacité de production",
    co2Emissions: "Émissions de CO2", energyPolicies: "Politiques énergétiques",
    activePersonnel: "Personnel actif", reservePersonnel: "Réserves",
    nuclearWeapons: "Armes nucléaires", militaryEquipment: "Équipement militaire",
    tanks: "Chars d'assaut", aircraft: "Aéronefs militaires", ships: "Navires de guerre",
    militaryTech: "Technologie militaire", internationalMissions: "Missions internationales",
    nuclearCapacity: "Capacité nucléaire", strategicReserves: "Réserves stratégiques",
    goldReserves: "Réserves d'or", foreignExchangeReserves: "Réserves de change",
    rawMaterials: "Matières premières stratégiques", miningProduction: "Production minière",
    sovereignWealthFunds: "Fonds souverains", economicSecurity: "Sécurité économique",
    arsenal: "Arsenal", militarySpending: "Dépenses militaires",
    militaryPersonnel: "Personnel militaire", militaryPowerIndex: "Indice de puissance militaire",
    gdp: "PIB", none: "Aucune", landWeapons: "Armements terrestres",
    airWeapons: "Armements aériens", navalWeapons: "Armements navals",
    missilesAndDefense: "Missiles et systèmes de défense",
    vehiclesAndInfrastructure: "Véhicules militaires et infrastructures",
    nuclearBombs: "Bombes nucléaires", softPower: "Soft Power",
    keyRelations: "Relations clés", allies: "Alliés", rivals: "Rivaux",
    lastUpdated: "Dernière mise à jour",
    politicsDesc: "Décrit comment le pouvoir est organisé.",
    organizations: "Organisations internationales",
    errorTitle: "Erreur de chargement", close: "Fermer",
    noSectorData: "Données sectorielles non disponibles",
    noPartnerData: "Données partenaires commerciaux non disponibles",
    noOrganizations: "Aucune organisation détectée",
    noAllies: "Aucun allié principal", noRivals: "Aucun rival principal",
    noEnergyPolicies: "Politiques énergétiques non disponibles",
    noMissions: "Missions internationales non disponibles",
    pdfReport: "Rapport PDF",
    refreshData: "Actualiser les données",
    refreshing: "Actualisation...",
    recentlyRefreshed: "Actualisé récemment",
    refreshSuccess: "Données actualisées !",
    addFavorite: "Ajouter aux favoris",
    removeFavorite: "Retirer des favoris",
    favLoginPrompt: "Connectez-vous pour sauvegarder vos pays favoris et débloquer des fonctionnalités exclusives comme la comparaison de pays, l'historique des visites et les mises à jour personnalisées.",
    favSignIn: "Se connecter",
    definitions: {
      democracy: "Mesure l'état de la démocratie en fonction du processus électoral, des libertés civiles et de la participation politique.",
      press: "Évalue le degré de liberté dont jouissent les journalistes et les médias.",
      corruption: "Classe les pays selon la perception de la corruption dans leur secteur public.",
      econFreedom: "Mesure le droit fondamental de chaque individu à contrôler son travail et sa propriété.",
      gdpNominal: "La valeur totale de marché de tous les biens et services finaux produits dans un pays en un an.",
      gdpCapita: "Le PIB divisé par la population moyenne, indiquant la richesse moyenne par personne.",
      growth: "La variation annuelle en pourcentage du PIB.",
      inflation: "Le taux d'augmentation des prix des biens et services.",
      unemployment: "Le pourcentage de personnes dans la population active qui sont sans emploi.",
      debtGdp: "Le ratio de la dette publique au PIB.",
      giniIndex: "Mesure l'inégalité dans la distribution des revenus. 0 représente l'égalité parfaite.",
      fdi: "Investissement réalisé par une entreprise dans les activités commerciales d'un autre pays.",
      population: "Le nombre total de personnes vivant en permanence sur un territoire donné.",
      popDensity: "Le nombre moyen de personnes vivant par kilomètre carré.",
      area: "La superficie totale du territoire d'un pays.",
      hdi: "Indice composite mesurant les résultats moyens dans trois dimensions du développement humain.",
      lifeExpectancy: "Le nombre moyen d'années qu'un nouveau-né pourrait espérer vivre.",
      happinessIndex: "Mesure du bien-être subjectif basée sur les évaluations des citoyens.",
      militarySpending: "Dépenses totales du gouvernement pour les forces armées et la défense.",
      militaryPowerIndex: "Indice classant la puissance militaire mondiale basé sur plus de 60 facteurs.",
      renewableShare: "Pourcentage d'énergie produite à partir de sources renouvelables.",
      energySecurity: "Disponibilité ininterrompue de sources d'énergie à un prix abordable.",
      medianAge: "L'âge qui divise la population en deux groupes numériquement égaux.",
      urbanization: "Le pourcentage de la population totale vivant dans des zones urbaines.",
      growthRate: "La variation annuelle en pourcentage de la population.",
      form: "Décrit la structure institutionnelle et l'organisation du pouvoir politique.",
      politicalSystem: "Classe le régime politique selon le niveau de démocratie.",
      governmentForm: "Précise le type de gouvernement et la relation entre les pouvoirs.",
      strategicPosition: "Analyse de la position géographique par rapport aux routes commerciales.",
      alliances: "Principales organisations et alliances internationales auxquelles appartient le pays.",
      influence: "La capacité du pays à projeter sa puissance et à influencer les décisions.",
      conflicts: "Tensions diplomatiques, conflits armés ou instabilité impliquant directement le pays.",
      softPower: "Influence exercée à travers la culture, la diplomatie et les valeurs politiques.",
      disputes: "Controverses concernant la souveraineté sur des territoires spécifiques.",
      totalProduction: "La quantité totale d'énergie produite par le pays.",
      energyDependence: "Le pourcentage d'énergie que le pays doit importer.",
      productionCapacity: "La puissance maximale que les centrales électriques du pays peuvent produire.",
      co2Emissions: "La quantité totale de CO2 rejetée dans l'atmosphère.",
      energyPolicies: "Les stratégies et lois adoptées par le gouvernement pour gérer l'énergie.",
      activePersonnel: "Le nombre de soldats actuellement en service actif.",
      reservePersonnel: "Le nombre de soldats entraînés prêts à être rappelés.",
      militaryEquipment: "Le décompte des principaux actifs de combat terrestres, aériens et navals.",
      militaryTech: "Le niveau d'avancement technologique dans le secteur de la défense.",
      internationalMissions: "Opérations de maintien de la paix ou interventions militaires à l'étranger.",
      nuclearCapacity: "L'état et la taille de l'arsenal atomique ou des capacités de dissuasion nucléaire.",
      goldReserves: "La quantité d'or détenue par la banque centrale comme réserve de valeur.",
      foreignExchangeReserves: "Les avoirs en devises étrangères détenus par la banque centrale.",
      rawMaterials: "Réserves de ressources naturelles critiques comme le pétrole, le gaz et les minéraux rares.",
      miningProduction: "Le volume et la valeur de l'extraction de minéraux et de ressources.",
      sovereignWealthFunds: "Fonds d'investissement appartenant à l'État financés par des réserves ou des exportations.",
      economicSecurity: "La résilience de l'économie nationale aux chocs externes.",
    }
  },
  es: {
    loading: "Análisis geopolítico en curso...",
    analyzing: "Consultando base de datos de Nation Explorer...",
    overview: "Resumen", politics: "Política", economy: "Economía", geopolitics: "Geopolítica",
    society: "Sociedad", energy: "Energía", capital: "Capital", continent: "Continente",
    region: "Región", population: "Población", popDensity: "Densidad de población",
    area: "Superficie", currency: "Moneda", languages: "Idiomas",
    indicators: "Indicadores de gobernanza", democracy: "Índice de democracia",
    press: "Libertad de prensa", corruption: "Percepción de corrupción",
    econFreedom: "Libertad económica", headOfState: "Jefe de Estado",
    headOfGov: "Jefe de Gobierno", politicalSystem: "Sistema político",
    form: "Forma de Estado", system: "Sistema", stability: "Estabilidad interna",
    elections: "Últimas elecciones", gdpNominal: "PIB nominal", gdpCapita: "PIB per cápita",
    growth: "Crecimiento del PIB", inflation: "Inflación", unemployment: "Desempleo",
    debtGdp: "Deuda/PIB", giniIndex: "Índice de Gini",
    fdi: "IED (Inversión extranjera directa)",
    partners: "Principales socios comerciales",
    economicSectors: "Composición sectorial de la economía",
    importSectors: "Composición de importaciones", exportSectors: "Composición de exportaciones",
    strategicPosition: "Posicionamiento estratégico", alliances: "Principales alianzas",
    conflicts: "Conflictos y tensiones", swotAnalysis: "Análisis FODA",
    strengths: "Fortalezas", weaknesses: "Debilidades",
    energyResources: "Recursos energéticos", energyMix: "Mix energético",
    nextElections: "Próximas elecciones", parliament: "Estructura parlamentaria",
    orientation: "Orientación política", treaties: "Tratados internacionales",
    disputes: "Disputas territoriales", influence: "Esfera de influencia",
    demographics: "Demografía", medianAge: "Edad mediana", urbanization: "Urbanización",
    growthRate: "Tasa de crecimiento", education: "Sistema educativo", healthcare: "Sanidad",
    hdi: "Índice de Desarrollo Humano (IDH)", lifeExpectancy: "Esperanza de vida",
    happinessIndex: "Índice de felicidad", socialCohesion: "Cohesión social",
    renewableShare: "Cuota de renovables", energySecurity: "Seguridad energética",
    mainProviders: "Principales proveedores", totalProduction: "Producción total",
    energyDependence: "Dependencia energética", productionCapacity: "Capacidad de producción",
    co2Emissions: "Emisiones de CO2", energyPolicies: "Políticas energéticas",
    activePersonnel: "Personal activo", reservePersonnel: "Reservas",
    nuclearWeapons: "Armas nucleares", militaryEquipment: "Equipamiento militar",
    tanks: "Tanques", aircraft: "Aeronaves militares", ships: "Buques de guerra",
    militaryTech: "Tecnología militar", internationalMissions: "Misiones internacionales",
    nuclearCapacity: "Capacidad nuclear", strategicReserves: "Reservas estratégicas",
    goldReserves: "Reservas de oro", foreignExchangeReserves: "Reservas de divisas",
    rawMaterials: "Materias primas estratégicas", miningProduction: "Producción minera",
    sovereignWealthFunds: "Fondos soberanos", economicSecurity: "Seguridad económica",
    arsenal: "Arsenal", militarySpending: "Gasto militar",
    militaryPersonnel: "Personal militar", militaryPowerIndex: "Índice de poder militar",
    gdp: "PIB", none: "Ninguna", landWeapons: "Armamento terrestre",
    airWeapons: "Armamento aéreo", navalWeapons: "Armamento naval",
    missilesAndDefense: "Misiles y sistemas de defensa",
    vehiclesAndInfrastructure: "Vehículos militares e infraestructuras",
    nuclearBombs: "Bombas nucleares", softPower: "Poder blando",
    keyRelations: "Relaciones clave", allies: "Aliados", rivals: "Rivales",
    lastUpdated: "Última actualización",
    politicsDesc: "Describe cómo está organizado el poder.",
    organizations: "Organizaciones internacionales",
    errorTitle: "Error de carga", close: "Cerrar",
    noSectorData: "Datos sectoriales no disponibles",
    noPartnerData: "Datos de socios comerciales no disponibles",
    noOrganizations: "Ninguna organización detectada",
    noAllies: "Ningún aliado principal", noRivals: "Ningún rival principal",
    noEnergyPolicies: "Políticas energéticas no disponibles",
    noMissions: "Misiones internacionales no disponibles",
    pdfReport: "Informe PDF",
    refreshData: "Actualizar datos",
    refreshing: "Actualizando...",
    recentlyRefreshed: "Actualizado recientemente",
    refreshSuccess: "Datos actualizados!",
    addFavorite: "Agregar a favoritos",
    removeFavorite: "Quitar de favoritos",
    favLoginPrompt: "Inicia sesión para guardar tus países favoritos y desbloquear funciones exclusivas como la comparación de países, el historial de visitas y las actualizaciones personalizadas.",
    favSignIn: "Iniciar sesión",
    definitions: {
      democracy: "Mide el estado de la democracia en función del proceso electoral, las libertades civiles y la participación política.",
      press: "Evalúa el grado de libertad del que gozan periodistas y medios de comunicación.",
      corruption: "Clasifica los países según la percepción de corrupción en su sector público.",
      econFreedom: "Mide el derecho fundamental de cada persona a controlar su propio trabajo y propiedad.",
      gdpNominal: "El valor total de mercado de todos los bienes y servicios finales producidos en un país en un año.",
      gdpCapita: "El PIB dividido por la población media, indicando la riqueza media por persona.",
      growth: "La variación porcentual anual del PIB.",
      inflation: "La tasa de aumento de precios de bienes y servicios.",
      unemployment: "El porcentaje de personas en la fuerza laboral que están sin empleo.",
      debtGdp: "La relación entre la deuda pública y el PIB.",
      giniIndex: "Mide la desigualdad en la distribución del ingreso. 0 representa perfecta igualdad.",
      fdi: "Inversión realizada por una empresa en actividades comerciales de otro país.",
      population: "El número total de personas que viven permanentemente en un territorio dado.",
      popDensity: "El número promedio de personas que viven por kilómetro cuadrado.",
      area: "El tamaño total del territorio de un país.",
      hdi: "Índice compuesto que mide los logros promedio en tres dimensiones del desarrollo humano.",
      lifeExpectancy: "El número promedio de años que un recién nacido podría esperar vivir.",
      happinessIndex: "Medida del bienestar subjetivo basada en las evaluaciones de los ciudadanos.",
      militarySpending: "Gasto total del gobierno en fuerzas armadas y actividades de defensa.",
      militaryPowerIndex: "Índice que clasifica el poder militar global basado en más de 60 factores.",
      renewableShare: "Porcentaje de energía producida de fuentes renovables.",
      energySecurity: "Disponibilidad ininterrumpida de fuentes de energía a un precio asequible.",
      medianAge: "La edad que divide la población en dos grupos numéricamente iguales.",
      urbanization: "El porcentaje de la población total que vive en áreas urbanas.",
      growthRate: "La variación porcentual anual de la población.",
      form: "Describe la estructura institucional y la organización del poder político.",
      politicalSystem: "Clasifica el régimen político según el nivel de democracia.",
      governmentForm: "Especifica el tipo de gobierno y la relación entre los poderes.",
      strategicPosition: "Análisis de la posición geográfica en relación con rutas comerciales.",
      alliances: "Principales organizaciones y alianzas internacionales a las que pertenece el país.",
      influence: "La capacidad del país para proyectar poder e influir en decisiones.",
      conflicts: "Tensiones diplomáticas, conflictos armados o inestabilidad que involucran al país.",
      softPower: "Influencia ejercida a través de la cultura, la diplomacia y los valores políticos.",
      disputes: "Controversias sobre la soberanía de territorios específicos.",
      totalProduction: "La cantidad total de energía producida por el país.",
      energyDependence: "El porcentaje de energía que el país debe importar.",
      productionCapacity: "La potencia máxima que las plantas de generación eléctrica del país pueden producir.",
      co2Emissions: "La cantidad total de CO2 liberado a la atmósfera.",
      energyPolicies: "Las estrategias y leyes adoptadas por el gobierno para gestionar la energía.",
      activePersonnel: "El número de soldados actualmente en servicio activo.",
      reservePersonnel: "El número de soldados entrenados listos para ser convocados.",
      militaryEquipment: "El recuento de los principales activos de combate terrestres, aéreos y navales.",
      militaryTech: "El nivel de avance tecnológico en el sector de defensa.",
      internationalMissions: "Operaciones de mantenimiento de la paz o intervenciones militares en el extranjero.",
      nuclearCapacity: "El estado y tamaño del arsenal atómico o las capacidades de disuasión nuclear.",
      goldReserves: "La cantidad de oro que tiene el banco central como reserva de valor.",
      foreignExchangeReserves: "Los activos en divisas extranjeras mantenidos por el banco central.",
      rawMaterials: "Reservas de recursos naturales críticos como petróleo, gas y minerales raros.",
      miningProduction: "El volumen y valor de la extracción de minerales y recursos.",
      sovereignWealthFunds: "Fondos de inversión de propiedad estatal financiados por reservas o exportaciones.",
      economicSecurity: "La resiliencia de la economía nacional frente a shocks externos.",
    }
  },
  de: {
    loading: "Geopolitische Analyse läuft...",
    analyzing: "Nation Explorer-Datenbank wird abgefragt...",
    overview: "Übersicht", politics: "Politik", economy: "Wirtschaft", geopolitics: "Geopolitik",
    society: "Gesellschaft", energy: "Energie", capital: "Hauptstadt", continent: "Kontinent",
    region: "Region", population: "Bevölkerung", popDensity: "Bevölkerungsdichte",
    area: "Fläche", currency: "Währung", languages: "Sprachen",
    indicators: "Governance-Indikatoren", democracy: "Demokratie-Index",
    press: "Pressefreiheit", corruption: "Korruptionswahrnehmung",
    econFreedom: "Wirtschaftsfreiheit", headOfState: "Staatsoberhaupt",
    headOfGov: "Regierungschef", politicalSystem: "Politisches System",
    form: "Staatsform", system: "System", stability: "Innere Stabilität",
    elections: "Letzte Wahlen", gdpNominal: "Nominales BIP", gdpCapita: "BIP pro Kopf",
    growth: "BIP-Wachstum", inflation: "Inflation", unemployment: "Arbeitslosigkeit",
    debtGdp: "Schulden/BIP", giniIndex: "Gini-Index",
    fdi: "ADI (Ausländische Direktinvestitionen)",
    partners: "Wichtigste Handelspartner",
    economicSectors: "Wirtschaftliche Sektorzusammensetzung",
    importSectors: "Importzusammensetzung", exportSectors: "Exportzusammensetzung",
    strategicPosition: "Strategische Positionierung", alliances: "Wichtigste Allianzen",
    conflicts: "Konflikte und Spannungen", swotAnalysis: "SWOT-Analyse",
    strengths: "Stärken", weaknesses: "Schwächen",
    energyResources: "Energieressourcen", energyMix: "Energiemix",
    nextElections: "Nächste Wahlen", parliament: "Parlamentsstruktur",
    orientation: "Politische Ausrichtung", treaties: "Internationale Verträge",
    disputes: "Territoriale Streitigkeiten", influence: "Einflussbereich",
    demographics: "Demografie", medianAge: "Medianalter", urbanization: "Urbanisierung",
    growthRate: "Wachstumsrate", education: "Bildungssystem", healthcare: "Gesundheitswesen",
    hdi: "Human Development Index (HDI)", lifeExpectancy: "Lebenserwartung",
    happinessIndex: "Glücksindex", socialCohesion: "Sozialer Zusammenhalt",
    renewableShare: "Erneuerbare-Anteil", energySecurity: "Energiesicherheit",
    mainProviders: "Hauptlieferanten", totalProduction: "Gesamtproduktion",
    energyDependence: "Energieabhängigkeit", productionCapacity: "Produktionskapazität",
    co2Emissions: "CO2-Emissionen", energyPolicies: "Energiepolitik",
    activePersonnel: "Aktive Soldaten", reservePersonnel: "Reservisten",
    nuclearWeapons: "Atomwaffen", militaryEquipment: "Militärausrüstung",
    tanks: "Panzer", aircraft: "Militärflugzeuge", ships: "Kriegsschiffe",
    militaryTech: "Militärtechnologie", internationalMissions: "Internationale Missionen",
    nuclearCapacity: "Nuklearkapazität", strategicReserves: "Strategische Reserven",
    goldReserves: "Goldreserven", foreignExchangeReserves: "Devisenreserven",
    rawMaterials: "Strategische Rohstoffe", miningProduction: "Bergbauproduktion",
    sovereignWealthFunds: "Staatsfonds", economicSecurity: "Wirtschaftssicherheit",
    arsenal: "Arsenal", militarySpending: "Militärausgaben",
    militaryPersonnel: "Militärpersonal", militaryPowerIndex: "Militärmacht-Index",
    gdp: "BIP", none: "Keine", landWeapons: "Landwaffen",
    airWeapons: "Luftwaffen", navalWeapons: "Seewaffen",
    missilesAndDefense: "Raketen und Verteidigungssysteme",
    vehiclesAndInfrastructure: "Militärfahrzeuge und Infrastruktur",
    nuclearBombs: "Atombomben", softPower: "Soft Power",
    keyRelations: "Schlüsselbeziehungen", allies: "Verbündete", rivals: "Rivalen",
    lastUpdated: "Zuletzt aktualisiert",
    politicsDesc: "Beschreibt, wie die Macht organisiert ist.",
    organizations: "Internationale Organisationen",
    errorTitle: "Ladefehler", close: "Schließen",
    noSectorData: "Sektordaten nicht verfügbar",
    noPartnerData: "Handelspartnerdaten nicht verfügbar",
    noOrganizations: "Keine Organisationen erkannt",
    noAllies: "Keine wichtigen Verbündeten", noRivals: "Keine wichtigen Rivalen",
    noEnergyPolicies: "Energiepolitik nicht verfügbar",
    noMissions: "Internationale Missionen nicht verfügbar",
    pdfReport: "PDF-Bericht",
    refreshData: "Daten aktualisieren",
    refreshing: "Aktualisierung...",
    recentlyRefreshed: "Kürzlich aktualisiert",
    refreshSuccess: "Daten aktualisiert!",
    addFavorite: "Zu Favoriten hinzufügen",
    removeFavorite: "Aus Favoriten entfernen",
    favLoginPrompt: "Melde dich an, um deine Lieblingsländer zu speichern und exklusive Funktionen wie den Ländervergleich, den Besuchsverlauf und personalisierte Updates freizuschalten.",
    favSignIn: "Anmelden",
    definitions: {
      democracy: "Misst den Zustand der Demokratie anhand von Wahlprozess, bürgerlichen Freiheiten und politischer Teilhabe.",
      press: "Bewertet den Grad der Freiheit, den Journalisten und Medien genießen.",
      corruption: "Bewertet, wie korrupt der öffentliche Sektor eines Landes wahrgenommen wird.",
      econFreedom: "Misst das grundlegende Recht jedes Menschen, seine eigene Arbeit und sein Eigentum zu kontrollieren.",
      gdpNominal: "Der gesamte Marktwert aller endgültigen Güter und Dienstleistungen, die in einem Land in einem Jahr produziert wurden.",
      gdpCapita: "Das BIP geteilt durch die durchschnittliche Bevölkerung.",
      growth: "Die jährliche prozentuale Veränderung des BIP.",
      inflation: "Die Rate des Preisanstiegs für Waren und Dienstleistungen.",
      unemployment: "Der Prozentsatz der Erwerbspersonen, die ohne Arbeit sind.",
      debtGdp: "Das Verhältnis von Staatsverschuldung zum BIP.",
      giniIndex: "Misst die Ungleichheit in der Einkommensverteilung. 0 steht für vollkommene Gleichheit.",
      fdi: "Investitionen eines Unternehmens in Geschäftsinteressen in einem anderen Land.",
      population: "Die Gesamtzahl der Personen, die dauerhaft in einem bestimmten Gebiet leben.",
      popDensity: "Die durchschnittliche Anzahl von Personen pro Quadratkilometer.",
      area: "Die Gesamtgröße des Territoriums eines Landes.",
      hdi: "Zusammengesetzter Index, der die durchschnittlichen Leistungen in drei Dimensionen der menschlichen Entwicklung misst.",
      lifeExpectancy: "Die durchschnittliche Anzahl von Jahren, die ein Neugeborenes erwarten könnte zu leben.",
      happinessIndex: "Maß des subjektiven Wohlbefindens basierend auf den Einschätzungen der Bürger.",
      militarySpending: "Gesamte Regierungsausgaben für Streitkräfte und Verteidigungsaktivitäten.",
      militaryPowerIndex: "Index, der die globale Militärmacht anhand von mehr als 60 Faktoren bewertet.",
      renewableShare: "Prozentsatz der aus erneuerbaren Quellen produzierten Energie.",
      energySecurity: "Unterbrechungsfreie Verfügbarkeit von Energiequellen zu einem erschwinglichen Preis.",
      medianAge: "Das Alter, das eine Bevölkerung in zwei numerisch gleiche Gruppen teilt.",
      urbanization: "Der Prozentsatz der Gesamtbevölkerung, der in städtischen Gebieten lebt.",
      growthRate: "Die jährliche prozentuale Veränderung der Bevölkerung.",
      form: "Beschreibt die institutionelle Struktur und Organisation der politischen Macht.",
      politicalSystem: "Klassifiziert das politische Regime nach dem Grad der Demokratie.",
      governmentForm: "Gibt die Art der Regierung und die Beziehung zwischen den Gewalten an.",
      strategicPosition: "Analyse der geografischen Lage in Bezug auf Handelsrouten und militärische Bedeutung.",
      alliances: "Wichtigste internationale Organisationen und Allianzen, denen das Land angehört.",
      influence: "Die Fähigkeit des Landes, Macht zu projizieren und Entscheidungen zu beeinflussen.",
      conflicts: "Diplomatische Spannungen, bewaffnete Konflikte oder Instabilität, die das Land direkt betreffen.",
      softPower: "Einfluss, der durch Kultur, Diplomatie und politische Werte ausgeübt wird.",
      disputes: "Streitigkeiten über die Souveränität über bestimmte Gebiete.",
      totalProduction: "Die Gesamtmenge der vom Land produzierten Energie.",
      energyDependence: "Der Prozentsatz der Energie, die das Land importieren muss.",
      productionCapacity: "Die maximale Leistung, die die Stromerzeugungsanlagen des Landes produzieren können.",
      co2Emissions: "Die Gesamtmenge an CO2, die durch menschliche Aktivitäten freigesetzt wird.",
      energyPolicies: "Die vom Regierung verabschiedeten Strategien und Gesetze zur Verwaltung der Energie.",
      activePersonnel: "Die Anzahl der Soldaten, die derzeit im aktiven Dienst sind.",
      reservePersonnel: "Die Anzahl der ausgebildeten Soldaten, die bei Bedarf einberufen werden können.",
      militaryEquipment: "Die Anzahl der wichtigsten Land-, Luft- und Seekampfmittel.",
      militaryTech: "Das Niveau des technologischen Fortschritts im Verteidigungssektor.",
      internationalMissions: "Friedenssicherungseinsätze oder militärische Interventionen im Ausland.",
      nuclearCapacity: "Der Status und die Größe des Atomarsenals oder der nuklearen Abschreckungsfähigkeiten.",
      goldReserves: "Die von der Zentralbank als Wertreserve gehaltene Goldmenge.",
      foreignExchangeReserves: "Von der Zentralbank gehaltene Devisenanlagen.",
      rawMaterials: "Reserven kritischer natürlicher Ressourcen wie Öl, Gas und seltene Mineralien.",
      miningProduction: "Das Volumen und der Wert der Mineralien- und Ressourcengewinnung.",
      sovereignWealthFunds: "Staatliche Investmentfonds, die durch Reserven oder Exporte finanziert werden.",
      economicSecurity: "Die Widerstandsfähigkeit der nationalen Wirtschaft gegenüber externen Schocks.",
    }
  },
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AnimatedBar = (props: any) => {
  const { x, y, width: targetWidth, height, fill, index = 0 } = props;
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(targetWidth);
    }, index * 80);
    return () => clearTimeout(timer);
  }, [targetWidth, index]);

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={4}
      style={{
        transition: 'width 800ms cubic-bezier(0.0, 0, 0.2, 1), filter 200ms ease, opacity 200ms ease',
        filter: hovered ? `drop-shadow(0 0 6px ${fill}99)` : 'none',
        opacity: hovered ? 1 : 0.82,
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '8px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
      }}
    >
      {label && (
        <p style={{ color: '#94a3b8', fontSize: '10px', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || '#fff', fontSize: '13px', fontWeight: 700, margin: 0 }}>
          {entry.value}%{' '}
          <span style={{ color: '#64748b', fontWeight: 400, fontSize: '11px' }}>{entry.name}</span>
        </p>
      ))}
    </motion.div>
  );
};

const ActivePieShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 3}
      outerRadius={outerRadius + 7}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      style={{ filter: `drop-shadow(0 0 8px ${fill}88)`, transition: 'all 200ms ease' }}
    />
  );
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-800 rounded-lg", className)} />
);

export const CountryProfile: React.FC<CountryProfileProps> = React.memo(({ countryName, data: initialData, loading, error, onClose, onCountryClick, onShowAuth, language }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderImages, setLeaderImages] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
  const [refreshedData, setRefreshedData] = useState<CountryData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showFavLoginPrompt, setShowFavLoginPrompt] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const data = refreshedData || initialData;

  const { user } = useAuth();
  const t = translations[language];

  const REFRESH_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
  const getRefreshKey = () => `ne_refresh_${countryName}_${language}`;

  const isRecentlyRefreshed = useCallback(() => {
    try {
      const ts = localStorage.getItem(getRefreshKey());
      if (!ts) return false;
      return Date.now() - Number(ts) < REFRESH_COOLDOWN;
    } catch {
      return false;
    }
  }, [countryName, language]);

  const [cooldown, setCooldown] = useState(isRecentlyRefreshed);

  const canRefresh = useCallback(() => !cooldown, [cooldown]);

  useEffect(() => {
    setCooldown(isRecentlyRefreshed());
    setRefreshedData(null);
  }, [countryName, language, isRecentlyRefreshed]);

  useEffect(() => {
    if (!user || !data?.code) return;
    let cancelled = false;
    isFavorite(user.id, data.code).then(val => { if (!cancelled) setFavorited(val); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, data?.code]);

  const handleToggleFavorite = useCallback(async () => {
    if (!data) return;
    if (!user) {
      setShowFavLoginPrompt(true);
      return;
    }
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);
    try {
      if (favorited) {
        await removeFavorite(user.id, data.code);
        setFavorited(false);
      } else {
        await addFavorite(user.id, data.code, data.name || countryName);
        setFavorited(true);
      }
    } catch {}
  }, [user, data, countryName, favorited]);

  const handleNavigateToCountry = useCallback((name: string) => {
    onClose();
    if (onCountryClick) onCountryClick(name);
  }, [onClose, onCountryClick]);

  const handleRefresh = useCallback(async () => {
    if (refreshing || cooldown) return;
    setRefreshing(true);
    try {
      // Clear localStorage cache to force API call
      const cacheKey = `nation_explorer_v1_${language}_${encodeURIComponent(countryName)}`;
      localStorage.removeItem(cacheKey);

      const newData = await getCountryData(countryName, language);
      if (newData) {
        setRefreshedData(newData as CountryData);
        await saveToSupabaseCache(countryName, language, newData);
        localStorage.setItem(getRefreshKey(), String(Date.now()));
        setCooldown(true);
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
      }
    } catch {
      // refresh failed silently
    } finally {
      setRefreshing(false);
    }
  }, [countryName, language, refreshing, cooldown]);

  const handleDownloadPdf = useCallback(() => {
    if (!data) return;
    const d = data;
    const flag = getFlagEmoji(d.code);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const section = (title: string, content: string) =>
      `<div class="section"><h2>${title}</h2>${content}</div>`;

    const row = (label: string, value: string | number | undefined | null) =>
      value != null && value !== '' ? `<tr><td class="label">${label}</td><td>${value}</td></tr>` : '';

    const list = (items: string[] | undefined) =>
      items?.length ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '';

    const leaderBlock = (l: { name?: string; title?: string; party?: string; termStart?: string; bio?: string } | undefined, heading: string) =>
      l?.name ? `<div class="leader"><strong>${heading}</strong><br/>${l.name}${l.title ? ` — ${l.title}` : ''}${l.party ? `<br/>${l.party}` : ''}${l.termStart ? ` (${l.termStart})` : ''}${l.bio ? `<br/><em>${l.bio}</em>` : ''}</div>` : '';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${d.name} — Nation Explorer Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;font-size:11px;line-height:1.5;padding:30px 40px}
.header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:20px}
.header .flag{font-size:40px;line-height:1}
.header h1{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.header .sub{color:#666;font-size:11px;margin-top:2px}
.brand{font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase}
.overview{font-size:12px;color:#333;margin-bottom:20px;line-height:1.6;border-left:3px solid #2563eb;padding-left:12px}
.section{margin-bottom:18px;page-break-inside:avoid}
.section h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563eb;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:8px}
table{width:100%;border-collapse:collapse;margin-bottom:8px}
tr{border-bottom:1px solid #f3f4f6}
td{padding:4px 8px 4px 0;vertical-align:top}
td.label{font-weight:600;color:#555;width:40%;white-space:nowrap}
ul{padding-left:18px;margin:4px 0}
li{margin-bottom:2px}
.leader{margin-bottom:8px;padding:6px 10px;background:#f8fafc;border-radius:4px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.footer{margin-top:24px;padding-top:10px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:9px;color:#999}
@media print{body{padding:20px 25px}.section{page-break-inside:avoid}}
</style></head><body>
<div class="header">
  <span class="flag">${flag}</span>
  <div>
    <div class="brand">Nation Explorer</div>
    <h1>${d.name}</h1>
    <div class="sub">${d.officialName || ''}${d.region ? ` — ${d.region}` : ''}${d.continent ? ` — ${d.continent}` : ''}</div>
  </div>
</div>

${d.overview ? `<div class="overview">${d.overview}</div>` : ''}

<div class="two-col">
${section(t.overview, `<table>
${row(t.capital, d.capital)}
${row(t.population, d.population?.toLocaleString())}
${row(t.popDensity, d.populationDensity ? `${d.populationDensity} /km²` : '')}
${row(t.area, d.area ? `${d.area.toLocaleString()} km²` : '')}
${row(t.languages, d.languages?.join(', '))}
${row(t.currency, d.currency)}
${row('Timezones', d.timezones?.join(', '))}
${row(t.form, d.governmentForm)}
${row(t.system, d.politicalSystem)}
${d.motto ? row('Motto', d.motto) : ''}
</table>`)}

${section(t.indicators, `<table>
${row(t.democracy, d.indicators?.democracyIndex)}
${row(t.press, d.indicators?.pressFreedom)}
${row(t.corruption, d.indicators?.corruptionPerception)}
${row(t.econFreedom, d.indicators?.economicFreedom)}
</table>`)}
</div>

${section(t.politics, `
${leaderBlock(d.leadership?.headOfState, t.headOfState)}
${leaderBlock(d.leadership?.headOfGovernment, t.headOfGov)}
<table>
${row(t.stability, d.internalPolitics?.stability)}
${row(t.elections, d.internalPolitics?.recentElections)}
${row(t.nextElections, d.internalPolitics?.nextElections)}
${row(t.parliament, d.internalPolitics?.parliamentStructure)}
${row(t.orientation, d.internalPolitics?.politicalOrientation)}
</table>`)}

<div class="two-col">
${section(t.economy, `<table>
${row(t.gdpNominal, d.economy?.gdpNominal)}
${row(t.gdpCapita, d.economy?.gdpPerCapita)}
${row(t.growth, d.economy?.growth)}
${row(t.inflation, d.economy?.inflation)}
${row(t.unemployment, d.economy?.unemployment)}
${row(t.debtGdp, d.economy?.debtToGdp)}
${row(t.giniIndex, d.economy?.giniIndex)}
${row(t.fdi, d.economy?.fdi)}
${row('Rating', d.economy?.rating)}
</table>
${d.economy?.sectors?.length ? `<strong>${t.economicSectors}</strong><table>${d.economy.sectors.map(s => `<tr><td class="label">${s.name}</td><td>${s.share}%</td></tr>`).join('')}</table>` : ''}`)}

${section(t.geopolitics, `<table>
${row(t.strategicPosition, d.geopolitics?.position)}
${row(t.influence, d.geopolitics?.influence)}
${row('Soft Power', d.geopolitics?.softPower)}
${row(t.strategicPosition, d.geopolitics?.strategicImportance)}
</table>
${d.geopolitics?.allies?.length ? `<strong>${t.alliances}</strong><ul>${d.geopolitics.allies.map(a => `<li>${a.name}</li>`).join('')}</ul>` : ''}
${d.geopolitics?.rivals?.length ? `<strong>Rivals</strong><ul>${d.geopolitics.rivals.map(r => `<li>${r.name}</li>`).join('')}</ul>` : ''}
${d.geopolitics?.treaties?.length ? `<strong>${t.treaties}</strong>${list(d.geopolitics.treaties)}` : ''}
${d.geopolitics?.disputes?.length ? `<strong>${t.disputes}</strong>${list(d.geopolitics.disputes)}` : ''}
${d.geopolitics?.conflicts?.length ? `<strong>${t.conflicts}</strong>${list(d.geopolitics.conflicts)}` : ''}`)}
</div>

${d.organizations?.length ? section('Organizations', `<p>${d.organizations.join(', ')}</p>`) : ''}

<div class="two-col">
${section(t.society, `<table>
${row(t.medianAge, d.society?.demographics?.medianAge)}
${row(t.urbanization, d.society?.demographics?.urbanization)}
${row(t.growthRate, d.society?.demographics?.growthRate)}
${row(t.education, d.society?.education)}
${row(t.healthcare, d.society?.healthcare)}
${row(t.hdi, d.society?.humanDevelopmentIndex)}
${row(t.lifeExpectancy, d.society?.lifeExpectancy ? `${d.society.lifeExpectancy} yr` : '')}
${row(t.happinessIndex, d.society?.happinessIndex)}
${row(t.socialCohesion, d.society?.socialCohesion)}
</table>`)}

${section(t.energy, `<table>
${row(t.totalProduction, d.energy?.totalProduction)}
${row(t.energyDependence, d.energy?.dependence)}
${row(t.productionCapacity, d.energy?.capacity)}
${row(t.co2Emissions, d.energy?.emissions)}
</table>
${d.energy?.mix?.length ? `<strong>${t.energyMix}</strong><table>${d.energy.mix.map(m => `<tr><td class="label">${m.source}</td><td>${m.share}%</td></tr>`).join('')}</table>` : ''}
${d.energy?.resources?.length ? `<strong>${t.energyResources}</strong>${list(d.energy.resources)}` : ''}
${d.energy?.mainProviders?.length ? `<strong>${t.mainProviders}</strong>${list(d.energy.mainProviders)}` : ''}
${d.energy?.policies?.length ? `<strong>${t.energyPolicies}</strong>${list(d.energy.policies)}` : ''}`)}
</div>

<div class="two-col">
${section(t.arsenal, `<table>
${row('Power Index', d.arsenal?.militaryPowerIndex)}
${row(t.militaryEquipment + ' — ' + t.tanks, d.arsenal?.equipment?.tanks)}
${row(t.aircraft, d.arsenal?.equipment?.aircraft)}
${row(t.ships, d.arsenal?.equipment?.ships)}
${row(t.activePersonnel, d.arsenal?.personnel?.active)}
${row(t.reservePersonnel, d.arsenal?.personnel?.reserve)}
${row(t.nuclearWeapons, d.arsenal?.nuclearWeapons)}
${row(t.militaryTech, d.arsenal?.militaryTech)}
</table>
${d.arsenal?.internationalMissions?.length ? `<strong>${t.internationalMissions}</strong>${list(d.arsenal.internationalMissions)}` : ''}`)}

${section(t.strategicReserves, `<table>
${row(t.goldReserves, d.strategicReserves?.goldReserves)}
${row(t.foreignExchangeReserves, d.strategicReserves?.foreignExchangeReserves)}
${row(t.miningProduction, d.strategicReserves?.miningProduction)}
${row(t.sovereignWealthFunds, d.strategicReserves?.sovereignWealthFunds)}
${row(t.economicSecurity, d.strategicReserves?.economicSecurity)}
</table>
${d.strategicReserves?.rawMaterials?.length ? `<strong>${t.rawMaterials}</strong>${list(d.strategicReserves.rawMaterials)}` : ''}`)}
</div>

${d.swot ? section(t.swotAnalysis, `<div class="two-col">
<div><strong>${t.strengths}</strong>${list(d.swot.strengths)}</div>
<div><strong>${t.weaknesses}</strong>${list(d.swot.weaknesses)}</div>
<div><strong>${'Opportunities'}</strong>${list(d.swot.opportunities)}</div>
<div><strong>${'Threats'}</strong>${list(d.swot.threats)}</div>
</div>`) : ''}

<div class="footer">
  <span>nationexplorer.com</span>
  <span>${dateStr}</span>
</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      addToPdfHistory(d.code, d.name || countryName);
    }
  }, [data, countryName, t]);

  useEffect(() => {
    if (data && activeTab === 'politics' && data.leadership) {
      const fetchImages = async () => {
        const leaders = [
          { key: 'hos', name: data.leadership.headOfState?.name, title: data.leadership.headOfState?.title },
          { key: 'hog', name: data.leadership.headOfGovernment?.name, title: data.leadership.headOfGovernment?.title }
        ];

        for (const leader of leaders) {
          if (leader.name && !leaderImages[leader.key] && !loadingImages[leader.key]) {
            setLoadingImages(prev => ({ ...prev, [leader.key]: true }));
            try {
              const encoded = encodeURIComponent(leader.name.replace(/ /g, '_'));
              const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
              let imageUrl = '';
              if (res.ok) {
                const json = await res.json();
                imageUrl = json.thumbnail?.source || '';
              }
              setLeaderImages(prev => ({ ...prev, [leader.key]: imageUrl }));
            } catch {
              // image unavailable — placeholder will show
            } finally {
              setLoadingImages(prev => ({ ...prev, [leader.key]: false }));
            }
          }
        }
      };

      fetchImages();
    }
  }, [data, activeTab]);

  // Reset images when data changes (new country)
  useEffect(() => {
    setLeaderImages({});
    setLoadingImages({});
  }, [data?.id]);

  const tabs = [
    { id: 'overview', label: t.overview, icon: Globe },
    { id: 'politics', label: t.politics, icon: Landmark },
    { id: 'economy', label: t.economy, icon: TrendingUp },
    { id: 'geopolitics', label: t.geopolitics, icon: Shield },
    { id: 'society', label: t.society, icon: Users },
    { id: 'energy', label: t.energy, icon: Zap },
    { id: 'arsenal', label: t.arsenal, icon: Crosshair },
    { id: 'reserves', label: t.strategicReserves, icon: Bank },
  ];

  return (
    <>
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700 rounded-full z-20" />
          
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10 border-b border-slate-800">
            <div className="max-w-7xl mx-auto p-4 md:p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
                {data ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl">{getFlagEmoji(data.code)}</span>
                    <div>
                      <h2 className="text-base md:text-xl font-bold text-white leading-none">{data.name}</h2>
                      <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{data.region}</p>
                    </div>
                    <button
                      onClick={handleToggleFavorite}
                      title={favorited ? t.removeFavorite : t.addFavorite}
                      className="p-2 rounded-lg transition-all hover:bg-slate-800/50"
                    >
                      <Heart
                        size={20}
                        fill={favorited ? 'red' : 'none'}
                        className={cn(
                          'transition-all duration-200',
                          favorited ? 'text-red-500' : 'text-slate-400 hover:text-red-400',
                          heartAnimating && 'scale-125'
                        )}
                      />
                    </button>
                    {user && (
                      <button
                        onClick={handleDownloadPdf}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <FileDown size={14} />
                        {t.pdfReport}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <p className="text-base font-bold text-white">{countryName}</p>
                      <Skeleton className="w-20 h-3" />
                    </div>
                  </div>
                )}
              </div>
              {data && (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Live Intelligence</span>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      {data?.lastUpdated && (
                        <span className="text-xs text-slate-500">
                          {t.lastUpdated}: {new Date(data.lastUpdated).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing || !canRefresh()}
                        title={canRefresh() ? t.refreshData : t.recentlyRefreshed}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                      </button>
                      {refreshSuccess && (
                        <span className="text-xs text-emerald-400">{t.refreshSuccess}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading && !data ? (
            <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 flex flex-col items-center justify-center min-h-[40vh] space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-blue-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white animate-pulse">
                  {t.loading}
                </h3>
                <p className="text-slate-400 text-sm">
                  {t.analyzing}
                </p>
              </div>
              
              <div className="w-full max-w-md space-y-4 pt-8">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-4/6 h-4" />
              </div>
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {t.errorTitle}
                </h3>
                <p className="text-slate-400 text-sm max-w-md">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
              >
                {t.close}
              </button>
            </div>
          ) : data && (
            <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
              {/* Summary */}
              <div className="mb-8">
                <p className="text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
                  {data.summary}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="space-y-8">
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">📌</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.overview}</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic px-2">
                      {data.overview}
                    </p>

                    {/* Main Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard label={t.capital} value={data.capital || 'N/A'} icon={Landmark} />
                        <InfoCard label={t.continent} value={data.continent || 'N/A'} icon={Globe} />
                        <InfoCard label={t.form} value={data.governmentForm || 'N/A'} icon={Shield} definition={(t as any).definitions.form} />
                        <InfoCard label={t.area} value={`${(data.area || 0).toLocaleString()} km²`} icon={Map} definition={(t as any).definitions.area} />
                        <InfoCard label={t.population} value={(data.population || 0).toLocaleString()} icon={Users} definition={(t as any).definitions.population} />
                        <InfoCard label={t.popDensity} value={`${(data.populationDensity || 0).toLocaleString()} ab/km²`} icon={Activity} definition={(t as any).definitions.popDensity} />
                        <InfoCard 
                          label={t.languages} 
                          value={(data.languages || []).length > 0 ? (data.languages || []).join(', ') : 'N/A'} 
                          icon={Info} 
                        />
                        <InfoCard label={t.currency} value={data.currency || 'N/A'} icon={Briefcase} />
                      </div>
                      
                      {/* Governance Indicators Card */}
                      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                          <Activity size={18} className="text-blue-400" />
                          {t.indicators}
                        </h3>
                        <div className="space-y-6">
                          <IndicatorItem 
                            icon={Shield} 
                            label={t.democracy} 
                            value={data.indicators?.democracyIndex || 0} 
                            max={10} 
                            color="bg-blue-500/20" 
                            definition={(t as any).definitions.democracy} 
                          />
                          <IndicatorItem 
                            icon={TrendingUp} 
                            label={t.econFreedom} 
                            value={data.indicators?.economicFreedom || 0} 
                            max={100} 
                            color="bg-purple-500/20" 
                            definition={(t as any).definitions.econFreedom} 
                          />
                          <IndicatorItem 
                            icon={Info} 
                            label={t.corruption} 
                            value={data.indicators?.corruptionPerception || 0} 
                            max={100} 
                            color="bg-emerald-500/20" 
                            definition={(t as any).definitions.corruption} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quality of Life Indicators */}
                    <div className="col-span-full">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <HeartPulse size={20} className="text-rose-500" />
                        {t.lifeExpectancy} & {t.hdi}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoCard label={t.lifeExpectancy} value={`${data.society?.lifeExpectancy || 'N/A'} anni`} icon={HeartPulse} definition={(t as any).definitions.lifeExpectancy} />
                        <InfoCard label={t.happinessIndex} value={`${data.society?.happinessIndex || 'N/A'} / 10`} icon={Smile} definition={(t as any).definitions.happinessIndex} />
                        <InfoCard label={t.hdi} value={(data.society?.humanDevelopmentIndex || 'N/A').toString()} icon={BookOpen} definition={(t as any).definitions.hdi} />
                        <InfoCard label={t.press} value={`${data.indicators?.pressFreedom || 'N/A'} / 100`} icon={Activity} definition={(t as any).definitions.press} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'politics' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">🏛️</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.politics}</h3>
                    </div>

                      {/* Leadership Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LeaderCard 
                          leader={data.leadership?.headOfState} 
                          label={t.headOfState} 
                          loading={loadingImages['hos']} 
                          image={leaderImages['hos']} 
                        />
                        <LeaderCard 
                          leader={data.leadership?.headOfGovernment} 
                          label={t.headOfGov} 
                          loading={loadingImages['hog']} 
                          image={leaderImages['hog']} 
                        />
                      </div>

                      {/* Political System Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                              <Shield size={14} />
                              {t.politicalSystem}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <InfoCard 
                                label={t.politicalSystem} 
                                value={data.politicalSystem || 'N/A'} 
                                icon={Activity} 
                                definition={(t as any).definitions.politicalSystem} 
                              />
                              <InfoCard 
                                label={t.form} 
                                value={data.governmentForm || 'N/A'} 
                                icon={Landmark} 
                                definition={(t as any).definitions.governmentForm} 
                              />
                              <InfoCard 
                                label={t.orientation} 
                                value={data.internalPolitics?.politicalOrientation || 'N/A'} 
                                icon={Compass} 
                              />
                              <InfoCard 
                                label={t.stability} 
                                value={data.internalPolitics?.stability || 'N/A'} 
                                icon={Activity} 
                              />
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-700/50">
                              <h5 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">{t.parliament}</h5>
                              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                {data.internalPolitics?.parliamentStructure || 'Informazione non disponibile'}
                              </p>
                            </div>
                          </div>

                          {/* Elections Section */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 flex items-center gap-4">
                              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <Clock size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.elections}</p>
                                <p className="text-white font-semibold">{data.internalPolitics?.recentElections || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 flex items-center gap-4">
                              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                <Clock size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.nextElections}</p>
                                <p className="text-white font-semibold">{data.internalPolitics?.nextElections || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Side Column: Indicators & Organizations */}
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                              <BarChart3 size={16} className="text-blue-400" />
                              {t.indicators}
                            </h4>
                            <div className="space-y-6">
                              <IndicatorItem 
                                icon={Shield} 
                                label={t.democracy} 
                                value={data.indicators?.democracyIndex || 0} 
                                max={10} 
                                color="bg-blue-500/20" 
                                definition={(t as any).definitions.democracy} 
                              />
                              <IndicatorItem 
                                icon={Activity} 
                                label={t.corruption} 
                                value={data.indicators?.corruptionPerception || 0} 
                                max={100} 
                                color="bg-emerald-500/20" 
                                definition={(t as any).definitions.corruption} 
                              />
                            </div>
                          </div>

                          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                            <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Globe size={14} />
                              {(t as any).organizations}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(data.organizations || []).length > 0 ? (data.organizations || []).map(org => (
                                <span 
                                  key={org} 
                                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:border-blue-500/50 transition-colors"
                                >
                                  {org}
                                </span>
                              )) : (
                                <p className="text-xs text-slate-500 italic">N/A</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                  </motion.div>
                )}

                {activeTab === 'economy' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">💰</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.economy}</h3>
                    </div>

                    {/* Main Economic Indicators */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatSimple label={t.gdpNominal} value={data.economy?.gdpNominal || 'N/A'} definition={(t as any).definitions?.gdpNominal} />
                      <StatSimple label={t.gdpCapita} value={data.economy?.gdpPerCapita || 'N/A'} definition={(t as any).definitions?.gdpCapita} />
                      <StatSimple label={t.growth} value={data.economy?.growth || 'N/A'} definition={(t as any).definitions?.growth} />
                      <StatSimple label={t.inflation} value={data.economy?.inflation || 'N/A'} definition={(t as any).definitions?.inflation} />
                      <StatSimple label={t.unemployment} value={data.economy?.unemployment || 'N/A'} definition={(t as any).definitions?.unemployment} />
                      <StatSimple label={t.debtGdp} value={data.economy?.debtToGdp || 'N/A'} definition={(t as any).definitions?.debtGdp} />
                      <StatSimple label={t.giniIndex} value={data.economy?.giniIndex || 'N/A'} definition={(t as any).definitions?.giniIndex} />
                      <StatSimple label={t.fdi} value={data.economy?.fdi || 'N/A'} definition={(t as any).definitions?.fdi} />
                    </div>

                    {/* Economic Sectors with Descriptions */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-1.5 mb-6">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.economicSectors}</h4>
                        <InfoIcon definition={(t as any).definitions?.economicSectors} />
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.economy?.sectors || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="share"
                                activeShape={ActivePieShape}
                              >
                                {(data.economy?.sectors || []).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="space-y-4">
                          {(data.economy?.sectors || []).length > 0 ? (data.economy?.sectors || []).map((entry, index) => (
                            <div key={entry.name} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 transition-colors duration-200 hover:bg-slate-800/70 hover:border-slate-700 cursor-default">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{entry.name} ({entry.share}%)</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                {entry.description}
                              </p>
                            </div>
                          )) : (
                            <p className="text-sm text-slate-500 italic">{t.noSectorData}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trade Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <StatSimple label={t.importSectors} value={data.trade?.imports || 'N/A'} definition={(t as any).definitions?.imports} />
                      <StatSimple label={t.exportSectors} value={data.trade?.exports || 'N/A'} definition={(t as any).definitions?.exports} />
                    </div>

                    {/* Trading Partners */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">{t.partners}</h4>
                      {(data.trade?.partners || []).length > 0 ? (
                        <>
                          <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={(data.trade?.partners || []).map(p => ({ ...p, displayName: `${getFlagEmoji(p.code)} ${p.name}` }))}
                                margin={{ left: 40, right: 30 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} unit="%" />
                                <YAxis dataKey="displayName" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="share" fill="#3b82f6" barSize={20} isAnimationActive={false} shape={(props: any) => <AnimatedBar {...props} />} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {(data.trade?.partners || []).map(p => (
                              <button key={p.code} onClick={() => handleNavigateToCountry(p.name)} className="flex items-center gap-1.5 text-xs bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-700/50 transition-colors hover:border-slate-600 cursor-pointer">
                                <span>{getFlagEmoji(p.code)}</span>
                                <span className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">{p.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 italic">{t.noPartnerData}</p>
                      )}
                    </div>

                    {/* Import/Export Composition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.importSectors}</h4>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.trade?.importSectors || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="share"
                                activeShape={ActivePieShape}
                              >
                                {(data.trade?.importSectors || []).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                          {(data.trade?.importSectors || []).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider p-2 bg-slate-900/30 rounded border border-slate-800/50 transition-colors duration-200 hover:bg-slate-800/60 hover:border-slate-700/70 cursor-default">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-bold text-slate-200">{entry.share}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.exportSectors}</h4>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.trade?.exportSectors || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="share"
                                activeShape={ActivePieShape}
                              >
                                {(data.trade?.exportSectors || []).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mt-4">
                          {(data.trade?.exportSectors || []).map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider p-2 bg-slate-900/30 rounded border border-slate-800/50 transition-colors duration-200 hover:bg-slate-800/60 hover:border-slate-700/70 cursor-default">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-bold text-slate-200">{entry.share}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'geopolitics' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">🌍</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.geopolitics}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strategic Position */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.strategicPosition}</h4>
                          <InfoIcon definition={(t as any).definitions?.strategicPosition} />
                        </div>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.geopolitics?.position || 'Informazione non disponibile'}</p>
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-300 italic">{data.geopolitics?.strategicImportance || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Influence */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.influence}</h4>
                          <InfoIcon definition={(t as any).definitions?.influence} />
                        </div>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.geopolitics?.influence || 'Informazione non disponibile'}</p>
                      </div>
                    </div>

                    {/* Alliances and Organizations */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                      <div className="flex items-center gap-1.5 mb-4">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.alliances}</h4>
                        <InfoIcon definition={(t as any).definitions?.alliances} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(data.organizations || []).length > 0 ? (data.organizations || []).map((org, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300 uppercase tracking-wider">
                            {org}
                          </span>
                        )) : (
                          <p className="text-xs text-slate-500 italic">{t.noOrganizations}</p>
                        )}
                      </div>
                    </div>

                    {/* Key Relations - Table style */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 overflow-hidden">
                      <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.keyRelations}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-800/30">
                          <h5 className="text-emerald-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                            <Users size={14} /> {t.allies}
                          </h5>
                          <div className="grid grid-cols-2 gap-2">
                            {(data.geopolitics?.allies || []).length > 0 ? (data.geopolitics?.allies || []).map(ally => (
                              <button key={ally.name} onClick={() => handleNavigateToCountry(ally.name)} className="flex items-center gap-2 text-xs text-emerald-100 bg-emerald-900/40 p-2 rounded border border-emerald-800/20 transition-colors duration-200 hover:bg-emerald-900/60 hover:border-emerald-700/40 cursor-pointer text-left">
                                <span>{getFlagEmoji(ally.code)}</span>
                                <span className="truncate text-blue-400 hover:text-blue-300 hover:underline transition-colors">{ally.name}</span>
                              </button>
                            )) : (
                              <p className="text-[10px] text-slate-500 italic col-span-2">{t.noAllies}</p>
                            )}
                          </div>
                        </div>
                        <div className="bg-rose-900/20 p-4 rounded-lg border border-rose-800/30">
                          <h5 className="text-rose-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                            <Shield size={14} /> {t.rivals}
                          </h5>
                          <div className="grid grid-cols-2 gap-2">
                            {(data.geopolitics?.rivals || []).length > 0 ? (data.geopolitics?.rivals || []).map(rival => (
                              <button key={rival.name} onClick={() => handleNavigateToCountry(rival.name)} className="flex items-center gap-2 text-xs text-rose-100 bg-rose-900/40 p-2 rounded border border-rose-800/20 transition-colors duration-200 hover:bg-rose-900/60 hover:border-rose-700/40 cursor-pointer text-left">
                                <span>{getFlagEmoji(rival.code)}</span>
                                <span className="truncate text-blue-400 hover:text-blue-300 hover:underline transition-colors">{rival.name}</span>
                              </button>
                            )) : (
                              <p className="text-[10px] text-slate-500 italic col-span-2">{t.noRivals}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Soft Power */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.softPower}</h4>
                          <InfoIcon definition={(t as any).definitions.softPower} />
                        </div>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.geopolitics?.softPower || 'Informazione non disponibile'}</p>
                      </div>

                      {/* Conflicts and Tensions */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-rose-400 text-xs font-bold uppercase tracking-wider">{t.conflicts}</h4>
                          <InfoIcon definition={(t as any).definitions.conflicts} />
                        </div>
                        <ul className="space-y-2">
                          {(data.geopolitics?.conflicts || []).map((conflict, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5" />
                              {conflict}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Territorial Disputes */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                      <div className="flex items-center gap-1.5 mb-4">
                        <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider">{t.disputes}</h4>
                        <InfoIcon definition={(t as any).definitions.disputes} />
                      </div>
                      <ul className="space-y-2">
                        {(data.geopolitics?.disputes || []).map((dispute, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                            {dispute}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'society' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">👥</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.society}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.demographics}</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-700 pb-2 relative group rounded px-2 -mx-2 transition-colors duration-200 hover:bg-slate-700/20 cursor-default">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-slate-400">{t.medianAge}</span>
                              <InfoIcon definition={(t as any).definitions?.medianAge} />
                            </div>
                            <span className="text-sm font-bold text-white">{data.society?.demographics?.medianAge || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-700 pb-2 relative group rounded px-2 -mx-2 transition-colors duration-200 hover:bg-slate-700/20 cursor-default">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-slate-400">{t.urbanization}</span>
                              <InfoIcon definition={(t as any).definitions?.urbanization} />
                            </div>
                            <span className="text-sm font-bold text-white">{data.society?.demographics?.urbanization || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-700 pb-2 relative group rounded px-2 -mx-2 transition-colors duration-200 hover:bg-slate-700/20 cursor-default">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-slate-400">{t.growthRate}</span>
                              <InfoIcon definition={(t as any).definitions?.growthRate} />
                            </div>
                            <span className="text-sm font-bold text-white">{data.society?.demographics?.growthRate || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center relative group">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-slate-400">{t.hdi}</span>
                              <InfoIcon definition={(t as any).definitions?.hdi} />
                            </div>
                            <span className="text-sm font-bold text-emerald-400">{data.society?.humanDevelopmentIndex || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.socialCohesion}</h4>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.society?.socialCohesion || 'Informazione non disponibile'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.education}</h4>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.society?.education || 'Informazione non disponibile'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.healthcare}</h4>
                        <p className="text-slate-200 leading-relaxed text-sm">{data.society?.healthcare || 'Informazione non disponibile'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.swotAnalysis}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-emerald-900/10 border border-emerald-800/30 p-4 rounded-xl">
                          <h5 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">{t.strengths}</h5>
                          <ul className="text-xs text-slate-300 space-y-1.5">
                            {(data.swot?.strengths || []).length > 0 ? (data.swot?.strengths || []).map(s => (
                              <li key={s} className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">▸</span>{s}</li>
                            )) : <li className="italic opacity-50">N/A</li>}
                          </ul>
                        </div>
                        <div className="bg-rose-900/10 border border-rose-800/30 p-4 rounded-xl">
                          <h5 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">{t.weaknesses}</h5>
                          <ul className="text-xs text-slate-300 space-y-1.5">
                            {(data.swot?.weaknesses || []).length > 0 ? (data.swot?.weaknesses || []).map(w => (
                              <li key={w} className="flex items-start gap-1.5"><span className="text-rose-500 mt-0.5">▸</span>{w}</li>
                            )) : <li className="italic opacity-50">N/A</li>}
                          </ul>
                        </div>
                        <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-xl">
                          <h5 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">{(t as any).opportunities}</h5>
                          <ul className="text-xs text-slate-300 space-y-1.5">
                            {(data.swot?.opportunities || []).length > 0 ? (data.swot?.opportunities || []).map(o => (
                              <li key={o} className="flex items-start gap-1.5"><span className="text-blue-500 mt-0.5">▸</span>{o}</li>
                            )) : <li className="italic opacity-50">N/A</li>}
                          </ul>
                        </div>
                        <div className="bg-amber-900/10 border border-amber-800/30 p-4 rounded-xl">
                          <h5 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">{(t as any).threats}</h5>
                          <ul className="text-xs text-slate-300 space-y-1.5">
                            {(data.swot?.threats || []).length > 0 ? (data.swot?.threats || []).map(th => (
                              <li key={th} className="flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">▸</span>{th}</li>
                            )) : <li className="italic opacity-50">N/A</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'energy' && data.energy && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">⚡</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.energy}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-2">
                          <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{t.totalProduction}</h4>
                          <InfoIcon definition={(t as any).definitions.totalProduction} />
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">{data.energy?.totalProduction || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-2">
                          <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{t.energyDependence}</h4>
                          <InfoIcon definition={(t as any).definitions.energyDependence} />
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">{data.energy?.dependence || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-2">
                          <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{t.productionCapacity}</h4>
                          <InfoIcon definition={(t as any).definitions.productionCapacity} />
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">{data.energy?.capacity || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Energy Mix Chart */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">{t.energyMix}</h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.energy?.mix || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="share"
                                nameKey="source"
                                activeShape={ActivePieShape}
                              >
                                {(data.energy?.mix || []).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                          {(data.energy?.mix || []).map((entry, index) => (
                            <div key={entry.source} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 transition-colors duration-200 hover:bg-slate-800/70 hover:border-slate-600/60 cursor-default">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-500 uppercase font-bold truncate">{entry.source}</p>
                                <p className="text-xs text-white font-bold">{entry.share}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Resources */}
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.energyResources}</h4>
                          <div className="flex flex-wrap gap-2">
                            {(data.energy?.resources || []).map(res => (
                              <span key={res} className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-300 font-medium">
                                {res}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CO2 Emissions */}
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-1.5 mb-2">
                            <h4 className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">{t.co2Emissions}</h4>
                            <InfoIcon definition={(t as any).definitions.co2Emissions} />
                          </div>
                          <p className="text-2xl font-bold text-white tracking-tight">{data.energy?.emissions || 'N/A'}</p>
                        </div>

                        {/* Main Providers */}
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{t.mainProviders}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {(data.energy?.mainProviders || []).map((provider, i) => (
                              <div key={i} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 transition-colors duration-200 hover:bg-slate-800/70 hover:border-slate-600/60 cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {provider}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Energy Policies */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                      <div className="flex items-center gap-1.5 mb-4">
                        <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{t.energyPolicies}</h4>
                        <InfoIcon definition={(t as any).definitions.energyPolicies} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.energy?.policies || []).length > 0 ? (data.energy?.policies || []).map((policy, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800 transition-colors duration-200 hover:bg-slate-800/70 hover:border-slate-700 cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {policy}
                          </div>
                        )) : (
                          <p className="text-sm text-slate-500 italic col-span-full">{t.noEnergyPolicies}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'arsenal' && data.arsenal && (() => {
                  const tips = ({
                    it: {
                      spending: "% PIL + importo totale",
                      personnel: "truppe attive + riserve",
                      aircraft: "aerei totali",
                      armored: "veicoli corazzati totali",
                      naval: "flotta navale totale",
                      nuclear: "testate nucleari",
                      tech: "livello avanzamento",
                      gfp: "classifica militare globale",
                      missions: "operazioni attive estero",
                    },
                    en: {
                      spending: "% GDP + total amount",
                      personnel: "active troops + reserves",
                      aircraft: "total aircraft",
                      armored: "armored vehicles total",
                      naval: "naval fleet total",
                      nuclear: "nuclear warheads count",
                      tech: "advancement level",
                      gfp: "global military ranking",
                      missions: "active operations abroad",
                    },
                    fr: {
                      spending: "% PIB + montant total",
                      personnel: "troupes actives + réserves",
                      aircraft: "aéronefs total",
                      armored: "blindés total",
                      naval: "flotte navale totale",
                      nuclear: "ogives nucléaires",
                      tech: "niveau technologique",
                      gfp: "classement militaire mondial",
                      missions: "opérations à l'étranger",
                    },
                    es: {
                      spending: "% PIB + importe total",
                      personnel: "tropas activas + reservas",
                      aircraft: "aeronaves total",
                      armored: "blindados total",
                      naval: "flota naval total",
                      nuclear: "ojivas nucleares",
                      tech: "nivel tecnológico",
                      gfp: "ranking militar global",
                      missions: "operaciones exterior",
                    },
                    de: {
                      spending: "% BIP + Gesamtbetrag",
                      personnel: "aktive + Reservetruppen",
                      aircraft: "Flugzeuge gesamt",
                      armored: "Panzerfahrzeuge gesamt",
                      naval: "Flotte gesamt",
                      nuclear: "Atomsprengköpfe",
                      tech: "Technologieniveau",
                      gfp: "globales Militärranking",
                      missions: "Auslandseinsätze",
                    },
                  } as Record<string, Record<string, string>>)[language] ?? {} as Record<string, string>;

                  // Extract only the leading number from a value that may contain
                  // descriptive text from older cached API responses (e.g. "310 F-16s…"
                  // → "310", "5,977 (deployed)" → "5,977").
                  // Returns the original string unchanged if it is already clean or is "None".
                  const numOnly = (value: string | undefined | null): string => {
                    if (!value) return 'N/A';
                    const s = value.trim();
                    if (/^none$/i.test(s)) return 'None';
                    const m = s.match(/^[\d,\.]+/);
                    return m ? m[0] : s;
                  };

                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <span className="text-xl">🪖</span>
                        <h3 className="text-xl font-bold text-white tracking-tight">{t.arsenal}</h3>
                      </div>

                      {/* Row 1: Spending | Personnel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">💰</span>
                            <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.militarySpending}</span>
                            <InfoIcon definition={tips.spending} />
                          </div>
                          <p className="text-3xl font-black text-white tracking-tight">{data.arsenal?.spending?.gdpShare || 'N/A'}</p>
                          <p className="text-sm text-slate-400 mt-1">{data.arsenal?.spending?.total || ''}</p>
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">🎖️</span>
                            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.militaryPersonnel}</span>
                            <InfoIcon definition={tips.personnel} />
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-slate-700">
                            <div className="pr-4">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.activePersonnel}</p>
                              <p className="text-2xl font-black text-white">{data.arsenal?.personnel?.active || 'N/A'}</p>
                            </div>
                            <div className="pl-4">
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.reservePersonnel}</p>
                              <p className="text-2xl font-black text-white">{data.arsenal?.personnel?.reserve || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Aircraft | Tanks | Naval */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 text-center relative group">
                          <div className="flex justify-center items-center gap-1.5 mb-2">
                            <span className="text-xl leading-none">🛩️</span>
                            <InfoIcon definition={tips.aircraft} />
                          </div>
                          <p className="text-2xl font-black text-white mb-1">{numOnly(data.arsenal?.equipment?.aircraft)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t.aircraft}</p>
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 text-center relative group">
                          <div className="flex justify-center items-center gap-1.5 mb-2">
                            <span className="text-xl leading-none">🪖</span>
                            <InfoIcon definition={tips.armored} />
                          </div>
                          <p className="text-2xl font-black text-white mb-1">{numOnly(data.arsenal?.equipment?.tanks)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t.tanks}</p>
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 text-center relative group">
                          <div className="flex justify-center items-center gap-1.5 mb-2">
                            <span className="text-xl leading-none">🚢</span>
                            <InfoIcon definition={tips.naval} />
                          </div>
                          <p className="text-2xl font-black text-white mb-1">{numOnly(data.arsenal?.equipment?.ships)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{t.ships}</p>
                        </div>
                      </div>

                      {/* Row 3: Nuclear | GFP */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-rose-900/50 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">☢️</span>
                            <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.nuclearWeapons}</span>
                            <InfoIcon definition={tips.nuclear} />
                          </div>
                          <p className="text-3xl font-black text-white tracking-tight">{numOnly(data.arsenal?.nuclearWeapons) || t.none}</p>
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">🏆</span>
                            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.militaryPowerIndex}</span>
                            <InfoIcon definition={tips.gfp} />
                          </div>
                          <p className="text-3xl font-black text-white tracking-tight">{data.arsenal?.militaryPowerIndex || 'N/A'}</p>
                          <p className="text-[10px] text-slate-500 uppercase mt-1">Global Firepower Index</p>
                        </div>
                      </div>

                      {/* Row 4: Military Tech | Foreign Missions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">⚙️</span>
                            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.militaryTech}</span>
                            <InfoIcon definition={tips.tech} />
                          </div>
                          <p className="text-lg font-bold text-white leading-snug">
                            {(data.arsenal?.militaryTech || 'N/A').split(/[,\.]/)[0].trim()}
                          </p>
                          {data.arsenal?.missilesAndDefense && (
                            <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5">
                              <span className="shrink-0">🚀</span>
                              {data.arsenal.missilesAndDefense.split(/[,\.]/)[0].trim()}
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 relative group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base leading-none">🌍</span>
                            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest flex-1">{t.internationalMissions}</span>
                            <InfoIcon definition={tips.missions} />
                          </div>
                          <p className="text-3xl font-black text-white tracking-tight mb-3">
                            {(data.arsenal?.internationalMissions || []).length || '0'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(data.arsenal?.internationalMissions || []).length > 0
                              ? (data.arsenal.internationalMissions || []).map((m: string, i: number) => (
                                  <span key={i} className="text-[10px] text-slate-300 bg-slate-900/70 border border-slate-700/50 px-2 py-1 rounded-lg font-medium">
                                    {m.split(/[,:]/)[0].trim()}
                                  </span>
                                ))
                              : <span className="text-sm text-slate-500 italic">{t.noMissions}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {activeTab === 'reserves' && data.strategicReserves && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                      <span className="text-xl">🪙</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{t.strategicReserves}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Coins className="text-yellow-500" size={16} />
                          <h4 className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">{t.goldReserves}</h4>
                          <InfoIcon definition={(t as any).definitions.goldReserves} />
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">{data.strategicReserves?.goldReserves || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Wallet className="text-emerald-500" size={16} />
                          <h4 className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">{t.foreignExchangeReserves}</h4>
                          <InfoIcon definition={(t as any).definitions.foreignExchangeReserves} />
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">{data.strategicReserves?.foreignExchangeReserves || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Raw Materials */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-1.5 mb-4">
                          <Gem className="text-blue-400" size={18} />
                          <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.rawMaterials}</h4>
                          <InfoIcon definition={(t as any).definitions.rawMaterials} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(data.strategicReserves?.rawMaterials || []).length > 0 ? (data.strategicReserves?.rawMaterials || []).map((material, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-300 font-medium">
                              {material}
                            </span>
                          )) : (
                            <p className="text-xs text-slate-500 italic">N/A</p>
                          )}
                        </div>
                      </div>

                      {/* Mining Production */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-1.5 mb-4">
                          <Pickaxe className="text-amber-400" size={18} />
                          <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider">{t.miningProduction}</h4>
                          <InfoIcon definition={(t as any).definitions.miningProduction} />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          {data.strategicReserves?.miningProduction || 'Informazione non disponibile'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sovereign Wealth Funds */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{t.sovereignWealthFunds}</h4>
                          <InfoIcon definition={(t as any).definitions.sovereignWealthFunds} />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          {data.strategicReserves?.sovereignWealthFunds || 'Informazione non disponibile'}
                        </p>
                      </div>

                      {/* Economic Security */}
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative group">
                        <div className="flex items-center gap-1.5 mb-4">
                          <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{t.economicSecurity}</h4>
                          <InfoIcon definition={(t as any).definitions.economicSecurity} />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          {data.strategicReserves?.economicSecurity || 'Informazione non disponibile'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
                <span>Nation Explorer Global Intelligence Unit</span>
              </div>
            </div>
          )}

      {/* Favorite Login Prompt Modal */}
      <AnimatePresence>
        {showFavLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFavLoginPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <Heart size={28} className="text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-300 text-center leading-relaxed mb-6">
                {t.favLoginPrompt}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFavLoginPrompt(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  <X size={14} className="inline mr-1" />
                  {language === 'it' ? 'Chiudi' : language === 'fr' ? 'Fermer' : language === 'es' ? 'Cerrar' : language === 'de' ? 'Schließen' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    setShowFavLoginPrompt(false);
                    if (onShowAuth) onShowAuth();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  {t.favSignIn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

const IndicatorItem = ({ icon: Icon, label, value, max, color, definition }: { icon: any; label: string; value: number; max: number; color: string; definition?: string }) => {
  return (
    <div className="flex items-center justify-between relative group">
      <div className="flex items-center gap-2">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={16} className={color.replace('bg-', 'text-').replace('/20', '')} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 text-sm">{label}</span>
          {definition && <InfoIcon definition={definition} />}
        </div>
      </div>
      <span className="text-white font-bold">{value} <span className="text-[10px] text-slate-500 font-normal">/ {max}</span></span>
    </div>
  );
};

const InfoIcon = ({ definition }: { definition?: string }) => {
  const [showDef, setShowDef] = useState(false);

  if (!definition) return null;

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowDef(true)}
        onMouseLeave={() => setShowDef(false)}
        className="text-slate-500 hover:text-blue-400 transition-colors cursor-help"
      >
        <Info size={12} />
      </div>
      
      <AnimatePresence>
        {showDef && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 leading-relaxed min-w-[200px] pointer-events-none"
          >
            <div className="flex justify-between items-start gap-2 mb-1">
              <span className="font-bold text-blue-400 uppercase tracking-tighter">Definition</span>
            </div>
            {definition}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeaderCard = ({ leader, label, loading, image }: { leader: any; label: string; loading: boolean; image: string }) => {
  const [hovered, setHovered] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!image || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const popupW = 200;
    const popupH = 200;
    const margin = 14;

    let left = rect.right + margin;
    if (left + popupW > window.innerWidth - 8) {
      left = rect.left - popupW - margin;
    }
    left = Math.max(8, left);

    let top = rect.top + rect.height / 2 - popupH / 2;
    top = Math.max(8, Math.min(window.innerHeight - popupH - 8, top));

    setPopupStyle({ left, top });
    setHovered(true);
  };

  if (!leader) return null;

  return (
    <>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row gap-6 hover:border-blue-500/30 transition-all group">
        <div
          ref={imgRef}
          className="w-32 h-40 flex-shrink-0 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative"
          style={image ? { cursor: 'zoom-in' } : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setHovered(false)}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : image ? (
            <>
              <img
                src={image}
                alt={leader.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1 px-2">
                <p className="text-[8px] text-slate-400 uppercase tracking-tighter text-center">Wikipedia</p>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700">
              <User size={48} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</h4>
          <p className="text-xl font-bold text-white mb-1">{leader.name}</p>
          <p className="text-slate-400 text-xs font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {leader.party}
          </p>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
            {leader.bio}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {hovered && image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[300] pointer-events-none"
            style={popupStyle}
          >
            <img
              src={image}
              alt={leader.name}
              className="w-[200px] h-[200px] rounded-full object-cover border-2 border-slate-600"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const InfoCard = ({ label, value, icon: Icon, definition }: { label: string; value: string; icon: any; definition?: string }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-start gap-3 relative group">
      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          {definition && <InfoIcon definition={definition} />}
        </div>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, max, definition }: { label: string; value: number; max: number; definition?: string }) => {
  return (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-center relative group">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <p className="text-slate-400 text-[10px] font-bold uppercase">{label}</p>
        {definition && <InfoIcon definition={definition} />}
      </div>
      <p className="text-xl font-bold text-white">{value}<span className="text-slate-500 text-xs">/{max}</span></p>
      <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-500 h-full transition-all duration-1000" 
          style={{ width: `${(value / max) * 100}%` }} 
        />
      </div>
    </div>
  );
};

const StatSimple = ({ label, value, definition }: { label: string; value: string; definition?: string }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative group">
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        {definition && <InfoIcon definition={definition} />}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
};
