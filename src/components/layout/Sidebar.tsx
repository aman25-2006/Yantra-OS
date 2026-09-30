'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  LineChart, 
  AlertOctagon, 
  Bot, 
  Wrench, 
  ShieldCheck, 
  Radio
} from 'lucide-react';

export type ActiveTab = 'overview' | 'telemetry' | 'alerts' | 'copilot';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  anomalyCount: number;
}

export function Sidebar({ activeTab, setActiveTab, anomalyCount }: SidebarProps) {
  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Factory Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'telemetry' as ActiveTab,
      label: 'Machine Telemetry',
      icon: LineChart,
      badge: 'Live',
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Anomaly Center',
      icon: AlertOctagon,
      badge: anomalyCount > 0 ? anomalyCount.toString() : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'copilot' as ActiveTab,
      label: 'Industrial Copilot',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
  ];

  return (
    <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-industrial-800 bg-industrial-950/60 p-4">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-industrial-500">
            Operations Command
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-industrial-800 text-white shadow-sm border border-industrial-700'
                      : 'text-industrial-400 hover:bg-industrial-900 hover:text-industrial-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-industrial-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                        item.badgeColor || 'bg-industrial-800 text-industrial-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* IIoT Protocol & Standards Info */}
        <div className="rounded-xl border border-industrial-800 bg-industrial-900/60 p-3.5 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-industrial-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Edge Protocols</span>
          </div>
          <div className="mt-2.5 space-y-1.5 font-mono text-[11px] text-industrial-400">
            <div className="flex justify-between">
              <span>OPC UA / Modbus:</span>
              <span className="text-emerald-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>MQTT Broker:</span>
              <span className="text-emerald-400">12ms Ping</span>
            </div>
            <div className="flex justify-between">
              <span>Standard:</span>
              <span className="text-cyan-300">ISO 10816-3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Edge Gateway Status */}
      <div className="rounded-xl border border-industrial-800/80 bg-industrial-900/40 p-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-industrial-300">Edge Gateway</span>
          </div>
          <span className="font-mono text-[10px] text-industrial-500">v1.9.4</span>
        </div>
        <p className="mt-1 text-[11px] text-industrial-400">
          Continuous downsampling buffer: 60s
        </p>
      </div>
    </aside>
  );
}
