import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, Users, Landmark, Shield,
  ArrowUpNarrowWide, ArrowDownWideNarrow, Search,
  Trophy, Percent, DollarSign, Scale,
  Maximize, BookOpen, Newspaper, Fingerprint,
  Zap, HeartPulse, Smile, Upload, Download, UserCircle
} from 'lucide-react';
import { getRankingFromCache } from '../services/rankingsService';
import { getRankingFromCountryCache } from '../services/rankingsFromCache';
import { getFlagEmoji, cn } from '../utils';

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

  const filteredRanking = ranking
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'desc'
        ? b.numericValue - a.numericValue
        : a.numericValue - b.numericValue;
    });

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
                {filteredRanking
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
                          #{sortOrder === 'desc' ? index + 1 : ranking.length - index}
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
