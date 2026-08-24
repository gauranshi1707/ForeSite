import React from 'react';
import { Globe, Map, Satellite, ShieldAlert, Activity, User, Users } from 'lucide-react';
import ProfileSwitcher from './ProfileSwitcher';

const TABS = [
  { id: 'overview',   label: 'Overview',         icon: Map },
  { id: 'satellite',  label: 'Satellite Analysis', icon: Satellite },
  { id: 'alerts',     label: 'Priority Alerts',    icon: ShieldAlert },
  { id: 'activity',   label: 'Activity',           icon: Activity },
  { id: 'reports',    label: 'Community Reports',  icon: Users },
];

export default function AppHeader({ activeTab, onTabChange, stats, locationContext, onOpenPipeline }) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      {/* Top bar: Logo + Location + User */}
      <div className="px-5 py-2 flex items-center justify-between gap-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-blue-700">
            <Globe className="w-4 h-4 text-white" size={16} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-stone-900 tracking-tight leading-none">
                ForeSite
              </h1>
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider leading-none">
                SIH 2026
              </span>
            </div>
          </div>
        </div>

        {/* Location context */}
        <div className="hidden md:flex items-center gap-2 text-[10px] text-stone-500 font-mono">
          <span className="font-semibold text-stone-700">{locationContext?.state || 'DELHI NCR'}</span>
          <span className="text-stone-300">/</span>
          <span>{locationContext?.district || 'SOUTH WEST DELHI'}</span>
          <span className="text-stone-300">/</span>
          <span>{locationContext?.ward || 'DWARKA ZONE 3'}</span>
        </div>

        {/* User badge */}
          <div className="flex items-center gap-3 text-[10px]">
            {/* KPI strip — tiny */}
            <div className="hidden lg:flex items-center gap-3 mr-3 text-stone-500">
              <span className="flex items-center gap-1">
                <span className="font-bold text-stone-800 font-mono">{stats?.total_parcels?.toLocaleString() || '1,000'}</span>
                MONITORED
              </span>
              <span className="text-stone-200">|</span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-amber-700 font-mono">{stats?.active_alerts?.toLocaleString() || '—'}</span>
                ACTIVE
              </span>
              <span className="text-stone-200">|</span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-red-700 font-mono">{stats?.high_priority?.toLocaleString() || '—'}</span>
                HIGH PRIORITY
              </span>
            </div>
            <ProfileSwitcher />
          </div>
      </div>

      {/* Tab navigation */}
      <nav className="px-5 flex items-center gap-6 w-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 py-2 text-[12px] font-medium border-b-[3px] transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'border-blue-700 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon size={13} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-blue-700" : ""} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
