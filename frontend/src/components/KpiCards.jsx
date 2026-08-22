import React from 'react';
import { Layers, AlertTriangle, Flame, RotateCcw } from 'lucide-react';

export default function KpiCards({ stats, selectedStatus, onSelectStatusFilter }) {
  const cards = [
    {
      id: 'All',
      title: 'Total Parcels Monitored',
      value: stats?.total_parcels ? stats.total_parcels.toLocaleString() : '1,000',
      subtitle: 'Verified Land Parcels',
      icon: Layers,
      color: 'cyan',
      borderColor: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-950/80 text-cyan-400',
      glow: 'shadow-cyan-500/10'
    },
    {
      id: 'New Alert',
      title: 'Active Alerts',
      value: stats?.active_alerts ? stats.active_alerts.toLocaleString() : '128',
      subtitle: 'Land-Use Changes Detected',
      icon: AlertTriangle,
      color: 'amber',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-950/80 text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    {
      id: 'High Priority',
      title: 'High Priority',
      value: stats?.high_priority ? stats.high_priority.toLocaleString() : '12',
      subtitle: 'Urgency Score ≥ 75/100',
      icon: Flame,
      color: 'rose',
      borderColor: 'border-rose-500/40',
      badgeBg: 'bg-rose-950/80 text-rose-400',
      glow: 'shadow-rose-500/20'
    },
    {
      id: 'Re-check Required',
      title: 'Requiring Re-check',
      value: stats?.requiring_recheck ? stats.requiring_recheck.toLocaleString() : '7',
      subtitle: 'Post-Notice Continued Growth',
      icon: RotateCcw,
      color: 'purple',
      borderColor: 'border-purple-500/40',
      badgeBg: 'bg-purple-950/80 text-purple-300',
      glow: 'shadow-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatusFilter(card.id)}
            className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-200 hover:translate-y-[-2px] ${card.borderColor} ${card.glow} ${
              isSelected ? 'ring-2 ring-cyan-400 bg-slate-800/90' : 'hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {card.subtitle}
              </span>
            </div>

            <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  card.color === 'rose'
                    ? 'bg-rose-500'
                    : card.color === 'amber'
                    ? 'bg-amber-500'
                    : card.color === 'purple'
                    ? 'bg-purple-500'
                    : 'bg-cyan-500'
                }`}
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
