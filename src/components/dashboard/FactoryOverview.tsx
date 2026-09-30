'use client';

import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  Gauge, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Waves,
  ArrowUpRight,
  Bot,
  RotateCcw,
  Sparkles,
  X,
  TrendingUp,
  Info
} from 'lucide-react';
import { Machine, Anomaly, FactoryOverviewStats } from '@/types/industrial';
import { getStatusBadgeStyle, formatMetric, getIsoVibrationZone } from '@/lib/utils';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

interface FactoryOverviewProps {
  machines: Machine[];
  anomalies: Anomaly[];
  selectedMachineId: string;
  onSelectMachine: (machineId: string) => void;
  onViewTelemetryTab: () => void;
  onAskCopilot?: (query: string) => void;
}

export function FactoryOverview({
  machines,
  anomalies,
  selectedMachineId,
  onSelectMachine,
  onViewTelemetryTab,
  onAskCopilot,
}: FactoryOverviewProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'ATTENTION' | 'RUNNING'>('ALL');
  const [showOeeModal, setShowOeeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Aggregate Factory Metrics
  const totalMachines = machines.length;
  const runningCount = machines.filter(m => m.status === 'RUNNING').length;
  const warningCount = machines.filter(m => m.status === 'WARNING').length;
  const criticalCount = machines.filter(m => m.status === 'CRITICAL').length;
  const idleCount = machines.filter(m => m.status === 'IDLE').length;

  const averageOee = totalMachines > 0 
    ? (machines.reduce((acc, m) => acc + m.oee.overall, 0) / totalMachines).toFixed(1)
    : '0.0';

  const averageAvailability = totalMachines > 0
    ? (machines.reduce((acc, m) => acc + m.oee.availability, 0) / totalMachines).toFixed(1)
    : '0.0';

  const averagePerformance = totalMachines > 0
    ? (machines.reduce((acc, m) => acc + m.oee.performance, 0) / totalMachines).toFixed(1)
    : '0.0';

  const activeCriticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  const filteredMachines = machines.filter(m => {
    if (filterMode === 'ATTENTION') return m.status === 'CRITICAL' || m.status === 'WARNING';
    if (filterMode === 'RUNNING') return m.status === 'RUNNING';
    return true;
  });

  const handleQuickResetMachine = (e: React.MouseEvent, machineId: string, machineCode: string) => {
    e.stopPropagation();
    telemetrySimulator.resetMachine(machineId);
    setToastMessage(`Reset ${machineCode} back to nominal ISO Zone A/B.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAskCopilotAboutMachine = (e: React.MouseEvent, m: Machine) => {
    e.stopPropagation();
    if (onAskCopilot) {
      onAskCopilot(`What is the current health status and diagnostic root cause for ${m.code} (${m.name})?`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-950/70 p-3 text-xs font-mono text-cyan-300 shadow-lg animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-industrial-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. Executive Summary Metric Cards (Interactive) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connected Fleet Card */}
        <div 
          onClick={() => setFilterMode('ALL')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
            filterMode === 'ALL' ? 'border-cyan-500/60 bg-industrial-900 ring-1 ring-cyan-500/40' : 'border-industrial-800 bg-industrial-900/70 hover:border-industrial-700'
          }`}
          title="Click to show all fleet machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400">Connected Fleet</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{totalMachines}</span>
            <span className="text-xs text-emerald-400 font-medium">100% online</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-industrial-400 font-mono">
            <span>{runningCount} Active • {idleCount} Idle</span>
            {filterMode === 'ALL' && <span className="text-[10px] text-cyan-400 font-bold">ACTIVE FILTER</span>}
          </div>
        </div>

        {/* Operational Availability Card */}
        <div 
          onClick={() => setFilterMode('RUNNING')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
            filterMode === 'RUNNING' ? 'border-emerald-500/60 bg-industrial-900 ring-1 ring-emerald-500/40' : 'border-industrial-800 bg-industrial-900/70 hover:border-industrial-700'
          }`}
          title="Click to filter only running machines"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400">Fleet Availability</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{averageAvailability}%</span>
            <span className="text-xs text-industrial-400 font-mono">Target: &gt;90%</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 w-full rounded-full bg-industrial-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                style={{ width: `${averageAvailability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Critical Anomalies Card */}
        <div 
          onClick={() => setFilterMode('ATTENTION')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all ${
            filterMode === 'ATTENTION' ? 'border-rose-500 bg-industrial-900 ring-1 ring-rose-500/50' : 'border-industrial-800 bg-industrial-900/70 hover:border-industrial-700'
          }`}
          title="Click to filter machines requiring attention"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400">Critical Anomalies</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              activeCriticalAnomalies > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-industrial-800 text-industrial-400'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${activeCriticalAnomalies > 0 ? 'text-rose-400' : 'text-white'}`}>
              {activeCriticalAnomalies}
            </span>
            <span className="text-xs text-rose-400/90 font-medium">
              {activeCriticalAnomalies > 0 ? 'Needs Attention' : 'Nominal'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400">{criticalCount} Critical • {warningCount} Warn</span>
            {filterMode === 'ATTENTION' && <span className="text-[10px] text-rose-400 font-bold">FILTERED</span>}
          </div>
        </div>

        {/* Plant OEE Benchmark Card (Opens Math Modal) */}
        <div 
          onClick={() => setShowOeeModal(true)}
          className="cursor-pointer rounded-xl border border-industrial-800 bg-industrial-900/70 p-4 shadow-sm backdrop-blur-sm hover:border-cyan-500/50 transition-all group"
          title="Click to view detailed OEE formula and loss breakdown"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400 group-hover:text-cyan-300">Overall OEE (Click Breakdown)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{averageOee}%</span>
            <span className="text-xs text-cyan-400 font-mono">Benchmark: 85%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-industrial-400">
            <span>A: {averageAvailability}%</span>
            <span>P: {averagePerformance}%</span>
            <span className="text-cyan-400 font-semibold">Inspect →</span>
          </div>
        </div>
      </div>

      {/* 2. Live Machine Status Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Live Shop Floor Fleet Grid</h2>
              {filterMode !== 'ALL' && (
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                  Showing: {filterMode}
                </span>
              )}
            </div>
            <p className="text-xs text-industrial-400">Select any asset to inspect high-frequency sensor streams.</p>
          </div>

          <div className="flex items-center gap-2">
            {filterMode !== 'ALL' && (
              <button
                onClick={() => setFilterMode('ALL')}
                className="text-xs text-industrial-400 hover:text-white underline font-mono"
              >
                Clear Filter
              </button>
            )}
            <button 
              onClick={onViewTelemetryTab}
              className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 rounded-lg border border-industrial-800 bg-industrial-900/60 px-3 py-1.5"
            >
              <span>Full Telemetry View</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredMachines.map((machine) => {
            const isSelected = machine.id === selectedMachineId;
            const badge = getStatusBadgeStyle(machine.status);
            const latest = machine.lastTelemetry;
            const vib = latest?.vibrationRms ?? 0;
            const temp = latest?.temperatureCelsius ?? 0;
            const vibZone = getIsoVibrationZone(vib);

            return (
              <div
                key={machine.id}
                onClick={() => onSelectMachine(machine.id)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-500 bg-industrial-850/90 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'border-industrial-800 bg-industrial-900/60 hover:border-industrial-700 hover:bg-industrial-900'
                }`}
              >
                {/* Header: Code, Name, Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white group-hover:text-cyan-300">{machine.code}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.bg} ${badge.border} ${badge.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-industrial-400 line-clamp-1">{machine.name}</p>
                  </div>
                </div>

                {/* Bay & Machine Health */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-industrial-400">
                  <span>{machine.bay}</span>
                  <span className="text-industrial-300 font-semibold">{machine.healthScore.toFixed(0)}% Health</span>
                </div>

                {/* Key Telemetry Readings */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
                  {/* Vibration */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-industrial-400">
                      <Waves className="h-3 w-3 text-cyan-400" />
                      <span>Vibration RMS</span>
                    </div>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className={`text-sm font-bold ${
                        vib >= machine.thresholds.vibrationCritical 
                          ? 'text-rose-400' 
                          : vib >= machine.thresholds.vibrationWarning 
                          ? 'text-amber-400' 
                          : 'text-white'
                      }`}>
                        {formatMetric(vib, 2)}
                      </span>
                      <span className="text-[10px] text-industrial-400">mm/s</span>
                    </div>
                    <div className="text-[9px] font-mono" style={{ color: vibZone.color }}>
                      {vibZone.label}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-industrial-400">
                      <Thermometer className="h-3 w-3 text-amber-400" />
                      <span>Temperature</span>
                    </div>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className={`text-sm font-bold ${
                        temp >= machine.thresholds.tempCritical 
                          ? 'text-rose-400' 
                          : temp >= machine.thresholds.tempWarning 
                          ? 'text-amber-400' 
                          : 'text-white'
                      }`}>
                        {formatMetric(temp, 1)}
                      </span>
                      <span className="text-[10px] text-industrial-400">°C</span>
                    </div>
                    <div className="text-[9px] font-mono text-industrial-400">
                      Max: {machine.thresholds.tempCritical}°C
                    </div>
                  </div>
                </div>

                {/* Interactive Card Action Buttons */}
                <div className="mt-3 flex items-center justify-between border-t border-industrial-800/60 pt-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    {/* Ask Copilot Button */}
                    <button
                      onClick={(e) => handleAskCopilotAboutMachine(e, machine)}
                      className="flex items-center gap-1 text-industrial-400 hover:text-cyan-300 font-mono text-[10px]"
                      title="Ask Industrial Copilot about this machine"
                    >
                      <Bot className="h-3 w-3 text-cyan-400" />
                      <span>Ask AI</span>
                    </button>

                    {/* Quick Reset if status is not running */}
                    {machine.status !== 'RUNNING' && machine.status !== 'IDLE' && (
                      <button
                        onClick={(e) => handleQuickResetMachine(e, machine.id, machine.code)}
                        className="flex items-center gap-1 text-industrial-400 hover:text-emerald-300 font-mono text-[10px]"
                        title="Reset to nominal state"
                      >
                        <RotateCcw className="h-3 w-3 text-emerald-400" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <span className="font-mono text-industrial-400">
                    {machine.runtimeHours.toFixed(0)}h run
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OEE Breakdown Modal */}
      {showOeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-industrial-800 bg-industrial-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Overall Equipment Effectiveness (OEE) Analysis</h3>
              </div>
              <button
                onClick={() => setShowOeeModal(false)}
                className="rounded-lg p-1 text-industrial-400 hover:bg-industrial-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-4 text-center">
                <div className="text-xs text-cyan-300 font-mono uppercase">Current Shop Floor OEE</div>
                <div className="text-3xl font-extrabold text-white mt-1">{averageOee}%</div>
                <div className="text-[11px] text-industrial-400 mt-1">Formula: Availability × Performance × Quality</div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3">
                  <div className="flex justify-between font-bold text-white">
                    <span>Availability (88.5%)</span>
                    <span className="text-amber-400">Drag: -11.5%</span>
                  </div>
                  <p className="text-[11px] text-industrial-400 mt-1">
                    Unplanned downtime risk on HYD-03 (vibration bearing issue) and thermal throttling on INJ-02.
                  </p>
                </div>

                <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3">
                  <div className="flex justify-between font-bold text-white">
                    <span>Performance (92.8%)</span>
                    <span className="text-emerald-400">Strong</span>
                  </div>
                  <p className="text-[11px] text-industrial-400 mt-1">
                    CNC-01 operating at 96% rated spindle speed with high feed rate compliance.
                  </p>
                </div>

                <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3">
                  <div className="flex justify-between font-bold text-white">
                    <span>Quality / First Pass Yield (96.2%)</span>
                    <span className="text-emerald-400">Optimal</span>
                  </div>
                  <p className="text-[11px] text-industrial-400 mt-1">
                    Scrap rate held below 3.8% across precision machining bays.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowOeeModal(false)}
                className="rounded-lg bg-industrial-800 px-4 py-2 text-xs font-medium text-white hover:bg-industrial-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
