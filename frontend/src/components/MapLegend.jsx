import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 right-3 z-[1000] bg-white/95 border border-stone-300 shadow-sm px-3 py-2 text-[10px] backdrop-blur-sm">
      <div className="font-bold text-stone-500 uppercase tracking-wider mb-2">Built-up Footprint</div>
      <div className="space-y-1.5 font-medium text-stone-700">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500/80 border border-red-700" />
          <span>Growing Fast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500/80 border border-amber-700" />
          <span>Growing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500/80 border border-green-700" />
          <span>Stable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-purple-500/80 border border-purple-700" />
          <span>Re-check Required</span>
        </div>
      </div>
    </div>
  );
}
