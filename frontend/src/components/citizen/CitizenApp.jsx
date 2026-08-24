import React from 'react';
import ProfileSwitcher from '../ProfileSwitcher';
import { MapPin, LayoutList } from 'lucide-react';
import CitizenMap from './CitizenMap';
import MyReports from './MyReports';

export default function CitizenApp() {
  const [activeTab, setActiveTab] = React.useState('report');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50">
      <header className="bg-white border-b border-stone-200 flex items-center justify-between px-4 py-2.5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-700">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight leading-none">ForeSite</h1>
              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none">SIH 2026</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-none mt-0.5">Community Land Watch</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProfileSwitcher />
        </div>
      </header>

      <nav className="flex px-4 border-b border-stone-200 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeTab === 'report'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin size={13} />
          Report Land Change
        </button>
        <button
          onClick={() => setActiveTab('myreports')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeTab === 'myreports'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutList size={13} />
          My Reports
        </button>
      </nav>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'report' && <CitizenMap />}
        {activeTab === 'myreports' && <MyReports />}
      </div>
    </div>
  );
}
