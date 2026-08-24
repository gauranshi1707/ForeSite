import React, { useState, useRef, useEffect } from 'react';
import { getRole, setRole } from '../services/store';
import { ChevronDown, Check, LogOut, User, Users } from 'lucide-react';

export default function ProfileSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const role = getRole();
  const isOfficial = role === 'official';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = (newRole) => {
    if (role === newRole) return;
    setRole(newRole);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setRole(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border rounded-sm px-2 py-1 transition-colors ${
          isOpen ? 'bg-stone-100 border-stone-300' : 'bg-transparent border-transparent hover:bg-stone-50 hover:border-stone-200'
        }`}
        title="Account"
      >
        <div className="w-6 h-6 rounded bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          {isOfficial ? 'SV' : 'C'}
        </div>
        <div className="hidden sm:block text-left mr-1">
          <div className="font-semibold text-stone-800 text-[11px] leading-none mb-0.5">
            {isOfficial ? 'S. Verma' : 'Citizen'}
          </div>
          <div className="text-[9px] text-stone-500 uppercase tracking-wider leading-none">
            {isOfficial ? 'District Magistrate' : 'Community User'}
          </div>
        </div>
        <ChevronDown size={12} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-stone-200 shadow-sm rounded-sm z-[9999] text-[11px]">
          {/* Header */}
          <div className="px-3 py-2.5 bg-stone-50 border-b border-stone-200">
            <div className="font-bold text-stone-900 text-[12px]">{isOfficial ? 'S. Verma' : 'Citizen'}</div>
            <div className="text-stone-500 mt-0.5">{isOfficial ? 'District Magistrate' : 'Community User'}</div>
          </div>

          <div className="py-1">
            <div className="px-3 py-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-1">
              Switch role
            </div>
            
            <button
              onClick={() => handleSwitchRole('citizen')}
              disabled={!isOfficial}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                !isOfficial ? 'bg-blue-50/50 cursor-default' : 'hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <div className="w-4 flex justify-center shrink-0">
                {!isOfficial ? <Check size={12} className="text-blue-700" /> : <Users size={12} className="text-stone-400" />}
              </div>
              <span className={!isOfficial ? 'font-semibold text-blue-900' : 'text-stone-700'}>
                Citizen / Community User
              </span>
            </button>
            
            <button
              onClick={() => handleSwitchRole('official')}
              disabled={isOfficial}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                isOfficial ? 'bg-blue-50/50 cursor-default' : 'hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <div className="w-4 flex justify-center shrink-0">
                {isOfficial ? <Check size={12} className="text-blue-700" /> : <User size={12} className="text-stone-400" />}
              </div>
              <span className={isOfficial ? 'font-semibold text-blue-900' : 'text-stone-700'}>
                District Official
              </span>
            </button>
          </div>

          <div className="border-t border-stone-200 py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 text-stone-700"
            >
              <div className="w-4 flex justify-center shrink-0">
                <LogOut size={12} className="text-stone-400" />
              </div>
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
