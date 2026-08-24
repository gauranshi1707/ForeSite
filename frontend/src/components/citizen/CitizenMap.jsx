import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReportForm from './ReportForm';

// Fix leaflet default icon issue with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && center) {
      map.setView(center, zoom);
      initialized.current = true;
    }
  }, [center, zoom, map]);
  return null;
}

export default function CitizenMap() {
  const [locationState, setLocationState] = useState('loading');
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.5833, 77.0667]);
  const [mapZoom] = useState(13);
  const [showForm, setShowForm] = useState(false);

  // ALL hooks must be declared before any early return (Rules of Hooks)
  const [theme, setTheme] = useState(() => localStorage.getItem('foresite_theme') || 'light');

  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem('foresite_theme') || 'light');
    window.addEventListener('foresite_theme_change', handler);
    return () => window.removeEventListener('foresite_theme_change', handler);
  }, []);

  const requestGeolocation = () => {
    setLocationState('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          setMapCenter([newPos.lat, newPos.lng]);
          setLocationState('ready');
        },
        () => {
          setLocationState('ready');
        },
        { timeout: 5000 }
      );
    } else {
      setLocationState('ready');
    }
  };

  useEffect(() => {
    requestGeolocation();
    const timer = setTimeout(() => {
      setLocationState(prev => (prev === 'loading' ? 'ready' : prev));
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const tileUrl = theme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  // Early return after all hooks
  if (showForm) {
    return <ReportForm position={position} onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Map */}
      <div className="flex-1 relative bg-stone-100">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
            subdomains="abcd"
            maxZoom={20}
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapController center={mapCenter} zoom={mapZoom} />
        </MapContainer>

        {/* Loading overlay */}
        {locationState === 'loading' && (
          <div className="absolute inset-0 bg-white/70 z-[1000] flex flex-col items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-stone-700 mb-3">Detecting your location…</p>
            <button
              onClick={() => setLocationState('ready')}
              className="text-xs font-semibold text-blue-600 hover:underline border border-stone-200 bg-white px-3 py-1 rounded shadow-sm"
            >
              Use map manually
            </button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
        <div>
          {position ? (
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Location selected
                <button
                  onClick={requestGeolocation}
                  className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                >
                  ◎ Use My Location
                </button>
              </p>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Drag pin to adjust. Click elsewhere to move it.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Select a location
                <button
                  onClick={requestGeolocation}
                  className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                >
                  ◎ Use My Location
                </button>
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Click anywhere on the map to drop a pin.</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!position}
          className={`whitespace-nowrap px-5 py-2 rounded text-sm font-medium transition-colors ${
            position
              ? 'bg-blue-700 hover:bg-blue-800 text-white'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
