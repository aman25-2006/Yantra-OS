'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Machine, SensorTelemetry } from '@/types/industrial';
import { 
  Waves, 
  Thermometer, 
  Zap, 
  Pause, 
  Play, 
  Sliders, 
  AlertCircle,
  Maximize2,
  Download,
  RotateCcw,
  Flame,
  Check
} from 'lucide-react';
import { formatMetric, getIsoVibrationZone } from '@/lib/utils';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

interface RealtimeTelemetryChartProps {
  machine: Machine;
  telemetryStream: SensorTelemetry[];
}

type MetricMode = 'vibration' | 'temperature' | 'electrical';

export function RealtimeTelemetryChart({
  machine,
  telemetryStream,
}: RealtimeTelemetryChartProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>('vibration');
  const [isPaused, setIsPaused] = useState(false);
  const [frozenData, setFrozenData] = useState<SensorTelemetry[]>([]);
  const [windowSize, setWindowSize] = useState<number>(30); // number of data points to display
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle stream freeze/unfreeze
  const togglePause = () => {
    if (!isPaused) {
      setFrozenData([...telemetryStream]);
    }
    setIsPaused(!isPaused);
  };

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'MachineCode', 'VibrationRMS_mm_s', 'VibrationPeak_mm_s', 'CrestFactor', 'Temperature_C', 'Current_Amps', 'Pressure_Bar', 'Noise_dB'];
    const rows = telemetryStream.map(t => {
      const cf = t.vibrationRms > 0 ? (t.vibrationPeak / t.vibrationRms).toFixed(2) : '1.0';
      return [
        `"${t.timestamp}"`,
        machine.code,
        t.vibrationRms,
        t.vibrationPeak,
        cf,
        t.temperatureCelsius,
        t.currentAmps,
        t.pressureBar ?? '',
        t.noiseDb ?? ''
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${machine.code}_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${telemetryStream.length} telemetry records for ${machine.code}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInjectFaultOnMachine = () => {
    const faultType = metricMode === 'temperature' ? 'THERMAL_RUNAWAY' : 'VIBRATION_SPIKE';
    telemetrySimulator.injectFault(machine.id, faultType);
    setToastMessage(`Injected ${faultType} on ${machine.code}! Alert triggered.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetThisMachine = () => {
    telemetrySimulator.resetMachine(machine.id);
    setToastMessage(`Reset ${machine.code} back to nominal ISO Zone A/B condition.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const chartData = useMemo(() => {
    const source = isPaused ? frozenData : telemetryStream;
    return source.slice(-windowSize).map((frame) => ({
      time: new Date(frame.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      vibrationRms: frame.vibrationRms,
      vibrationPeak: frame.vibrationPeak,
      temperatureCelsius: frame.temperatureCelsius,
      currentAmps: frame.currentAmps,
      pressureBar: frame.pressureBar,
      isAnomaly: frame.isAnomaly,
    }));
  }, [telemetryStream, frozenData, isPaused, windowSize]);

  // Derived current metrics & peaks
  const latestFrame = telemetryStream[telemetryStream.length - 1];
  const currentVib = latestFrame?.vibrationRms ?? 0;
  const currentTemp = latestFrame?.temperatureCelsius ?? 0;
  const currentPeak = latestFrame?.vibrationPeak ?? 0;
  const crestFactor = currentVib > 0 ? (currentPeak / currentVib).toFixed(2) : '1.00';
  const isoZone = getIsoVibrationZone(currentVib);

  return (
    <div className="rounded-xl border border-industrial-800 bg-industrial-900/80 p-5 shadow-sm backdrop-blur-md">
      {/* Top Bar: Machine Title, Metric Tab Switcher & Chart Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-industrial-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-cyan-400">{machine.code}</span>
            <span className="text-sm font-semibold text-white">{machine.name}</span>
            <span className="rounded bg-industrial-800 px-2 py-0.5 text-[10px] font-mono text-industrial-400">
              {machine.bay}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-industrial-400">
            High-frequency sensor stream with real-time ISO 10816 threshold comparison
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex rounded-lg border border-industrial-800 bg-industrial-950 p-0.5">
            <button
              onClick={() => setMetricMode('vibration')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                metricMode === 'vibration'
                  ? 'bg-industrial-800 text-cyan-300 shadow-sm'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              <Waves className="h-3.5 w-3.5" />
              <span>Vibration (RMS)</span>
            </button>
            <button
              onClick={() => setMetricMode('temperature')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                metricMode === 'temperature'
                  ? 'bg-industrial-800 text-amber-300 shadow-sm'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>Thermal (°C)</span>
            </button>
            <button
              onClick={() => setMetricMode('electrical')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                metricMode === 'electrical'
                  ? 'bg-industrial-800 text-purple-300 shadow-sm'
                  : 'text-industrial-400 hover:text-industrial-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Load & Pressure</span>
            </button>
          </div>

          {/* Window Size Selector */}
          <select
            value={windowSize}
            onChange={(e) => setWindowSize(Number(e.target.value))}
            className="rounded-lg border border-industrial-800 bg-industrial-950 px-2 py-1 text-xs font-mono text-industrial-300 focus:outline-none focus:border-cyan-500"
          >
            <option value={20}>Last 40s</option>
            <option value={30}>Last 1m</option>
            <option value={50}>Last ~2m</option>
          </select>

          {/* Pause / Resume Button */}
          <button
            onClick={togglePause}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              isPaused
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'border-industrial-700 bg-industrial-800 text-industrial-300 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{isPaused ? 'Resume' : 'Freeze'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-industrial-700 bg-industrial-800 px-3 py-1 text-xs font-medium text-industrial-200 hover:border-cyan-500 hover:text-white transition-colors"
            title="Export real-time sliding telemetry data to CSV file"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>

          {/* In-Chart Machine Fault Trigger */}
          <button
            onClick={handleInjectFaultOnMachine}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Inject an abnormal excursion specifically onto this machine"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Trip Fault</span>
          </button>

          {/* Reset Machine Condition */}
          <button
            onClick={handleResetThisMachine}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            title="Reset this machine to nominal baseline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Action Toast Notification */}
      {toastMessage && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3.5 py-2 text-xs font-mono text-cyan-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-industrial-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Physics Metric HUD Strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metricMode === 'vibration' && (
          <>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Current RMS</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {formatMetric(currentVib, 2)}
                </span>
                <span className="text-xs text-industrial-400">mm/s</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Peak Crest Factor</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white">{crestFactor}</span>
                <span className="text-xs text-industrial-400">Pk/RMS</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">ISO 10816 Zone</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-xs font-mono font-bold"
                  style={{ backgroundColor: `${isoZone.color}20`, color: isoZone.color }}
                >
                  {isoZone.label}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Critical Boundary</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono text-rose-400">
                <span className="text-xl font-bold">{machine.thresholds.vibrationCritical}</span>
                <span className="text-xs">mm/s</span>
              </div>
            </div>
          </>
        )}

        {metricMode === 'temperature' && (
          <>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Bearing Temp</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-amber-400">
                  {formatMetric(currentTemp, 1)}
                </span>
                <span className="text-xs text-industrial-400">°C</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Warning Threshold</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono text-amber-300">
                <span className="text-xl font-bold">{machine.thresholds.tempWarning}</span>
                <span className="text-xs">°C</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Shutdown Boundary</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono text-rose-400">
                <span className="text-xl font-bold">{machine.thresholds.tempCritical}</span>
                <span className="text-xs">°C</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Thermal Headroom</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono text-emerald-400">
                <span className="text-xl font-bold">
                  {(machine.thresholds.tempCritical - currentTemp).toFixed(1)}
                </span>
                <span className="text-xs">°C margin</span>
              </div>
            </div>
          </>
        )}

        {metricMode === 'electrical' && (
          <>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Motor Current</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-purple-400">
                  {latestFrame?.currentAmps?.toFixed(1) ?? '--'}
                </span>
                <span className="text-xs text-industrial-400">Amps</span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">System Pressure</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-sky-400">
                  {latestFrame?.pressureBar ? `${latestFrame.pressureBar.toFixed(1)} Bar` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Spindle RPM</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestFrame?.spindleRpm ? `${latestFrame.spindleRpm}` : 'Static'}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-industrial-800/80 bg-industrial-950/60 p-2.5">
              <span className="text-[11px] text-industrial-400 font-mono">Acoustic Noise</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-industrial-300">
                  {latestFrame?.noiseDb ? `${latestFrame.noiseDb.toFixed(1)} dB` : '--'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main High-Performance Recharts Canvas */}
      <div className="mt-5 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'vibration' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <YAxis 
                domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax + 1))]} 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit=" mm/s"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* ISO 10816 Threshold Reference Lines */}
              <ReferenceLine 
                y={machine.thresholds.vibrationWarning} 
                label={{ 
                  value: `Warning (${machine.thresholds.vibrationWarning} mm/s)`, 
                  fill: '#f59e0b', 
                  fontSize: 10, 
                  position: 'insideTopRight' 
                }} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
              />
              <ReferenceLine 
                y={machine.thresholds.vibrationCritical} 
                label={{ 
                  value: `ISO Zone D Critical (${machine.thresholds.vibrationCritical} mm/s)`, 
                  fill: '#ef4444', 
                  fontSize: 10, 
                  position: 'insideTopRight' 
                }} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="vibrationRms"
                name="Vibration Velocity RMS (mm/s)"
                stroke="#06b6d4"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#ffffff' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="vibrationPeak"
                name="Vibration Peak (mm/s)"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          ) : metricMode === 'temperature' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis 
                domain={[30, (dataMax: number) => Math.max(90, Math.ceil(dataMax + 5))]} 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="°C"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <ReferenceLine 
                y={machine.thresholds.tempWarning} 
                label={{ 
                  value: `Warning (${machine.thresholds.tempWarning}°C)`, 
                  fill: '#f59e0b', 
                  fontSize: 10, 
                  position: 'insideTopRight' 
                }} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
              />
              <ReferenceLine 
                y={machine.thresholds.tempCritical} 
                label={{ 
                  value: `Critical Trip (${machine.thresholds.tempCritical}°C)`, 
                  fill: '#ef4444', 
                  fontSize: 10, 
                  position: 'insideTopRight' 
                }} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="temperatureCelsius"
                name="Bearing Temperature (°C)"
                stroke="#f59e0b"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5, fill: '#f59e0b' }}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              <Line
                type="monotone"
                dataKey="currentAmps"
                name="Motor Current (Amps)"
                stroke="#c084fc"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {machine.thresholds.pressureMin !== undefined && (
                <Line
                  type="monotone"
                  dataKey="pressureBar"
                  name="Pressure (Bar)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ISO 10816 Legend Guide Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-industrial-800/60 pt-3 text-[11px] text-industrial-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-industrial-300">ISO 10816-3 Severity Reference:</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> &lt;1.8 mm/s (Zone A)
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> 1.8-4.5 (Zone B)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> 4.5-7.1 (Zone C)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> &gt;7.1 (Zone D Danger)
          </span>
        </div>
        <div className="text-industrial-500">
          Continuous Ingestion Buffer Active
        </div>
      </div>
    </div>
  );
}
