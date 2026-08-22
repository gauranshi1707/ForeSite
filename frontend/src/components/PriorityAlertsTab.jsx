import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Eye, AlertTriangle, RotateCcw, TrendingUp } from 'lucide-react';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function getStatusBadge(status) {
  const cls = {
    'Re-check Required':    'status-recheck',
    'Notice Issued':        'status-notice',
    'Under Review':         'status-review',
    'Inspection Scheduled': 'status-inspection',
    'New Alert':            'status-new-alert',
    'Resolved':             'status-resolved',
  }[status] || 'status-stable';
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

function getScoreBadge(score) {
  const cls = score >= 80 ? 'score-critical' : score >= 60 ? 'score-high' : score >= 35 ? 'score-medium' : 'score-low';
  return <span className={`score-chip ${cls}`}>{score}/100</span>;
}

function getTrajLabel(traj) {
  if (traj === 'GROWING FAST') return <span className="traj-fast text-[11px]">↑ Growing Fast</span>;
  if (traj === 'GROWING') return <span className="traj-grow text-[11px]">↗ Growing</span>;
  return <span className="traj-stable text-[11px]">→ Stable</span>;
}

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------
export default function PriorityAlertsTab({ alerts, onSelectParcel, onNavigateToOverview }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [trajectoryFilter, setTrajectoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortKey, setSortKey] = useState('urgency_score');
  const [sortDir, setSortDir] = useState('desc');

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
        item.state?.toLowerCase().includes(q) ||
        item.ward?.toLowerCase().includes(q) ||
        item.land_category?.toLowerCase().includes(q);

      return matchSearch &&
        (trajectoryFilter === 'All' || item.trajectory === trajectoryFilter) &&
        (statusFilter === 'All' || item.status === statusFilter) &&
        (districtFilter === 'All' || item.district === districtFilter) &&
        item.urgency_score >= minScoreFilter;
    });

    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [alerts, searchTerm, trajectoryFilter, statusFilter, districtFilter, minScoreFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={11} className="text-stone-300" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="text-blue-600" /> : <ChevronDown size={11} className="text-blue-600" />;
  };

  const handleOpenParcel = (parcel) => {
    onSelectParcel(parcel);
    onNavigateToOverview();
  };

  // Stats row
  const recheckCount = filteredAlerts.filter(a => a.status === 'Re-check Required').length;
  const criticalCount = filteredAlerts.filter(a => a.urgency_score >= 80).length;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="max-w-[1400px] mx-auto px-5 py-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Priority Alerts</h2>
            <p className="text-[12px] text-stone-500 mt-0.5">
              Ranked by urgency score — highest priority parcels requiring attention first
            </p>
          </div>
          {/* Summary chips */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-red-50 border border-red-200 text-red-700 font-semibold px-2.5 py-1 rounded-full">
              {criticalCount} critical
            </span>
            <span className="bg-rose-50 border border-rose-200 text-rose-700 font-semibold px-2.5 py-1 rounded-full">
              {recheckCount} re-check required
            </span>
            <span className="bg-stone-100 border border-stone-200 text-stone-600 font-medium px-2.5 py-1 rounded-full">
              {filteredAlerts.length} total
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="fs-card p-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                id="alerts-search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by ID, district, ward, category…"
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-stone-200 rounded-md bg-white text-stone-800 placeholder-stone-400 outline-none focus:border-blue-400"
              />
            </div>

            <select
              value={trajectoryFilter}
              onChange={e => setTrajectoryFilter(e.target.value)}
              id="alerts-trajectory-filter"
              className="text-[12px] border border-stone-200 rounded-md bg-white text-stone-700 px-2.5 py-1.5 outline-none focus:border-blue-400"
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
              className="text-[12px] border border-stone-200 rounded-md bg-white text-stone-700 px-2.5 py-1.5 outline-none focus:border-blue-400"
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
              className="text-[12px] border border-stone-200 rounded-md bg-white text-stone-700 px-2.5 py-1.5 outline-none focus:border-blue-400"
            >
              {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
            </select>

            <div className="flex items-center gap-2 text-[12px] text-stone-600">
              <label className="whitespace-nowrap">Min score:</label>
              <input
                type="number"
                min={0} max={100}
                value={minScoreFilter}
                onChange={e => setMinScoreFilter(Number(e.target.value))}
                className="w-16 border border-stone-200 rounded-md bg-white text-stone-700 px-2 py-1.5 outline-none focus:border-blue-400 text-center font-mono text-[12px]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="fs-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12">Rank</th>
                  <th className="py-3 px-4">
                    <button onClick={() => handleSort('parcel_id')} className="flex items-center gap-1 hover:text-stone-800">
                      Parcel ID <SortIcon col="parcel_id" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">
                    <button onClick={() => handleSort('urgency_score')} className="flex items-center gap-1 mx-auto hover:text-stone-800">
                      Score <SortIcon col="urgency_score" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Trajectory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recommended Action</th>
                  <th className="py-3 px-4 text-right w-16">Inspect</th>
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
                    const rank = parcel.rank || idx + 1;
                    return (
                      <tr
                        key={parcel.id}
                        onClick={() => handleOpenParcel(parcel)}
                        className={`alert-row border-b border-stone-100 text-[12px] ${
                          parcel.is_hero ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 font-mono text-stone-400 font-medium">
                          #{rank}
                        </td>

                        {/* Parcel ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-stone-900">{parcel.parcel_id}</span>
                            {parcel.is_hero && (
                              <span className="text-[8px] font-bold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded uppercase">HERO</span>
                            )}
                            {parcel.post_notice_growth && (
                              <RotateCcw size={11} className="text-rose-500" />
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <div className="text-stone-700 font-medium">{parcel.ward}</div>
                          <div className="text-stone-400 text-[11px]">{parcel.district}, {parcel.state}</div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-stone-600 max-w-[160px]">
                          <span className="truncate block">{parcel.land_category}</span>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-4 text-center">
                          {getScoreBadge(parcel.urgency_score)}
                        </td>

                        {/* Trajectory */}
                        <td className="py-3 px-4">
                          {getTrajLabel(parcel.trajectory)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {getStatusBadge(parcel.status)}
                        </td>

                        {/* Recommended Action */}
                        <td className="py-3 px-4 text-stone-500 text-[11px] max-w-[160px]">
                          <span className="truncate block">{parcel.recommended_action || 'Schedule Field Survey'}</span>
                        </td>

                        {/* Inspect */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); handleOpenParcel(parcel); }}
                            id={`inspect-${parcel.parcel_id}`}
                            className="p-1.5 rounded-md border border-stone-200 hover:bg-blue-700 hover:text-white hover:border-blue-700 text-stone-500 transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Showing {filteredAlerts.length} of {alerts.length} alerts</span>
            <span>Click any row to open parcel on map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
