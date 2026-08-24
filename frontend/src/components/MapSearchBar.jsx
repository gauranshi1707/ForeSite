import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';

export default function MapSearchBar({ parcels, onSelectParcel }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return parcels
      .filter(p =>
        p.parcel_id?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.ward?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) ||
        p.land_category?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [parcels, query]);

  const handleSelect = (parcel) => {
    setQuery('');
    setIsFocused(false);
    onSelectParcel(parcel);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && query.length >= 2;

  return (
    <div className="relative w-72">
      <div className={`flex items-center bg-white border rounded-sm shadow-sm transition-all duration-150 ${
        isFocused ? 'border-blue-400 shadow-md' : 'border-stone-300'
      }`}>
        <Search size={14} className="ml-3 text-stone-400 shrink-0" strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          id="map-search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 180)}
          placeholder="Search parcel ID, ward, district…"
          className="w-full px-2.5 py-1.5 text-[11px] text-stone-800 placeholder-stone-400 bg-transparent outline-none"
        />
        {query && (
          <button onClick={handleClear} className="mr-2 text-stone-400 hover:text-stone-700">
            <X size={13} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-sm shadow-md z-[2000] overflow-hidden">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-stone-400 italic">No parcels found</div>
          ) : (
            results.map(p => {
              const score = p.urgency_score;
              const scoreColor = score >= 80 ? 'text-red-600' : score >= 60 ? 'text-amber-600' : score >= 35 ? 'text-yellow-600' : 'text-green-600';
              return (
                <button
                  key={p.id}
                  onMouseDown={() => handleSelect(p)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-0 text-left transition-colors"
                >
                  <MapPin size={13} className="text-stone-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[12px] text-stone-900">{p.parcel_id}</span>
                      <span className={`font-mono text-[11px] font-bold ${scoreColor}`}>{score}/100</span>
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">{p.ward} · {p.district}</div>
                    <div className="text-[10px] text-stone-400 truncate">{p.land_category}</div>
                  </div>
                  <span className={`text-[10px] font-medium shrink-0 mt-0.5 px-1.5 py-0.5 rounded ${
                    p.trajectory === 'GROWING FAST' ? 'bg-red-50 text-red-700' :
                    p.trajectory === 'GROWING' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {p.trajectory === 'GROWING FAST' ? 'Fast' : p.trajectory === 'GROWING' ? 'Growing' : 'Stable'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
