import React, { useState, useEffect } from 'react';
import { Heart, Compass, Clock } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { getHistory, clearHistory } from '../services/historyService';
import { getFlagEmoji } from '../utils';

interface FavoritesPanelProps {
  userId: string;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
  onCountryClick: (name: string) => void;
  onExplore?: () => void;
}

const translations = {
  it: {
    title: 'I tuoi preferiti',
    subtitle: (n: number) => n === 1 ? '1 paese salvato' : `${n} paesi salvati`,
    empty: 'Nessun preferito ancora',
    emptyHint: 'Esplora la mappa e tocca il cuore per salvare i tuoi paesi preferiti.',
    explore: 'Esplora la Mappa',
    remove: 'Rimuovi dai preferiti',
    recentTitle: 'Visitati di recente',
    clear: 'Cancella',
  },
  en: {
    title: 'Your favorites',
    subtitle: (n: number) => n === 1 ? '1 country saved' : `${n} countries saved`,
    empty: 'No favorites yet',
    emptyHint: 'Explore the map and tap the heart to save your favorite countries.',
    explore: 'Explore the Map',
    remove: 'Remove from favorites',
    recentTitle: 'Recently visited',
    clear: 'Clear',
  },
  fr: {
    title: 'Vos favoris',
    subtitle: (n: number) => n === 1 ? '1 pays sauvegardé' : `${n} pays sauvegardés`,
    empty: 'Aucun favori pour le moment',
    emptyHint: 'Explorez la carte et appuyez sur le coeur pour sauvegarder vos pays favoris.',
    explore: 'Explorer la Carte',
    remove: 'Retirer des favoris',
    recentTitle: 'Visités récemment',
    clear: 'Effacer',
  },
  es: {
    title: 'Tus favoritos',
    subtitle: (n: number) => n === 1 ? '1 país guardado' : `${n} países guardados`,
    empty: 'Sin favoritos aún',
    emptyHint: 'Explora el mapa y toca el corazón para guardar tus países favoritos.',
    explore: 'Explorar el Mapa',
    remove: 'Quitar de favoritos',
    recentTitle: 'Visitados recientemente',
    clear: 'Borrar',
  },
  de: {
    title: 'Deine Favoriten',
    subtitle: (n: number) => n === 1 ? '1 Land gespeichert' : `${n} Länder gespeichert`,
    empty: 'Noch keine Favoriten',
    emptyHint: 'Erkunde die Karte und tippe auf das Herz, um deine Lieblingsländer zu speichern.',
    explore: 'Karte erkunden',
    remove: 'Aus Favoriten entfernen',
    recentTitle: 'Kürzlich besucht',
    clear: 'Löschen',
  },
};

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ userId, language, onCountryClick, onExplore }) => {
  const [favorites, setFavorites] = useState<{ country_code: string; country_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{ countryCode: string; countryName: string; visitedAt: number }[]>([]);
  const t = translations[language];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFavorites(userId)
      .then(data => { if (!cancelled) setFavorites(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    setHistory(getHistory().slice(0, 5));
  }, []);

  const handleRemove = async (e: React.MouseEvent, countryCode: string) => {
    e.stopPropagation();
    try {
      await removeFavorite(userId, countryCode);
      setFavorites(prev => prev.filter(f => f.country_code !== countryCode));
    } catch {}
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const Header = ({ count }: { count?: number }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-red-500/10 rounded-xl">
          <Heart size={20} className="text-red-400" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t.title}</h2>
          {count !== undefined && (
            <p className="text-xs text-slate-500 mt-0.5">{t.subtitle(count)}</p>
          )}
        </div>
      </div>
    </div>
  );

  const RecentVisits = () => {
    if (history.length === 0) return null;
    return (
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.recentTitle}</h3>
          </div>
          <button
            onClick={handleClearHistory}
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-wider font-medium"
          >
            {t.clear}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {history.map(entry => (
            <button
              key={entry.countryCode + entry.visitedAt}
              onClick={() => onCountryClick(entry.countryName)}
              className="flex-shrink-0 flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all"
            >
              <span className="text-xl leading-none">{getFlagEmoji(entry.countryCode)}</span>
              <span className="text-sm font-medium text-slate-300 whitespace-nowrap">{entry.countryName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Header />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-800/50 rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Header count={0} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-5 bg-slate-800/50 rounded-full mb-5">
            <Heart size={40} className="text-slate-700" />
          </div>
          <p className="text-base font-semibold text-slate-400 mb-1">{t.empty}</p>
          <p className="text-sm text-slate-600 max-w-xs mb-6">{t.emptyHint}</p>
          {onExplore && (
            <button
              onClick={onExplore}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Compass size={16} />
              {t.explore}
            </button>
          )}
        </div>
        <RecentVisits />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <Header count={favorites.length} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {favorites.map(fav => (
          <button
            key={fav.country_code}
            onClick={() => onCountryClick(fav.country_name)}
            className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500/30 hover:bg-slate-800/50 hover:scale-105 transition-all duration-200 group text-left"
          >
            <button
              onClick={(e) => handleRemove(e, fav.country_code)}
              title={t.remove}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Heart size={14} fill="currentColor" />
            </button>
            <span className="text-4xl leading-none mt-1">{getFlagEmoji(fav.country_code)}</span>
            <span className="text-sm font-bold text-white text-center truncate w-full">{fav.country_name}</span>
          </button>
        ))}
      </div>
      <RecentVisits />
    </div>
  );
};
