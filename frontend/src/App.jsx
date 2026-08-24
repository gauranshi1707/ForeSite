import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import OverviewTab from './components/OverviewTab';
import SatelliteAnalysisTab from './components/SatelliteAnalysisTab';
import PriorityAlertsTab from './components/PriorityAlertsTab';
import ActivityTab from './components/ActivityTab';
import SystemPipelineModal from './components/SystemPipelineModal';

import {
  fetchStatistics,
  fetchParcels,
  fetchPriorityAlerts,
  fetchParcelById,
  recordParcelAction,
  triggerPostNoticeRecheck,
  checkHealth
} from './services/api';

import RoleSelection from './components/RoleSelection';
import CitizenApp from './components/citizen/CitizenApp';
import CommunityReportsTab from './components/CommunityReportsTab';
import { getRole } from './services/store';

function OfficialApp({ onLogout }) {
  // ── App state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Data loading ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await checkHealth();
      const [statsRes, parcelsRes, alertsRes] = await Promise.all([
        fetchStatistics(),
        fetchParcels(),
        fetchPriorityAlerts(),
      ]);
      setStats(statsRes);
      setParcels(parcelsRes);
      setAlerts(alertsRes);

      // Re-sync selected parcel from fresh data, or default to PL-4587
      if (selectedParcel) {
        const updated =
          parcelsRes.find(p => p.id === selectedParcel.id) ||
          alertsRes.find(p => p.id === selectedParcel.id);
        if (updated) setSelectedParcel(updated);
      } else {
        const defaultParcel = parcelsRes.find(p => p.parcel_id === 'PL-4587');
        if (defaultParcel) setSelectedParcel(defaultParcel);
      }
    } catch (err) {
      console.error('ForeSite: Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedParcel?.id]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ────────────────────────────────────────────────
  const handleRecordAction = async (parcelId, action, notes, officialId) => {
    try {
      const updated = await recordParcelAction(parcelId, action, notes, officialId);
      setSelectedParcel(updated);
      await loadData();
    } catch (err) {
      alert(`Error recording action: ${err.message}`);
    }
  };

  const handleTriggerRecheck = async (parcelId, year2027Area = 1150.0) => {
    try {
      const updated = await triggerPostNoticeRecheck(parcelId, year2027Area);
      setSelectedParcel(updated);
      setSelectedYear(2027);
      await loadData();
      return updated;
    } catch (err) {
      alert(`Error triggering re-check: ${err.message}`);
      return null;
    }
  };

  const handleSelectParcel = (parcel) => {
    setSelectedParcel(parcel);
  };

  // When user clicks "View Satellite Analysis" from side panel:
  const handleOpenSatellite = () => {
    setActiveTab('satellite');
  };

  // When clicking an alert/activity item → navigate to overview + select parcel
  const handleNavigateToOverview = () => {
    setActiveTab('overview');
  };

  // ── Location context (from selected parcel or default) ─────
  const locationContext = selectedParcel
    ? {
        state: selectedParcel.state,
        district: selectedParcel.district,
        ward: selectedParcel.ward,
        category: selectedParcel.land_category,
      }
    : {
        state: 'Delhi NCR',
        district: 'South West Delhi',
        ward: 'Dwarka Zone 3',
        category: null,
      };

  // ── Satellite tab: which parcel to show by default ─────────
  const satelliteInitialParcel =
    selectedParcel ||
    parcels.find(p => p.parcel_id === 'PL-4587') ||
    null;

  // ── Loading / error states ─────────────────────────────────
  if (loading && parcels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-stone-500 font-medium">Loading ForeSite…</p>
          <p className="text-[11px] text-stone-400 mt-1">Connecting to monitoring backend</p>
        </div>
      </div>
    );
  }

  if (error && parcels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 font-bold text-lg">!</span>
          </div>
          <h2 className="font-bold text-stone-900 mb-2">Backend Connection Error</h2>
          <p className="text-[12px] text-stone-500 mb-4">
            Could not connect to the ForeSite API. Make sure the Python backend is running on port 8000.
          </p>
          <code className="text-[11px] bg-stone-100 text-stone-700 px-3 py-1.5 rounded border border-stone-200 block">
            cd backend && python main.py
          </code>
          <button onClick={loadData} className="mt-4 text-[12px] text-blue-600 hover:underline">
            Retry connection →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header with tab nav */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
        locationContext={locationContext}
        onOpenPipeline={() => setPipelineModalOpen(true)}
      />

      {/* Tab content: relative z-0 creates a contained stacking context for any maps inside */}
      <div className="flex-1 overflow-hidden flex flex-col tab-transition relative z-0" key={activeTab}>

        {activeTab === 'overview' && (
          <OverviewTab
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={handleSelectParcel}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            stats={stats}
            onRecordAction={handleRecordAction}
            onTriggerRecheck={handleTriggerRecheck}
            onOpenSatellite={handleOpenSatellite}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteAnalysisTab
            parcels={parcels}
            selectedParcelId={selectedParcel?.parcel_id}
            onSelectParcel={handleSelectParcel}
            onRecordAction={handleRecordAction}
            onTriggerRecheck={handleTriggerRecheck}
          />
        )}

        {activeTab === 'alerts' && (
          <PriorityAlertsTab
            alerts={alerts}
            onSelectParcel={handleSelectParcel}
            onNavigateToOverview={handleNavigateToOverview}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab
            parcels={parcels}
            onSelectParcel={handleSelectParcel}
            onNavigateToOverview={handleNavigateToOverview}
          />
        )}

        {activeTab === 'reports' && (
          <CommunityReportsTab />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 px-5 py-2 flex items-center justify-between text-[10px] text-stone-400">
        <span>ForeSite © 2026 Smart India Hackathon · Ministry of Housing & Urban Affairs / Land Revenue Dept</span>
        <div className="flex items-center gap-3">
          <span className="bg-stone-100 border border-stone-200 text-stone-500 px-2 py-0.5 rounded">
            Prototype Synthetic EO Dataset
          </span>
          <span>Sentinel-2 / Earth Engine architecture ready</span>
        </div>
      </footer>

      {pipelineModalOpen && (
        <SystemPipelineModal onClose={() => setPipelineModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  const [role, setRoleState] = useState(getRole());

  useEffect(() => {
    const handleStorageChange = () => {
      setRoleState(getRole());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('foresite_role_change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('foresite_role_change', handleStorageChange);
    };
  }, []);

  if (!role) {
    return <RoleSelection onSelect={setRoleState} />;
  }

  if (role === 'citizen') {
    return <CitizenApp />;
  }

  return <OfficialApp />;
}

