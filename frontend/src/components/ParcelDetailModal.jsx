import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { X, ShieldAlert, AlertTriangle, RotateCcw, FileCheck, Layers, MapPin, Calendar, Clock, ArrowRight, Eye, AlertOctagon } from 'lucide-react';
import ScoreExplainability from './ScoreExplainability';
import ActionFormModal from './ActionFormModal';

export default function ParcelDetailModal({
  parcel,
  selectedYear,
  onClose,
  onRecordAction,
  onTriggerRecheck
}) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [showOverlayMask, setShowOverlayMask] = useState(true);
  const [isRechecking, setIsRechecking] = useState(false);

  if (!parcel) return null;

  // Format historical chart data
  const chartData = Object.entries(parcel.history).map(([yr, val]) => ({
    year: `Year ${yr}`,
    builtup: val,
  }));

  const currentArea = parcel.history[selectedYear] || parcel.history['2026'] || 0;
  const baselineArea = parcel.history['2024'] || 0;
  const netGrowth = currentArea - baselineArea;

  const handleRecheckClick = async () => {
    setIsRechecking(true);
    await onTriggerRecheck(parcel.id, 1150.0);
    setIsRechecking(false);
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Title Bar */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-3 py-1 rounded-lg font-mono font-bold text-base">
              {parcel.parcel_id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white leading-tight">
                  Parcel Inspection & Legal Evidence Dashboard
                </h2>
                {parcel.is_hero && (
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                    SIH Hero Demo Case
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {parcel.district}, {parcel.state} | {parcel.land_category} | ({parcel.latitude.toFixed(4)} N, {parcel.longitude.toFixed(4)} E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Post-Notice Non-Compliance Warning Banner */}
          {(parcel.post_notice_growth || parcel.status === 'Re-check Required') && (
            <div className="bg-purple-950/80 border-2 border-purple-500/80 p-4 rounded-xl flex items-start gap-3 shadow-lg shadow-purple-900/30 pulse-red">
              <AlertOctagon className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
                  <span>POST-NOTICE VIOLATION DETECTED</span>
                  <span className="bg-purple-900 text-purple-200 border border-purple-700 text-[10px] px-2 py-0.5 rounded font-mono">
                    RE-CHECK REQUIRED
                  </span>
                </h3>
                <p className="text-xs text-purple-300 mt-1 font-mono">
                  Continued land-use expansion detected after official intervention/notice date ({parcel.notice_date || '2026-06-15'}). Urgency score re-escalated to <strong className="text-white">{parcel.urgency_score}/100</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-slate-400 font-mono">2024 Baseline Area</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{baselineArea} m²</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-slate-400 font-mono">{selectedYear} Built-up Area</span>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{currentArea} m²</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-slate-400 font-mono">Trajectory Classification</span>
              <div className={`text-sm font-bold font-mono mt-1 ${
                parcel.trajectory === 'GROWING FAST' ? 'text-rose-400' :
                parcel.trajectory === 'GROWING' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {parcel.trajectory}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
              <span className="text-[11px] text-slate-400 font-mono">Current Status</span>
              <div className="text-sm font-bold text-amber-300 font-mono mt-1">{parcel.status}</div>
            </div>
          </div>

          {/* Before / After Satellite Imagery Panels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Multi-Temporal Imagery Comparison (Before vs Current)
              </h3>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOverlayMask}
                  onChange={(e) => setShowOverlayMask(e.target.checked)}
                  className="accent-cyan-400 rounded"
                />
                Show Encroachment Change Heatmap Mask
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Panel 1: 2024 Baseline */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative group">
                <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono px-2.5 py-1 rounded">
                  BEFORE — 2024 Baseline (120 m²)
                </div>
                {/* Visual Satellite Imagery Canvas Representation */}
                <div className="h-64 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  {/* Baseline green open parcel outline */}
                  <div className="w-48 h-48 border-2 border-emerald-500/60 rounded-lg relative bg-emerald-950/20 flex items-center justify-center">
                    <span className="text-xs font-mono text-emerald-400/80 bg-emerald-950/80 px-2 py-1 rounded">
                      Open Vegetated Land
                    </span>
                    <div className="w-8 h-8 bg-amber-600/40 border border-amber-500 rounded absolute bottom-4 right-4 text-[9px] text-amber-200 flex items-center justify-center">
                      120m²
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Current Selected Year Satellite */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative group">
                <div className="absolute top-3 left-3 z-10 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono px-2.5 py-1 rounded">
                  CURRENT — {selectedYear} Scan ({currentArea} m²)
                </div>

                <div className="h-64 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  {/* Built-up expansion overlay */}
                  <div className="w-48 h-48 border-2 border-cyan-500/60 rounded-lg relative bg-slate-900/40 flex items-center justify-center">
                    {/* Expanded construction footprint */}
                    <div
                      className={`transition-all duration-300 rounded border flex items-center justify-center ${
                        showOverlayMask
                          ? 'bg-rose-600/50 border-rose-400 shadow-lg shadow-rose-600/30'
                          : 'bg-amber-700/60 border-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentArea / 1200) * 100)}%`,
                        height: `${Math.min(100, (currentArea / 1200) * 100)}%`
                      }}
                    >
                      <span className="text-xs font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-rose-400">
                        {currentArea} m² Built-up
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Growth Chart & Score Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Built-up Area Growth Graph */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Built-Up Expansion over Time
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mb-4">
                  Calculated area expansion in m² derived from multi-temporal Sentinel-2 spectral indices
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" m²" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => [`${val} m²`, 'Built-up Area']}
                    />
                    <Line
                      type="monotone"
                      dataKey="builtup"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#f43f5e', stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainable AI Score Breakdown */}
            <ScoreExplainability
              score={parcel.urgency_score}
              riskLevel={parcel.risk_level}
              breakdown={parcel.score_breakdown}
              isHero={parcel.is_hero}
            />

          </div>

          {/* Closed-Loop Workflow Banner */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              ForeSite Encroachment Workflow Lifecycle
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-900 border border-cyan-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">1. DETECT</div>
                <div className="text-slate-300 font-semibold mt-1">Satellite Scan</div>
              </div>
              <div className="bg-slate-900 border border-cyan-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">2. PRIORITIZE</div>
                <div className="text-slate-300 font-semibold mt-1">Urgency Score ({parcel.urgency_score}/100)</div>
              </div>
              <div className="bg-slate-900 border border-amber-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">3. ACT</div>
                <div className="text-slate-300 font-semibold mt-1">{parcel.status}</div>
              </div>
              <div className="bg-slate-900 border border-purple-800 p-2.5 rounded-lg">
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold">4. RE-CHECK</div>
                <div className="text-slate-300 font-semibold mt-1">
                  {parcel.post_notice_growth ? 'Violated (Re-escalated)' : 'Pending Observation'}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Legal & Inspection Audit Log History
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {parcel.audit_trail?.map((log, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg text-xs flex items-start gap-3 border border-slate-800">
                  <div className="text-[10px] font-mono text-cyan-400 shrink-0 mt-0.5">
                    {log.timestamp}
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-200">{log.event}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Logged by: {log.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="bg-slate-850 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <button
            onClick={handleRecheckClick}
            disabled={isRechecking}
            className="bg-purple-900 hover:bg-purple-800 border border-purple-700 text-purple-200 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            <RotateCcw className="w-4 h-4 text-purple-300" />
            {isRechecking ? 'Simulating 2027 Scenario...' : 'Simulate 2027 Post-Notice Scenario (1,150 m²)'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={() => setShowActionForm(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              Record Official Enforcement Action
            </button>
          </div>

        </div>

      </div>

      {/* Official Action Form Modal */}
      {showActionForm && (
        <ActionFormModal
          parcel={parcel}
          onClose={() => setShowActionForm(false)}
          onSubmitAction={onRecordAction}
        />
      )}
    </div>
  );
}
