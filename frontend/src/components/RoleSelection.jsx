import React, { useState } from 'react';
import { setRole, setCitizen } from '../services/store';
import { Globe } from 'lucide-react';

export default function RoleSelection({ onSelect }) {
  const [citizenName, setCitizenName] = useState('');

  const handleOfficial = (e) => {
    e.preventDefault();
    setRole('official');
    onSelect('official');
  };

  const handleCitizen = (e) => {
    e.preventDefault();
    setRole('citizen');
    setCitizen({ name: citizenName || 'Citizen' });
    onSelect('citizen');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Logo */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-700 shadow-sm mb-4">
            <Globe className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight leading-none">
              ForeSite
            </h1>
            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none">
              SIH 2026
            </span>
          </div>
          <p className="text-sm text-stone-500">
            Predictive Land-Change Intelligence
          </p>
        </div>

        {/* Auth container */}
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-base font-semibold text-stone-800">Sign in to ForeSite</h2>
          </div>

          {/* Official */}
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden mb-5">
            <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-100">
              <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">District Official</h3>
            </div>
            <form onSubmit={handleOfficial} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">Official ID</label>
                <input
                  type="text"
                  defaultValue="DM-7489"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded text-sm bg-white text-stone-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">Password</label>
                <input
                  type="password"
                  defaultValue="password"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded text-sm bg-white text-stone-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded text-sm transition-colors">
                Enter Dashboard
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative px-3 bg-stone-50 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">or</div>
          </div>

          {/* Citizen */}
          <button
            onClick={handleCitizen}
            className="w-full flex flex-col items-center p-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-sm transition-colors text-center"
          >
            <span className="text-sm font-semibold text-stone-800">Continue as Citizen</span>
            <span className="text-[11px] text-stone-400 mt-1">Community Land Watch</span>
          </button>
        </div>
      </div>

      <footer className="text-center py-5 text-[10px] text-stone-400">
        Ministry of Housing & Urban Affairs / Land Revenue Dept
      </footer>
    </div>
  );
}
