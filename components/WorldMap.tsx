import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Sphere, Graticule } from 'react-simple-maps';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type MapMode = 'flat' | 'globe';

interface WorldMapProps {
  onCountryClick: (name: string) => void;
  language: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const TRANSLATIONS = {
  it: { subtitle: 'Intelligence Geopolitica Interattiva', zoomIn: 'Ingrandisci', zoomOut: 'Rimpicciolisci', reset: 'Ripristina Mappa', toGlobe: 'Vista Globo', toFlat: 'Vista Mappa', toSatellite: 'Vista Satellite', toDark: 'Vista Scura' },
  en: { subtitle: 'Interactive Geopolitical Intelligence', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', reset: 'Reset Map', toGlobe: 'Globe View', toFlat: 'Flat Map', toSatellite: 'Satellite View', toDark: 'Dark View' },
  fr: { subtitle: 'Intelligence Géopolitique Interactive', zoomIn: 'Agrandir', zoomOut: 'Réduire', reset: 'Réinitialiser la carte', toGlobe: 'Vue Globe', toFlat: 'Vue Carte', toSatellite: 'Vue Satellite', toDark: 'Vue Sombre' },
  es: { subtitle: 'Inteligencia Geopolítica Interactiva', zoomIn: 'Acercar', zoomOut: 'Alejar', reset: 'Restablecer mapa', toGlobe: 'Vista Globo', toFlat: 'Vista Mapa', toSatellite: 'Vista Satélite', toDark: 'Vista Oscura' },
  de: { subtitle: 'Interaktive Geopolitische Analyse', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', reset: 'Karte zurücksetzen', toGlobe: 'Globus-Ansicht', toFlat: 'Kartenansicht', toSatellite: 'Satelliten-Ansicht', toDark: 'Dunkle Ansicht' },
};

// Style sets for each map theme
const DARK_STYLE = {
  default: { fill: '#0f172a', stroke: '#334155', strokeWidth: 0.5, transition: 'fill 200ms' },
  hover: { fill: '#2563eb', stroke: '#60a5fa', strokeWidth: 1, cursor: 'pointer', transition: 'fill 200ms' },
  pressed: { fill: '#1d4ed8', stroke: '#3b82f6', strokeWidth: 1 },
};

const SATELLITE_STYLE = {
  default: { fill: '#3d6b45', stroke: '#2a4d30', strokeWidth: 0.5, transition: 'fill 200ms' },
  hover: { fill: '#f59e0b', stroke: '#fbbf24', strokeWidth: 1, cursor: 'pointer', transition: 'fill 200ms' },
  pressed: { fill: '#d97706', stroke: '#f59e0b', strokeWidth: 1 },
};

// Memoized country path — prevents re-rendering all 240+ countries on every hover/zoom
const GeoPath = React.memo(({ geo, onEnter, onLeave, onClick, styleSet }: {
  geo: any;
  onEnter: (geo: any) => void;
  onLeave: () => void;
  onClick: (name: string) => void;
  styleSet: typeof DARK_STYLE;
}) => (
  <Geography
    geography={geo}
    onMouseEnter={() => onEnter(geo)}
    onMouseLeave={onLeave}
    onClick={() => onClick(geo.properties.name)}
    className="outline-none"
    style={styleSet}
  />
));
GeoPath.displayName = 'GeoPath';

export const WorldMap: React.FC<WorldMapProps> = React.memo(({ onCountryClick, language }) => {
  const [hovered, setHovered] = useState<{ name: string; code: string } | null>(null);
  const [position, setPosition] = useState({ coordinates: [10, 10] as [number, number], zoom: 1.2 });
  const [mode, setMode] = useState<MapMode>('flat');
  const [rotation, setRotation] = useState<[number, number, number]>([-10, -20, 0]);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const isDragging = useRef(false);
  const lastMouse = useRef<{ x: number; y: number } | null>(null);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 8;

  const t = TRANSLATIONS[language];

  const handleZoomIn = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(MAX_ZOOM, pos.zoom * 1.5) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(MIN_ZOOM, pos.zoom / 1.5) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [10, 10], zoom: 1.2 });
    setRotation([-10, -20, 0]);
  }, []);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  const handleGlobeMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleGlobeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !lastMouse.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setRotation((prev) => [
      prev[0] - dx * 0.35,
      Math.max(-80, Math.min(80, prev[1] + dy * 0.35)),
      prev[2],
    ]);
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    lastMouse.current = null;
  }, []);

  const handleGlobeTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleGlobeTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !lastMouse.current || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastMouse.current.x;
    const dy = e.touches[0].clientY - lastMouse.current.y;
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setRotation((prev) => [
      prev[0] - dx * 0.35,
      Math.max(-80, Math.min(80, prev[1] + dy * 0.35)),
      prev[2],
    ]);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', stopDrag);
    return () => window.removeEventListener('mouseup', stopDrag);
  }, [stopDrag]);

  const handleMouseEnter = useCallback((geo: any) => {
    setHovered({ name: geo.properties.name, code: geo.id });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((m) => m === 'flat' ? 'globe' : 'flat');
  }, []);

  const toggleMapStyle = useCallback(() => {
    setMapStyle((s) => s === 'dark' ? 'satellite' : 'dark');
  }, []);

  const activeStyle = mapStyle === 'satellite' ? SATELLITE_STYLE : DARK_STYLE;

  const flatProjectionConfig = useMemo(() => ({ scale: 160, center: [10, 0] as [number, number] }), []);
  const flatTranslateExtent = useMemo(() => [[-800, -400], [1600, 800]] as [[number, number], [number, number]], []);
  const globeProjectionConfig = useMemo(() => ({ rotate: rotation, scale: 260 }), [rotation]);

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-2xl border shadow-2xl"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backgroundColor: mapStyle === 'satellite' ? '#0a2540' : '#020617',
        borderColor: mapStyle === 'satellite' ? '#1a4060' : '#1e293b',
      }}
    >
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Nation Explorer</h1>
        <p className="text-slate-400 text-sm">{t.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg" title={t.zoomIn}>
          <Plus size={20} />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg" title={t.zoomOut}>
          <Minus size={20} />
        </button>
        <button onClick={handleReset} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg" title={t.reset}>
          <RotateCcw size={20} />
        </button>
        <button onClick={toggleMode} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg text-base leading-none" title={mode === 'flat' ? t.toGlobe : t.toFlat}>
          {mode === 'flat' ? '🌐' : '🗺️'}
        </button>
        <button onClick={toggleMapStyle} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg text-base leading-none" title={mapStyle === 'dark' ? t.toSatellite : t.toDark}>
          {mapStyle === 'dark' ? '🛰️' : '🗺️'}
        </button>
      </div>

      {hovered && (
        <div className="absolute bottom-6 right-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-lg shadow-xl pointer-events-none">
          <span className="text-white font-medium">{hovered.name}</span>
        </div>
      )}

      {/* Flat map */}
      {mode === 'flat' && (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <ComposableMap
            projectionConfig={flatProjectionConfig}
            width={800}
            height={400}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              translateExtent={flatTranslateExtent}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo, index) => (
                    <GeoPath
                      key={geo.id || geo.rjsKey || `geo-${index}`}
                      geo={geo}
                      onEnter={handleMouseEnter}
                      onLeave={handleMouseLeave}
                      onClick={onCountryClick}
                      styleSet={activeStyle}
                    />
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      )}

      {/* Globe view */}
      {mode === 'globe' && (
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onMouseDown={handleGlobeMouseDown}
          onMouseMove={handleGlobeMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={handleGlobeTouchStart}
          onTouchMove={handleGlobeTouchMove}
          onTouchEnd={stopDrag}
        >
          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={globeProjectionConfig}
            width={560}
            height={560}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: 'min(100%, 80vh)', height: 'auto', display: 'block' }}
          >
            <Sphere
              id="globe-sphere"
              fill={mapStyle === 'satellite' ? '#0a2540' : '#020617'}
              stroke={mapStyle === 'satellite' ? '#1a4060' : '#1e293b'}
              strokeWidth={1}
            />
            <Graticule
              stroke={mapStyle === 'satellite' ? '#1a4060' : '#1e293b'}
              strokeWidth={0.4}
            />
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo, index) => (
                  <GeoPath
                    key={geo.id || geo.rjsKey || `geo-${index}`}
                    geo={geo}
                    onEnter={handleMouseEnter}
                    onLeave={handleMouseLeave}
                    onClick={onCountryClick}
                    styleSet={activeStyle}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      )}
    </div>
  );
});

WorldMap.displayName = 'WorldMap';
