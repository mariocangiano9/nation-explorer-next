'use client';

import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { WorldMap } from '../components/WorldMap';
import { HomeView } from '../components/views/HomeView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AuthModal } from '../components/AuthModal';
import { useCountryData } from '../hooks/useCountryData';
import { useAuth } from '../hooks/useAuth';
import { Search, Globe2, Compass, Trophy, ChevronDown, Home, User, LogOut, LogIn, Heart } from 'lucide-react';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getFlagEmoji } from '../utils';
import {
  savePendingCountry,
  clearPendingCountry,
  getPendingCountry,
  signOut,
} from '../services/authService';

const CountryProfile = lazy(() =>
  import('../components/CountryProfile').then(m => ({ default: m.CountryProfile }))
);
const RankingView = lazy(() =>
  import('../components/views/RankingView').then(m => ({ default: m.RankingView }))
);

const GUEST_LIMIT = 3;
const GUEST_COUNT_KEY = 'ne_guest_count';

interface GuestState { count: number; date: string; }

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGuestState(): GuestState {
  try {
    const raw = localStorage.getItem(GUEST_COUNT_KEY);
    if (!raw) return { count: 0, date: todayKey() };
    const parsed = JSON.parse(raw) as GuestState;
    if (parsed.date !== todayKey()) return { count: 0, date: todayKey() };
    return parsed;
  } catch {
    return { count: 0, date: todayKey() };
  }
}

function getGuestCount(): number {
  return getGuestState().count;
}

function incrementGuestCount(): void {
  const state = getGuestState();
  localStorage.setItem(GUEST_COUNT_KEY, JSON.stringify({ count: state.count + 1, date: state.date }));
}

const NavIcon = React.memo(({ icon: Icon, active = false, onClick }: { icon: any; active?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-3 rounded-xl transition-all",
      active ? "bg-slate-800 text-blue-400 shadow-lg shadow-blue-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
    )}
  >
    <Icon size={22} />
  </button>
));

export default function Page() {
  const [view, setView] = useState<'home' | 'map' | 'ranking' | 'favorites'>('home');
  const [language, setLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('en');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  const appT = {
    it: { search: 'Cerca un Paese...', status: 'Status Globale', operational: 'Sistema Operativo', mapHint: 'Clicca su un Paese per scoprire di più' },
    en: { search: 'Search a country...', status: 'Global Status', operational: 'System Operational', mapHint: 'Click on a country to discover more' },
    fr: { search: 'Rechercher un pays...', status: 'Statut Global', operational: 'Système Opérationnel', mapHint: 'Cliquez sur un pays pour en savoir plus' },
    es: { search: 'Buscar un país...', status: 'Estado Global', operational: 'Sistema Operativo', mapHint: 'Haz clic en un país para descubrir más' },
    de: { search: 'Land suchen...', status: 'Globaler Status', operational: 'System Betriebsbereit', mapHint: 'Klicke auf ein Land, um mehr zu entdecken' },
  }[language];

  const {
    selectedCountry,
    countryData,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredCountries,
    handleCountryClick,
    closeProfile,
  } = useCountryData(language, user?.id);

  const handleCountryClickRef = useRef(handleCountryClick);
  handleCountryClickRef.current = handleCountryClick;

  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (prevUserIdRef.current === null && currentId !== null) {
      const pending = getPendingCountry();
      if (pending) {
        handleCountryClickRef.current(pending);
        clearPendingCountry();
      }
    }
    prevUserIdRef.current = currentId;
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langMenuRef.current && !langMenuRef.current.contains(target) &&
        langDropdownRef.current && !langDropdownRef.current.contains(target)
      ) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLangMenu(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleCountryClickWithLimit = (name: string) => {
    if (user) {
      handleCountryClick(name);
      return;
    }
    const count = getGuestCount();
    if (count < GUEST_LIMIT) {
      incrementGuestCount();
      handleCountryClick(name);
    } else {
      savePendingCountry(name);
      setPendingCountry(name);
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    const country = pendingCountry;
    setShowAuthModal(false);
    setPendingCountry(null);
    clearPendingCountry();
    if (country) handleCountryClick(country);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    setPendingCountry(null);
    clearPendingCountry();
  };

  const handleLanguageChange = (newLang: 'it' | 'en' | 'fr' | 'es' | 'de') => {
    if (newLang === language) return;
    setLanguage(newLang);
    if (selectedCountry) {
      handleCountryClick(selectedCountry, newLang);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar / Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-8 gap-8 z-40 hidden md:flex">
        <nav className="flex flex-col gap-6">
          <NavIcon
            icon={Home}
            active={view === 'home'}
            onClick={() => setView('home')}
          />
          <NavIcon
            icon={Compass}
            active={view === 'map'}
            onClick={() => setView('map')}
          />
          <NavIcon
            icon={Trophy}
            active={view === 'ranking'}
            onClick={() => setView('ranking')}
          />
          <NavIcon
            icon={Heart}
            active={view === 'favorites'}
            onClick={() => user ? setView('favorites') : setShowAuthModal(true)}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:pl-20 h-screen flex flex-col">
        {/* Top Bar */}
        <header className="h-20 border-b border-slate-800 flex items-center gap-2 md:gap-4 px-3 md:px-8 bg-slate-950/80 backdrop-blur-md z-50 relative">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-3 shrink-0">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', lineHeight: 0 }} className="bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20 text-white md:hidden">
                <Globe2 size={20} />
              </div>
              <h1 style={{ lineHeight: 1, margin: 0, padding: 0 }} className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
                Nation <span className="text-blue-500">Explorer</span>
              </h1>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder={appT.search}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {filteredCountries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryClickWithLimit(country.originalName || country.name)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors border-b border-slate-800 last:border-0"
                      >
                        <span className="text-xl leading-none">{getFlagEmoji(country.code)}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-200 block">{country.displayName || country.name}</span>
                          {(country.capital || country.population) && (
                            <span className="text-xs text-slate-500 block truncate">
                              {[
                                country.capital,
                                country.population
                                  ? (country.population >= 1_000_000
                                    ? `${(country.population / 1_000_000).toFixed(1)}M`
                                    : `${(country.population / 1_000).toFixed(0)}K`) + ' pop.'
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          )}
                        </div>
                        {country.region && (
                          <span className="text-[10px] text-slate-600 shrink-0 hidden sm:block">{country.region}</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="shrink-0" ref={langMenuRef}>
              <button
                ref={langButtonRef}
                onClick={() => setShowLangMenu(v => !v)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 hover:border-slate-700 transition-all text-sm font-bold uppercase tracking-wider"
              >
                <span className="text-base leading-none">
                  {{ en: '🇬🇧', it: '🇮🇹', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪' }[language]}
                </span>
                <span className="text-xs">{{ en: 'EN', it: 'IT', fr: 'FR', es: 'ES', de: 'DE' }[language]}</span>
                <ChevronDown
                  size={14}
                  className={cn("text-slate-400 transition-transform duration-200", showLangMenu && "rotate-180")}
                />
              </button>
            </div>
          </div>

          {/* User menu */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              <User size={17} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={async () => { await signOut(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <LogOut size={14} className="text-slate-500" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowUserMenu(false); setShowAuthModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <LogIn size={14} className="text-slate-500" />
                      Login
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <HomeView onExplore={() => setView('map')} language={language} />
              </motion.div>
            ) : view === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full h-full p-2 md:p-6"
              >
                <WorldMap onCountryClick={handleCountryClickWithLimit} language={language} />

                {/* Floating Controls */}
                <div className="absolute bottom-20 left-4 md:bottom-12 md:left-12 flex flex-col gap-3">
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 px-4 py-2 rounded-full shadow-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Compass size={12} className="text-blue-500 animate-pulse" />
                      {appT.mapHint}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : view === 'ranking' ? (
              <motion.div
                key="ranking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full p-3 md:p-6"
              >
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500">Loading...</div>}>
                  <RankingView onCountryClick={handleCountryClickWithLimit} language={language} />
                </Suspense>
              </motion.div>
            ) : user ? (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full p-3 md:p-6 overflow-y-auto"
              >
                <FavoritesPanel userId={user.id} language={language} onCountryClick={handleCountryClickWithLimit} onExplore={() => setView('map')} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Backdrop */}
      <AnimatePresence>
        {!!selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
            className="fixed top-20 inset-x-0 bottom-16 md:bottom-0 bg-slate-950/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* Country Profile Panel */}
      <AnimatePresence>
        {!!selectedCountry && (
          <motion.div
            key={selectedCountry}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-20 left-0 w-full h-[calc(100vh-5rem-4rem)] md:h-[calc(100vh-5rem)] bg-slate-900 border-t border-slate-800 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-y-auto no-scrollbar rounded-t-[2.5rem]"
          >
            <ErrorBoundary key={selectedCountry}>
              <Suspense fallback={null}>
                <CountryProfile
                  countryName={selectedCountry}
                  data={countryData}
                  loading={loading}
                  error={error}
                  onClose={closeProfile}
                  onCountryClick={handleCountryClickWithLimit}
                  onShowAuth={() => setShowAuthModal(true)}
                  language={language}
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            language={language}
            onClose={handleCloseModal}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>

      {/* Language Dropdown (fixed, outside header to avoid clipping) */}
      <AnimatePresence>
        {showLangMenu && (
          <motion.div
            ref={langDropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
            style={{
              position: 'fixed',
              top: '5rem',
              right: langButtonRef.current
                ? window.innerWidth - langButtonRef.current.getBoundingClientRect().right
                : 60,
              zIndex: 200,
            }}
          >
            {([
              { code: 'en', flag: '🇬🇧', label: 'EN' },
              { code: 'it', flag: '🇮🇹', label: 'IT' },
              { code: 'fr', flag: '🇫🇷', label: 'FR' },
              { code: 'es', flag: '🇪🇸', label: 'ES' },
              { code: 'de', flag: '🇩🇪', label: 'DE' },
            ] as const).map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => { handleLanguageChange(code); setShowLangMenu(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors",
                  language === code
                    ? "text-blue-400 bg-slate-800"
                    : "text-slate-200 hover:bg-white/5"
                )}
              >
                <span className="text-base leading-none">{flag}</span>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around md:hidden z-40">
        <NavIcon
          icon={Home}
          active={view === 'home'}
          onClick={() => setView('home')}
        />
        <NavIcon
          icon={Compass}
          active={view === 'map'}
          onClick={() => setView('map')}
        />
        <NavIcon
          icon={Trophy}
          active={view === 'ranking'}
          onClick={() => setView('ranking')}
        />
        <NavIcon
          icon={Heart}
          active={view === 'favorites'}
          onClick={() => user ? setView('favorites') : setShowAuthModal(true)}
        />
      </div>
    </div>
  );
}
