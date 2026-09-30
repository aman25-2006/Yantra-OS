'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Bell, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  ChevronDown,
  Building2,
  Clock,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  X
} from 'lucide-react';
import { telemetrySimulator } from '@/lib/telemetry-simulator';
import { Alert } from '@/types/industrial';

interface HeaderProps {
  activeAlertCount: number;
  onOpenAlerts: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  selectedFacility: string;
  onSelectFacility: (fac: string) => void;
}

export function Header({ 
  activeAlertCount, 
  onOpenAlerts, 
  onToggleCopilot, 
  isCopilotOpen,
  selectedFacility,
  onSelectFacility
}: HeaderProps) {
  const [injecting, setInjecting] = useState<string | null>(null);
  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showFaultMenu, setShowFaultMenu] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  const facilityMenuRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);
  const faultMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentAlerts(telemetrySimulator.getAlerts());
    const unsub = telemetrySimulator.onAlerts((alerts) => {
      setRecentAlerts(alerts);
    });
    return () => unsub();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (facilityMenuRef.current && !facilityMenuRef.current.contains(e.target as Node)) {
        setShowFacilityMenu(false);
      }
      if (alertMenuRef.current && !alertMenuRef.current.contains(e.target as Node)) {
        setShowAlertMenu(false);
      }
      if (faultMenuRef.current && !faultMenuRef.current.contains(e.target as Node)) {
        setShowFaultMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInjectFault = (machineId: string, faultType: 'VIBRATION_SPIKE' | 'THERMAL_RUNAWAY' | 'PRESSURE_DROP', label: string) => {
    setInjecting(label);
    telemetrySimulator.injectFault(machineId, faultType);
    setShowFaultMenu(false);
    setTimeout(() => setInjecting(null), 1000);
  };

  const handleResetFleet = () => {
    const machines = telemetrySimulator.getMachines();
    machines.forEach(m => telemetrySimulator.resetMachine(m.id));
    setShowFaultMenu(false);
  };

  const handleAcknowledgeAlert = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    telemetrySimulator.acknowledgeAlert(alertId);
  };

  const facilities = [
    'Pune Precision Works (Bay 1 & 2)',
    'Rajkot CNC Tooling Unit (Plant 2)',
    'Bengaluru Aerospace Machine Shop',
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-industrial-800 bg-industrial-950/90 px-4 md:px-6 backdrop-blur-md">
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

          {/* Interactive Facility Selector */}
          <div className="relative hidden md:block" ref={facilityMenuRef}>
            <button
              onClick={() => setShowFacilityMenu(!showFacilityMenu)}
              className="flex items-center gap-2 rounded-lg border border-industrial-800 bg-industrial-900/60 px-2.5 py-1.5 text-xs text-industrial-200 transition-colors hover:border-industrial-700 hover:text-white"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{selectedFacility}</span>
              <ChevronDown className="h-3.5 w-3.5 text-industrial-400" />
            </button>

            {showFacilityMenu && (
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-industrial-800 bg-industrial-900 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-industrial-400">Select Production Bay</div>
                {facilities.map((fac) => (
                  <button
                    key={fac}
                    onClick={() => {
                      onSelectFacility(fac);
                      setShowFacilityMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                      selectedFacility === fac
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'
                    }`}
                  >
                    <span>{fac}</span>
                    {selectedFacility === fac && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Shift Roster Button */}
          <button
            onClick={() => setShowShiftModal(true)}
            className="hidden items-center gap-1.5 rounded-full border border-industrial-700/60 bg-industrial-850 px-2.5 py-1 text-[11px] font-mono text-industrial-300 transition-colors hover:border-cyan-500 hover:text-cyan-300 lg:flex"
            title="View Shift 2 Team & Operations Roster"
          >
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>Shift 2 (14:00 - 22:00)</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Realtime Stream Pulse Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-lg border border-industrial-800 bg-industrial-900/80 px-3 py-1.5 text-xs text-industrial-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-400">10Hz Telemetry Stream</span>
          </div>

          {/* Interactive Fault Injection Dropdown Menu */}
          <div className="relative" ref={faultMenuRef}>
            <button
              onClick={() => setShowFaultMenu(!showFaultMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/25 active:scale-95 shadow-sm"
              title="Inject machine anomalies to test real-time detection & alert triggers"
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>{injecting ? `Injecting...` : 'Simulate Fault'}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showFaultMenu && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-industrial-800 bg-industrial-900 p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-industrial-400">Choose Fault Scenario</div>
                <button
                  onClick={() => handleInjectFault('11111111-1111-1111-1111-111111111111', 'VIBRATION_SPIKE', 'CNC-01')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-industrial-200 hover:bg-industrial-800 hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-rose-500 mt-1" />
                  <div>
                    <div className="font-bold text-white">CNC-01: Vibration Spike</div>
                    <div className="text-[10px] text-industrial-400">Bearing race spall breach &gt;7.1 mm/s</div>
                  </div>
                </button>

                <button
                  onClick={() => handleInjectFault('22222222-2222-2222-2222-222222222222', 'THERMAL_RUNAWAY', 'INJ-02')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-industrial-200 hover:bg-industrial-800 hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1" />
                  <div>
                    <div className="font-bold text-white">INJ-02: Thermal Runaway</div>
                    <div className="text-[10px] text-industrial-400">Heat exchanger failure &gt;80°C</div>
                  </div>
                </button>

                <button
                  onClick={() => handleInjectFault('33333333-3333-3333-3333-333333333333', 'PRESSURE_DROP', 'HYD-03')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs text-industrial-200 hover:bg-industrial-800 hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-sky-500 mt-1" />
                  <div>
                    <div className="font-bold text-white">HYD-03: Pressure Loss</div>
                    <div className="text-[10px] text-industrial-400">Hydraulic line breach &lt;220 Bar</div>
                  </div>
                </button>

                <div className="my-1 border-t border-industrial-800" />

                <button
                  onClick={handleResetFleet}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs text-emerald-400 hover:bg-emerald-950/40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="font-semibold">Reset Fleet to Nominal (Healthy)</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Alert Bell with Dropdown Menu */}
          <div className="relative" ref={alertMenuRef}>
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-industrial-800 bg-industrial-900 text-industrial-300 transition-colors hover:border-industrial-700 hover:text-white"
              title="View Active Machine Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-industrial-800 bg-industrial-900 p-3 shadow-2xl backdrop-blur-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
                  <span className="text-xs font-bold text-white">Active Shop Floor Alerts ({activeAlertCount})</span>
                  <button
                    onClick={() => {
                      setShowAlertMenu(false);
                      onOpenAlerts();
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {recentAlerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-industrial-800 bg-industrial-950 p-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-industrial-400 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="mt-1 font-semibold text-white line-clamp-1">{alert.title}</div>
                      <div className="mt-1 text-[11px] text-industrial-300 line-clamp-2">{alert.recommendedAction}</div>
                      
                      {alert.status === 'NEW' && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={(e) => handleAcknowledgeAlert(e, alert.id)}
                            className="rounded bg-industrial-800 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:bg-industrial-700"
                          >
                            Acknowledge
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </header>

      {/* Shift Details Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-industrial-800 bg-industrial-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Shop Floor Shift Roster</h3>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="rounded-lg p-1 text-industrial-400 hover:bg-industrial-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3">
                <div className="text-industrial-400">Current Shift:</div>
                <div className="text-sm font-bold text-white mt-0.5">Shift 2 — Afternoon Operations (14:00 - 22:00)</div>
                <div className="text-[11px] text-cyan-400 font-mono mt-1">Status: Running | 4 Connected Work Centers</div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-industrial-400">Personnel on Duty:</div>
                <div className="flex items-center justify-between rounded-lg border border-industrial-800 bg-industrial-950/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Ramesh Sharma</div>
                      <div className="text-[10px] text-industrial-400">Lead Maintenance Fitter</div>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">On Floor</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-industrial-800 bg-industrial-950/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Anil Patil</div>
                      <div className="text-[10px] text-industrial-400">Duty Electrical Engineer</div>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">On Floor</span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Handover Action Item</span>
                </div>
                <div className="mt-1 text-[11px] text-amber-200/90 leading-relaxed">
                  Hydraulic Press-03 drive motor bearing is under active ISO Zone D observation. Do not exceed 90% load without checking vibration RMS.
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowShiftModal(false)}
                className="rounded-lg bg-industrial-800 px-4 py-2 text-xs font-medium text-white hover:bg-industrial-700"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
