'use client';

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  Search, 
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Anomaly, Alert, AnomalySeverity } from '@/types/industrial';
import { getSeverityBadgeStyle, formatDateTime, formatMetric } from '@/lib/utils';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

interface AnomalyAlertCenterProps {
  anomalies: Anomaly[];
  alerts: Alert[];
  onSelectMachine: (machineId: string) => void;
}

export function AnomalyAlertCenter({
  anomalies,
  alerts,
  onSelectMachine,
}: AnomalyAlertCenterProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedMap, setAcknowledgedMap] = useState<Record<string, boolean>>({});

  const handleAcknowledge = (alertId: string) => {
    telemetrySimulator.acknowledgeAlert(alertId);
    setAcknowledgedMap(prev => ({ ...prev, [alertId]: true }));
  };

  const filteredAnomalies = anomalies.filter((anom) => {
    const matchesSeverity = filterSeverity === 'ALL' || anom.severity === filterSeverity;
    const matchesSearch =
      anom.machineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anom.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anom.rootCauseAnalysis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anom.anomalyType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const mediumCount = anomalies.filter(a => a.severity === 'MEDIUM').length;

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-industrial-800 bg-industrial-900/80 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Industrial Anomaly & Predictive Alert Center</h2>
            <p className="text-xs text-industrial-400">
              Live physics violations and automated ISO 10816 root-cause diagnoses for machine maintenance teams.
            </p>
          </div>
        </div>

        {/* Severity Metrics Strip */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase font-mono font-medium text-rose-300">Critical Incidents</span>
            <div className="text-xl font-bold font-mono text-rose-400">{criticalCount}</div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase font-mono font-medium text-amber-300">Warning Excursions</span>
            <div className="text-xl font-bold font-mono text-amber-400">{mediumCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterSeverity === sev
                  ? 'bg-industrial-800 text-white border border-industrial-700 shadow-sm'
                  : 'text-industrial-400 hover:bg-industrial-900 hover:text-industrial-200'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-industrial-500" />
          <input
            type="text"
            placeholder="Search by machine, bearing, root-cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-industrial-800 bg-industrial-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-industrial-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Anomalies & Alert Log Table */}
      <div className="overflow-hidden rounded-xl border border-industrial-800 bg-industrial-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-industrial-800 bg-industrial-950/80 font-mono text-[11px] uppercase tracking-wider text-industrial-400">
              <tr>
                <th className="px-4 py-3">Severity & Timestamp</th>
                <th className="px-4 py-3">Machine Asset</th>
                <th className="px-4 py-3">Observed Violation</th>
                <th className="px-4 py-3">AI Root-Cause Diagnosis</th>
                <th className="px-4 py-3">Prescribed Action (SOP)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-sans">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-industrial-400">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
                    <span>No active anomalies match current filters. All machine telemetry is healthy.</span>
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((anom) => {
                  const badgeStyle = getSeverityBadgeStyle(anom.severity);
                  const relatedAlert = alerts.find(a => a.anomalyId === anom.id || a.machineId === anom.machineId);
                  const isAck = relatedAlert?.status === 'ACKNOWLEDGED' || (relatedAlert && acknowledgedMap[relatedAlert.id]);

                  return (
                    <tr 
                      key={anom.id} 
                      className="transition-colors hover:bg-industrial-850/60"
                    >
                      {/* Severity & Time */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold ${badgeStyle.badge}`}>
                            {anom.severity}
                          </span>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-industrial-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(anom.timestamp)}</span>
                          </div>
                          <span className="inline-block text-[10px] font-mono text-cyan-400/90">
                            {(anom.confidenceScore * 100).toFixed(0)}% AI Confidence
                          </span>
                        </div>
                      </td>

                      {/* Machine Asset */}
                      <td className="px-4 py-3.5 align-top">
                        <button
                          onClick={() => onSelectMachine(anom.machineId)}
                          className="group flex flex-col text-left"
                        >
                          <span className="font-mono font-bold text-white group-hover:text-cyan-400 flex items-center gap-1">
                            {anom.machineCode}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[11px] text-industrial-400 line-clamp-1">{anom.machineName}</span>
                          <span className="mt-1 text-[10px] font-mono text-industrial-500">{anom.anomalyType}</span>
                        </button>
                      </td>

                      {/* Observed Violation */}
                      <td className="px-4 py-3.5 align-top font-mono">
                        <div className="space-y-1">
                          <div className="text-white font-semibold">
                            {formatMetric(anom.observedValue, 2, anom.unit)}
                          </div>
                          <div className="text-[11px] text-industrial-400">
                            Threshold: {formatMetric(anom.thresholdValue, 2, anom.unit)}
                          </div>
                          <div className="text-[10px] text-rose-400 font-semibold">
                            +{(((anom.observedValue - anom.thresholdValue) / anom.thresholdValue) * 100).toFixed(1)}% breach
                          </div>
                        </div>
                      </td>

                      {/* AI Root-Cause Diagnosis */}
                      <td className="px-4 py-3.5 align-top max-w-xs">
                        <p className="text-industrial-200 leading-relaxed text-xs">
                          {anom.rootCauseAnalysis}
                        </p>
                      </td>

                      {/* Recommended Action SOP */}
                      <td className="px-4 py-3.5 align-top max-w-xs">
                        <div className="rounded-lg border border-industrial-800 bg-industrial-950/70 p-2 text-industrial-300">
                          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
                            <Wrench className="h-3 w-3" />
                            <span>Recommended SOP</span>
                          </div>
                          <p className="text-[11px] leading-snug">
                            {anom.recommendedAction}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => onSelectMachine(anom.machineId)}
                            className="rounded-md border border-industrial-700 bg-industrial-800 px-2.5 py-1 text-[11px] font-medium text-industrial-300 transition-colors hover:border-cyan-500 hover:text-white"
                          >
                            Inspect Stream
                          </button>
                          {relatedAlert && (
                            <button
                              onClick={() => handleAcknowledge(relatedAlert.id)}
                              disabled={isAck}
                              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                isAck
                                  ? 'bg-industrial-950 text-industrial-500 border border-industrial-800 cursor-not-allowed'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                              }`}
                            >
                              {isAck ? 'Acknowledged' : 'Acknowledge'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
