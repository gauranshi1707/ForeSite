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
        const score = getScore(yr);
        const hasData = parcel.is_hero || parcel.history?.[String(yr)] !== undefined;

        const scoreColor = score >= 80 ? '#b91c1c' : score >= 55 ? '#b45309' : '#15803d';
        const bgColor = active
          ? (yr === 2027 ? '#fef2f2' : '#eff6ff')
          : '#f9fafb';
        const borderColor = active
          ? (yr === 2027 ? '#fecaca' : '#bfdbfe')
          : '#e5e7eb';

        return (
          <React.Fragment key={yr}>
            {i > 0 && (
              <div style={{ flexShrink: 0, height: 1, width: yr === 2027 ? 24 : 18, background: yr === 2027 ? '#fecaca' : '#d1d5db', borderStyle: yr === 2027 ? 'dashed' : 'solid' }} />
            )}
            <button
              onClick={() => hasData && setSelectedYear(yr)}
              disabled={!hasData}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: `1.5px solid ${borderColor}`,
                background: bgColor,
                cursor: hasData ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                minWidth: 64,
                opacity: hasData ? 1 : 0.4,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 12, color: active ? (yr === 2027 ? '#b91c1c' : '#1d4ed8') : (yr === 2027 ? '#b91c1c' : '#374151') }}>
                {yr} {yr === 2027 && <span style={{ fontSize: 8, verticalAlign: 'top', textTransform: 'uppercase' }}>PROJ</span>}
              </div>
              {area > 0 && (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b7280', marginTop: 1 }}>
                  {area} m²
                </div>
              )}
              {score > 0 && (
                <div style={{ fontSize: 9, fontWeight: 700, color: scoreColor, marginTop: 1 }}>
                  P:{score}
                </div>
              )}
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
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-3">
            <div className="bg-white/95 border border-stone-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-stone-600 shadow-sm backdrop-blur-sm flex items-center gap-2">
              <span className="font-semibold text-stone-700 mr-1">Observations:</span>
              <div className="flex bg-stone-100 rounded p-0.5 border border-stone-200">
                {[2024, 2025, 2026].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                      selectedYear === yr
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white/95 border border-rose-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-rose-700 shadow-sm backdrop-blur-sm flex items-center gap-2">
              <span className="font-semibold mr-1">Projected Scenario:</span>
              <div className="flex bg-rose-50 rounded p-0.5 border border-rose-200">
                <button
                  onClick={() => setSelectedYear(2027)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                    selectedYear === 2027
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'text-rose-500 hover:text-rose-900 hover:bg-rose-200'
                  }`}
                >
                  2027
                </button>
              </div>
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
      <div className="bg-white border-t border-stone-200 px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-stone-500 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-stone-700 uppercase tracking-wider text-[9px] mr-2">Monitoring Funnel:</span>
          <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.monitored || parcels.length}</span> Monitored
          </span>
          <span className="text-stone-300">→</span>
          <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.detected_change || '—'}</span> Detected Change
          </span>
          <span className="text-stone-300">→</span>
          <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.persistent_changes || '—'}</span> Persistent
          </span>
          <span className="text-stone-300">→</span>
          <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.high_priority || '—'}</span> High Priority
          </span>
          <span className="text-stone-300">→</span>
          <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700">
            <span className="font-bold text-stone-900 font-mono">{stats?.monitoring_funnel?.inspection_candidates || '—'}</span> Inspection Candidates
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <span>False Positives Filtered: <span className="font-bold text-stone-700 font-mono">{stats?.monitoring_funnel?.false_positives || '—'}</span></span>
          <span className="text-stone-200">|</span>
          <span>Click a parcel to inspect</span>
        </div>
      </div>
    </div>
  );
}
