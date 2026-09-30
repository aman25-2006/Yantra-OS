'use client';

import React from 'react';
import { 
  Activity, 
  Bell, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Flame
} from 'lucide-react';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

interface HeaderProps {
  activeAlertCount: number;
  onOpenAlerts: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export function Header({ 
  activeAlertCount, 
  onOpenAlerts, 
  onToggleCopilot, 
  isCopilotOpen 
}: HeaderProps) {
  const [injecting, setInjecting] = React.useState(false);

  const handleSimulateFault = () => {
    setInjecting(true);
    // Inject fault into Machine 1 (CNC-01) to demonstrate real-time alert trigger
    telemetrySimulator.injectFault('11111111-1111-1111-1111-111111111111', 'VIBRATION_SPIKE');
    setTimeout(() => setInjecting(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-industrial-800 bg-industrial-950/90 px-6 backdrop-blur-md">
      {/* Brand & Plant Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Cpu className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Yantra<span className="text-cyan-400">OS</span></span>
              <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300 border border-cyan-800/60">
                IIoT v2.4
              </span>
            </div>
            <p className="text-xs text-industrial-400">Predictive Shopfloor Intelligence</p>
          </div>
        </div>

        <div className="hidden h-7 w-[1px] bg-industrial-800 md:block" />

        {/* Facility Selector */}
        <div className="hidden items-center gap-2 text-xs md:flex">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-industrial-300 font-medium">Pune Precision Works (Bay 1 & 2)</span>
          <span className="rounded-full bg-industrial-850 px-2 py-0.5 text-[11px] font-mono text-industrial-400 border border-industrial-700/50">
            Shift 2 (14:00 - 22:00)
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Realtime Stream Pulse Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-industrial-800 bg-industrial-900/80 px-3 py-1.5 text-xs text-industrial-300">
          <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400">10Hz Telemetry Stream</span>
        </div>

        {/* Fault Injection Button for Testing */}
        <button
          onClick={handleSimulateFault}
          disabled={injecting}
          title="Inject a vibration anomaly into CNC-01 to demonstrate real-time alert trigger"
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95"
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>{injecting ? 'Injecting Fault...' : 'Simulate Fault'}</span>
        </button>

        {/* Alert Bell Button */}
        <button
          onClick={onOpenAlerts}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-industrial-800 bg-industrial-900 text-industrial-300 transition-colors hover:border-industrial-700 hover:text-white"
          title="Anomaly Alert Center"
        >
          <Bell className="h-4 w-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Industrial Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all ${
            isCopilotOpen
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>AI Copilot</span>
        </button>
      </div>
    </header>
  );
}
