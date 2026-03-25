import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { getFlagEmoji } from '../utils';

interface FavoritesPanelProps {
  userId: string;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
  onCountryClick: (name: string) => void;
}

const translations = {
  it: { title: 'I tuoi preferiti', empty: 'Nessun paese nei preferiti', remove: 'Rimuovi' },
  en: { title: 'Your favorites', empty: 'No favorite countries yet', remove: 'Remove' },
  fr: { title: 'Vos favoris', empty: 'Aucun pays favori', remove: 'Supprimer' },
  es: { title: 'Tus favoritos', empty: 'Sin países favoritos', remove: 'Eliminar' },
  de: { title: 'Deine Favoriten', empty: 'Keine Lieblingsländer', remove: 'Entfernen' },
};

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ userId, language, onCountryClick }) => {
  const [favorites, setFavorites] = useState<{ country_code: string; country_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleRemove = async (countryCode: string) => {
    try {
      await removeFavorite(userId, countryCode);
      setFavorites(prev => prev.filter(f => f.country_code !== countryCode));
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t.title}</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Heart size={14} className="text-red-400" />
        {t.title}
      </h3>
      {favorites.length === 0 ? (
        <p className="text-xs text-slate-600 italic">{t.empty}</p>
      ) : (
        <div className="space-y-1">
          {favorites.map(fav => (
            <div
              key={fav.country_code}
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => onCountryClick(fav.country_name)}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
              >
                <span className="text-base leading-none">{getFlagEmoji(fav.country_code)}</span>
                <span className="text-sm text-slate-300 truncate">{fav.country_name}</span>
              </button>
              <button
                onClick={() => handleRemove(fav.country_code)}
                title={t.remove}
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Heart size={12} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
