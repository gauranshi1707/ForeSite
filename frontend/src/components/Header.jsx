import React from 'react';
import { ShieldAlert, Globe, Cpu, UserCheck, Activity } from 'lucide-react';

export default function Header({ currentPeriod, onTriggerHeroDemo }) {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-lg shadow-lg shadow-cyan-500/20 text-slate-950 font-black">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FORE<span className="text-cyan-400 font-extrabold">SITE</span>
              </h1>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                SIH 2026 MVP
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sentinel-2 Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Predictive Land-Change Intelligence & Enforcement System
            </p>
          </div>
        </div>

        {/* Action Controls & Quick Hero Demo trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          
          <button
            onClick={onTriggerHeroDemo}
            className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>Launch Judge Demo (Hero Parcel #PL-4587)</span>
          </button>

          {/* Monitoring Period Indicator */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Period:</span>
            <span className="text-cyan-300 font-semibold">{currentPeriod}</span>
          </div>

          {/* Official Profile Badge */}
          <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
              SV
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-slate-200 font-medium leading-none">S. Verma (Magistrate)</div>
              <div className="text-[10px] text-slate-400 font-mono leading-tight mt-0.5">Govt Land Enforcement</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
