import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import {
  Search, Play, Pause, ChevronLeft, ChevronRight, AlertTriangle,
  Info, Clock, TrendingUp, Layers, MapPin, Compass, RotateCcw
} from 'lucide-react';
import MapSearchBar from './MapSearchBar';

// ─────────────────────────────────────────────────────────────────────────────
// Data Definitions
// ─────────────────────────────────────────────────────────────────────────────
const HERO_YEAR_DATA = {
  2024: { area: 120,  score: 32, traj: 'Stable',       status: 'Monitoring', risk: 'Low' },
  2025: { area: 480,  score: 58, traj: 'Growing',      status: 'Alert Flagged', risk: 'Medium' },
  2026: { area: 920,  score: 85, traj: 'Growing Fast', status: 'Notice Issued', risk: 'High' },
  2027: { area: 1150, score: 95, traj: 'Re-check Required', status: 'Re-check Required', risk: 'Critical' },
};

const YEARS = [2024, 2025, 2026, 2027];

// ─────────────────────────────────────────────────────────────────────────────
// Isometric 3D Map Component
// ─────────────────────────────────────────────────────────────────────────────
function IsometricMap({ parcel, year, prevYear, layerMode, options }) {
  const isProj = year === 2027;
  
  // Dimensions and mapping
  const area = parcel?.is_hero ? (HERO_YEAR_DATA[year]?.area ?? 0) : (parcel?.history?.[String(year)] ?? 0);
  const prevArea = prevYear ? (parcel?.is_hero ? (HERO_YEAR_DATA[prevYear]?.area ?? 0) : (parcel?.history?.[String(prevYear)] ?? 0)) : 0;
  
  const maxArea = 1200;
  const builtRatio = Math.min(1, area / maxArea);
  
  // Directional growth logic (SE -> NW)
  const getBounds = (yrArea) => {
    const ratio = Math.min(1, yrArea / maxArea);
    const w = 0.15 + ratio * 0.55;
    const h = 0.15 + ratio * 0.45;
    return {
      w: w * 400,
      h: h * 400,
      x: 400 - (w * 400) - 80,
      y: 400 - (h * 400) - 80,
    };
  };

  const currentBounds = getBounds(area);
  const prevBounds = getBounds(prevArea);

  // Extrusion height based on area (simulating building volume)
  const extrusionHeight = 5 + (builtRatio * 40);

  // Colors based on layer mode
  let terrainColor = '#e5e5e5';
  let vegColor = '#d1d5db';
  let builtTopColor = '#a8a29e';
  let builtSideColor = '#78716c';
  let builtFrontColor = '#57534e';
  
  if (layerMode === 'TRUE COLOR') {
    terrainColor = '#c4b898';
    vegColor = '#a3b18a';
    builtTopColor = isProj ? '#c05030' : '#d6d3d1';
    builtSideColor = isProj ? '#9b3020' : '#a8a29e';
    builtFrontColor = isProj ? '#7a2215' : '#78716c';
  } else if (layerMode === 'FALSE COLOR') {
    terrainColor = '#1e1b4b'; // Deep blue/purple
    vegColor = '#dc2626';     // Red for vegetation in CIR
    builtTopColor = '#06b6d4'; // Cyan for built-up
    builtSideColor = '#0891b2';
    builtFrontColor = '#0e7490';
  } else if (layerMode === 'BUILT-UP') {
    terrainColor = '#171717';
    vegColor = '#262626';
    // Heatmap style for built-up
    const intensity = Math.round(150 + builtRatio * 105);
    builtTopColor = `rgb(255, ${255 - intensity}, 0)`;
    builtSideColor = `rgb(200, ${200 - (intensity*0.8)}, 0)`;
    builtFrontColor = `rgb(150, ${150 - (intensity*0.6)}, 0)`;
  } else if (layerMode === 'CHANGE') {
    terrainColor = '#f5f5f4';
    vegColor = '#e7e5e4';
    builtTopColor = '#d6d3d1';
    builtSideColor = '#a8a29e';
    builtFrontColor = '#78716c';
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-900 select-none">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* The 3D World Container */}
      <div 
        style={{
          width: 400, height: 400,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transition: 'transform 0.5s ease',
        }}
        className="relative"
      >
        {/* Terrain Base */}
        <div 
          className="absolute inset-0 shadow-2xl transition-colors duration-500"
          style={{ background: terrainColor, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* Parcel Boundary */}
          {options.showParcel && (
            <div className="absolute inset-4 border-2 border-dashed border-stone-800/40" />
          )}

          {/* Vegetation Patches (abstract) */}
          {options.showVeg && (
            <>
              <div className="absolute top-8 left-8 w-32 h-24 rounded-full blur-xl opacity-60 transition-colors duration-500" style={{ background: vegColor }} />
              <div className="absolute bottom-16 left-12 w-24 h-32 rounded-full blur-xl opacity-50 transition-colors duration-500" style={{ background: vegColor }} />
            </>
          )}

          {/* Roads */}
          {options.showRoads && (
            <>
              <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-stone-800/10" />
              <div className="absolute left-0 right-0 top-1/3 h-3 bg-stone-800/10" />
            </>
          )}

          {/* Previous Footprint Ghosting */}
          {options.showPrev && prevArea > 0 && (
            <div 
              className="absolute border-2 border-dashed border-stone-800/40 bg-stone-800/10 transition-all duration-700 ease-in-out"
              style={{
                left: prevBounds.x, top: prevBounds.y,
                width: prevBounds.w, height: prevBounds.h,
              }}
            />
          )}

          {/* Extruded 3D Building */}
          {options.showBuilt && area > 0 && (
            <div
              className="absolute transition-all duration-700 ease-in-out"
              style={{
                left: currentBounds.x, top: currentBounds.y,
                width: currentBounds.w, height: currentBounds.h,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Change Highlight Base (renders underneath if CHANGE mode) */}
              {layerMode === 'CHANGE' && prevArea > 0 && area > prevArea && (
                <div 
                  className="absolute bg-rose-500/80 animate-pulse transition-all duration-700 ease-in-out"
                  style={{
                    left: prevBounds.x - currentBounds.x,
                    top: prevBounds.y - currentBounds.y,
                    width: prevBounds.w, height: prevBounds.h,
                    boxShadow: '0 0 20px 10px rgba(244,63,94,0.4)'
                  }}
                />
              )}

              {/* Top Face */}
              <div 
                className="absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center"
                style={{
                  background: builtTopColor,
                  transform: `translateZ(${extrusionHeight}px)`,
                  boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1)'
                }}
              >
                {/* Grid texture on roof */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
                  backgroundSize: '10px 10px'
                }} />
              </div>

              {/* Front Face (South) */}
              <div 
                className="absolute bottom-0 left-0 right-0 origin-bottom transition-all duration-700 ease-in-out"
                style={{
                  height: extrusionHeight,
                  background: builtFrontColor,
                  transform: `rotateX(-90deg)`,
                }}
              />

              {/* Side Face (East) */}
              <div 
                className="absolute top-0 bottom-0 right-0 origin-right transition-all duration-700 ease-in-out"
                style={{
                  width: extrusionHeight,
                  background: builtSideColor,
                  transform: `rotateY(90deg)`,
                }}
              />

              {/* Shadow */}
              <div 
                className="absolute inset-0 bg-black/30 blur-md transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateZ(-1px) translateX(10px) translateY(10px)`,
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Overlay UI Elements ── */}
      
      {/* North Arrow */}
      <div className="absolute top-6 right-6 flex flex-col items-center opacity-70">
        <Compass size={24} className="text-stone-400" />
        <span className="text-[9px] font-bold text-stone-500 mt-1">N</span>
      </div>

      {/* Scale & Coordinates */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="flex items-center justify-end gap-2 mb-1">
          <div className="w-16 h-1 bg-stone-500/50 relative border-x border-stone-400" />
          <span className="text-[10px] font-mono text-stone-400">100m</span>
        </div>
        <div className="text-[10px] font-mono text-stone-500">28.58° N, 77.05° E</div>
      </div>

      {/* Data Honesty Label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-stone-700 rounded-full px-4 py-1.5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono font-medium text-stone-300 uppercase tracking-wider">
          Prototype Synthetic EO Dataset
        </span>
      </div>

      {isProj && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-rose-900/80 backdrop-blur-md border border-rose-500/50 rounded px-3 py-1 text-[11px] font-bold text-rose-200 uppercase tracking-widest shadow-lg shadow-rose-900/20">
          Projected Scenario — Not Observed
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SatelliteAnalysisTab({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onRecordAction,
  onTriggerRecheck,
}) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layerMode, setLayerMode] = useState('TRUE COLOR');
  const [hoverYear, setHoverYear] = useState(null);
  
  const [mapOptions, setMapOptions] = useState({
    showParcel: true,
    showPrev: true,
    showBuilt: true,
    showRoads: true,
    showVeg: true
  });

  const selectedParcel = useMemo(() => {
    if (!selectedParcelId) return null;
    return parcels.find(p => p.parcel_id === selectedParcelId);
  }, [parcels, selectedParcelId]);

  // Play animation effect
  useEffect(() => {
    if (!isPlaying) return;
    let currentIdx = YEARS.indexOf(selectedYear);
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % YEARS.length;
      setSelectedYear(YEARS[currentIdx]);
      if (currentIdx === YEARS.length - 1) {
        setIsPlaying(false);
      }
    }, 1500); // 1.5s per transition
    return () => clearInterval(interval);
  }, [isPlaying, selectedYear]);

  if (!selectedParcel) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50 text-stone-900">
        <div className="text-center">
          <Search size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm">Select a parcel to view satellite analysis.</p>
        </div>
      </div>
    );
  }

  const activeYear = hoverYear || selectedYear;
  const isProj = activeYear === 2027;
  const activeIdx = YEARS.indexOf(activeYear);
  const prevYear = activeIdx > 0 ? YEARS[activeIdx - 1] : null;

  const heroData = selectedParcel.is_hero ? HERO_YEAR_DATA[activeYear] : null;
  const area = heroData ? heroData.area : (selectedParcel.history?.[String(activeYear)] ?? 0);
  const baseArea = selectedParcel.is_hero ? HERO_YEAR_DATA[2024].area : (selectedParcel.history?.['2024'] ?? 0);
  const prevArea = prevYear ? (selectedParcel.is_hero ? HERO_YEAR_DATA[prevYear].area : (selectedParcel.history?.[String(prevYear)] ?? 0)) : area;
  const netGrowth = area - baseArea;
  const growthPct = baseArea > 0 ? ((netGrowth / baseArea) * 100).toFixed(0) : 0;
  
  const score = heroData ? heroData.score : (selectedParcel.score_history?.[String(activeYear)] ?? selectedParcel.urgency_score);
  const traj = heroData ? heroData.traj : selectedParcel.trajectory;
  const risk = heroData ? heroData.risk : selectedParcel.risk_level;

  const chartData = YEARS.map(yr => ({
    year: yr,
    builtup: selectedParcel.is_hero ? HERO_YEAR_DATA[yr].area : (selectedParcel.history?.[yr] ?? 0)
  }));

  const [isSimulating, setIsSimulating] = useState(false);
  const handleSimulateRecheck = async () => {
    setIsSimulating(true);
    await onTriggerRecheck(selectedParcel.id, 1150.0);
    setIsSimulating(false);
    setSelectedYear(2027);
  };

  return (
    <div className="flex h-full bg-stone-950 text-stone-300 overflow-hidden font-sans">
      
      {/* ── LEFT: Main Visualization ── */}
      <div className="flex-1 flex flex-col relative border-r border-stone-800">
        
        {/* Search Bar */}
        <div className="absolute top-4 left-4 z-30">
          <MapSearchBar parcels={parcels} onSelectParcel={onSelectParcel} />
        </div>

        {/* Layer Controls */}
        <div className="absolute top-16 left-4 z-20 flex gap-1 bg-stone-900/80 backdrop-blur border border-stone-800 p-1 rounded-lg shadow-xl">
          {['TRUE COLOR', 'FALSE COLOR', 'CHANGE', 'BUILT-UP'].map(mode => (
            <button
              key={mode}
              onClick={() => setLayerMode(mode)}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors ${
                layerMode === mode 
                  ? 'bg-blue-600 text-white shadow-inner' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Visibility Toggles */}
        <div className="absolute top-28 left-4 z-20 flex flex-col gap-1 bg-stone-900/80 backdrop-blur border border-stone-800 p-2 rounded-lg shadow-xl">
          {Object.entries({
            showParcel: 'Parcel Boundary',
            showPrev: 'Previous Footprint',
            showBuilt: 'Built-up Footprint',
            showRoads: 'Roads',
            showVeg: 'Vegetation'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={mapOptions[key]} 
                onChange={(e) => setMapOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="accent-blue-600 w-3 h-3"
              />
              {label}
            </label>
          ))}
        </div>

        {/* The 3D Map */}
        <div className="flex-1 relative">
          <IsometricMap 
            parcel={selectedParcel} 
            year={activeYear} 
            prevYear={prevYear} 
            layerMode={layerMode}
            options={mapOptions}
          />
          
          {/* Overlay Data on Map */}
          <div className="absolute top-4 right-4 z-20 bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-xl shadow-2xl min-w-[220px]">
            <div className="font-mono font-bold text-white text-lg">{selectedParcel.parcel_id}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{selectedParcel.land_category}</div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline border-b border-stone-800 pb-2">
                <span className="text-[11px] text-stone-400 uppercase">Built-up</span>
                <span className="font-mono text-xl text-stone-100 font-bold">{area} <span className="text-sm text-stone-500">m²</span></span>
              </div>
              {area > prevArea && prevArea > 0 && (
                <div className="flex justify-between items-baseline border-b border-stone-800 pb-2">
                  <span className="text-[11px] text-stone-400 uppercase">{isProj ? 'Projected Add' : 'New Change'}</span>
                  <span className="font-mono text-sm text-amber-500 font-bold">+{area - prevArea} m²</span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-stone-400 uppercase">Total Growth</span>
                <span className="font-mono text-sm text-rose-500 font-bold">+{growthPct}%</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2 py-1 rounded bg-stone-800 ${
                traj.includes('Fast') ? 'text-rose-400' : traj === 'Growing' ? 'text-amber-400' : 'text-stone-300'
              }`}>
                {traj}
              </span>
              <span className="font-mono text-sm font-bold text-rose-400">{score}<span className="text-[10px] text-stone-500">/100</span></span>
            </div>
          </div>
        </div>

        {/* Temporal Scrubber */}
        <div className="h-24 bg-stone-900 border-t border-stone-800 flex flex-col justify-center px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg transition-colors shrink-0"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            
            <div className="flex-1 flex justify-between relative px-4">
              {/* Line behind */}
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-stone-800 -translate-y-1/2" />
              
              {YEARS.map(yr => {
                const isActive = activeYear === yr;
                const isScenario = yr === 2027;
                return (
                  <div key={yr} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => setSelectedYear(yr)}>
                    <div className="text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider h-4">
                      {yr === 2024 ? 'Baseline' : yr === 2025 ? 'Observation' : yr === 2026 ? 'Latest' : 'Projected'}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                      isActive 
                        ? (isScenario ? 'bg-rose-500 border-rose-300 scale-125 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-500 border-blue-300 scale-125 shadow-[0_0_10px_rgba(59,130,246,0.5)]')
                        : 'bg-stone-900 border-stone-600 group-hover:border-stone-400'
                    }`} />
                    <div className={`mt-2 font-mono text-sm transition-colors ${
                      isActive ? (isScenario ? 'text-rose-400 font-bold' : 'text-blue-400 font-bold') : 'text-stone-400'
                    }`}>
                      {yr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Data & Signals Panel ── */}
      <div className="w-80 bg-stone-950 flex flex-col overflow-y-auto custom-scrollbar border-l border-stone-900 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-30">
        
        {/* Priority Score Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-900/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Priority Index</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl font-black text-rose-500">{score}</span>
                <span className="font-mono text-sm text-stone-600">/100</span>
              </div>
            </div>
            <div className="px-2 py-1 rounded border border-rose-900/50 bg-rose-950/30 text-rose-500 text-[10px] font-bold uppercase">
              {risk} Risk
            </div>
          </div>
          
          {/* Breakdown bars */}
          <div className="space-y-2 mt-4">
            {[
              { label: 'Growth Velocity', val: 25, max: 30 },
              { label: 'Recent Change', val: 20, max: 20 },
              { label: 'Accumulated Built-up', val: 12, max: 15 },
              { label: 'Temporal Persistence', val: 15, max: 15 },
              { label: 'Post-Notice Risk', val: isProj ? 20 : 13, max: 20 },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] text-stone-400 uppercase">
                  <span>{item.label}</span>
                  <span className="font-mono text-stone-300">{item.val}/{item.max}</span>
                </div>
                <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-500 transition-all duration-500" style={{ width: `${(item.val/item.max)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prototype EO Signals */}
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-stone-500" />
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Prototype EO Signals</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900 p-3 rounded border border-stone-800">
              <div className="text-[10px] text-stone-500 font-bold mb-1">NDBI</div>
              <div className="text-[11px] text-stone-300 leading-snug">Built-up signal <span className="text-rose-400 font-bold block mt-1">↑ Significant</span></div>
            </div>
            <div className="bg-stone-900 p-3 rounded border border-stone-800">
              <div className="text-[10px] text-stone-500 font-bold mb-1">NDVI</div>
              <div className="text-[11px] text-stone-300 leading-snug">Vegetation signal <span className="text-amber-500 font-bold block mt-1">↓ Declining</span></div>
            </div>
            <div className="bg-stone-900 p-3 rounded border border-stone-800">
              <div className="text-[10px] text-stone-500 font-bold mb-1">PERSISTENCE</div>
              <div className="text-[11px] text-stone-300 font-bold mt-1">3 consecutive obs.</div>
            </div>
            <div className="bg-stone-900 p-3 rounded border border-stone-800">
              <div className="text-[10px] text-stone-500 font-bold mb-1">CONSISTENCY</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">High Spatial Match</div>
            </div>
          </div>
        </div>

        {/* Built-up Area Graph (Interactive) */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-stone-500" />
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Temporal Growth Curve</h3>
          </div>
          <div className="text-[10px] text-stone-500 mb-4">Hover graph to highlight footprint on map</div>
          
          <div className="flex-1 w-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                onMouseMove={(e) => {
                  if (e.activeTooltipIndex !== undefined) {
                    setHoverYear(YEARS[e.activeTooltipIndex]);
                  }
                }}
                onMouseLeave={() => setHoverYear(null)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="year" stroke="#57534e" tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#57534e" tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '4px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <ReferenceLine x={2026} stroke="#f43f5e" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="builtup" name="Built-up Area (m²)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1c1917', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Re-check Action */}
          {selectedParcel.status === 'Notice Issued' && !selectedParcel.history?.['2027'] && (
            <div className="mt-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg">
              <div className="text-[11px] text-rose-300 font-bold mb-2">Notice Issued 2026-06-15</div>
              <button
                onClick={handleSimulateRecheck}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold py-2 rounded transition-colors disabled:opacity-50"
              >
                <RotateCcw size={14} />
                {isSimulating ? 'Simulating 2027 Scenario...' : 'Simulate 2027 Scenario (1,150 m²)'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
