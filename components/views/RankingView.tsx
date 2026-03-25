import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, Users, Landmark, Shield,
  ArrowUpNarrowWide, ArrowDownWideNarrow, Search,
  Trophy, Percent, DollarSign, Scale,
  Maximize, BookOpen, Newspaper, Fingerprint,
  Zap, HeartPulse, Smile, Upload, Download, UserCircle
} from 'lucide-react';
import { getRankingFromCache } from '../../services/rankingsService';
import { getRankingFromCountryCache } from '../../services/rankingsFromCache';
import { getFlagEmoji, cn } from '../../utils';

interface RankingItem {
  name: string;
  code: string;
  value: string;
  numericValue: number;
  unit: string;
}

interface RankingViewProps {
  onCountryClick: (name: string) => void;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const indicators = [
  { id: 'gdp', label: { it: 'PIL Nominale', en: 'Nominal GDP', fr: 'PIB Nominal', es: 'PIB Nominal', de: 'Nominales BIP' }, icon: DollarSign, color: 'text-blue-400' },
  { id: 'gdp_capita', label: { it: 'PIL Pro Capite', en: 'GDP per Capita', fr: 'PIB par Habitant', es: 'PIB per Cápita', de: 'BIP pro Kopf' }, icon: UserCircle, color: 'text-emerald-400' },
  { id: 'population', label: { it: 'Popolazione', en: 'Population', fr: 'Population', es: 'Población', de: 'Bevölkerung' }, icon: Users, color: 'text-indigo-400' },
  { id: 'area', label: { it: 'Superficie', en: 'Land Area', fr: 'Superficie', es: 'Superficie', de: 'Fläche' }, icon: Maximize, color: 'text-slate-400' },
  { id: 'unemployment', label: { it: 'Disoccupazione', en: 'Unemployment', fr: 'Chômage', es: 'Desempleo', de: 'Arbeitslosigkeit' }, icon: Percent, color: 'text-rose-400' },
  { id: 'inflation', label: { it: 'Inflazione', en: 'Inflation Rate', fr: 'Taux d\'Inflation', es: 'Tasa de Inflación', de: 'Inflationsrate' }, icon: Zap, color: 'text-orange-400' },
  { id: 'debt', label: { it: 'Debito Pubblico', en: 'Public Debt', fr: 'Dette Publique', es: 'Deuda Pública', de: 'Staatsverschuldung' }, icon: Scale, color: 'text-amber-400' },
  { id: 'exports', label: { it: 'Esportazioni', en: 'Total Exports', fr: 'Exportations Totales', es: 'Exportaciones Totales', de: 'Gesamtexporte' }, icon: Upload, color: 'text-blue-500' },
  { id: 'imports', label: { it: 'Importazioni', en: 'Total Imports', fr: 'Importations Totales', es: 'Importaciones Totales', de: 'Gesamtimporte' }, icon: Download, color: 'text-cyan-500' },
  { id: 'democracy', label: { it: 'Indice Democrazia', en: 'Democracy Index', fr: 'Indice de Démocratie', es: 'Índice de Democracia', de: 'Demokratie-Index' }, icon: Landmark, color: 'text-indigo-400' },
  { id: 'hdi', label: { it: 'Indice Sviluppo Umano', en: 'Human Development Index', fr: 'Indice de Développement Humain', es: 'Índice de Desarrollo Humano', de: 'Human Development Index' }, icon: BookOpen, color: 'text-emerald-500' },
  { id: 'press_freedom', label: { it: 'Libertà di Stampa', en: 'Press Freedom', fr: 'Liberté de la Presse', es: 'Libertad de Prensa', de: 'Pressefreiheit' }, icon: Newspaper, color: 'text-sky-400' },
  { id: 'corruption', label: { it: 'Percezione Corruzione', en: 'Corruption Perception', fr: 'Perception de Corruption', es: 'Percepción de Corrupción', de: 'Korruptionswahrnehmung' }, icon: Fingerprint, color: 'text-red-400' },
  { id: 'military', label: { it: 'Spesa Militare', en: 'Military Spending', fr: 'Dépenses Militaires', es: 'Gasto Militar', de: 'Militärausgaben' }, icon: Shield, color: 'text-slate-400' },
  { id: 'life_expectancy', label: { it: 'Aspettativa di Vita', en: 'Life Expectancy', fr: 'Espérance de Vie', es: 'Esperanza de Vida', de: 'Lebenserwartung' }, icon: HeartPulse, color: 'text-rose-500' },
  { id: 'happiness', label: { it: 'Indice Felicità', en: 'Happiness Index', fr: 'Indice de Bonheur', es: 'Índice de Felicidad', de: 'Glücksindex' }, icon: Smile, color: 'text-yellow-400' },
];

const indicatorDescriptions: Record<string, Record<string, string>> = {
  gdp: {
    it: 'Il PIL nominale misura il valore totale di beni e servizi prodotti da un paese in un anno, espresso in dollari correnti.',
    en: 'Nominal GDP measures the total value of goods and services produced by a country in a year, expressed in current dollars.',
    fr: 'Le PIB nominal mesure la valeur totale des biens et services produits par un pays en un an, exprimée en dollars courants.',
    es: 'El PIB nominal mide el valor total de bienes y servicios producidos por un país en un año, expresado en dólares corrientes.',
    de: 'Das nominale BIP misst den Gesamtwert der von einem Land in einem Jahr produzierten Güter und Dienstleistungen in laufenden US-Dollar.',
  },
  gdp_capita: {
    it: 'Il PIL pro capite divide il PIL totale per la popolazione, indicando il benessere economico medio per abitante.',
    en: 'GDP per capita divides total GDP by population, indicating the average economic well-being per inhabitant.',
    fr: 'Le PIB par habitant divise le PIB total par la population, indiquant le bien-être économique moyen par habitant.',
    es: 'El PIB per cápita divide el PIB total entre la población, indicando el bienestar económico medio por habitante.',
    de: 'Das BIP pro Kopf teilt das Gesamt-BIP durch die Bevölkerung und zeigt das durchschnittliche wirtschaftliche Wohlergehen pro Einwohner.',
  },
  population: {
    it: 'La popolazione totale di ogni paese secondo le stime più recenti.',
    en: 'The total population of each country according to the most recent estimates.',
    fr: 'La population totale de chaque pays selon les estimations les plus récentes.',
    es: 'La población total de cada país según las estimaciones más recientes.',
    de: 'Die Gesamtbevölkerung jedes Landes nach den neuesten Schätzungen.',
  },
  area: {
    it: 'La superficie totale del paese in chilometri quadrati, incluse terre e acque interne.',
    en: 'The total area of the country in square kilometers, including land and inland waters.',
    fr: 'La superficie totale du pays en kilomètres carrés, y compris les terres et les eaux intérieures.',
    es: 'La superficie total del país en kilómetros cuadrados, incluyendo tierra y aguas interiores.',
    de: 'Die Gesamtfläche des Landes in Quadratkilometern, einschließlich Land und Binnengewässer.',
  },
  unemployment: {
    it: 'Il tasso di disoccupazione indica la percentuale di persone in cerca di lavoro rispetto alla forza lavoro totale.',
    en: 'The unemployment rate indicates the percentage of people looking for work relative to the total labor force.',
    fr: 'Le taux de chômage indique le pourcentage de personnes à la recherche d\'un emploi par rapport à la population active totale.',
    es: 'La tasa de desempleo indica el porcentaje de personas que buscan trabajo respecto a la fuerza laboral total.',
    de: 'Die Arbeitslosenquote gibt den Anteil der Arbeitssuchenden an der gesamten Erwerbsbevölkerung an.',
  },
  inflation: {
    it: 'Il tasso di inflazione misura l\'aumento percentuale annuo del livello generale dei prezzi.',
    en: 'The inflation rate measures the annual percentage increase in the general price level.',
    fr: 'Le taux d\'inflation mesure l\'augmentation annuelle en pourcentage du niveau général des prix.',
    es: 'La tasa de inflación mide el aumento porcentual anual del nivel general de precios.',
    de: 'Die Inflationsrate misst den jährlichen prozentualen Anstieg des allgemeinen Preisniveaus.',
  },
  debt: {
    it: 'Il debito pubblico come percentuale del PIL indica quanto uno stato ha preso in prestito rispetto alla sua economia.',
    en: 'Public debt as a percentage of GDP indicates how much a state has borrowed relative to its economy.',
    fr: 'La dette publique en pourcentage du PIB indique combien un État a emprunté par rapport à son économie.',
    es: 'La deuda pública como porcentaje del PIB indica cuánto ha pedido prestado un estado en relación con su economía.',
    de: 'Die Staatsverschuldung in Prozent des BIP zeigt, wie viel ein Staat im Verhältnis zu seiner Wirtschaft geliehen hat.',
  },
  exports: {
    it: 'Il valore totale delle esportazioni, ovvero beni e servizi venduti ad altri paesi.',
    en: 'The total value of exports, i.e. goods and services sold to other countries.',
    fr: 'La valeur totale des exportations, c\'est-à-dire les biens et services vendus à d\'autres pays.',
    es: 'El valor total de las exportaciones, es decir, bienes y servicios vendidos a otros países.',
    de: 'Der Gesamtwert der Exporte, d.h. Waren und Dienstleistungen, die an andere Länder verkauft werden.',
  },
  imports: {
    it: 'Il valore totale delle importazioni, ovvero beni e servizi acquistati da altri paesi.',
    en: 'The total value of imports, i.e. goods and services purchased from other countries.',
    fr: 'La valeur totale des importations, c\'est-à-dire les biens et services achetés à d\'autres pays.',
    es: 'El valor total de las importaciones, es decir, bienes y servicios comprados a otros países.',
    de: 'Der Gesamtwert der Importe, d.h. Waren und Dienstleistungen, die von anderen Ländern gekauft werden.',
  },
  democracy: {
    it: 'L\'Indice di Democrazia dell\'Economist misura il grado di democrazia su scala 0-10.',
    en: 'The Economist Democracy Index measures the degree of democracy on a scale of 0-10.',
    fr: 'L\'Indice de Démocratie de l\'Economist mesure le degré de démocratie sur une échelle de 0 à 10.',
    es: 'El Índice de Democracia de The Economist mide el grado de democracia en una escala de 0 a 10.',
    de: 'Der Demokratie-Index des Economist misst den Grad der Demokratie auf einer Skala von 0 bis 10.',
  },
  hdi: {
    it: 'L\'Indice di Sviluppo Umano dell\'ONU combina aspettativa di vita, istruzione e reddito su scala 0-1.',
    en: 'The UN Human Development Index combines life expectancy, education and income on a scale of 0-1.',
    fr: 'L\'Indice de Développement Humain de l\'ONU combine espérance de vie, éducation et revenu sur une échelle de 0 à 1.',
    es: 'El Índice de Desarrollo Humano de la ONU combina esperanza de vida, educación e ingresos en una escala de 0 a 1.',
    de: 'Der Human Development Index der UN kombiniert Lebenserwartung, Bildung und Einkommen auf einer Skala von 0 bis 1.',
  },
  press_freedom: {
    it: 'L\'Indice di Libertà di Stampa di RSF misura la libertà dei giornalisti su scala 0-100 (100 = massima libertà).',
    en: 'RSF\'s Press Freedom Index measures journalists\' freedom on a scale of 0-100 (100 = most free).',
    fr: 'L\'Indice de Liberté de la Presse de RSF mesure la liberté des journalistes sur une échelle de 0 à 100 (100 = le plus libre).',
    es: 'El Índice de Libertad de Prensa de RSF mide la libertad de los periodistas en una escala de 0 a 100 (100 = más libre).',
    de: 'Der Pressefreiheitsindex von RSF misst die Freiheit der Journalisten auf einer Skala von 0 bis 100 (100 = am freiesten).',
  },
  corruption: {
    it: 'L\'Indice di Percezione della Corruzione di Transparency International va da 0 (molto corrotto) a 100 (molto pulito).',
    en: 'Transparency International\'s Corruption Perception Index ranges from 0 (very corrupt) to 100 (very clean).',
    fr: 'L\'Indice de Perception de la Corruption de Transparency International va de 0 (très corrompu) à 100 (très propre).',
    es: 'El Índice de Percepción de la Corrupción de Transparency International va de 0 (muy corrupto) a 100 (muy limpio).',
    de: 'Der Korruptionswahrnehmungsindex von Transparency International reicht von 0 (sehr korrupt) bis 100 (sehr sauber).',
  },
  military: {
    it: 'La spesa militare totale annua in miliardi di dollari.',
    en: 'Total annual military spending in billions of dollars.',
    fr: 'Les dépenses militaires annuelles totales en milliards de dollars.',
    es: 'El gasto militar anual total en miles de millones de dólares.',
    de: 'Die gesamten jährlichen Militärausgaben in Milliarden US-Dollar.',
  },
  life_expectancy: {
    it: 'L\'aspettativa di vita alla nascita in anni secondo le ultime stime disponibili.',
    en: 'Life expectancy at birth in years according to the latest available estimates.',
    fr: 'L\'espérance de vie à la naissance en années selon les dernières estimations disponibles.',
    es: 'La esperanza de vida al nacer en años según las últimas estimaciones disponibles.',
    de: 'Die Lebenserwartung bei der Geburt in Jahren nach den neuesten verfügbaren Schätzungen.',
  },
  happiness: {
    it: 'Il World Happiness Report misura la felicità percepita su scala 0-10 basandosi su sondaggi globali.',
    en: 'The World Happiness Report measures perceived happiness on a scale of 0-10 based on global surveys.',
    fr: 'Le World Happiness Report mesure le bonheur perçu sur une échelle de 0 à 10 basée sur des enquêtes mondiales.',
    es: 'El World Happiness Report mide la felicidad percibida en una escala de 0 a 10 basada en encuestas globales.',
    de: 'Der World Happiness Report misst das wahrgenommene Glück auf einer Skala von 0 bis 10 basierend auf globalen Umfragen.',
  },
};

export const RankingView: React.FC<RankingViewProps> = React.memo(({ onCountryClick, language }) => {
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    let cancelled = false;

    const fetchRanking = async () => {
      setLoading(true);
      setRanking([]);
      try {
        // Try the pre-built Supabase cache first (fast, no Claude call)
        const cached = await getRankingFromCache(selectedIndicator.id, language);
        const data = cached ?? await getRankingFromCountryCache(selectedIndicator.id, language);
        if (!cancelled) {
          setRanking(data);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRanking();

    return () => {
      cancelled = true;
    };
  }, [selectedIndicator.id, language]);

  const sortedRanking = useMemo(() => {
    const filtered = ranking.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return [...filtered].sort((a, b) =>
      sortOrder === 'desc' ? b.numericValue - a.numericValue : a.numericValue - b.numericValue
    );
  }, [ranking, searchQuery, sortOrder]);

  const description = indicatorDescriptions[selectedIndicator.id]?.[language] ?? '';

  const t = {
    it: { title: 'Classifiche Globali', subtitle: 'Confronto indicatori geopolitici ed economici', search: 'Filtra paesi...', rank: 'Pos.', country: 'Paese', value: 'Valore', loading: 'Generazione classifica in corso...' },
    en: { title: 'Global Rankings', subtitle: 'Comparison of geopolitical and economic indicators', search: 'Filter countries...', rank: 'Rank', country: 'Country', value: 'Value', loading: 'Generating ranking...' },
    fr: { title: 'Classements Mondiaux', subtitle: 'Comparaison des indicateurs géopolitiques et économiques', search: 'Filtrer les pays...', rank: 'Rang', country: 'Pays', value: 'Valeur', loading: 'Génération du classement...' },
    es: { title: 'Rankings Globales', subtitle: 'Comparación de indicadores geopolíticos y económicos', search: 'Filtrar países...', rank: 'Pos.', country: 'País', value: 'Valor', loading: 'Generando clasificación...' },
    de: { title: 'Globale Rankings', subtitle: 'Vergleich geopolitischer und wirtschaftlicher Indikatoren', search: 'Länder filtern...', rank: 'Rang', country: 'Land', value: 'Wert', loading: 'Ranking wird erstellt...' },
  }[language];

  return (
    <div className="h-full flex flex-col gap-3 md:gap-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" />
            {t.title}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSortOrder('desc')}
            className={cn(
              "p-1.5 md:p-2 rounded-lg transition-all",
              sortOrder === 'desc' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ArrowDownWideNarrow size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <button
            onClick={() => setSortOrder('asc')}
            className={cn(
              "p-1.5 md:p-2 rounded-lg transition-all",
              sortOrder === 'asc' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ArrowUpNarrowWide size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Indicators Selector */}
      <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 no-scrollbar">
        {indicators.map((indicator) => (
          <button
            key={indicator.id}
            onClick={() => setSelectedIndicator(indicator)}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap border",
              selectedIndicator.id === indicator.id
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            )}
          >
            <indicator.icon size={14} className={cn("md:w-4 md:h-4", selectedIndicator.id === indicator.id ? "text-white" : indicator.color)} />
            {indicator.label[language]}
          </button>
        ))}
      </div>

      {/* Indicator Description */}
      {description && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 leading-relaxed italic">{description}</p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm animate-pulse uppercase tracking-widest">{t.loading}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-4 md:px-6 py-3 md:py-4 w-12 md:w-16">{t.rank}</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">{t.country}</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right">{t.value}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedRanking
                  .map((item, index) => (
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={item.code}
                      onClick={() => onCountryClick(item.name)}
                      className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className={cn(
                          "text-[10px] md:text-xs font-bold",
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-slate-300" :
                          index === 2 ? "text-amber-600" : "text-slate-500"
                        )}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-lg md:text-xl">{getFlagEmoji(item.code)}</span>
                          <span className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate max-w-[100px] sm:max-w-none">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                        <span className="text-xs md:text-sm font-mono font-bold text-white">
                          {item.value}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
});
