import React from 'react';
import InteractiveMap from './InteractiveMap';
import MapSearchBar from './MapSearchBar';
import MapLegend from './MapLegend';
import ParcelSidePanel from './ParcelSidePanel';

export default function OverviewTab({
  parcels,
  selectedParcel,
  onSelectParcel,
  selectedYear,
  stats,
  onRecordAction,
  onTriggerRecheck,
  onOpenSatellite,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Map area with sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map column */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map search bar — floating overlay */}
          <div className="absolute top-3 left-3 z-[1000]">
            <MapSearchBar parcels={parcels} onSelectParcel={onSelectParcel} />
          </div>

          {/* Year badge overlay */}
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 border border-stone-200 rounded-lg px-3 py-1.5 text-[11px] font-medium text-stone-600 shadow-sm backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Observation: <span className="font-mono font-bold text-stone-900">{selectedYear}</span>
          </div>

          {/* Map legend */}
          <MapLegend />

          {/* Map */}
          <div className="w-full h-full">
            <InteractiveMap
              parcels={parcels}
              selectedParcel={selectedParcel}
              onSelectParcel={onSelectParcel}
              selectedYear={selectedYear}
            />
          </div>
        </div>

        {/* Right panel — parcel detail */}
        {selectedParcel && (
          <ParcelSidePanel
            parcel={selectedParcel}
            selectedYear={selectedYear}
            onClose={() => onSelectParcel(null)}
            onRecordAction={onRecordAction}
            onTriggerRecheck={onTriggerRecheck}
            onOpenSatellite={onOpenSatellite}
          />
        )}
      </div>

      {/* Bottom status bar */}
      <div className="bg-white border-t border-stone-200 px-5 py-1.5 flex items-center justify-between text-[11px] text-stone-500">
        <div className="flex items-center gap-4">
          <span><span className="font-mono font-semibold text-stone-800">{parcels.length}</span> parcels in view</span>
          <span className="text-stone-300">·</span>
          <span>Demo geography: Dwarka Zone 3, South West Delhi</span>
          <span className="text-stone-300">·</span>
          <span className="italic text-stone-400">Prototype Synthetic EO Dataset — Sentinel-2 / Earth Engine architecture ready</span>
        </div>
        <div className="text-stone-400">
          Click a parcel polygon to inspect
        </div>
      </div>
    </div>
  );
}
