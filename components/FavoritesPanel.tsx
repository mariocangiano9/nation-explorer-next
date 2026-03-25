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
  it: { title: 'I tuoi preferiti', empty: 'Nessun paese nei preferiti', emptyHint: 'Esplora la mappa e aggiungi i tuoi paesi preferiti!', remove: 'Rimuovi' },
  en: { title: 'Your favorites', empty: 'No favorite countries yet', emptyHint: 'Explore the map and add your favorite countries!', remove: 'Remove' },
  fr: { title: 'Vos favoris', empty: 'Aucun pays favori', emptyHint: 'Explorez la carte et ajoutez vos pays favoris !', remove: 'Supprimer' },
  es: { title: 'Tus favoritos', empty: 'Sin países favoritos', emptyHint: 'Explora el mapa y agrega tus países favoritos!', remove: 'Eliminar' },
  de: { title: 'Deine Favoriten', empty: 'Keine Lieblingsländer', emptyHint: 'Erkunde die Karte und füge deine Lieblingsländer hinzu!', remove: 'Entfernen' },
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
      <div className="max-w-2xl mx-auto p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Heart size={18} className="text-red-400" />
          {t.title}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Heart size={18} className="text-red-400" />
        {t.title}
      </h3>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-slate-800/50 rounded-full mb-4">
            <Heart size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400 font-medium">{t.empty}</p>
          <p className="text-xs text-slate-600 mt-1">{t.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favorites.map(fav => (
            <div
              key={fav.country_code}
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => onCountryClick(fav.country_name)}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
              >
                <span className="text-xl leading-none">{getFlagEmoji(fav.country_code)}</span>
                <span className="text-sm font-medium text-slate-200 truncate">{fav.country_name}</span>
              </button>
              <button
                onClick={() => handleRemove(fav.country_code)}
                title={t.remove}
                className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Heart size={14} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
