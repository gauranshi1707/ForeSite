import React from 'react';
import { Globe, Map, Satellite, ShieldAlert, Activity, User } from 'lucide-react';

const TABS = [
  { id: 'overview',   label: 'Overview',         icon: Map },
  { id: 'satellite',  label: 'Satellite Analysis', icon: Satellite },
  { id: 'alerts',     label: 'Priority Alerts',    icon: ShieldAlert },
  { id: 'activity',   label: 'Activity',           icon: Activity },
];

export default function AppHeader({ activeTab, onTabChange, stats, locationContext }) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      {/* Top bar: Logo + Location + User */}
      <div className="px-5 py-2.5 flex items-center justify-between gap-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-700">
            <Globe className="w-4.5 h-4.5 text-white" size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight leading-none">
                ForeSite
              </h1>
              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-none mt-0.5 font-medium">
              Predictive Land-Change Intelligence
            </p>
          </div>
        </div>

        {/* Location context */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-stone-500">
          <span className="font-medium text-stone-700">{locationContext?.state || 'Delhi NCR'}</span>
          <span className="text-stone-300">/</span>
          <span>{locationContext?.district || 'South West Delhi'}</span>
          <span className="text-stone-300">/</span>
          <span>{locationContext?.ward || 'Dwarka Zone 3'}</span>
          {locationContext?.category && (
            <>
              <span className="text-stone-300">·</span>
              <span className="italic text-stone-400">{locationContext.category}</span>
            </>
          )}
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* KPI strip — tiny */}
          <div className="hidden lg:flex items-center gap-3 mr-2 text-stone-500">
            <span>
              <span className="font-bold text-stone-800 font-mono">{stats?.total_parcels?.toLocaleString() || '1,000'}</span>
              {' '}monitored
            </span>
            <span className="text-stone-300">|</span>
            <span>
              <span className="font-bold text-amber-700 font-mono">{stats?.active_alerts?.toLocaleString() || '—'}</span>
              {' '}active alerts
            </span>
            <span className="text-stone-300">|</span>
            <span>
              <span className="font-bold text-red-700 font-mono">{stats?.high_priority?.toLocaleString() || '—'}</span>
              {' '}high priority
            </span>
            <span className="text-stone-300">|</span>
            <span>
              <span className="font-bold text-rose-700 font-mono">{stats?.requiring_recheck?.toLocaleString() || '—'}</span>
              {' '}re-check
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[9px] font-bold">
              SV
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-stone-700 leading-none">S. Verma</div>
              <div className="text-[9px] text-stone-400 leading-none mt-0.5">District Magistrate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="px-5 flex items-center gap-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
