import React, { useState } from 'react';
import { submitReport } from '../../services/store';
import { MapPin, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  'Suspected Unauthorized Construction',
  'Land-Use Change',
  'Encroachment',
  'Green Cover Loss',
  'Waterbody / Drainage Change',
  'Other',
];

export default function ReportForm({ position, onCancel }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const report = submitReport({
      type: category,
      details,
      locationDetails: locationDetails || `${position.lat.toFixed(5)}°N, ${position.lng.toFixed(5)}°E`,
      lat: position.lat,
      lng: position.lng,
    });
    setSubmitted(report);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-stone-50 p-8">
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h2 className="text-base font-bold text-stone-900 mb-1">Report Submitted</h2>
          <p className="text-sm text-stone-500 mb-5">Your report has been received for official review.</p>

          <div className="bg-stone-50 border border-stone-200 rounded p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500">Report ID</span>
              <span className="text-[12px] font-mono font-bold text-stone-900">{submitted.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500">Status</span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{submitted.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500">Category</span>
              <span className="text-[11px] text-stone-800">{submitted.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500">Location</span>
              <span className="text-[11px] font-mono text-stone-800">{submitted.lat.toFixed(5)}, {submitted.lng.toFixed(5)}</span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Submit Land-Change Report</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
              <MapPin size={11} className="text-blue-600" />
              <span className="font-mono">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-200 rounded text-sm bg-white text-stone-900 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">Location / Area Description</label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. Dwarka Zone 3, near Sector 14"
                className="w-full px-3 py-2 border border-stone-200 rounded text-sm bg-white text-stone-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Observation Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what you observed. Include any relevant details about the suspected change."
                required
                className="w-full px-3 py-2 border border-stone-200 rounded text-sm bg-white text-stone-900 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded text-sm font-medium transition-colors"
              >
                Back to Map
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded text-sm transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
