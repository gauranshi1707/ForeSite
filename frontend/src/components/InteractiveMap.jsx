import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC HERO FOOTPRINTS
// Each year the built-up footprint of PL-4587 grows directionally (SE → NW).
// These are exact pixel-level polygons tied to the 2024–2027 history values.
// ─────────────────────────────────────────────────────────────────────────────
const HERO_FOOTPRINTS = {
  // 2024 — 120 m²  Small initial structure in SE quadrant
  2024: [
    [28.5833, 77.0684],
    [28.5836, 77.0684],
    [28.5836, 77.0688],
    [28.5833, 77.0688],
  ],
  // 2025 — 480 m²  Expanded to cover SE half
  2025: [
    [28.5833, 77.0681],
    [28.5840, 77.0681],
    [28.5840, 77.0688],
    [28.5833, 77.0688],
  ],
  // 2026 — 920 m²  Large footprint covers two-thirds of parcel
  2026: [
    [28.5833, 77.0676],
    [28.5846, 77.0676],
    [28.5847, 77.0688],
    [28.5833, 77.0688],
  ],
  // 2027 — 1150 m²  Post-notice expansion: pushes further west
  2027: [
    [28.5833, 77.0671],
    [28.5848, 77.0671],
    [28.5848, 77.0688],
    [28.5833, 77.0688],
  ],
};

// 5 adjacent demo cluster parcels — also show visible (but milder) temporal change
const DEMO_CLUSTER_FOOTPRINTS = {
  // Parcel index 0 → slightly growing
  0: {
    2024: [[28.5853, 77.0692], [28.5855, 77.0692], [28.5855, 77.0695], [28.5853, 77.0695]],
    2025: [[28.5853, 77.0691], [28.5856, 77.0691], [28.5856, 77.0695], [28.5853, 77.0695]],
    2026: [[28.5852, 77.0690], [28.5857, 77.0690], [28.5857, 77.0696], [28.5852, 77.0696]],
    2027: [[28.5852, 77.0690], [28.5858, 77.0690], [28.5858, 77.0696], [28.5852, 77.0696]],
  },
  1: {
    2024: [[28.5813, 77.0692], [28.5815, 77.0692], [28.5815, 77.0694], [28.5813, 77.0694]],
    2025: [[28.5812, 77.0691], [28.5817, 77.0691], [28.5817, 77.0695], [28.5812, 77.0695]],
    2026: [[28.5812, 77.0691], [28.5818, 77.0691], [28.5818, 77.0696], [28.5812, 77.0696]],
    2027: [[28.5812, 77.0691], [28.5818, 77.0691], [28.5818, 77.0697], [28.5812, 77.0697]],
  },
  2: {
    2024: [[28.5873, 77.0657], [28.5875, 77.0657], [28.5875, 77.0659], [28.5873, 77.0659]],
    2025: [[28.5872, 77.0656], [28.5876, 77.0656], [28.5876, 77.0660], [28.5872, 77.0660]],
    2026: [[28.5872, 77.0655], [28.5877, 77.0655], [28.5877, 77.0661], [28.5872, 77.0661]],
    2027: [[28.5872, 77.0655], [28.5877, 77.0655], [28.5877, 77.0661], [28.5872, 77.0661]],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Parcel color config by trajectory / status
// ─────────────────────────────────────────────────────────────────────────────
function getParcelStyle(parcel, isSelected) {
  const traj = parcel.trajectory;
  const status = parcel.status;

  let fillColor = '#c8d5c0'; // Stable — muted green
  let strokeColor = '#6fa062';

  if (status === 'Re-check Required') {
    fillColor = '#e8c0d0';
    strokeColor = '#b04070';
  } else if (traj === 'GROWING FAST') {
    fillColor = '#f5cfc0';
    strokeColor = '#c96040';
  } else if (traj === 'GROWING') {
    fillColor = '#f5e4c0';
    strokeColor = '#c9a040';
  }

  if (isSelected) {
    return {
      color: '#2563eb',
      weight: 3,
      fillColor,
      fillOpacity: 0.55,
      dashArray: null,
    };
  }

  return {
    color: strokeColor,
    weight: 1.5,
    fillColor,
    fillOpacity: 0.38,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale polygon toward centroid (for non-hero parcels)
// ─────────────────────────────────────────────────────────────────────────────
function scalePolygonToward(polygon, scaleFactor) {
  if (!polygon || polygon.length < 3) return polygon;
  let cLat = 0, cLng = 0;
  polygon.forEach(([lat, lng]) => { cLat += lat; cLng += lng; });
  cLat /= polygon.length;
  cLng /= polygon.length;
  return polygon.map(([lat, lng]) => [
    cLat + (lat - cLat) * scaleFactor,
    cLng + (lng - cLng) * scaleFactor,
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-fly to selected parcel
// ─────────────────────────────────────────────────────────────────────────────
function MapFlyTo({ selectedParcel }) {
  const map = useMap();
  useEffect(() => {
    if (selectedParcel?.latitude && selectedParcel?.longitude) {
      map.flyTo([selectedParcel.latitude, selectedParcel.longitude], 15, { duration: 1.0 });
    }
  }, [selectedParcel, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact hover tooltip
// ─────────────────────────────────────────────────────────────────────────────
function ParcelTooltip({ parcel, selectedYear }) {
  const yr = String(selectedYear);
  const changeArea = parcel.history?.[yr] ?? parcel.history?.['2026'] ?? 0;
  const score = parcel.score_history?.[yr] ?? parcel.urgency_score;
  const traj = parcel.trajectory;

  const scoreColor = score >= 80 ? '#b91c1c' : score >= 60 ? '#b45309' : score >= 35 ? '#a16207' : '#15803d';
  const trajLabel = traj === 'GROWING FAST' ? 'Growing Fast' : traj === 'GROWING' ? 'Growing' : 'Stable';
  const trajColor = traj === 'GROWING FAST' ? '#9a3412' : traj === 'GROWING' ? '#92400e' : '#166534';

  const yearStatus = selectedYear === 2024 ? 'Stable' : selectedYear === 2025 ? 'Growing' :
    selectedYear === 2026 ? (traj === 'GROWING FAST' ? 'Growing Fast' : 'Growing') : 'Re-check Required';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 160, padding: '2px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 11, color: '#111827' }}>
          {parcel.parcel_id}
        </span>
        {parcel.is_hero && (
          <span style={{ fontSize: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '1px 3px', fontWeight: 700 }}>
            HERO
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>{selectedYear === 2027 ? 'Scenario' : 'Observation'}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: selectedYear === 2027 ? '#b91c1c' : '#1d4ed8' }}>{selectedYear} {selectedYear === 2027 && <span style={{fontSize: 7}}>PROJ</span>}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Built-up</span>
          <span style={{ fontWeight: 700 }}>{changeArea} m²</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Status</span>
          <span style={{ fontWeight: 600, color: trajColor }}>{yearStatus}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Priority</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: scoreColor }}>{score}/100</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Get built-up footprint for a parcel at a given year
// ─────────────────────────────────────────────────────────────────────────────
function getBuiltupFootprint(parcel, year, clusterIdx) {
  if (parcel.is_hero) {
    return HERO_FOOTPRINTS[year] || HERO_FOOTPRINTS[2026];
  }
  if (clusterIdx !== undefined && DEMO_CLUSTER_FOOTPRINTS[clusterIdx]) {
    return DEMO_CLUSTER_FOOTPRINTS[clusterIdx][year] || null;
  }
  // Generic: scale polygon toward centroid based on built-up area
  const area = parcel.history?.[String(year)] ?? parcel.history?.['2026'] ?? 0;
  if (area < 20 || !parcel.polygon || parcel.polygon.length < 3) return null;
  const maxArea = 1200;
  const scaleFactor = Math.min(0.80, 0.15 + (area / maxArea) * 0.65);
  return scalePolygonToward(parcel.polygon, scaleFactor);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main map component
// ─────────────────────────────────────────────────────────────────────────────
export default function InteractiveMap({ parcels, selectedParcel, onSelectParcel, selectedYear }) {
  const CENTER_LAT = 28.5833;
  const CENTER_LNG = 77.0667;

  // Identify demo cluster parcels (the 18 parcels in Dwarka Zone 3 ward cluster)
  const demoClusterIds = useMemo(() => {
    return parcels
      .filter(p => !p.is_hero && p.ward === 'Dwarka Zone 3')
      .slice(0, 3)
      .map(p => p.id);
  }, [parcels]);

  // Density layers: year-specific footprints for all parcels
  const densityLayers = useMemo(() => {
    return parcels
      .filter(p => p.polygon && p.polygon.length >= 3)
      .map((p, idx) => {
        const clusterIdx = demoClusterIds.indexOf(p.id) >= 0
          ? demoClusterIds.indexOf(p.id)
          : undefined;
        const footprint = getBuiltupFootprint(p, selectedYear, clusterIdx);
        if (!footprint) return null;
        const area = p.history?.[String(selectedYear)] ?? p.history?.['2026'] ?? 0;
        return { parcel: p, footprint, area };
      })
      .filter(Boolean);
  }, [parcels, selectedYear, demoClusterIds]);

  // Ghost (previous year) footprint for selected parcel
  const ghostFootprint = useMemo(() => {
    if (!selectedParcel) return null;
    const prevYear = selectedYear > 2024 ? selectedYear - 1 : null;
    if (!prevYear) return null;
    const clusterIdx = demoClusterIds.indexOf(selectedParcel.id) >= 0
      ? demoClusterIds.indexOf(selectedParcel.id) : undefined;
    return getBuiltupFootprint(selectedParcel, prevYear, clusterIdx);
  }, [selectedParcel, selectedYear, demoClusterIds]);

  // Change-area overlay: the diff between current and previous footprint (translucent)
  // We draw CURRENT footprint again with a different color to represent "new change"
  const changeAreaFootprint = useMemo(() => {
    if (!selectedParcel || selectedYear === 2024) return null;
    const clusterIdx = demoClusterIds.indexOf(selectedParcel.id) >= 0
      ? demoClusterIds.indexOf(selectedParcel.id) : undefined;
    return getBuiltupFootprint(selectedParcel, selectedYear, clusterIdx);
  }, [selectedParcel, selectedYear, demoClusterIds]);

  const [theme, setTheme] = React.useState(() => localStorage.getItem('foresite_theme') || 'light');
  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem('foresite_theme') || 'light');
    window.addEventListener('foresite_theme_change', handler);
    return () => window.removeEventListener('foresite_theme_change', handler);
  }, []);

  const tileUrl = theme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[CENTER_LAT, CENTER_LNG]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
          subdomains="abcd"
          maxZoom={20}
        />

        <MapFlyTo selectedParcel={selectedParcel} />

        {/* ── Render parcel boundary polygons ── */}
        {parcels.map((parcel) => {
          if (!parcel.polygon || parcel.polygon.length < 3) return null;
          const isSelected = selectedParcel?.id === parcel.id;
          const style = getParcelStyle(parcel, isSelected);

          return (
            <React.Fragment key={parcel.id}>
              <Polygon
                positions={parcel.polygon}
                pathOptions={style}
                eventHandlers={{ click: () => onSelectParcel(parcel) }}
              >
                <Tooltip sticky direction="top" offset={[0, -8]}>
                  <ParcelTooltip parcel={parcel} selectedYear={selectedYear} />
                </Tooltip>
              </Polygon>
            </React.Fragment>
          );
        })}

        {/* ── Year-specific built-up footprints ── */}
        {densityLayers.map(({ parcel, footprint, area }) => {
          const traj = parcel.trajectory;
          const status = parcel.status;
          const isSelected = selectedParcel?.id === parcel.id;

          let densityColor = '#4d7a45'; // stable green fill
          if (status === 'Re-check Required') densityColor = '#9b3460';
          else if (traj === 'GROWING FAST') densityColor = '#b24020';
          else if (traj === 'GROWING') densityColor = '#b07030';

          const maxArea = 1200;
          const opacity = Math.min(0.60, 0.12 + (area / maxArea) * 0.48);

          return (
            <Polygon
              key={`fp-${parcel.id}-${selectedYear}`}
              positions={footprint}
              pathOptions={{
                color: isSelected ? densityColor : 'none',
                weight: isSelected ? 1.5 : 0,
                fillColor: densityColor,
                fillOpacity: isSelected ? opacity + 0.1 : opacity,
              }}
              eventHandlers={{ click: () => onSelectParcel(parcel) }}
            />
          );
        })}

        {/* ── Ghost outline: previous-year footprint (dashed, when selected) ── */}
        {ghostFootprint && selectedParcel && (
          <Polygon
            key={`ghost-${selectedParcel.id}-${selectedYear}`}
            positions={ghostFootprint}
            pathOptions={{
              color: '#b07030',
              weight: 2,
              fillColor: 'transparent',
              fillOpacity: 0,
              dashArray: '5, 6',
              opacity: 0.7,
            }}
          />
        )}

        {/* ── Change-area overlay: translucent amber highlight for newly detected area ── */}
        {changeAreaFootprint && selectedParcel && selectedYear > 2024 && (
          <Polygon
            key={`change-${selectedParcel.id}-${selectedYear}`}
            positions={changeAreaFootprint}
            pathOptions={{
              color: selectedYear === 2027 ? '#9b1c1c' : '#c96040',
              weight: 2.5,
              fillColor: selectedYear === 2027 ? '#dc2626' : '#ea6030',
              fillOpacity: 0.13,
              dashArray: null,
            }}
          />
        )}
      </MapContainer>

      {/* ── Year epoch indicator (bottom-left of map) ── */}
      <div
        style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb',
          borderRadius: 8, padding: '6px 12px', fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
          color: selectedYear === 2027 ? '#b91c1c' : '#1d4ed8',
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          pointerEvents: 'none',
        }}
      >
        {selectedYear === 2027 ? 'PROJECTED SCENARIO ' : 'OBSERVATION '} {selectedYear}
        {selectedYear === 2027 && (
          <span style={{ fontFamily: 'Inter, system-ui', fontWeight: 600, color: '#b91c1c', marginLeft: 6, fontSize: 9 }}>
            RE-CHECK
          </span>
        )}
      </div>

      {/* ── Map legend for footprint colors ── */}
      <div
        style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb',
          borderRadius: 8, padding: '8px 12px', fontSize: 10,
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 5 }}>
          Built-up Footprint
        </div>
        {[
          { color: '#b24020', label: 'Growing Fast' },
          { color: '#b07030', label: 'Growing' },
          { color: '#4d7a45', label: 'Stable' },
          { color: '#9b3460', label: 'Re-check' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, background: color, borderRadius: 2, opacity: 0.75 }} />
            <span style={{ color: '#374151' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 2, background: '#b07030', borderTop: '2px dashed #b07030', opacity: 0.7 }} />
          <span style={{ color: '#9ca3af', fontSize: 9 }}>Prev. year footprint</span>
        </div>
      </div>
    </div>
  );
}
