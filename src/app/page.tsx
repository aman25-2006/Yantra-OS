'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { FactoryOverview } from '@/components/dashboard/FactoryOverview';
import { RealtimeTelemetryChart } from '@/components/charts/RealtimeTelemetryChart';
import { AnomalyAlertCenter } from '@/components/alerts/AnomalyAlertCenter';
import { IndustrialCopilotChat } from '@/components/copilot/IndustrialCopilotChat';
import { telemetrySimulator, INITIAL_MACHINES } from '@/lib/telemetry-simulator';
import { Machine, Anomaly, Alert, SensorTelemetry } from '@/types/industrial';
import { 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  Flame, 
  Activity, 
  Wrench,
  Bot
} from 'lucide-react';

export default function DashboardPage() {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [allTelemetry, setAllTelemetry] = useState<Record<string, SensorTelemetry[]>>({});
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(INITIAL_MACHINES[2].id); // HYD-03 by default to highlight critical anomaly
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string | undefined>(undefined);
  const [selectedFacility, setSelectedFacility] = useState<string>('Pune Precision Works (Bay 1 & 2)');

  // Initialize and subscribe to real-time telemetry simulator
  useEffect(() => {
    telemetrySimulator.startSimulation(2000);

    const unsubMachines = telemetrySimulator.onMachines((updated) => {
      setMachines(updated);
    });

    const unsubTelemetry = telemetrySimulator.onTelemetry((map) => {
      setAllTelemetry(map);
    });

    const unsubAnomalies = telemetrySimulator.onAnomalies((anomList) => {
      setAnomalies(anomList);
    });

    const unsubAlerts = telemetrySimulator.onAlerts((alertList) => {
      setAlerts(alertList);
    });

    // Initial sync
    setAlerts(telemetrySimulator.getAlerts());

    return () => {
      unsubMachines();
      unsubTelemetry();
      unsubAnomalies();
      unsubAlerts();
    };
  }, []);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const selectedStream = allTelemetry[selectedMachineId] || [];
  const activeAlertCount = alerts.filter((a) => a.status === 'NEW').length;

  const handleOpenCopilotWithQuery = (query: string) => {
    setCopilotInitialQuery(query);
    setIsCopilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col font-sans text-slate-100">
      {/* Top Bar */}
      <Header
        activeAlertCount={activeAlertCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'copilot') setIsCopilotOpen(false);
          }}
          anomalyCount={anomalies.filter((a) => a.status === 'ACTIVE').length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Shift Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-industrial-400">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-industrial-300">YantraOS Plant Ops</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-industrial-400">{selectedFacility}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-cyan-400 font-medium capitalize">
                {activeTab === 'overview' ? 'Command Center Dashboard' : activeTab}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-industrial-300">Edge Gateway: Active</span>
              <span className="text-industrial-600">|</span>
              <span className="text-industrial-400">ISO 10816-3 Engine Loaded</span>
            </div>
          </div>

          {/* Active Tab: Factory Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary KPIs & Fleet Grid */}
              <FactoryOverview
                machines={machines}
                anomalies={anomalies}
                selectedMachineId={selectedMachineId}
                onSelectMachine={(id) => setSelectedMachineId(id)}
                onViewTelemetryTab={() => setActiveTab('telemetry')}
                onAskCopilot={handleOpenCopilotWithQuery}
              />

              {/* Real-time Telemetry Section for Selected Machine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-white">
                      Live Telemetry Stream: <span className="font-mono text-cyan-400">{selectedMachine.code}</span>
                    </h2>
                  </div>
                  <span className="text-xs text-industrial-400 font-mono">
                    Updated every 2.0s
                  </span>
                </div>

                <RealtimeTelemetryChart
                  machine={selectedMachine}
                  telemetryStream={selectedStream}
                />
              </div>

              {/* Recent Anomaly Incident Callout */}
              <div className="rounded-xl border border-industrial-800 bg-industrial-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                    <span>Recent Critical Anomaly Incident</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    View All Anomalies ({anomalies.length}) →
                  </button>
                </div>

                {anomalies.length > 0 && (
                  <div className="rounded-lg border border-industrial-800 bg-industrial-950 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/40">
                          {anomalies[0].severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {anomalies[0].machineCode} ({anomalies[0].anomalyType})
                        </span>
                        <span className="text-[11px] text-industrial-400">
                          {new Date(anomalies[0].timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-industrial-300 line-clamp-2">
                        {anomalies[0].rootCauseAnalysis}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedMachineId(anomalies[0].machineId);
                          setActiveTab('telemetry');
                        }}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/50"
                      >
                        Inspect Stream
                      </button>
                      <button
                        onClick={() => handleOpenCopilotWithQuery(`Explain the root cause and recommend immediate maintenance action for the recent anomaly on ${anomalies[0].machineCode}`)}
                        className="rounded-lg border border-industrial-700 bg-industrial-800 px-3 py-1.5 text-xs font-medium text-industrial-300 hover:text-white flex items-center gap-1"
                      >
                        <Bot className="h-3 w-3 text-cyan-400" />
                        <span>Ask Copilot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Tab: Deep-Dive Telemetry View */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Machine Picker Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-industrial-400 mr-1">Select Asset:</span>
                {machines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMachineId(m.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                      selectedMachineId === m.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'border border-industrial-800 bg-industrial-900 text-industrial-300 hover:bg-industrial-800'
                    }`}
                  >
                    {m.code} ({m.status})
                  </button>
                ))}
              </div>

              {/* Chart Component */}
              <RealtimeTelemetryChart
                machine={selectedMachine}
                telemetryStream={selectedStream}
              />
            </div>
          )}

          {/* Active Tab: Dedicated Anomaly Alert Center */}
          {activeTab === 'alerts' && (
            <AnomalyAlertCenter
              anomalies={anomalies}
              alerts={alerts}
              onSelectMachine={(machineId) => {
                setSelectedMachineId(machineId);
                setActiveTab('telemetry');
              }}
            />
          )}

          {/* Active Tab: Dedicated AI Industrial Copilot */}
          {activeTab === 'copilot' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <IndustrialCopilotChat
                machines={machines}
                anomalies={anomalies}
                initialQuery={copilotInitialQuery}
                onSelectMachine={(id) => {
                  setSelectedMachineId(id);
                  setActiveTab('telemetry');
                }}
              />
            </div>
          )}
        </main>

        {/* Slide-over Drawer for Copilot (Accessible anywhere) */}
        {isCopilotOpen && (
          <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-industrial-950/95 border-l border-industrial-800 shadow-2xl p-4 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
            <IndustrialCopilotChat
              machines={machines}
              anomalies={anomalies}
              isDrawer={true}
              initialQuery={copilotInitialQuery}
              onClose={() => setIsCopilotOpen(false)}
              onSelectMachine={(id) => {
                setSelectedMachineId(id);
                setActiveTab('telemetry');
                setIsCopilotOpen(false);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
