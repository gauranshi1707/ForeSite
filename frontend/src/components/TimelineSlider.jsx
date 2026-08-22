import React from 'react';
import { Calendar, Play, ChevronRight, Clock, AlertCircle } from 'lucide-react';

export default function TimelineSlider({ selectedYear, onChangeYear, has2027Data }) {
  const years = [
    { year: 2024, label: '2024', desc: 'Baseline Earth Observation' },
    { year: 2025, label: '2025', desc: 'Intermediate Satellite Scan' },
    { year: 2026, label: '2026', desc: 'Current Active Observation' },
    { year: 2027, label: '2027', desc: 'Post-Notice Re-check Sim', isSim: true }
  ];

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Multi-Temporal Observation & Projection Timeline (2024–2027)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span>Selected Epoch:</span>
          <span className="bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800">
            Year {selectedYear}
          </span>
        </div>
      </div>

      {/* Interactive Year Selector Buttons & Slider */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {years.map((y) => {
          const isSelected = selectedYear === y.year;

          return (
            <button
              key={y.year}
              onClick={() => onChangeYear(y.year)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? y.isSim
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-400'
                    : 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-2 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-black tracking-wider">
                  {y.label}
                </span>
                {y.isSim && (
                  <span className="text-[9px] bg-purple-900 text-purple-300 border border-purple-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    RE-CHECK
                  </span>
                )}
                {isSelected && !y.isSim && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
              
              <span className="text-[10px] mt-1 line-clamp-1 font-mono text-slate-400">
                {y.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
