import React, { useState, useEffect } from 'react';
import { getReports, updateReportStatus } from '../services/store';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function CommunityReportsTab() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Reports');

  useEffect(() => {
    setReports(getReports());
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('foresite_theme') || 'light');
  useEffect(() => {
    const handler = () => setTheme(localStorage.getItem('foresite_theme') || 'light');
    window.addEventListener('foresite_theme_change', handler);
    return () => window.removeEventListener('foresite_theme_change', handler);
  }, []);

  const tileUrl = theme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleOpenAction = () => {
    setActionStatus(selectedReport.status || 'Under Review');
    setActionNotes(selectedReport.officerNotes || '');
    setShowActionModal(true);
  };

  const handleSaveAction = (e) => {
    e.preventDefault();
    updateReportStatus(selectedReport.id, actionStatus, actionNotes);
    
    // update local state
    const updatedReport = { ...selectedReport, status: actionStatus, officerNotes: actionNotes };
    setSelectedReport(updatedReport);
    setReports(getReports());
    setShowActionModal(false);
  };

  const filteredReports = filterStatus === 'All Reports' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  return (
    <div className="flex-1 flex overflow-hidden bg-stone-50">
      
      {/* Sidebar List */}
      <div className="w-[380px] border-r border-stone-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <h2 className="font-bold text-stone-900 uppercase tracking-wide text-xs">Community Reports</h2>
          <p className="text-[11px] text-stone-500 mt-1">Community-submitted land-change reports for official review.</p>
        </div>
        
        {/* Simple Filters visually requested by user */}
        <div className="px-4 py-2.5 border-b border-stone-200 bg-white flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] font-medium text-stone-800 bg-stone-50 border border-stone-200 rounded px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All Reports">All Reports</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Inspection Required">Inspection Required</option>
            <option value="Action Taken">Action Taken</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredReports.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="text-stone-300 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-stone-700">No reports found</p>
              <p className="text-[11px] text-stone-500 mt-1">Try selecting a different status filter.</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div 
                key={report.id} 
                onClick={() => handleSelectReport(report)}
                className={`p-4 border-b border-stone-100 cursor-pointer transition-colors ${selectedReport?.id === report.id ? 'bg-blue-50' : 'hover:bg-stone-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono font-bold text-stone-700">{report.id}</span>
                  <span className="text-[9px] font-bold bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-stone-600 uppercase tracking-wider">
                    {report.status}
                  </span>
                </div>
                <div className="font-bold text-[13px] text-stone-900 mt-2">{report.type}</div>
                <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">{report.locationDetails}</div>
                <div className="text-[10px] text-stone-400 mt-2 font-mono">
                  {new Date(report.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {selectedReport ? (
          <>
            {/* Map Area */}
            <div className="flex-1 relative bg-stone-200 z-0">
              <MapContainer
                center={[selectedReport.lat, selectedReport.lng]}
                zoom={15}
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
                <Marker position={[selectedReport.lat, selectedReport.lng]} />
                <MapController center={[selectedReport.lat, selectedReport.lng]} />
              </MapContainer>
            </div>

            {/* Bottom Overlay Detail Panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-white border border-stone-200 rounded-lg shadow-lg z-10 overflow-hidden flex flex-col md:flex-row max-h-[300px]">
              <div className="p-5 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-3">
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Community Report</div>
                    <h2 className="text-xl font-bold text-stone-900">{selectedReport.type}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-stone-700">{selectedReport.id}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{new Date(selectedReport.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Location</h3>
                    <div className="text-[12px] text-stone-800 font-medium">{selectedReport.locationDetails}</div>
                    <div className="text-[11px] text-stone-500 font-mono mt-1">{selectedReport.lat.toFixed(6)}, {selectedReport.lng.toFixed(6)}</div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Citizen Observation</h3>
                    <div className="text-[12px] text-stone-800 italic bg-stone-50 p-2 border border-stone-100 rounded">
                      "{selectedReport.details || 'No additional details provided by citizen.'}"
                    </div>
                  </div>
                </div>
                
                {selectedReport.officerNotes && (
                   <div className="mt-4 pt-3 border-t border-stone-100">
                     <h3 className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Latest Official Note</h3>
                     <div className="text-[12px] text-stone-800">{selectedReport.officerNotes}</div>
                   </div>
                )}
              </div>
              
              <div className="bg-stone-50 border-l border-stone-200 p-5 md:w-[220px] shrink-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Current Status</h3>
                  <div className="font-bold text-[13px] text-stone-900 mb-6">{selectedReport.status}</div>
                </div>
                
                <button 
                  onClick={handleOpenAction}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-semibold py-2.5 rounded transition-colors"
                >
                  Take Action
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100/50">
            <div className="text-4xl mb-3 opacity-20">🗺️</div>
            <div className="text-sm font-medium">Select a report from the list to view details</div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl border border-stone-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-stone-900">Official Action</h3>
                <div className="text-[11px] text-stone-500 font-mono mt-0.5">{selectedReport.id}</div>
              </div>
              <button onClick={() => setShowActionModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            
            <form onSubmit={handleSaveAction} className="p-5">
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">Status</label>
                <div className="space-y-2">
                  {['New', 'Under Review', 'Verified', 'Inspection Required', 'Action Taken', 'Closed'].map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value={status} 
                        checked={actionStatus === status}
                        onChange={(e) => setActionStatus(e.target.value)}
                        className="text-blue-600"
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">Officer Notes</label>
                <textarea 
                  rows="3"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter official notes. This will be visible to the citizen."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowActionModal(false)} className="px-4 py-2 text-[12px] font-medium text-stone-600 hover:bg-stone-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-[12px] font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded">
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
