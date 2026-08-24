import React from 'react';
import InteractiveMap from './InteractiveMap';
import MapSearchBar from './MapSearchBar';
import MapLegend from './MapLegend';
import ParcelSidePanel from './ParcelSidePanel';

// Deterministic hero year data — mirrors seed_generator and SatelliteAnalysisTab
const HERO_YEAR_DATA = {
  2024: { area: 120,  score: 32, traj: 'Stable',         status: 'Monitoring' },
  2025: { area: 480,  score: 58, traj: 'Growing',        status: 'Alert Flagged' },
  2026: { area: 920,  score: 85, traj: 'Growing Fast',   status: 'Notice Issued' },
  2027: { area: 1150, score: 95, traj: 'Re-check Req.', status: 'Re-check Required' },
};

// Small temporal growth strip shown above the panel when a parcel is selected
function TemporalGrowthStrip({ parcel, selectedYear, setSelectedYear }) {
  if (!parcel) return null;

  const YEARS = [2024, 2025, 2026, 2027];

  const getArea = (yr) => {
    if (parcel.is_hero) return HERO_YEAR_DATA[yr]?.area ?? 0;
    return parcel.history?.[String(yr)] ?? 0;
  };
  const getScore = (yr) => {
    if (parcel.is_hero) return HERO_YEAR_DATA[yr]?.score ?? 0;
    return parcel.score_history?.[String(yr)] ?? parcel.urgency_score ?? 0;
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        background: 'rgba(255,255,255,0.97)',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', whiteSpace: 'nowrap', marginRight: 4 }}>
        Temporal View
      </div>

      {YEARS.map((yr, i) => {
        const active = yr === selectedYear;
        const area = getArea(yr);
        const hasData = parcel.is_hero || parcel.history?.[String(yr)] !== undefined;

        const textColor = active
          ? (yr === 2027 ? '#b91c1c' : '#1d4ed8')
          : (yr === 2027 ? '#ef4444' : '#6b7280');
          
        return (
          <React.Fragment key={yr}>
            {i > 0 && (
              <div style={{ flexShrink: 0, height: 1, width: 24, background: yr === 2027 ? '#fecaca' : '#e5e7eb', borderStyle: yr === 2027 ? 'dashed' : 'solid' }} />
            )}
            <button
              onClick={() => hasData && setSelectedYear(yr)}
              disabled={!hasData}
              style={{
                padding: '2px 4px',
                cursor: hasData ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                opacity: hasData ? 1 : 0.4,
                borderBottom: active ? `2px solid ${textColor}` : '2px solid transparent',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: active ? 700 : 500, fontSize: 11, color: textColor }}>
                {yr} {yr === 2027 && <span style={{ fontSize: 8, verticalAlign: 'top', textTransform: 'uppercase' }}>PROJ</span>}
              </div>
            </button>
          </React.Fragment>
        );
      })}

      {/* Net growth indicator */}
      {parcel && (
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#6b7280', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#b91c1c' }}>
            +{getArea(selectedYear) - getArea(2024)} m²
          </span>
          {' '}net growth since 2024
          {parcel.is_hero && (
            <span style={{ marginLeft: 8, fontSize: 9, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 6px', fontWeight: 700 }}>
              HERO DEMO
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function OverviewTab({
  parcels,
  selectedParcel,
  onSelectParcel,
  selectedYear,
  setSelectedYear,
  stats,
  onRecordAction,
  onTriggerRecheck,
  onOpenSatellite,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Map area with sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map column */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map search bar — floating overlay */}
          <div className="absolute top-3 left-3 z-[1000]">
            <MapSearchBar parcels={parcels} onSelectParcel={onSelectParcel} />
          </div>

          {/* Year selector overlay */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 bg-white/95 border border-stone-300 shadow-sm px-1.5 py-1 text-[11px] font-medium font-mono text-stone-600 backdrop-blur-sm">
            <span className="text-stone-500 mx-1 uppercase tracking-wider text-[9px] font-sans">OBSERVATION</span>
            <div className="flex">
              {[2024, 2025, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2 py-0.5 transition-colors ${
                    selectedYear === yr
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
            
            <div className="w-px h-4 bg-stone-300 mx-1"></div>
            
            <span className="text-rose-600/70 mx-1 uppercase tracking-wider text-[9px] font-sans">SCENARIO</span>
            <div className="flex">
              <button
                onClick={() => setSelectedYear(2027)}
                className={`px-2 py-0.5 transition-colors ${
                  selectedYear === 2027
                    ? 'bg-rose-700 text-white font-bold'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                2027
              </button>
            </div>
          </div>

          {/* Map legend */}
          <MapLegend />

          {/* Map */}
          <div
            className="w-full"
            style={{ height: selectedParcel ? 'calc(100% - 60px)' : '100%', transition: 'height 0.2s' }}
          >
            <InteractiveMap
              parcels={parcels}
              selectedParcel={selectedParcel}
              onSelectParcel={onSelectParcel}
              selectedYear={selectedYear}
            />
          </div>

          {/* Temporal growth strip — visible when parcel is selected */}
          {selectedParcel && (
            <TemporalGrowthStrip
              parcel={selectedParcel}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          )}
        </div>

        {/* Right panel — parcel detail */}
        {selectedParcel && (
          <ParcelSidePanel
            parcel={selectedParcel}
            selectedYear={selectedYear}
            onClose={() => onSelectParcel(null)}
            onRecordAction={onRecordAction}
            onTriggerRecheck={onTriggerRecheck}
            onOpenSatellite={onOpenSatellite}
          />
        )}
      </div>

      {/* Bottom status bar with monitoring funnel */}
      <div className="bg-white border-t border-stone-200 px-5 py-2 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-stone-500 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-stone-600 uppercase tracking-wider text-[10px] mr-1">MONITORING FUNNEL</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.monitored || parcels.length}</span> Monitored
          </span>
          <span className="text-stone-300">›</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.detected_change || '—'}</span> Detected Change
          </span>
          <span className="text-stone-300">›</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.persistent_changes || '—'}</span> Persistent
          </span>
          <span className="text-stone-300">›</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.high_priority || '—'}</span> High Priority
          </span>
          <span className="text-stone-300">›</span>
          <span className="flex items-center gap-1">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.inspection_candidates || '—'}</span> Inspection Candidates
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-500">
          <span>False Positives Filtered: <span className="font-bold text-stone-800 font-mono">{stats?.monitoring_funnel?.false_positives || '—'}</span></span>
          <span className="text-stone-200">|</span>
          <span>Click parcel to inspect</span>
        </div>
      </div>
    </div>
  );
}
