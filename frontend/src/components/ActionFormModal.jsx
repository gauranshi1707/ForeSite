import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const ACTION_STATUSES = [
  { value: 'Under Review',          label: 'Mark Under Review',           desc: 'Assign case for satellite evidence audit' },
  { value: 'Inspection Scheduled',  label: 'Schedule Field Inspection',   desc: 'Dispatch field officer for ground survey' },
  { value: 'Notice Issued',         label: 'Issue Official Notice',        desc: 'Serve formal legal stop-work or eviction notice' },
  { value: 'Resolved',              label: 'Mark Resolved',                desc: 'Site verified cleared or structure demolished' },
  { value: 'Re-check Required',     label: 'Flag for Re-check',           desc: 'Schedule post-notice satellite re-observation' },
];

export default function ActionFormModal({ parcel, onClose, onSubmitAction }) {
  const [status, setStatus] = useState(parcel.status || 'Under Review');
  const [notes, setNotes] = useState('');
  const [officialId, setOfficialId] = useState('S. Verma, District Magistrate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitAction(parcel.id, status, notes, officialId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-bold text-stone-900 text-[15px]">Record Official Action</h3>
            <p className="text-[11px] text-stone-500 mt-0.5 font-mono">{parcel.parcel_id} — {parcel.district}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* HITL note */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[11px] text-blue-700">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            This action will be recorded in the parcel's case history and persisted.
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-700 mb-2">
              Action / New Status
            </label>
            <div className="space-y-2">
              {ACTION_STATUSES.map(st => (
                <label
                  key={st.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    status === st.value
                      ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionStatus"
                    value={st.value}
                    checked={status === st.value}
                    onChange={e => setStatus(e.target.value)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <div className={`text-[12px] font-semibold ${status === st.value ? 'text-blue-800' : 'text-stone-700'}`}>
                      {st.label}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{st.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Authorizing officer */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-700 mb-1">
              Authorizing Officer
            </label>
            <input
              type="text"
              value={officialId}
              onChange={e => setOfficialId(e.target.value)}
              className="w-full border border-stone-200 rounded-md px-3 py-2 text-[12px] text-stone-800 bg-white outline-none focus:border-blue-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-stone-700 mb-1">
              Inspection Notes / Legal Reference
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Notice Ref #DEL/SWD/2026/0891 served. Field survey confirmed 920 m² built-up on public park land."
              className="w-full border border-stone-200 rounded-md px-3 py-2 text-[12px] text-stone-800 bg-white outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[12px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-action-btn"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-semibold px-5 py-2 rounded-md transition-colors disabled:opacity-60"
            >
              <Send size={13} />
              {isSubmitting ? 'Recording…' : 'Record & Persist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
