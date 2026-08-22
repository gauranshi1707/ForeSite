import React from 'react';
import { Play, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HeroDemoBanner({ onTriggerHeroDemo }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hackathon Judge Demo Flow (Parcel #PL-4587)
            </h3>
            <span className="bg-rose-900 text-rose-200 border border-rose-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              17-Step Validation Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Test the full closed loop: <strong>2024 (120 m²) → 2025 (480 m²) → 2026 (920 m² Growing Fast, Score 85/100, Notice Issued)</strong>. Then simulate 2027 scenario (1,150 m²) to see automatic <strong>RE-CHECK REQUIRED</strong> escalation.
          </p>
        </div>
      </div>

      <button
        onClick={onTriggerHeroDemo}
        className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-rose-600/30 shrink-0 transition-all hover:scale-105 active:scale-95"
      >
        <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
        <span>Run Demo on Parcel #PL-4587</span>
      </button>
    </div>
  );
}
