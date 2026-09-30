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
  ExternalLink,
  FileText,
  Download,
  Check,
  X,
  UserCheck,
  ClipboardList
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Work Order Modal State
  const [activeWorkOrderAnomaly, setActiveWorkOrderAnomaly] = useState<Anomaly | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('Ramesh Sharma (Senior Fitter)');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);

  const handleAcknowledge = (alertId: string) => {
    telemetrySimulator.acknowledgeAlert(alertId);
    setAcknowledgedMap(prev => ({ ...prev, [alertId]: true }));
    setToastMessage('Alert marked as Acknowledged.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResolveAnomaly = (anomalyId: string, machineCode: string) => {
    telemetrySimulator.resolveAnomaly(anomalyId);
    setToastMessage(`Incident resolved! ${machineCode} restored to nominal operating health.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenWorkOrder = (anom: Anomaly) => {
    setActiveWorkOrderAnomaly(anom);
    setTechnicianNotes(`Inspect ${anom.machineCode} for ${anom.anomalyType}. Check bearings and lubrication.`);
    setIsDispatched(false);
  };

  const handleDispatchWorkOrder = () => {
    if (!activeWorkOrderAnomaly) return;
    telemetrySimulator.createWorkOrder(activeWorkOrderAnomaly.id, selectedTechnician, technicianNotes);
    setIsDispatched(true);
    setTimeout(() => {
      setActiveWorkOrderAnomaly(null);
      setToastMessage(`Work Order dispatched to ${selectedTechnician} for ${activeWorkOrderAnomaly.machineCode}!`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 800);
  };

  const handleExportIncidentLog = () => {
    const headers = ['AnomalyID', 'Timestamp', 'MachineCode', 'MachineName', 'Severity', 'Metric', 'ObservedValue', 'Threshold', 'RootCause', 'RecommendedSOP', 'Status'];
    const rows = anomalies.map(a => [
      `"${a.id}"`,
      `"${a.timestamp}"`,
      `"${a.machineCode}"`,
      `"${a.machineName}"`,
      a.severity,
      a.metricName,
      a.observedValue,
      a.thresholdValue,
      `"${a.rootCauseAnalysis.replace(/"/g, '""')}"`,
      `"${a.recommendedAction.replace(/"/g, '""')}"`,
      a.status
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YantraOS_Anomalies_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${anomalies.length} incident records to CSV.`);
    setTimeout(() => setToastMessage(null), 3000);
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

  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const mediumCount = anomalies.filter(a => a.severity === 'MEDIUM' && a.status === 'ACTIVE').length;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-950/70 p-3 text-xs font-mono text-cyan-300 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-industrial-400 hover:text-white">✕</button>
        </div>
      )}

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
            <span className="text-[10px] uppercase font-mono font-medium text-rose-300">Active Critical</span>
            <div className="text-xl font-bold font-mono text-rose-400">{criticalCount}</div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-center">
            <span className="text-[10px] uppercase font-mono font-medium text-amber-300">Active Warnings</span>
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

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-industrial-500" />
            <input
              type="text"
              placeholder="Search by machine, bearing, root-cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-industrial-800 bg-industrial-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-industrial-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportIncidentLog}
            className="flex items-center gap-1.5 rounded-lg border border-industrial-700 bg-industrial-800 px-3 py-1.5 text-xs font-medium text-industrial-200 hover:border-cyan-500 hover:text-white transition-colors"
            title="Download complete incident audit trail to CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export Log</span>
          </button>
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
                  const isResolved = anom.status === 'RESOLVED' || relatedAlert?.status === 'RESOLVED';
                  const isInProgress = relatedAlert?.status === 'IN_PROGRESS';

                  return (
                    <tr 
                      key={anom.id} 
                      className={`transition-colors hover:bg-industrial-850/60 ${isResolved ? 'opacity-60 bg-industrial-950/40' : ''}`}
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
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-400/90">
                              {(anom.confidenceScore * 100).toFixed(0)}% AI Confidence
                            </span>
                            {isResolved && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                                RESOLVED
                              </span>
                            )}
                            {isInProgress && (
                              <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-mono text-blue-300">
                                IN WORK
                              </span>
                            )}
                          </div>
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
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => onSelectMachine(anom.machineId)}
                            className="rounded-md border border-industrial-700 bg-industrial-800 px-2.5 py-1 text-[11px] font-medium text-industrial-300 transition-colors hover:border-cyan-500 hover:text-white"
                          >
                            Inspect Stream
                          </button>

                          {/* Work Order Modal Trigger */}
                          <button
                            onClick={() => handleOpenWorkOrder(anom)}
                            className="rounded-md border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-900/50 transition-colors flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Work Order</span>
                          </button>

                          {/* Acknowledge Button */}
                          {relatedAlert && !isResolved && (
                            <button
                              onClick={() => handleAcknowledge(relatedAlert.id)}
                              disabled={isAck}
                              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                isAck
                                  ? 'bg-industrial-950 text-industrial-500 border border-industrial-800 cursor-not-allowed'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                            >
                              {isAck ? 'Acknowledged' : 'Acknowledge'}
                            </button>
                          )}

                          {/* Resolve Incident Button */}
                          {!isResolved && (
                            <button
                              onClick={() => handleResolveAnomaly(anom.id, anom.machineCode)}
                              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                              title="Mark incident as resolved and reset machine health"
                            >
                              Resolve
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

      {/* Official Shop Floor Work Order Modal */}
      {activeWorkOrderAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-industrial-800 bg-industrial-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Generate Maintenance Work Order</h3>
                  <p className="text-[11px] font-mono text-industrial-400">WO-2026-MIDC-0982 • Asset: {activeWorkOrderAnomaly.machineCode}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveWorkOrderAnomaly(null)}
                className="rounded-lg p-1 text-industrial-400 hover:bg-industrial-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Incident Summary Card */}
              <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{activeWorkOrderAnomaly.machineName}</span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                    {activeWorkOrderAnomaly.severity} PRIORITY
                  </span>
                </div>
                <div className="text-[11px] text-industrial-300">
                  <span className="text-industrial-400">Detected Root Cause:</span> {activeWorkOrderAnomaly.rootCauseAnalysis}
                </div>
              </div>

              {/* Technician Dispatch Picker */}
              <div>
                <label className="text-[11px] font-mono uppercase text-industrial-400 block mb-1">
                  Assign Maintenance Technician:
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full rounded-lg border border-industrial-800 bg-industrial-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-sans"
                >
                  <option value="Ramesh Sharma (Senior Fitter)">Ramesh Sharma (Senior Mechanical Fitter — ISO Cert)</option>
                  <option value="Anil Patil (Duty Electrical Engineer)">Anil Patil (Duty Electrical & VFD Specialist)</option>
                  <option value="Dinesh Kumar (Hydraulics Technician)">Dinesh Kumar (Hydraulics & Seals Specialist)</option>
                </select>
              </div>

              {/* Spare Parts Checklist */}
              <div>
                <label className="text-[11px] font-mono uppercase text-industrial-400 block mb-1">
                  Required Spare Parts from Stores:
                </label>
                <div className="rounded-lg border border-industrial-800 bg-industrial-950/60 p-2.5 space-y-1.5 text-[11px] text-industrial-300 font-mono">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-cyan-500" />
                    <span>SKF 22216-E Spherical Roller Bearing (Qty: 1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-cyan-500" />
                    <span>ISO VG 46 Anti-Wear Hydraulic Fluid (Qty: 5L)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded accent-cyan-500" />
                    <span>Flexible Spider Coupling Insert 98 Sh A (Qty: 1)</span>
                  </div>
                </div>
              </div>

              {/* Technician Work Notes */}
              <div>
                <label className="text-[11px] font-mono uppercase text-industrial-400 block mb-1">
                  Work Order SOP Instructions:
                </label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full rounded-lg border border-industrial-800 bg-industrial-950 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-industrial-800 pt-3">
              <button
                onClick={() => setActiveWorkOrderAnomaly(null)}
                className="rounded-lg border border-industrial-800 px-3 py-1.5 text-xs text-industrial-400 hover:text-white"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDispatchWorkOrder}
                  disabled={isDispatched}
                  className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isDispatched ? 'Dispatched!' : 'Dispatch to Technician'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
