import React from 'react';
import { getRole, setRole } from '../services/store';
import { ChevronDown } from 'lucide-react';

export default function ProfileSwitcher() {
  const role = getRole();
  const isOfficial = role === 'official';

  const handleSwitch = () => {
    setRole(isOfficial ? 'citizen' : 'official');
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 text-[11px] hover:bg-stone-100 transition-colors"
      title="Switch role"
    >
      <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[9px] font-bold">
        {isOfficial ? 'SV' : 'C'}
      </div>
      <div className="hidden sm:block text-left">
        <div className="font-semibold text-stone-700 leading-none">
          {isOfficial ? 'S. Verma' : 'Citizen'}
        </div>
        <div className="text-[9px] text-stone-400 leading-none mt-0.5">
          {isOfficial ? 'District Magistrate' : 'Community Reporter'}
        </div>
      </div>
      <ChevronDown size={10} className="text-stone-400 ml-0.5" />
    </button>
  );
}
