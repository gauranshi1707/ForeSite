import React from 'react';
import { Eye, Flame, ShieldCheck, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ClosedLoopWorkflow() {
  const steps = [
    {
      step: '1',
      title: 'DETECT',
      desc: 'Sentinel-2 satellite scans detect multi-temporal land-use change',
      icon: Eye,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bg: 'bg-cyan-950/40'
    },
    {
      step: '2',
      title: 'PRIORITIZE',
      desc: 'Transparent ML scores urgency (0–100) & classifies trajectory',
      icon: Flame,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bg: 'bg-amber-950/40'
    },
    {
      step: '3',
      title: 'ACT',
      desc: 'Official reviews evidence & issues legal notice / ground survey',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bg: 'bg-emerald-950/40'
    },
    {
      step: '4',
      title: 'RE-CHECK & ESCALATE',
      desc: 'Re-evaluates post-notice scans; auto-escalates if growth continues',
      icon: RotateCcw,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bg: 'bg-purple-950/40'
    }
  ];

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Closed-Loop Enforcement Architecture (Detect → Prioritize → Act → Re-check)
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
          Core Differentiator
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`${s.bg} border ${s.borderColor} p-3 rounded-lg flex flex-col justify-between relative`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  PHASE 0{s.step}
                </span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>

              <div className={`font-mono font-extrabold text-sm ${s.color}`}>
                {s.title}
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
