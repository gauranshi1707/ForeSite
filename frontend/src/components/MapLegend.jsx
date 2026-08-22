import React from 'react';

const LEGEND_ITEMS = [
  { label: 'Stable',        fill: '#c8d5c0', stroke: '#6fa062' },
  { label: 'Growing',       fill: '#f5e4c0', stroke: '#c9a040' },
  { label: 'Growing Fast',  fill: '#f5cfc0', stroke: '#c96040' },
  { label: 'Re-check',      fill: '#e8c0d0', stroke: '#b04070' },
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 right-3 z-[1000] bg-white/95 border border-stone-200 rounded-lg px-3 py-2 shadow-sm backdrop-blur-sm">
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        Trajectory
      </div>
      <div className="space-y-1">
        {LEGEND_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0 border"
              style={{ backgroundColor: item.fill, borderColor: item.stroke }}
            />
            <span className="text-[11px] text-stone-600 font-medium">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-0.5 border-t border-stone-100 mt-0.5">
          <div className="w-3 h-3 rounded-sm border-2 shrink-0" style={{ borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)' }} />
          <span className="text-[11px] text-stone-600 font-medium">Selected</span>
        </div>
      </div>
    </div>
  );
}
