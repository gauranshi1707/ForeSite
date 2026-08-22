import React, { useState } from 'react';
import {
  X, MapPin, Layers, Calendar, RotateCcw, FileCheck, ChevronRight,
  AlertTriangle, Clock, Info, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import ActionFormModal from './ActionFormModal';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function getStatusClass(status) {
  switch (status) {
    case 'Re-check Required':   return 'status-recheck';
    case 'Notice Issued':       return 'status-notice';
    case 'Under Review':        return 'status-review';
    case 'Inspection Scheduled': return 'status-inspection';
    case 'New Alert':           return 'status-new-alert';
    case 'Resolved':            return 'status-resolved';
    default:                    return 'status-stable';
  }
}

function getScoreClass(score) {
  if (score >= 80) return 'score-critical';
  if (score >= 60) return 'score-high';
  if (score >= 35) return 'score-medium';
  return 'score-low';
}

function getTrajColor(traj) {
  if (traj === 'GROWING FAST') return 'text-red-700';
  if (traj === 'GROWING') return 'text-amber-700';
  return 'text-green-700';
}

function getTrajBg(traj) {
  if (traj === 'GROWING FAST') return 'bg-red-50 border-red-200 text-red-700';
  if (traj === 'GROWING') return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-green-50 border-green-200 text-green-700';
}

function TrajIcon({ traj }) {
  if (traj === 'GROWING FAST') return <TrendingUp size={12} className="text-red-600" />;
  if (traj === 'GROWING') return <TrendingUp size={12} className="text-amber-600" />;
  return <Minus size={12} className="text-green-600" />;
}

function ScoreBar({ score, max = 100 }) {
  const pct = (score / max) * 100;
  const barColor = score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-amber-500' : score >= 35 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
export default function ParcelSidePanel({
  parcel,
  selectedYear,
  onClose,
  onRecordAction,
  onTriggerRecheck,
  onOpenSatellite,
}) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  if (!parcel) return null;

  const currentArea = parcel.history?.[String(selectedYear)] ?? parcel.history?.['2026'] ?? 0;
  const baselineArea = parcel.history?.['2024'] ?? 0;
  const netGrowth = currentArea - baselineArea;
  const growthPct = baselineArea > 0 ? ((netGrowth / baselineArea) * 100).toFixed(0) : '—';

  const handleRecheckClick = async () => {
    setIsRechecking(true);
    await onTriggerRecheck(parcel.id, 1150.0);
    setIsRechecking(false);
  };

  const isRecheck = parcel.status === 'Re-check Required' || parcel.post_notice_growth;
  const canShowRecheck = !parcel.history?.['2027'] && parcel.status === 'Notice Issued';

  return (
    <>
      <div className="side-panel-enter h-full flex flex-col bg-white border-l border-stone-200 w-[380px] shrink-0 overflow-hidden">

        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-stone-900">{parcel.parcel_id}</span>
              {parcel.is_hero && (
                <span className="text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded uppercase">
                  Hero Case
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-stone-500">
              <MapPin size={10} />
              <span>{parcel.ward} · {parcel.district}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Re-check warning banner */}
        {isRecheck && (
          <div className="mx-4 mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 flex items-start gap-2">
            <AlertTriangle size={14} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-[12px] font-semibold text-rose-800">Re-check Required</div>
              <div className="text-[11px] text-rose-600 mt-0.5">
                Growth detected after intervention on {parcel.notice_date}. Score re-escalated.
              </div>
            </div>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

          {/* Score + Trajectory row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="fs-card p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Priority Score</div>
              <div className={`score-chip text-lg font-black font-mono ${getScoreClass(parcel.urgency_score)}`}>
                {parcel.urgency_score}<span className="text-[11px] font-normal opacity-60">/100</span>
              </div>
              <ScoreBar score={parcel.urgency_score} />
              <div className="text-[10px] text-stone-400 mt-1">{parcel.risk_level} Risk</div>
            </div>
            <div className="fs-card p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Trajectory</div>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[12px] font-semibold mt-0.5 ${getTrajBg(parcel.trajectory)}`}>
                <TrajIcon traj={parcel.trajectory} />
                {parcel.trajectory === 'GROWING FAST' ? 'Growing Fast' :
                 parcel.trajectory === 'GROWING' ? 'Growing' : 'Stable'}
              </div>
              <div className="mt-2">
                <span className={`status-badge ${getStatusClass(parcel.status)}`}>
                  {parcel.status}
                </span>
              </div>
            </div>
          </div>

          {/* Land info */}
          <div className="fs-card p-3 space-y-2">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Parcel Information</div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
              <div>
                <div className="text-stone-400">Category</div>
                <div className="font-medium text-stone-800 leading-snug">{parcel.land_category}</div>
              </div>
              <div>
                <div className="text-stone-400">Ownership</div>
                <div className="font-medium text-stone-800 leading-snug">{parcel.ownership}</div>
              </div>
              <div>
                <div className="text-stone-400">Total Area</div>
                <div className="font-mono font-semibold text-stone-800">{parcel.area_sqm?.toLocaleString()} m²</div>
              </div>
              <div>
                <div className="text-stone-400">Coordinates</div>
                <div className="font-mono text-stone-700">{parcel.latitude?.toFixed(4)}°N, {parcel.longitude?.toFixed(4)}°E</div>
              </div>
              <div>
                <div className="text-stone-400">State</div>
                <div className="font-medium text-stone-800">{parcel.state}</div>
              </div>
              <div>
                <div className="text-stone-400">Last Checked</div>
                <div className="font-medium text-stone-800">{parcel.last_checked}</div>
              </div>
            </div>
          </div>

          {/* Change metrics */}
          <div className="fs-card p-3">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Change Metrics ({selectedYear})
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-stone-50 rounded-md p-2">
                <div className="font-mono font-bold text-stone-800 text-[13px]">{baselineArea} m²</div>
                <div className="text-[10px] text-stone-400 mt-0.5">2024 Baseline</div>
              </div>
              <div className="bg-stone-50 rounded-md p-2">
                <div className="font-mono font-bold text-stone-800 text-[13px]">{currentArea} m²</div>
                <div className="text-[10px] text-stone-400 mt-0.5">{selectedYear} Built-up</div>
              </div>
              <div className={`rounded-md p-2 ${netGrowth > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className={`font-mono font-bold text-[13px] ${netGrowth > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {netGrowth > 0 ? '+' : ''}{netGrowth} m²
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  {growthPct !== '—' ? `${growthPct}% growth` : 'Growth'}
                </div>
              </div>
            </div>
          </div>

          {/* Score breakdown — compact */}
          {parcel.score_breakdown && parcel.score_breakdown.length > 0 && (
            <div className="fs-card p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Info size={10} />
                Score Breakdown
              </div>
              <div className="space-y-2">
                {parcel.score_breakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-700 font-medium">{item.factor}</span>
                      <span className="font-mono font-bold text-stone-900">+{item.points}<span className="text-stone-400 font-normal">/{item.max_points}</span></span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(item.points / item.max_points) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-start gap-1.5 text-[10px] text-stone-400">
                <Info size={10} className="shrink-0 mt-0.5" />
                AI prioritizes; officials make all legal determinations.
              </div>
            </div>
          )}

          {/* Audit trail */}
          {parcel.audit_trail && parcel.audit_trail.length > 0 && (
            <div className="fs-card p-3">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock size={10} />
                Case History
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {[...parcel.audit_trail].reverse().map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[10px] text-stone-400">{log.timestamp}</div>
                      <div className="text-[11px] text-stone-700 mt-0.5 leading-snug">{log.event}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{log.actor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HITL notice */}
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">
            <strong>Human-in-the-Loop:</strong> Potential land-use change detected. Official field inspection and legal verification required before any enforcement action.
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-stone-200 px-4 py-3 bg-stone-50 space-y-2">
          <button
            onClick={onOpenSatellite}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-semibold py-2 rounded-md transition-colors"
          >
            View Satellite Analysis
            <ChevronRight size={13} />
          </button>
          <div className="flex items-center gap-2">
            {canShowRecheck && (
              <button
                onClick={handleRecheckClick}
                disabled={isRechecking}
                className="flex-1 flex items-center justify-center gap-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-[11px] font-medium py-1.5 rounded-md transition-colors"
              >
                <RotateCcw size={11} />
                {isRechecking ? 'Simulating 2027…' : 'Simulate 2027 Re-check'}
              </button>
            )}
            <button
              onClick={() => setShowActionForm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-stone-300 text-stone-700 hover:bg-stone-100 text-[11px] font-medium py-1.5 rounded-md transition-colors"
            >
              <FileCheck size={11} />
              Record Action
            </button>
          </div>
        </div>
      </div>

      {showActionForm && (
        <ActionFormModal
          parcel={parcel}
          onClose={() => setShowActionForm(false)}
          onSubmitAction={onRecordAction}
        />
      )}
    </>
  );
}
