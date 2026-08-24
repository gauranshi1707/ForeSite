import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function statusLabel(status) {
  const map = {
    'Re-check Required':    { text: 'Re-check Req.',  cls: 'text-red-700 border-red-300 bg-red-50' },
    'Notice Issued':        { text: 'Notice Issued',  cls: 'text-amber-800 border-amber-300 bg-amber-50' },
    'Inspection Scheduled': { text: 'Inspection Sch.', cls: 'text-blue-700 border-blue-300 bg-blue-50' },
    'Under Review':         { text: 'Under Review',   cls: 'text-stone-700 border-stone-300 bg-stone-50' },
    'New Alert':            { text: 'New Alert',      cls: 'text-orange-700 border-orange-300 bg-orange-50' },
    'Resolved':             { text: 'Resolved',       cls: 'text-green-800 border-green-300 bg-green-50' },
  };
  return map[status] || { text: status, cls: 'text-stone-600 border-stone-200 bg-stone-50' };
}

function scoreStyle(score) {
  if (score >= 80) return 'text-red-700 font-bold';
  if (score >= 60) return 'text-amber-700 font-semibold';
  return 'text-stone-700 font-medium';
}

function trajLabel(traj) {
  if (traj === 'GROWING FAST') return { text: '↑ Growing Fast', cls: 'text-red-700' };
  if (traj === 'GROWING')      return { text: '↗ Growing',      cls: 'text-amber-700' };
  return                              { text: '→ Stable',        cls: 'text-stone-500' };
}

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------
export default function PriorityAlertsTab({ alerts, onSelectParcel, onNavigateToOverview }) {
  const [searchTerm,       setSearchTerm]       = useState('');
  const [trajectoryFilter, setTrajectoryFilter] = useState('All');
  const [statusFilter,     setStatusFilter]     = useState('All');
  const [districtFilter,   setDistrictFilter]   = useState('All');
  const [minScoreFilter,   setMinScoreFilter]   = useState(0);
  const [sortKey,          setSortKey]          = useState('urgency_score');
  const [sortDir,          setSortDir]          = useState('desc');

  const districts = useMemo(() => {
    const set = new Set(alerts.map(a => a.district));
    return ['All', ...Array.from(set).sort()];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    let result = alerts.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        item.parcel_id?.toLowerCase().includes(q) ||
        item.district?.toLowerCase().includes(q) ||
        item.ward?.toLowerCase().includes(q) ||
        item.land_category?.toLowerCase().includes(q);
      return matchSearch &&
        (trajectoryFilter === 'All' || item.trajectory === trajectoryFilter) &&
        (statusFilter     === 'All' || item.status     === statusFilter)     &&
        (districtFilter   === 'All' || item.district   === districtFilter)   &&
        item.urgency_score >= minScoreFilter;
    });

    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return result;
  }, [alerts, searchTerm, trajectoryFilter, statusFilter, districtFilter, minScoreFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={10} className="text-stone-300 ml-0.5 inline" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={10} className="text-blue-600 ml-0.5 inline" />
      : <ChevronDown size={10} className="text-blue-600 ml-0.5 inline" />;
  };

  const handleOpenParcel = (parcel) => {
    onSelectParcel(parcel);
    onNavigateToOverview();
  };

  const criticalCount = filteredAlerts.filter(a => a.urgency_score >= 80).length;
  const recheckCount  = filteredAlerts.filter(a => a.status === 'Re-check Required').length;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="px-6 py-5">

        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[14px] font-bold text-stone-900">Priority Alerts</h2>
            <p className="text-[12px] text-stone-500 mt-0.5">Active land-change alerts · ranked by urgency score</p>
          </div>
          <div className="text-[11px] text-stone-500 space-x-3">
            <span><span className="font-semibold text-red-700">{criticalCount}</span> critical</span>
            <span className="text-stone-300">·</span>
            <span><span className="font-semibold text-stone-800">{recheckCount}</span> re-check required</span>
            <span className="text-stone-300">·</span>
            <span><span className="font-semibold text-stone-800">{filteredAlerts.length}</span> shown</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center mb-3 pb-3 border-b border-stone-200">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              id="alerts-search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ID, ward, category…"
              className="pl-7 pr-3 py-1.5 text-[12px] border border-stone-300 bg-white text-stone-800 placeholder-stone-400 outline-none focus:border-blue-500 rounded w-52"
            />
          </div>
          <select
            value={trajectoryFilter}
            onChange={e => setTrajectoryFilter(e.target.value)}
            id="alerts-trajectory-filter"
            className="text-[12px] border border-stone-300 bg-white text-stone-700 px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
          >
            <option value="All">All Trajectories</option>
            <option value="GROWING FAST">Growing Fast</option>
            <option value="GROWING">Growing</option>
            <option value="STABLE">Stable</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            id="alerts-status-filter"
            className="text-[12px] border border-stone-300 bg-white text-stone-700 px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Re-check Required">Re-check Required</option>
            <option value="Notice Issued">Notice Issued</option>
            <option value="Inspection Scheduled">Inspection Scheduled</option>
            <option value="Under Review">Under Review</option>
            <option value="New Alert">New Alert</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            id="alerts-district-filter"
            className="text-[12px] border border-stone-300 bg-white text-stone-700 px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
          >
            {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-[12px] text-stone-600">
            <label htmlFor="min-score" className="text-stone-500">Min score</label>
            <input
              type="number"
              id="min-score"
              min={0} max={100}
              value={minScoreFilter}
              onChange={e => setMinScoreFilter(Number(e.target.value))}
              className="w-14 border border-stone-300 bg-white text-stone-700 px-2 py-1.5 rounded outline-none focus:border-blue-500 text-center font-mono text-[12px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                  <th className="py-2.5 px-4 w-10">
                    <button onClick={() => handleSort('rank')} className="hover:text-stone-900 flex items-center">
                      # <SortIcon col="rank" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4">
                    <button onClick={() => handleSort('parcel_id')} className="hover:text-stone-900 flex items-center">
                      Parcel <SortIcon col="parcel_id" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">
                    <button onClick={() => handleSort('urgency_score')} className="hover:text-stone-900 flex items-center">
                      Score <SortIcon col="urgency_score" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4">Trajectory</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Recommended Action</th>
                  <th className="py-2.5 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[13px] text-stone-400">
                      No alerts match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((parcel, idx) => {
                    const rank    = parcel.rank || idx + 1;
                    const st      = statusLabel(parcel.status);
                    const traj    = trajLabel(parcel.trajectory);
                    const isHigh  = parcel.urgency_score >= 80;

                    return (
                      <tr
                        key={parcel.id}
                        onClick={() => handleOpenParcel(parcel)}
                        className="alert-row border-b border-stone-100 text-[12px]"
                      >
                        {/* Rank */}
                        <td className="py-2.5 px-4 font-mono text-stone-400 text-[11px]">
                          {rank}
                        </td>

                        {/* Parcel ID */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-stone-900">{parcel.parcel_id}</span>
                            {parcel.is_hero && (
                              <span className="text-[9px] text-stone-400 border border-stone-200 px-1 rounded-sm">HERO</span>
                            )}
                            {parcel.post_notice_growth && (
                              <RotateCcw size={10} className="text-red-500 shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-2.5 px-4">
                          <div className="text-stone-800">{parcel.ward}</div>
                          <div className="text-[11px] text-stone-400">{parcel.district}</div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-4 text-stone-600 text-[11px] max-w-[150px]">
                          <span className="truncate block">{parcel.land_category}</span>
                        </td>

                        {/* Score */}
                        <td className="py-2.5 px-4">
                          <span className={`font-mono text-[13px] ${scoreStyle(parcel.urgency_score)}`}>
                            {parcel.urgency_score}
                            <span className="text-stone-400 font-normal text-[10px]">/100</span>
                          </span>
                        </td>

                        {/* Trajectory */}
                        <td className={`py-2.5 px-4 text-[11px] font-medium ${traj.cls}`}>
                          {traj.text}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-4">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 border rounded-sm ${st.cls}`}>
                            {st.text}
                          </span>
                        </td>

                        {/* Recommended Action */}
                        <td className="py-2.5 px-4 text-stone-500 text-[11px] max-w-[160px]">
                          <span className="truncate block">{parcel.recommended_action || 'Schedule Field Survey'}</span>
                        </td>

                        {/* Inspect button */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={e => { e.stopPropagation(); handleOpenParcel(parcel); }}
                            id={`inspect-${parcel.parcel_id}`}
                            className="text-[11px] font-medium text-blue-700 hover:underline border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-sm transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between bg-stone-50">
            <span>Showing {filteredAlerts.length} of {alerts.length} alerts</span>
            <span>Click any row to open parcel on map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
