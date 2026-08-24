import React, { useMemo, useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, Search, FileCheck, Clock } from 'lucide-react';
import { getReports } from '../services/store';

// ----------------------------------------------------------------
// Build flat activity feed from parcel audit trails + community reports
// ----------------------------------------------------------------
function buildActivityFeed(parcels) {
  const events = [];

  parcels.forEach(parcel => {
    if (!parcel.audit_trail) return;
    parcel.audit_trail.forEach(log => {
      events.push({
        id:            `${parcel.parcel_id}-${log.timestamp}`,
        parcel_id:     parcel.parcel_id,
        parcel:        parcel,
        timestamp:     log.timestamp,
        event:         log.event,
        actor:         log.actor,
        status:        parcel.status,
        urgency_score: parcel.urgency_score,
        category:      classifyEvent(log.event).category,
        ward:          parcel.ward,
        district:      parcel.district,
      });
    });
  });

  // Community reports from localStorage
  try {
    const reports = getReports();
    reports.forEach(r => {
      events.push({
        id:            r.id,
        parcel_id:     r.id,
        parcel:        null,
        timestamp:     r.date ? r.date.replace('T', ' ').slice(0, 16) : '',
        event:         `Community report submitted — ${r.type}`,
        actor:         'Community User',
        status:        r.status,
        urgency_score: null,
        category:      'community',
        ward:          r.locationDetails || '',
        district:      '',
      });
    });
  } catch (_) {}

  events.sort((a, b) => {
    const ta = new Date(a.timestamp.replace(/\//g, '-'));
    const tb = new Date(b.timestamp.replace(/\//g, '-'));
    return tb - ta;
  });

  return events.slice(0, 300);
}

// ----------------------------------------------------------------
// Classify event into a category
// ----------------------------------------------------------------
function classifyEvent(event = '') {
  const ev = event.toLowerCase();
  if (ev.includes('re-check') || ev.includes('recheck') || ev.includes('re-escalat')) {
    return { label: 'Re-check',      category: 'official', dotCls: 'bg-red-500',    textCls: 'text-red-700' };
  }
  if (ev.includes('notice')) {
    return { label: 'Notice',        category: 'official', dotCls: 'bg-amber-400',  textCls: 'text-amber-700' };
  }
  if (ev.includes('resolved') || ev.includes('cleared')) {
    return { label: 'Resolved',      category: 'official', dotCls: 'bg-green-500',  textCls: 'text-green-700' };
  }
  if (ev.includes('inspection') || ev.includes('field')) {
    return { label: 'Inspection',    category: 'official', dotCls: 'bg-blue-500',   textCls: 'text-blue-700' };
  }
  if (ev.includes('action recorded') || ev.includes('status changed') || ev.includes('recorded')) {
    return { label: 'Official Action', category: 'official', dotCls: 'bg-blue-600', textCls: 'text-blue-700' };
  }
  if (ev.includes('alert') || ev.includes('priority') || ev.includes('change detected') || ev.includes('expansion')) {
    return { label: 'System Alert',  category: 'system',   dotCls: 'bg-orange-400', textCls: 'text-orange-700' };
  }
  return   { label: 'Event',         category: 'system',   dotCls: 'bg-stone-400',  textCls: 'text-stone-500' };
}

// ----------------------------------------------------------------
// Format timestamp
// ----------------------------------------------------------------
function formatTs(ts) {
  if (!ts) return { date: '—', time: '' };
  const d = new Date(ts.replace(/\//g, '-'));
  if (isNaN(d.getTime())) return { date: ts, time: '' };
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

// ----------------------------------------------------------------
// Filter tabs
// ----------------------------------------------------------------
const FILTERS = [
  { key: 'all',       label: 'All Activity' },
  { key: 'system',    label: 'System' },
  { key: 'official',  label: 'Official Actions' },
  { key: 'community', label: 'Community Reports' },
];

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------
export default function ActivityTab({ parcels, onSelectParcel, onNavigateToOverview }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const activityFeed = useMemo(() => buildActivityFeed(parcels), [parcels]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return activityFeed;
    return activityFeed.filter(e => e.category === activeFilter);
  }, [activityFeed, activeFilter]);

  const handleOpenParcel = (parcel) => {
    if (!parcel) return;
    onSelectParcel(parcel);
    onNavigateToOverview();
  };

  const counts = {
    official:  activityFeed.filter(e => e.category === 'official').length,
    system:    activityFeed.filter(e => e.category === 'system').length,
    community: activityFeed.filter(e => e.category === 'community').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="max-w-[860px] mx-auto px-6 py-5">

        {/* Page header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-[14px] font-bold text-stone-900">Activity</h2>
            <p className="text-[12px] text-stone-500 mt-0.5">System and field activity across monitored parcels</p>
          </div>
          <span className="text-[11px] text-stone-500">
            <span className="font-semibold text-stone-800">{activityFeed.length}</span> events
          </span>
        </div>

        {/* Monitoring cycle — simple inline text */}
        <div className="text-[11px] text-stone-500 mb-4 pb-3 border-b border-stone-200 flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-stone-600 mr-1">Monitoring cycle:</span>
          {['Monitor', 'Detect', 'Prioritize', 'Verify', 'Act', 'Re-check'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className={step === 'Re-check' ? 'text-red-600 font-semibold' : step === 'Act' || step === 'Verify' ? 'text-blue-700 font-medium' : 'text-stone-600'}>
                {step}
              </span>
              {i < arr.length - 1 && <span className="text-stone-300">→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-6 border-b border-stone-200 mb-4">
          {FILTERS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`pb-2.5 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                activeFilter === tab.key
                  ? 'border-blue-700 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && counts[tab.key] > 0 && (
                <span className="ml-1 text-[10px] text-stone-400">({counts[tab.key]})</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-stone-400 pb-2.5">{filtered.length} entries</span>
        </div>

        {/* Activity log */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-stone-400">No activity events recorded yet.</div>
        ) : (
          <div className="bg-white border border-stone-200 rounded divide-y divide-stone-100">
            {filtered.map((ev, i) => {
              const evType = ev.category === 'community'
                ? { label: 'Community', dotCls: 'bg-stone-400', textCls: 'text-stone-600', category: 'community' }
                : classifyEvent(ev.event);
              const { date, time } = formatTs(ev.timestamp);
              const score = ev.urgency_score;
              const scoreColor = score >= 80 ? 'text-red-700' : score >= 60 ? 'text-amber-700' : 'text-stone-500';
              const isCommunity = ev.category === 'community';

              return (
                <div
                  key={ev.id || i}
                  onClick={() => !isCommunity && ev.parcel && handleOpenParcel(ev.parcel)}
                  className={`flex items-start gap-4 px-4 py-3 text-[11px] ${!isCommunity && ev.parcel ? 'cursor-pointer hover:bg-stone-50' : ''} transition-colors`}
                >
                  {/* Timestamp */}
                  <div className="w-28 shrink-0 text-right">
                    <div className="text-[11px] text-stone-700 font-medium">{date}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">{time}</div>
                  </div>

                  {/* Dot */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className={`w-2 h-2 rounded-full ${evType.dotCls}`} />
                    {i < filtered.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1.5 min-h-[16px]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Actor + event type */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-stone-800">{ev.actor}</span>
                          <span className={`text-[10px] font-medium ${evType.textCls}`}>{evType.label}</span>
                        </div>

                        {/* Event description */}
                        <div className="mt-0.5 text-stone-700 leading-snug">{ev.event}</div>

                        {/* Parcel / location / score */}
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-500 flex-wrap">
                          <span className="font-mono font-semibold text-stone-800">{ev.parcel_id}</span>
                          {ev.ward && <span>· {ev.ward}</span>}
                          {ev.district && <span>· {ev.district}</span>}
                          {score != null && (
                            <span className={`font-mono font-semibold ${scoreColor}`}>· P: {score}/100</span>
                          )}
                          {ev.status && !isCommunity && (
                            <span className="text-stone-400">· {ev.status}</span>
                          )}
                        </div>
                      </div>

                      {/* View link — only for parcel events */}
                      {ev.parcel && (
                        <button
                          onClick={e => { e.stopPropagation(); handleOpenParcel(ev.parcel); }}
                          className="shrink-0 self-start mt-0.5 text-[11px] font-medium text-blue-700 hover:underline"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
