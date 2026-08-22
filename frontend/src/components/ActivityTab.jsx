import React, { useMemo } from 'react';
import { Clock, RotateCcw, FileCheck, AlertTriangle, CheckCircle2, Eye, Search, Calendar } from 'lucide-react';

// ----------------------------------------------------------------
// Aggregate audit trails from all parcels into a flat timeline
// ----------------------------------------------------------------
function buildActivityFeed(parcels) {
  const events = [];
  parcels.forEach(parcel => {
    if (!parcel.audit_trail) return;
    parcel.audit_trail.forEach(log => {
      events.push({
        parcel_id: parcel.parcel_id,
        parcel: parcel,
        timestamp: log.timestamp,
        event: log.event,
        actor: log.actor,
        status: parcel.status,
        urgency_score: parcel.urgency_score,
      });
    });
  });

  // Sort by timestamp descending (newer first)
  events.sort((a, b) => {
    const ta = new Date(a.timestamp.replace(/\//g, '-'));
    const tb = new Date(b.timestamp.replace(/\//g, '-'));
    return tb - ta;
  });

  return events.slice(0, 200); // Show max 200 events
}

// ----------------------------------------------------------------
// Categorize event type from text
// ----------------------------------------------------------------
function classifyEvent(event, status) {
  const ev = event.toLowerCase();
  if (ev.includes('re-check') || ev.includes('recheck') || ev.includes('re-escalat')) {
    return { icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', label: 'Re-check' };
  }
  if (ev.includes('notice')) {
    return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Notice' };
  }
  if (ev.includes('resolved') || ev.includes('cleared')) {
    return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Resolved' };
  }
  if (ev.includes('inspection') || ev.includes('field')) {
    return { icon: Search, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Inspection' };
  }
  if (ev.includes('alert') || ev.includes('priority') || ev.includes('change detected') || ev.includes('expansion')) {
    return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Alert' };
  }
  return { icon: Clock, color: 'text-stone-500', bg: 'bg-stone-50 border-stone-200', label: 'Event' };
}

// ----------------------------------------------------------------
// Group events by date
// ----------------------------------------------------------------
function groupByDate(events) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = new Map();

  events.forEach(ev => {
    const evDate = new Date(ev.timestamp.replace(/\//g, '-'));
    let groupKey;
    if (
      evDate.getFullYear() === today.getFullYear() &&
      evDate.getMonth() === today.getMonth() &&
      evDate.getDate() === today.getDate()
    ) {
      groupKey = 'Today';
    } else if (
      evDate.getFullYear() === yesterday.getFullYear() &&
      evDate.getMonth() === yesterday.getMonth() &&
      evDate.getDate() === yesterday.getDate()
    ) {
      groupKey = 'Yesterday';
    } else {
      // Format: Jun 2026
      groupKey = evDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(ev);
  });

  return groups;
}

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------
export default function ActivityTab({ parcels, onSelectParcel, onNavigateToOverview }) {
  const activityFeed = useMemo(() => buildActivityFeed(parcels), [parcels]);
  const grouped = useMemo(() => groupByDate(activityFeed), [activityFeed]);

  const handleOpenParcel = (parcel) => {
    onSelectParcel(parcel);
    onNavigateToOverview();
  };

  // Summary stats
  const todayEvents = grouped.get('Today')?.length ?? 0;
  const recheckEvents = activityFeed.filter(e => classifyEvent(e.event, e.status).label === 'Re-check').length;
  const noticeEvents = activityFeed.filter(e => classifyEvent(e.event, e.status).label === 'Notice').length;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="max-w-[900px] mx-auto px-5 py-5 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Activity & Verification</h2>
            <p className="text-[12px] text-stone-500 mt-0.5">
              Operational history — inspections, notices, re-checks, and resolutions
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-stone-100 border border-stone-200 text-stone-600 px-2.5 py-1 rounded-full font-medium">
              {activityFeed.length} events
            </span>
            {recheckEvents > 0 && (
              <span className="bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full font-semibold">
                {recheckEvents} re-checks
              </span>
            )}
            {noticeEvents > 0 && (
              <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                {noticeEvents} notices
              </span>
            )}
          </div>
        </div>

        {/* Workflow cycle explanation */}
        <div className="fs-card p-4">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Monitoring Cycle</div>
          <div className="flex items-center gap-0">
            {['Monitor', 'Detect', 'Prioritize', 'Verify', 'Act', 'Re-check'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`text-[10px] font-semibold px-2 py-1 rounded ${
                    step === 'Re-check' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    step === 'Act' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    step === 'Verify' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>{step}</div>
                </div>
                {i < arr.length - 1 && <div className="text-stone-300 text-xs mx-0.5">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        {Array.from(grouped.entries()).map(([dateLabel, events]) => (
          <div key={dateLabel}>
            {/* Date group header */}
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={13} className="text-stone-400" />
              <span className="text-[12px] font-semibold text-stone-600">{dateLabel}</span>
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[11px] text-stone-400">{events.length} events</span>
            </div>

            {/* Events */}
            <div className="space-y-2">
              {events.map((ev, i) => {
                const evType = classifyEvent(ev.event, ev.status);
                const Icon = evType.icon;
                const score = ev.urgency_score;
                const scoreColor = score >= 80 ? 'text-red-700' : score >= 60 ? 'text-amber-700' : 'text-stone-500';

                return (
                  <div
                    key={i}
                    onClick={() => handleOpenParcel(ev.parcel)}
                    className="fs-card p-3 cursor-pointer hover:bg-stone-50 transition-colors flex items-start gap-3"
                  >
                    {/* Event icon */}
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${evType.bg}`}>
                      <Icon size={12} className={evType.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[12px] text-stone-900">{ev.parcel_id}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${evType.bg} ${evType.color}`}>
                          {evType.label}
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${scoreColor}`}>{score}/100</span>
                      </div>
                      <div className="text-[11px] text-stone-700 mt-1 leading-snug line-clamp-2">{ev.event}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-400 font-mono">{ev.timestamp}</span>
                        <span className="text-stone-200">·</span>
                        <span className="text-[10px] text-stone-400">{ev.actor}</span>
                      </div>
                    </div>

                    {/* Navigate button */}
                    <button
                      onClick={e => { e.stopPropagation(); handleOpenParcel(ev.parcel); }}
                      className="shrink-0 p-1.5 rounded-md border border-stone-200 text-stone-400 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {activityFeed.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-[13px]">
            No activity events recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
