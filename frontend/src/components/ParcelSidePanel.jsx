import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Layers, Calendar, RotateCcw, FileCheck, ChevronRight,
  AlertTriangle, Clock, Info, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import ActionFormModal from './ActionFormModal';
import { fetchParcelEvidence } from '../services/api';

const HERO_YEAR_DATA = {
  2024: { area: 120,  score: 32, traj: 'STABLE',        status: 'Monitoring',         risk: 'Low' },
  2025: { area: 480,  score: 58, traj: 'GROWING',       status: 'Alert Flagged',      risk: 'Medium' },
  2026: { area: 920,  score: 85, traj: 'GROWING FAST',  status: 'Notice Issued',      risk: 'High' },
  2027: { area: 1150, score: 95, traj: 'GROWING FAST',  status: 'Re-check Required',  risk: 'Critical' },
};

function getScoreClass(score) {
  if (score >= 80) return 'text-red-700';
  if (score >= 60) return 'text-amber-700';
  if (score >= 35) return 'text-yellow-700';
  return 'text-green-700';
}

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
  const [showEvidence, setShowEvidence] = useState(false);
  const [evidenceData, setEvidenceData] = useState(null);

  useEffect(() => {
    setEvidenceData(null);
    setShowEvidence(false);
  }, [parcel.parcel_id]);

  if (!parcel) return null;

  const toggleEvidence = async () => {
    if (!showEvidence && !evidenceData) {
      try {
        const data = await fetchParcelEvidence(parcel.parcel_id);
        setEvidenceData(data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowEvidence(!showEvidence);
  };

  const heroYr = parcel.is_hero ? (HERO_YEAR_DATA[selectedYear] || HERO_YEAR_DATA[2026]) : null;
  const displayScore = heroYr ? heroYr.score : (parcel.score_history?.[String(selectedYear)] ?? parcel.urgency_score);
  const displayTraj = heroYr ? heroYr.traj : parcel.trajectory;
  const displayStatus = heroYr ? heroYr.status : parcel.status;
  const displayRisk = heroYr ? heroYr.risk : parcel.risk_level;

  const currentArea = heroYr ? heroYr.area : (parcel.history?.[String(selectedYear)] ?? parcel.history?.['2026'] ?? 0);
  const baselineArea = parcel.is_hero ? HERO_YEAR_DATA[2024].area : (parcel.history?.['2024'] ?? 0);
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
      <div className="side-panel-enter h-full flex flex-col bg-white border-l border-stone-300 w-[380px] shrink-0 overflow-hidden">

        {/* Panel Header */}
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[15px] text-stone-900">{parcel.parcel_id}</span>
              {parcel.is_hero && (
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider border border-stone-300 px-1 py-0.5 bg-white">
                  HERO CASE
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-stone-500 uppercase">
              <span>{parcel.ward}</span>
              <span className="text-stone-300">/</span>
              <span>{parcel.district}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Alerts Section (Flat) */}
          {(isRecheck || parcel.is_false_positive || parcel.verification_outcome) && (
            <div className="border-b border-stone-200 bg-stone-50 px-5 py-3 space-y-3">
              {isRecheck && (
                <div className="border-l-[3px] border-rose-600 pl-3">
                  <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">RE-CHECK REQUIRED</div>
                  <div className="text-[11px] text-stone-700 mt-0.5">
                    Growth detected after intervention on {parcel.notice_date}. Score re-escalated.
                  </div>
                </div>
              )}
              {parcel.is_false_positive && (
                <div className="border-l-[3px] border-amber-500 pl-3">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">POTENTIAL FALSE POSITIVE</div>
                  <div className="text-[11px] text-stone-700 mt-0.5">
                    Notes: {parcel.false_positive_reason || 'Change may be seasonal or sensor artifact.'}
                  </div>
                </div>
              )}
              {parcel.verification_outcome && (
                <div className="border-l-[3px] border-blue-600 pl-3">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">FIELD VERIFICATION</div>
                  <div className="text-[11px] text-stone-700 mt-0.5">
                    Outcome: {parcel.verification_outcome}
                    {parcel.verification?.officer && (
                      <span className="text-stone-500 ml-1">
                        (by {parcel.verification.officer} on {parcel.verification.verified_at})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-5 py-4 space-y-6">

            {/* PRIORITY ASSESSMENT */}
            <section>
              <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Priority Assessment ({selectedYear})</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className={`font-mono text-3xl font-black leading-none ${getScoreClass(displayScore)}`}>
                    {displayScore}<span className="text-sm font-normal text-stone-400">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-stone-900 uppercase">{displayRisk} Risk</div>
                  <div className={`text-[11px] font-bold uppercase mt-0.5 ${
                    displayStatus === 'Re-check Required' ? 'text-rose-700' :
                    displayStatus === 'Notice Issued' ? 'text-amber-700' :
                    displayStatus === 'Alert Flagged' ? 'text-yellow-700' : 'text-stone-600'
                  }`}>{displayStatus}</div>
                </div>
              </div>
            </section>

            <div className="h-px bg-stone-200"></div>

            {/* DETECTION */}
            <section>
              <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Detection</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-stone-500 mb-0.5 uppercase tracking-wider">Confidence</div>
                  <div className="font-mono text-xl font-bold text-stone-800 leading-none">
                    {parcel.detection_confidence || '—'}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-stone-500 mb-0.5 uppercase tracking-wider">Trajectory</div>
                  <div className={`font-bold text-[12px] uppercase ${displayTraj === 'GROWING FAST' ? 'text-red-700' : displayTraj === 'GROWING' ? 'text-amber-700' : 'text-stone-600'}`}>
                    {displayTraj}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-stone-200"></div>

            {/* CHANGE METRICS */}
            <section>
              <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Change Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase mb-1">Baseline</div>
                  <div className="font-mono font-bold text-stone-900">{baselineArea} m²</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 uppercase mb-1">{selectedYear} Area</div>
                  <div className="font-mono font-bold text-stone-900">{currentArea} m²</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 uppercase mb-1">Net Growth</div>
                  <div className={`font-mono font-bold ${netGrowth > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {netGrowth > 0 ? '+' : ''}{netGrowth} m² <span className="text-[9px] text-stone-500 font-sans ml-1">({growthPct}%)</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-stone-200"></div>

            {/* PARCEL INFORMATION */}
            <section>
              <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Parcel Information</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px]">
                <div>
                  <div className="text-stone-400 uppercase text-[9px] mb-0.5">Category</div>
                  <div className="font-medium text-stone-800">{parcel.land_category}</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[9px] mb-0.5">Ownership</div>
                  <div className="font-medium text-stone-800">{parcel.ownership}</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[9px] mb-0.5">Total Area</div>
                  <div className="font-mono font-medium text-stone-800">{parcel.area_sqm?.toLocaleString()} m²</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[9px] mb-0.5">Coordinates</div>
                  <div className="font-mono text-stone-700">{parcel.latitude?.toFixed(4)}°N, {parcel.longitude?.toFixed(4)}°E</div>
                </div>
              </div>
            </section>

            <div className="h-px bg-stone-200"></div>

            {/* GEOSPATIAL EVIDENCE STACK */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Geospatial Evidence Stack</h3>
                <button onClick={toggleEvidence} className="text-[9px] font-bold text-blue-700 uppercase tracking-wider hover:underline">
                  {showEvidence ? 'HIDE' : 'VIEW'}
                </button>
              </div>
              
              {showEvidence && (
                <div className="space-y-3">
                  {evidenceData ? (
                    <>
                      {evidenceData.why_flagged && (
                        <div className="mb-3 text-[11px]">
                          <div className="font-bold text-stone-900 mb-1">{evidenceData.why_flagged.title}</div>
                          <ul className="list-disc pl-4 space-y-1 text-stone-600 mb-2">
                            {evidenceData.why_flagged.reasons.map((reason, rIdx) => (
                              <li key={rIdx}>{reason}</li>
                            ))}
                          </ul>
                          <div className="text-[10px]">
                            <span className="font-bold text-stone-500 uppercase tracking-wider">Recommendation: </span>
                            <span className="font-bold text-stone-900 uppercase">{evidenceData.why_flagged.recommended_action}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 border-t border-stone-200 pt-3">
                        {evidenceData.evidence.map((item) => (
                          <div key={item.id} className="text-[11px]">
                            <div className="font-bold text-stone-800 mb-0.5 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 inline-block ${
                                item.confidence_impact === 'critical' ? 'bg-red-600' :
                                item.confidence_impact === 'high' ? 'bg-orange-500' :
                                item.confidence_impact === 'medium' ? 'bg-amber-500' :
                                item.confidence_impact === 'negative' ? 'bg-purple-500' : 'bg-stone-400'
                              }`} />
                              {item.title}
                            </div>
                            <div className="text-stone-600 ml-3 leading-relaxed">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-stone-400 italic">Loading evidence...</div>
                  )}
                </div>
              )}
            </section>

            {/* SCORE BREAKDOWN (Compact list) */}
            {parcel.score_breakdown && parcel.score_breakdown.length > 0 && (
              <>
                <div className="h-px bg-stone-200"></div>
                <section>
                  <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Score Breakdown</h3>
                  <div className="space-y-2 text-[11px]">
                    {parcel.score_breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between border-b border-stone-100 pb-1">
                        <span className="text-stone-700">{item.factor}</span>
                        <span className="font-mono font-bold text-stone-900">+{item.points}<span className="text-stone-400 font-normal">/{item.max_points}</span></span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* AUDIT TRAIL */}
            {parcel.audit_trail && parcel.audit_trail.length > 0 && (
              <>
                <div className="h-px bg-stone-200"></div>
                <section>
                  <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">Case History</h3>
                  <div className="space-y-3">
                    {[...parcel.audit_trail].reverse().map((log, i) => (
                      <div key={i} className="text-[10px]">
                        <div className="font-mono text-stone-500 mb-0.5">{log.timestamp}</div>
                        <div className="text-[11px] font-medium text-stone-800">{log.event}</div>
                        <div className="text-stone-500 mt-0.5">{log.actor}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <div className="h-px bg-stone-200"></div>
            
            <div className="text-[10px] text-stone-500 uppercase tracking-wider text-center">
              Human-in-the-Loop Required
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-stone-200 px-5 py-4 bg-stone-50 space-y-2 shrink-0">
          <button
            onClick={onOpenSatellite}
            className="w-full flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold tracking-wide uppercase py-2 transition-colors"
          >
            Satellite Analysis
            <ChevronRight size={14} />
          </button>
          <div className="flex items-center gap-2">
            {canShowRecheck && (
              <button
                onClick={handleRecheckClick}
                disabled={isRechecking}
                className="flex-1 flex items-center justify-center gap-1.5 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 text-[10px] font-bold tracking-wide uppercase py-2 transition-colors"
              >
                <RotateCcw size={12} />
                {isRechecking ? 'Simulating…' : 'Simulate 2027' }
              </button>
            )}
            <button
              onClick={() => setShowActionForm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 text-[10px] font-bold tracking-wide uppercase py-2 transition-colors"
            >
              <FileCheck size={12} />
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
