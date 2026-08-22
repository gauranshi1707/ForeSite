import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import {
  Search, ChevronLeft, ChevronRight, Play, Pause, AlertTriangle,
  Info, Clock, TrendingUp, RotateCcw, MapPin
} from 'lucide-react';

// ----------------------------------------------------------------
// Synthetic satellite imagery panel — prototype visualization
// ----------------------------------------------------------------
function SatelliteImageryPanel({ parcel, year, isCurrentYear }) {
  if (!parcel) return (
    <div className="h-56 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm">
      Select a parcel to view imagery
    </div>
  );

  const area = parcel.history?.[String(year)] ?? 0;
  const maxArea = 1200;
  const builtPct = Math.min(1, area / maxArea);

  // Vegetation green behind
  const vegOpacity = Math.max(0.15, 0.7 - builtPct * 0.55);
  // Built-up block scale
  const builtScale = Math.min(0.85, 0.08 + builtPct * 0.77);

  const traj = parcel.trajectory;
  const builtColor = isCurrentYear && traj === 'GROWING FAST' ? '#c0503a'
    : isCurrentYear && traj === 'GROWING' ? '#c08030'
    : '#8a7050';

  return (
    <div className="relative h-56 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
      {/* Prototype label */}
      <div className="absolute top-2 left-2 z-10 bg-white/90 border border-stone-200 text-[9px] font-mono text-stone-500 px-2 py-0.5 rounded">
        Prototype Synthetic EO — {year}
      </div>

      {/* Label badge */}
      <div className={`absolute top-2 right-2 z-10 text-[10px] font-semibold px-2 py-1 rounded border ${
        isCurrentYear ? 'bg-blue-700 text-white border-blue-800' : 'bg-stone-100 text-stone-600 border-stone-200'
      }`}>
        {isCurrentYear ? `CURRENT — ${year}` : `BEFORE — ${year}`}
      </div>

      {/* Terrain background */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, #d4e8c8 0%, #c8e0b8 40%, #d8e8c0 70%, #c8d8b0 100%)`,
        opacity: vegOpacity + 0.3,
      }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(#666 1px,transparent 1px),linear-gradient(90deg,#666 1px,transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Roads */}
      <div className="absolute" style={{ left: '10%', right: '10%', top: '50%', height: 2, background: '#b8a898', opacity: 0.7 }} />
      <div className="absolute" style={{ left: '50%', top: '10%', bottom: '10%', width: 2, background: '#b8a898', opacity: 0.7 }} />

      {/* Land parcel outline */}
      <div className="absolute inset-6 border border-dashed border-stone-400 rounded opacity-60" />

      {/* Built-up footprint visualization */}
      {area > 0 && (
        <div
          className="absolute rounded transition-all duration-500"
          style={{
            bottom: `${(1 - builtScale) * 50 + 8}%`,
            left: `${(1 - builtScale) * 50 + 8}%`,
            width: `${builtScale * 84}%`,
            height: `${builtScale * 84}%`,
            background: builtColor,
            opacity: 0.55 + builtPct * 0.25,
          }}
        >
          {/* Building grid effect */}
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '10px 10px' }}
          />
        </div>
      )}

      {/* Area label */}
      <div className="absolute bottom-2 left-2 bg-white/90 border border-stone-200 text-[11px] font-mono font-bold text-stone-800 px-2 py-1 rounded">
        {area} m² built-up
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Custom recharts tooltip
// ----------------------------------------------------------------
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-md text-[11px]">
      <div className="font-semibold text-stone-700 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-stone-600">{p.name}:</span>
          <span className="font-mono font-bold text-stone-900">{p.value}{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------
// Score explainability (inline, light)
// ----------------------------------------------------------------
function ScoreBreakdownPanel({ score, riskLevel, breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;
  return (
    <div className="fs-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Prototype Priority Score</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Explainable factor breakdown</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-black text-2xl text-stone-900">{score}<span className="text-sm text-stone-400 font-normal">/100</span></div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            riskLevel === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
            riskLevel === 'High' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
            riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            'bg-green-100 text-green-700 border border-green-200'
          }`}>{riskLevel} Risk</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {breakdown.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-stone-700">{item.factor}</span>
              <span className="font-mono font-bold text-stone-900">+{item.points}<span className="text-stone-400 font-normal text-[10px]">/{item.max_points} pts</span></span>
            </div>
            <div className="text-[10px] text-stone-400 mb-1">{item.description}</div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${(item.points / item.max_points) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-start gap-1.5 text-[10px] text-stone-400">
        <Info size={10} className="mt-0.5 shrink-0 text-blue-500" />
        AI decision support only. Officials perform field inspections and make all legal determinations.
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main SatelliteAnalysisTab
// ----------------------------------------------------------------
export default function SatelliteAnalysisTab({
  parcels,
  initialParcel,
  onRecordAction,
  onTriggerRecheck,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState(initialParcel || null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showSearch, setShowSearch] = useState(false);
  const [showChangeMask, setShowChangeMask] = useState(true);
  const [isRechecking, setIsRechecking] = useState(false);

  const YEARS = [2024, 2025, 2026, 2027];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return parcels.filter(p =>
      p.parcel_id?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.ward?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [parcels, searchQuery]);

  const handleSelectParcel = useCallback((p) => {
    setSelectedParcel(p);
    setSelectedYear(2026);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  // Chart data
  const growthChartData = useMemo(() => {
    if (!selectedParcel) return [];
    return Object.entries(selectedParcel.history)
      .filter(([yr]) => !isNaN(Number(yr)))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([yr, val]) => ({
        year: yr,
        area: val,
        label: `${yr}`,
      }));
  }, [selectedParcel]);

  const scoreChartData = useMemo(() => {
    if (!selectedParcel?.score_history) return [];
    return Object.entries(selectedParcel.score_history)
      .filter(([yr]) => !isNaN(Number(yr)))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([yr, sc]) => ({ year: yr, score: sc }));
  }, [selectedParcel]);

  const currentArea = selectedParcel?.history?.[String(selectedYear)] ?? selectedParcel?.history?.['2026'] ?? 0;
  const baselineArea = selectedParcel?.history?.['2024'] ?? 0;
  const latestArea = selectedParcel?.history?.['2026'] ?? 0;
  const netGrowth = latestArea - baselineArea;
  const growthPct = baselineArea > 0 ? ((netGrowth / baselineArea) * 100).toFixed(0) : '—';

  const hasYear = (yr) => selectedParcel?.history?.[String(yr)] !== undefined;
  const canShowRecheck = selectedParcel && !hasYear(2027) && selectedParcel.status === 'Notice Issued';

  const handleRecheck = async () => {
    if (!selectedParcel) return;
    setIsRechecking(true);
    const updated = await onTriggerRecheck(selectedParcel.id, 1150.0);
    if (updated) {
      setSelectedParcel(updated);
      setSelectedYear(2027);
    }
    setIsRechecking(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="max-w-[1400px] mx-auto px-5 py-5 space-y-5">

        {/* Page header + search */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Satellite Change Analysis</h2>
            <p className="text-[12px] text-stone-500 mt-0.5">
              Multi-temporal Earth Observation — Built-up Change & Trajectory Analysis
            </p>
          </div>

          {/* Parcel search */}
          <div className="relative w-72">
            <div className={`flex items-center bg-white border rounded-lg shadow-sm transition-all ${showSearch ? 'border-blue-400 shadow-blue-100' : 'border-stone-300'}`}>
              <Search size={14} className="ml-3 text-stone-400 shrink-0" />
              <input
                type="text"
                id="satellite-parcel-search"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 180)}
                placeholder="Search parcel for analysis…"
                className="w-full px-2.5 py-2 text-[12px] text-stone-800 placeholder-stone-400 bg-transparent outline-none"
              />
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => handleSelectParcel(p)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 border-b border-stone-100 last:border-0 text-left"
                  >
                    <MapPin size={12} className="text-stone-400 shrink-0" />
                    <div>
                      <div className="font-mono font-semibold text-[12px] text-stone-900">{p.parcel_id}</div>
                      <div className="text-[10px] text-stone-400">{p.ward} · {p.district}</div>
                    </div>
                    <span className="ml-auto font-mono text-[11px] font-bold text-stone-600">{p.urgency_score}/100</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected parcel headline */}
        {selectedParcel ? (
          <>
            <div className="flex items-center gap-3 pb-1 border-b border-stone-200">
              <span className="font-mono font-bold text-stone-900">{selectedParcel.parcel_id}</span>
              <span className="text-stone-400">—</span>
              <span className="text-stone-600 text-[13px]">{selectedParcel.ward}, {selectedParcel.district}</span>
              <span className="text-stone-400">·</span>
              <span className="text-[12px] text-stone-500">{selectedParcel.land_category}</span>
              {selectedParcel.is_hero && (
                <span className="text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded uppercase ml-1">
                  Hero Demo
                </span>
              )}
            </div>

            {/* Re-check warning */}
            {(selectedParcel.status === 'Re-check Required' || selectedParcel.post_notice_growth) && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-800 text-[13px]">Continued Growth Detected After Intervention</div>
                  <div className="text-[12px] text-rose-600 mt-0.5">
                    Built-up area expanded from {latestArea} m² (2026) to {selectedParcel.history?.['2027'] ?? '—'} m² (2027) despite notice issued on {selectedParcel.notice_date}. Status escalated to <strong>Re-check Required</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* Main 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* LEFT — imagery + timeline */}
              <div className="lg:col-span-2 space-y-4">

                {/* Time slider */}
                <div className="fs-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Observation Timeline</div>
                    <div className="font-mono text-[12px] font-bold text-stone-800">
                      Epoch: <span className="text-blue-700">{selectedYear}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const idx = YEARS.indexOf(selectedYear);
                        if (idx > 0) setSelectedYear(YEARS[idx - 1]);
                      }}
                      disabled={YEARS.indexOf(selectedYear) === 0}
                      className="p-1.5 rounded border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      {YEARS.map(yr => {
                        const active = yr === selectedYear;
                        const hasData = hasYear(yr);
                        const isSim = yr === 2027;
                        return (
                          <button
                            key={yr}
                            onClick={() => hasData && setSelectedYear(yr)}
                            disabled={!hasData}
                            className={`py-2 px-3 rounded-md border text-center transition-colors ${
                              active ? (isSim
                                ? 'bg-rose-700 text-white border-rose-800'
                                : 'bg-blue-700 text-white border-blue-800')
                              : hasData ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                              : 'bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-mono font-bold text-[14px]">{yr}</div>
                            <div className={`text-[9px] mt-0.5 ${active ? 'opacity-80' : 'text-stone-400'}`}>
                              {yr === 2024 ? 'Baseline'
                                : yr === 2025 ? 'Scan 1'
                                : yr === 2026 ? 'Current'
                                : 'Re-check'}
                            </div>
                            {isSim && (
                              <div className={`text-[8px] mt-0.5 font-semibold ${active ? 'text-rose-200' : 'text-rose-500'}`}>
                                {hasData ? 'SIM' : 'NOT YET'}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        const idx = YEARS.indexOf(selectedYear);
                        const next = YEARS[idx + 1];
                        if (next && hasYear(next)) setSelectedYear(next);
                      }}
                      disabled={YEARS.indexOf(selectedYear) >= YEARS.length - 1 || !hasYear(YEARS[YEARS.indexOf(selectedYear) + 1])}
                      className="p-1.5 rounded border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Before / After imagery */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Before — 2024 Baseline</div>
                    <SatelliteImageryPanel parcel={selectedParcel} year={2024} isCurrentYear={false} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Current — {selectedYear} Observation
                      <label className="flex items-center gap-1 font-normal normal-case cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showChangeMask}
                          onChange={e => setShowChangeMask(e.target.checked)}
                          className="rounded border-stone-300 accent-blue-600 w-3 h-3"
                        />
                        <span className="text-stone-400 text-[10px]">Change overlay</span>
                      </label>
                    </div>
                    <SatelliteImageryPanel parcel={selectedParcel} year={selectedYear} isCurrentYear={true} />
                  </div>
                </div>

                {/* Change metrics strip */}
                <div className="fs-card p-4">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Temporal Growth Metrics</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] text-stone-400">2024 Baseline</div>
                      <div className="font-mono font-bold text-stone-900">{baselineArea} m²</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">2026 Changed Area</div>
                      <div className="font-mono font-bold text-stone-900">{latestArea} m²</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Net Growth</div>
                      <div className={`font-mono font-bold ${netGrowth > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {netGrowth > 0 ? '+' : ''}{netGrowth} m²
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400">Growth %</div>
                      <div className={`font-mono font-bold ${netGrowth > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {growthPct !== '—' ? `${growthPct}%` : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth chart */}
                <div className="fs-card p-4">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Built-up Area vs Year</div>
                  <div className="text-[10px] text-stone-400 mb-3">Derived from multi-temporal spectral indices (prototype synthetic data)</div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e2" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} unit=" m²" width={55} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="area" stroke="#2563eb" strokeWidth={2} fill="url(#areaGradient)" dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} name="Built-up Area" unit=" m²" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* RIGHT — score + history */}
              <div className="space-y-4">

                {/* Risk score evolution chart */}
                <div className="fs-card p-4">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Priority Score Over Time</div>
                  <div className="text-[10px] text-stone-400 mb-3">Risk escalation trajectory</div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e2" />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#78716c' }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#dc2626" strokeWidth={2} dot={{ r: 4, fill: '#dc2626', stroke: '#fff', strokeWidth: 2 }} name="Priority Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score breakdown */}
                <ScoreBreakdownPanel
                  score={selectedParcel.urgency_score}
                  riskLevel={selectedParcel.risk_level}
                  breakdown={selectedParcel.score_breakdown}
                />

                {/* Case timeline */}
                <div className="fs-card p-4">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Clock size={11} />
                    Case History
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {selectedParcel.audit_trail && [...selectedParcel.audit_trail].reverse().map((log, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                        <div>
                          <div className="font-mono text-[10px] text-stone-400">{log.timestamp}</div>
                          <div className="text-[11px] text-stone-700 leading-snug mt-0.5">{log.event}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">{log.actor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulate re-check */}
                {canShowRecheck && (
                  <div className="fs-card p-4 border-rose-200">
                    <div className="text-[11px] font-semibold text-stone-600 mb-2">
                      2027 Post-Notice Simulation
                    </div>
                    <p className="text-[11px] text-stone-500 mb-3 leading-relaxed">
                      Simulate the next satellite observation after notice was issued. If growth continues, status escalates to <strong>Re-check Required</strong>.
                    </p>
                    <button
                      onClick={handleRecheck}
                      disabled={isRechecking}
                      className="w-full flex items-center justify-center gap-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-[12px] font-semibold py-2 rounded-md transition-colors"
                    >
                      <RotateCcw size={13} />
                      {isRechecking ? 'Simulating 2027 Scan…' : 'Simulate 2027 Re-check (1,150 m²)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Search size={24} className="text-stone-400" />
            </div>
            <h3 className="font-semibold text-stone-700 mb-2">No parcel selected</h3>
            <p className="text-[13px] text-stone-400 max-w-xs">
              Search for a parcel above, or click any parcel on the Overview map and then select "View Satellite Analysis".
            </p>
            <button
              onClick={() => handleSelectParcel(parcels.find(p => p.parcel_id === 'PL-4587') || parcels[0])}
              className="mt-4 text-[12px] text-blue-600 hover:underline font-medium"
            >
              Load hero parcel PL-4587 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
