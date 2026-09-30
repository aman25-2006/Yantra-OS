'use client';

import React from 'react';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  Gauge, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Waves,
  ArrowUpRight
} from 'lucide-react';
import { Machine, Anomaly, FactoryOverviewStats } from '@/types/industrial';
import { getStatusBadgeStyle, formatMetric, getIsoVibrationZone } from '@/lib/utils';

interface FactoryOverviewProps {
  machines: Machine[];
  anomalies: Anomaly[];
  selectedMachineId: string;
  onSelectMachine: (machineId: string) => void;
  onViewTelemetryTab: () => void;
}

export function FactoryOverview({
  machines,
  anomalies,
  selectedMachineId,
  onSelectMachine,
  onViewTelemetryTab,
}: FactoryOverviewProps) {
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

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connected Fleet */}
        <div className="rounded-xl border border-industrial-800 bg-industrial-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400">Connected Fleet</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{totalMachines}</span>
            <span className="text-xs text-emerald-400 font-medium">100% telemetry online</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-industrial-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> {runningCount} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> {idleCount} Idle
            </span>
          </div>
        </div>

        {/* Operational Status Ratio */}
        <div className="rounded-xl border border-industrial-800 bg-industrial-900/70 p-4 shadow-sm backdrop-blur-sm">
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

        {/* Critical Anomalies Detected */}
        <div className="rounded-xl border border-industrial-800 bg-industrial-900/70 p-4 shadow-sm backdrop-blur-sm">
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
              {activeCriticalAnomalies > 0 ? 'Action required immediately' : 'Nominal operation'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="text-amber-400">{warningCount} Warning</span>
            <span className="text-industrial-600">•</span>
            <span className="text-rose-400">{criticalCount} Critical</span>
          </div>
        </div>

        {/* Plant OEE Benchmark */}
        <div className="rounded-xl border border-industrial-800 bg-industrial-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-industrial-400">Overall OEE Estimate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{averageOee}%</span>
            <span className="text-xs text-cyan-400 font-mono">Perf: {averagePerformance}%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-industrial-400">
            <span>A: {averageAvailability}%</span>
            <span>P: {averagePerformance}%</span>
            <span>Q: 96.2%</span>
          </div>
        </div>
      </div>

      {/* 2. Live Machine Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Live Shop Floor Fleet Grid</h2>
            <p className="text-xs text-industrial-400">Click any machine asset to load real-time sensor streams and ISO vibration spectrum.</p>
          </div>
          <button 
            onClick={onViewTelemetryTab}
            className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            <span>Open Telemetry Inspector</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {machines.map((machine) => {
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
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-500 bg-industrial-850/90 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'border-industrial-800 bg-industrial-900/60 hover:border-industrial-700 hover:bg-industrial-900'
                }`}
              >
                {/* Header: Code, Name, Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{machine.code}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.bg} ${badge.border} ${badge.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-industrial-400 line-clamp-1">{machine.name}</p>
                  </div>
                </div>

                {/* Bay & Machine Type */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-industrial-400">
                  <span>{machine.bay}</span>
                  <span className="text-industrial-400 font-semibold">{machine.healthScore.toFixed(0)}% Health</span>
                </div>

                {/* Key Telemetry Readings (Temperature & Vibration RMS) */}
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

                {/* Runtime & Load footer */}
                <div className="mt-3 flex items-center justify-between border-t border-industrial-800/60 pt-2 text-[11px] text-industrial-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-industrial-400" />
                    <span>{machine.runtimeHours.toFixed(0)} hrs runtime</span>
                  </div>
                  <div className="font-mono text-cyan-400/90 font-medium">
                    {machine.currentLoadPct.toFixed(0)}% Load
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
