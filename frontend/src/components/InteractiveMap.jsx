import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------------------
// Parcel color config by trajectory / status
// ----------------------------------------------------------------
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

// ----------------------------------------------------------------
// Compute a scaled inner polygon for built-up density visualization
// ----------------------------------------------------------------
function scalePolygonToward(polygon, scaleFactor) {
  if (!polygon || polygon.length < 3) return polygon;
  // Compute centroid
  let cLat = 0, cLng = 0;
  polygon.forEach(([lat, lng]) => { cLat += lat; cLng += lng; });
  cLat /= polygon.length;
  cLng /= polygon.length;
  // Scale toward centroid
  return polygon.map(([lat, lng]) => [
    cLat + (lat - cLat) * scaleFactor,
    cLng + (lng - cLng) * scaleFactor,
  ]);
}

// ----------------------------------------------------------------
// Sub-component: auto fly to selected parcel
// ----------------------------------------------------------------
function MapFlyTo({ selectedParcel }) {
  const map = useMap();
  useEffect(() => {
    if (selectedParcel?.latitude && selectedParcel?.longitude) {
      map.flyTo([selectedParcel.latitude, selectedParcel.longitude], 15, { duration: 1.0 });
    }
  }, [selectedParcel, map]);
  return null;
}

// ----------------------------------------------------------------
// Compact hover tooltip
// ----------------------------------------------------------------
function ParcelTooltip({ parcel, selectedYear }) {
  const changeArea = parcel.history?.[String(selectedYear)] ?? parcel.history?.['2026'] ?? 0;
  const traj = parcel.trajectory;
  const score = parcel.urgency_score;

  const scoreColor = score >= 80 ? '#b91c1c' : score >= 60 ? '#b45309' : score >= 35 ? '#a16207' : '#15803d';
  const trajLabel = traj === 'GROWING FAST' ? 'Growing Fast' : traj === 'GROWING' ? 'Growing' : 'Stable';
  const trajColor = traj === 'GROWING FAST' ? '#9a3412' : traj === 'GROWING' ? '#92400e' : '#166534';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 180 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13, color: '#111827' }}>
          {parcel.parcel_id}
        </span>
        {parcel.is_hero && (
          <span style={{ fontSize: 9, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
            HERO
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.8 }}>
        <div><span style={{ color: '#6b7280' }}>Trajectory</span> <span style={{ fontWeight: 600, color: trajColor }}>{trajLabel}</span></div>
        <div><span style={{ color: '#6b7280' }}>Priority</span> <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: scoreColor }}>{score}/100</span></div>
        <div><span style={{ color: '#6b7280' }}>Built-up</span> <span style={{ fontWeight: 600 }}>{changeArea} m²</span></div>
        <div><span style={{ color: '#6b7280' }}>Status</span> <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{parcel.status}</span></div>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
        Click to inspect parcel
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main map component
// ----------------------------------------------------------------
export default function InteractiveMap({ parcels, selectedParcel, onSelectParcel, selectedYear }) {
  const CENTER_LAT = 28.5833;
  const CENTER_LNG = 77.0667;

  // Build density inner polygons for demo cluster (Dwarka zone parcels)
  // Only show for parcels with meaningful built-up area
  const densityLayers = useMemo(() => {
    return parcels
      .filter(p => p.polygon && p.polygon.length >= 3)
      .map(p => {
        const area = p.history?.[String(selectedYear)] ?? p.history?.['2026'] ?? 0;
        const maxArea = 1200;
        // Scale: 0 area = no inner polygon, max area = 0.75 scale
        const scaleFactor = Math.min(0.80, 0.15 + (area / maxArea) * 0.65);
        if (area < 20) return null;
        const inner = scalePolygonToward(p.polygon, scaleFactor);
        return { parcel: p, inner, area };
      })
      .filter(Boolean);
  }, [parcels, selectedYear]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[CENTER_LAT, CENTER_LNG]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        {/* CartoDB Positron — light neutral GIS tile */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <MapFlyTo selectedParcel={selectedParcel} />

        {/* Render parcels */}
        {parcels.map((parcel) => {
          if (!parcel.polygon || parcel.polygon.length < 3) return null;
          const isSelected = selectedParcel?.id === parcel.id;
          const style = getParcelStyle(parcel, isSelected);

          return (
            <React.Fragment key={parcel.id}>
              {/* Main parcel boundary */}
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

        {/* Built-up density inner fills */}
        {densityLayers.map(({ parcel, inner, area }) => {
          const traj = parcel.trajectory;
          const status = parcel.status;

          let densityColor = '#4d7a45'; // stable green fill
          if (status === 'Re-check Required') densityColor = '#9b3460';
          else if (traj === 'GROWING FAST') densityColor = '#b24020';
          else if (traj === 'GROWING') densityColor = '#b07030';

          const maxArea = 1200;
          const opacity = Math.min(0.55, 0.10 + (area / maxArea) * 0.45);

          return (
            <Polygon
              key={`density-${parcel.id}`}
              positions={inner}
              pathOptions={{
                color: 'none',
                weight: 0,
                fillColor: densityColor,
                fillOpacity: opacity,
              }}
              eventHandlers={{ click: () => onSelectParcel(parcel) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
