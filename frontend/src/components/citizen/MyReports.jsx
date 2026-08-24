import React, { useState, useEffect } from 'react';
import { getReports } from '../../services/store';
import { ClipboardList } from 'lucide-react';

function statusColor(status) {
  switch (status) {
    case 'New': return 'bg-stone-100 text-stone-600 border-stone-200';
    case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Verified': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Inspection Required': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Action Taken': return 'bg-green-50 text-green-700 border-green-200';
    case 'Closed': return 'bg-stone-100 text-stone-500 border-stone-200';
    default: return 'bg-stone-100 text-stone-600 border-stone-200';
  }
}

export default function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getReports());
  }, []);

  if (reports.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-stone-50 text-stone-400 p-8">
        <ClipboardList size={36} className="opacity-20 mb-3" />
        <p className="text-sm font-medium">No reports submitted yet.</p>
        <p className="text-xs mt-1">Use "Report Land Change" to submit your first report.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-stone-50 p-4">
      <div className="max-w-xl mx-auto space-y-3">
        <div className="pb-2">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider">My Reports ({reports.length})</h2>
        </div>
        {reports.map(report => (
          <div key={report.id} className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-700">{report.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="font-semibold text-[13px] text-stone-900">{report.type}</div>
              <div className="text-[11px] text-stone-500">{report.locationDetails}</div>
              <div className="text-[11px] text-stone-400 font-mono">
                {new Date(report.date).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>

              {report.details && (
                <div className="text-[11px] text-stone-600 italic bg-stone-50 border border-stone-100 rounded px-3 py-2">
                  "{report.details}"
                </div>
              )}

              {report.officerNotes ? (
                <div className="mt-1 pt-2 border-t border-stone-100">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Officer Update</div>
                  <div className="text-[11px] text-stone-800">{report.officerNotes}</div>
                </div>
              ) : (
                <div className="mt-1 pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                  Awaiting official review.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
