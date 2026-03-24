import React from 'react';
import { motion } from 'motion/react';
import { Globe2, ArrowRight, Shield, Zap, BarChart3, Users } from 'lucide-react';

interface HomeViewProps {
  onExplore: () => void;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
}

export const HomeView = React.memo(function HomeView({ onExplore, language }: HomeViewProps) {
  const t = {
    it: {
      title: "Esplora il Mondo",
      subtitle: "Analisi Geopolitica Avanzata",
      description: "Accedi a dati in tempo reale su economia, difesa, energia e demografia di ogni nazione. Nation Explorer utilizza l'intelligenza artificiale per fornirti una visione profonda degli equilibri globali.",
      explore: "Esplora la Mappa",
      features: [
        { icon: Shield, title: "Difesa & Arsenali", desc: "Dati dettagliati su capacità militari e testate nucleari." },
        { icon: Zap, title: "Energia & Risorse", desc: "Mix energetico, dipendenza e riserve strategiche." },
        { icon: BarChart3, title: "Economia & PIL", desc: "Indicatori macroeconomici e partner commerciali." },
        { icon: Users, title: "Società & Politica", desc: "Demografia, libertà di stampa e coesione sociale." }
      ]
    },
    en: {
      title: "Explore the World",
      subtitle: "Advanced Geopolitical Analysis",
      description: "Access real-time data on economy, defense, energy, and demographics of every nation. Nation Explorer uses artificial intelligence to provide you with a deep insight into global balances.",
      explore: "Explore the Map",
      features: [
        { icon: Shield, title: "Defense & Arsenals", desc: "Detailed data on military capabilities and nuclear warheads." },
        { icon: Zap, title: "Energy & Resources", desc: "Energy mix, dependence, and strategic reserves." },
        { icon: BarChart3, title: "Economy & GDP", desc: "Macroeconomic indicators and trading partners." },
        { icon: Users, title: "Society & Politics", desc: "Demographics, press freedom, and social cohesion." }
      ]
    },
    fr: {
      title: "Explorer le Monde",
      subtitle: "Analyse Géopolitique Avancée",
      description: "Accédez aux données en temps réel sur l'économie, la défense, l'énergie et la démographie de chaque nation. Nation Explorer utilise l'intelligence artificielle pour vous offrir une vision approfondie des équilibres mondiaux.",
      explore: "Explorer la Carte",
      features: [
        { icon: Shield, title: "Défense & Arsenaux", desc: "Données détaillées sur les capacités militaires et les têtes nucléaires." },
        { icon: Zap, title: "Énergie & Ressources", desc: "Mix énergétique, dépendance et réserves stratégiques." },
        { icon: BarChart3, title: "Économie & PIB", desc: "Indicateurs macroéconomiques et partenaires commerciaux." },
        { icon: Users, title: "Société & Politique", desc: "Démographie, liberté de la presse et cohésion sociale." }
      ]
    },
    es: {
      title: "Explorar el Mundo",
      subtitle: "Análisis Geopolítico Avanzado",
      description: "Accede a datos en tiempo real sobre economía, defensa, energía y demografía de cada nación. Nation Explorer utiliza inteligencia artificial para brindarte una visión profunda de los equilibrios globales.",
      explore: "Explorar el Mapa",
      features: [
        { icon: Shield, title: "Defensa & Arsenales", desc: "Datos detallados sobre capacidades militares y ojivas nucleares." },
        { icon: Zap, title: "Energía & Recursos", desc: "Mix energético, dependencia y reservas estratégicas." },
        { icon: BarChart3, title: "Economía & PIB", desc: "Indicadores macroeconómicos y socios comerciales." },
        { icon: Users, title: "Sociedad & Política", desc: "Demografía, libertad de prensa y cohesión social." }
      ]
    },
    de: {
      title: "Die Welt Erkunden",
      subtitle: "Fortgeschrittene Geopolitische Analyse",
      description: "Greifen Sie auf Echtzeit-Daten zu Wirtschaft, Verteidigung, Energie und Demografie jeder Nation zu. Nation Explorer nutzt künstliche Intelligenz, um Ihnen einen tiefen Einblick in die globalen Gleichgewichte zu geben.",
      explore: "Karte Erkunden",
      features: [
        { icon: Shield, title: "Verteidigung & Arsenal", desc: "Detaillierte Daten zu militärischen Fähigkeiten und Atomsprengköpfen." },
        { icon: Zap, title: "Energie & Ressourcen", desc: "Energiemix, Abhängigkeit und strategische Reserven." },
        { icon: BarChart3, title: "Wirtschaft & BIP", desc: "Makroökonomische Indikatoren und Handelspartner." },
        { icon: Users, title: "Gesellschaft & Politik", desc: "Demografie, Pressefreiheit und sozialer Zusammenhalt." }
      ]
    },
  }[language];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-y-auto custom-scrollbar pt-10 md:pt-20 pb-20 md:pb-12 px-4 md:px-6">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Globe2 size={14} className="animate-pulse" />
          {t.subtitle}
        </div>

        <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white leading-none">
          NATION <span className="text-blue-500">EXPLORER</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.description}
        </p>

        <div className="flex justify-center pt-4">
          <button
            onClick={onExplore}
            className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95"
          >
            {t.explore}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 md:mt-20 text-left">
          {t.features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});
