import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, ArrowUpDown, ChevronRight, RotateCcw, AlertTriangle, Eye } from 'lucide-react';

export default function PriorityAlertList({
  alerts,
  selectedParcelId,
  onSelectParcel
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [trajectoryFilter, setTrajectoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set(alerts.map((a) => a.district));
    return ['All', ...Array.from(set).sort()];
  }, [alerts]);

  const [districtFilter, setDistrictFilter] = useState('All');

  // Filter & sort ranked alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesSearch =
        item.parcel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.land_category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTrajectory = trajectoryFilter === 'All' || item.trajectory === trajectoryFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesDistrict = districtFilter === 'All' || item.district === districtFilter;
      const matchesScore = item.urgency_score >= minScoreFilter;

      return matchesSearch && matchesTrajectory && matchesStatus && matchesDistrict && matchesScore;
    });
  }, [alerts, searchTerm, trajectoryFilter, statusFilter, districtFilter, minScoreFilter]);

  return (
    <div className="glass-panel rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      
      {/* Table Header Controls */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Priority Encroachment Alert Queue ({filteredAlerts.length} Flagged Parcels)
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Sorted by Urgency Score (High → Low)
          </span>
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
          
          {/* Search Box */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Parcel ID (e.g. PL-4587), District..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Trajectory Dropdown */}
          <select
            value={trajectoryFilter}
            onChange={(e) => setTrajectoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="All">All Trajectories</option>
            <option value="GROWING FAST">GROWING FAST</option>
            <option value="GROWING">GROWING</option>
            <option value="STABLE">STABLE</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Re-check Required">Re-check Required</option>
            <option value="Notice Issued">Notice Issued</option>
            <option value="Inspection Scheduled">Inspection Scheduled</option>
            <option value="Under Review">Under Review</option>
            <option value="New Alert">New Alert</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* District Dropdown */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="All">All Districts</option>
            {districts.filter(d => d !== 'All').map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Ranked Table View */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800 text-[10px]">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Parcel ID</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">Urgency</th>
              <th className="py-3 px-4">Trajectory</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No priority alerts match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((parcel, idx) => {
                const isSelected = selectedParcelId === parcel.id;
                const score = parcel.urgency_score;
                const rank = parcel.rank || idx + 1;

                return (
                  <tr
                    key={parcel.id}
                    onClick={() => onSelectParcel(parcel)}
                    className={`cursor-pointer transition-colors ${
                      parcel.is_hero ? 'bg-rose-950/20 hover:bg-rose-950/40' :
                      isSelected ? 'bg-cyan-950/50 text-cyan-200' : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 font-bold text-slate-400">
                      #{rank}
                    </td>

                    {/* Parcel ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{parcel.parcel_id}</span>
                        {parcel.is_hero && (
                          <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">HERO</span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-400">
                      <div>{parcel.district}</div>
                      <div className="text-[10px] text-slate-500">{parcel.state}</div>
                    </td>

                    {/* Urgency Score */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block font-bold text-xs px-2 py-1 rounded font-mono ${
                        score >= 80 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        score >= 60 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        score >= 35 ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {score}/100
                      </span>
                    </td>

                    {/* Trajectory */}
                    <td className="py-3 px-4">
                      <span className={`font-semibold text-[11px] ${
                        parcel.trajectory === 'GROWING FAST' ? 'text-rose-400' :
                        parcel.trajectory === 'GROWING' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {parcel.trajectory}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {parcel.status === 'Re-check Required' ? (
                          <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <RotateCcw className="w-3 h-3 text-purple-400" />
                            Re-check Required
                          </span>
                        ) : (
                          <span className="text-slate-300 font-semibold text-[11px]">{parcel.status}</span>
                        )}
                      </div>
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {parcel.recommended_action || 'Schedule Field Survey'}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectParcel(parcel);
                        }}
                        className="bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-300 p-1.5 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
