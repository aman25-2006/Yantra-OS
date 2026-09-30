import { Machine, SensorTelemetry, Anomaly, Alert } from '@/types/industrial';
import { AnomalyDetector } from './anomaly-detector';

// Initial Fleet Baseline
export const INITIAL_MACHINES: Machine[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'CNC-01',
    name: 'CNC Lathe - Dual Spindle Alpha',
    type: 'CNC Turning Center',
    bay: 'Bay 1 - Precision Turning',
    status: 'RUNNING',
    healthScore: 94.5,
    runtimeHours: 1420.5,
    currentLoadPct: 78.0,
    oee: {
      overall: 88.5,
      availability: 95.0,
      performance: 96.0,
      quality: 97.0,
    },
    thresholds: {
      vibrationWarning: 4.5,
      vibrationCritical: 7.1,
      tempWarning: 65.0,
      tempCritical: 80.0,
      currentWarning: 32.0,
      currentCritical: 40.0,
    },
    lastMaintenance: new Date(Date.now() - 14 * 86400000).toISOString(),
    nextServiceDue: new Date(Date.now() + 16 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'INJ-02',
    name: 'Injection Molder - 250T Hydraulic',
    type: 'Plastic Injection Press',
    bay: 'Bay 2 - Polymers & Molding',
    status: 'WARNING',
    healthScore: 68.2,
    runtimeHours: 2840.1,
    currentLoadPct: 84.0,
    oee: {
      overall: 71.4,
      availability: 82.0,
      performance: 91.0,
      quality: 95.5,
    },
    thresholds: {
      vibrationWarning: 4.5,
      vibrationCritical: 7.1,
      tempWarning: 65.0,
      tempCritical: 80.0,
      currentWarning: 45.0,
      currentCritical: 55.0,
      pressureMin: 120.0,
      pressureMax: 180.0,
    },
    lastMaintenance: new Date(Date.now() - 45 * 86400000).toISOString(),
    nextServiceDue: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    code: 'HYD-03',
    name: 'Hydraulic Stamping Press - 500T',
    type: 'Heavy Forging Press',
    bay: 'Bay 3 - Stamping & Forging',
    status: 'CRITICAL',
    healthScore: 42.8,
    runtimeHours: 4190.0,
    currentLoadPct: 91.5,
    oee: {
      overall: 52.1,
      availability: 61.0,
      performance: 92.0,
      quality: 93.0,
    },
    thresholds: {
      vibrationWarning: 4.5,
      vibrationCritical: 7.1,
      tempWarning: 65.0,
      tempCritical: 80.0,
      currentWarning: 60.0,
      currentCritical: 75.0,
      pressureMin: 220.0,
      pressureMax: 320.0,
    },
    lastMaintenance: new Date(Date.now() - 60 * 86400000).toISOString(),
    nextServiceDue: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    code: 'CMP-04',
    name: 'Rotary Screw Air Compressor - 75kW',
    type: 'Plant Utility',
    bay: 'Utility Yard - Plant Pneumatics',
    status: 'IDLE',
    healthScore: 91.0,
    runtimeHours: 890.3,
    currentLoadPct: 15.0,
    oee: {
      overall: 89.0,
      availability: 98.0,
      performance: 92.0,
      quality: 99.0,
    },
    thresholds: {
      vibrationWarning: 3.8,
      vibrationCritical: 6.2,
      tempWarning: 70.0,
      tempCritical: 85.0,
      currentWarning: 80.0,
      currentCritical: 100.0,
      pressureMin: 6.5,
      pressureMax: 8.5,
    },
    lastMaintenance: new Date(Date.now() - 20 * 86400000).toISOString(),
    nextServiceDue: new Date(Date.now() + 40 * 86400000).toISOString(),
  },
];

// Initial seeded active anomalies
export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-init-01',
    machineId: '33333333-3333-3333-3333-333333333333',
    machineCode: 'HYD-03',
    machineName: 'Hydraulic Stamping Press - 500T',
    metricName: 'vibrationRms',
    observedValue: 8.42,
    thresholdValue: 7.1,
    unit: 'mm/s',
    severity: 'CRITICAL',
    confidenceScore: 0.965,
    anomalyType: 'BEARING_WEAR',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    rootCauseAnalysis: 'Harmonic frequency peak detected at 3.2x shaft speed with high crest factor (4.18). Indicates outer race spalling on Main Hydraulic Pump Drive Bearing.',
    recommendedAction: 'Execute controlled stop. Inspect drive coupling alignment, verify ISO VG 46 hydraulic oil viscosity, and replace spherical roller bearing assembly.',
    status: 'ACTIVE',
  },
  {
    id: 'anom-init-02',
    machineId: '22222222-2222-2222-2222-222222222222',
    machineCode: 'INJ-02',
    machineName: 'Injection Molder - 250T Hydraulic',
    metricName: 'temperatureCelsius',
    observedValue: 73.8,
    thresholdValue: 65.0,
    unit: '°C',
    severity: 'MEDIUM',
    confidenceScore: 0.89,
    anomalyType: 'OVERHEATING',
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    rootCauseAnalysis: 'Cooling circuit flow restriction detected. Temperature rose +8.2°C over the last 45 minutes under standard duty cycle.',
    recommendedAction: 'Check chiller coolant return valve and clean heat exchanger intake mesh. Do not exceed 80°C threshold.',
    status: 'ACTIVE',
  },
];

// Initial active alerts
export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-init-01',
    anomalyId: 'anom-init-01',
    machineId: '33333333-3333-3333-3333-333333333333',
    machineCode: 'HYD-03',
    title: 'CRITICAL: Excessive Vibration on Hydraulic Press-03',
    severity: 'CRITICAL',
    status: 'NEW',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    rootCause: 'Severe bearing outer race degradation on 500T hydraulic pump motor. RMS vibration (8.42 mm/s) breached ISO 10816 Zone D.',
    recommendedAction: 'Immediate inspection of pump shaft bearing, check lubrication grease contamination, lock out machine if noise exceeds 92 dB.',
    assignedTechnician: 'Senior Fitter - Ramesh Sharma',
  },
  {
    id: 'alert-init-02',
    anomalyId: 'anom-init-02',
    machineId: '22222222-2222-2222-2222-222222222222',
    machineCode: 'INJ-02',
    title: 'WARNING: Thermal Excursion on Injection Molder-02',
    severity: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    rootCause: 'Chiller heat exchange delta reduced; temperature holding at 73.8°C against 65.0°C warning threshold.',
    recommendedAction: 'Inspect cooling line water pressure, flush sediment filter on heat exchanger.',
    assignedTechnician: 'Duty Electrician - Anil Patil',
  },
];

type TelemetryListener = (telemetryMap: Record<string, SensorTelemetry[]>) => void;
type MachineListener = (machines: Machine[]) => void;
type AnomalyListener = (anomalies: Anomaly[]) => void;

class TelemetryEngine {
  private machines: Machine[] = [...INITIAL_MACHINES];
  private telemetryHistory: Record<string, SensorTelemetry[]> = {};
  private anomalies: Anomaly[] = [...INITIAL_ANOMALIES];
  private alerts: Alert[] = [...INITIAL_ALERTS];
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private machineListeners: Set<MachineListener> = new Set();
  private anomalyListeners: Set<AnomalyListener> = new Set();

  constructor() {
    this.seedInitialHistory();
  }

  /**
   * Pre-fill each machine with 30 past timestamps for immediate rich graph rendering
   */
  private seedInitialHistory() {
    const now = Date.now();
    const count = 30;

    for (const machine of this.machines) {
      const history: SensorTelemetry[] = [];
      const baseVib = machine.status === 'CRITICAL' ? 8.2 : machine.status === 'WARNING' ? 4.2 : 2.1;
      const baseTemp = machine.status === 'CRITICAL' ? 76.0 : machine.status === 'WARNING' ? 72.5 : 54.0;
      const baseRpm = machine.type.includes('CNC') ? 2400 : 0;
      const basePressure = machine.thresholds.pressureMin ? (machine.thresholds.pressureMin + 20) : undefined;

      for (let i = count; i >= 0; i--) {
        const time = new Date(now - i * 2000).toISOString();
        const noise = (Math.random() - 0.5) * 0.4;
        const vib = Math.max(0.2, baseVib + noise + Math.sin(i * 0.4) * 0.3);
        const temp = Math.max(25, baseTemp + (Math.random() - 0.5) * 0.8);
        const current = machine.status === 'IDLE' ? 4.2 : 24.5 + (Math.random() - 0.5) * 2;

        history.push({
          id: `seed-${machine.code}-${i}`,
          machineId: machine.id,
          timestamp: time,
          vibrationRms: Number(vib.toFixed(3)),
          vibrationPeak: Number((vib * 1.414 + Math.random() * 0.5).toFixed(3)),
          temperatureCelsius: Number(temp.toFixed(1)),
          currentAmps: Number(current.toFixed(1)),
          spindleRpm: baseRpm ? Math.round(baseRpm + (Math.random() - 0.5) * 40) : undefined,
          pressureBar: basePressure ? Number((basePressure + (Math.random() - 0.5) * 3).toFixed(1)) : undefined,
          noiseDb: Number((65 + vib * 3 + Math.random() * 2).toFixed(1)),
          isAnomaly: vib > machine.thresholds.vibrationWarning || temp > machine.thresholds.tempWarning,
        });
      }

      this.telemetryHistory[machine.id] = history;
      machine.lastTelemetry = history[history.length - 1];
    }
  }

  public startSimulation(intervalMs = 2000) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  public stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Generates the next telemetry step for all machines
   */
  private tick() {
    const nowIso = new Date().toISOString();
    let hasNewAnomalies = false;

    this.machines = this.machines.map((machine) => {
      const history = this.telemetryHistory[machine.id] || [];
      const prev = history[history.length - 1];

      // Physical fluctuation simulation
      let targetVib = machine.status === 'CRITICAL' ? 8.4 : machine.status === 'WARNING' ? 4.3 : 2.2;
      let targetTemp = machine.status === 'CRITICAL' ? 76.5 : machine.status === 'WARNING' ? 73.5 : 55.0;

      if (machine.status === 'IDLE') {
        targetVib = 0.4;
        targetTemp = 36.0;
      }

      const noiseVib = (Math.random() - 0.5) * 0.35;
      const newVib = Math.max(0.1, Number((targetVib + noiseVib).toFixed(3)));
      const noiseTemp = (Math.random() - 0.5) * 0.4;
      const newTemp = Number((targetTemp + noiseTemp).toFixed(1));
      const current = machine.status === 'IDLE' ? 3.5 : Number((25 + (Math.random() - 0.5) * 3).toFixed(1));
      const rpm = machine.type.includes('CNC') && machine.status === 'RUNNING' 
        ? Math.round(2400 + (Math.random() - 0.5) * 30) 
        : undefined;

      const pressure = machine.thresholds.pressureMin 
        ? Number(((machine.thresholds.pressureMin + 25) + (Math.random() - 0.5) * 4).toFixed(1)) 
        : undefined;

      const frame: SensorTelemetry = {
        id: `tel-${machine.code}-${Date.now()}`,
        machineId: machine.id,
        timestamp: nowIso,
        vibrationRms: newVib,
        vibrationPeak: Number((newVib * 1.5 + Math.random() * 0.6).toFixed(3)),
        temperatureCelsius: newTemp,
        currentAmps: current,
        spindleRpm: rpm,
        pressureBar: pressure,
        noiseDb: Number((62 + newVib * 3.2).toFixed(1)),
      };

      // Anomaly detection check
      const evalResult = AnomalyDetector.evaluateTelemetry(machine, frame, prev);
      frame.isAnomaly = evalResult.isAnomaly;

      if (evalResult.isAnomaly && evalResult.anomaly) {
        // Prevent duplicate flood if active anomaly already exists in last 3 minutes
        const recentExists = this.anomalies.some(
          a => a.machineId === machine.id && 
               a.metricName === evalResult.anomaly!.metricName &&
               (Date.now() - new Date(a.timestamp).getTime()) < 180000
        );

        if (!recentExists) {
          this.anomalies = [evalResult.anomaly, ...this.anomalies];
          hasNewAnomalies = true;

          // Also push an alert
          this.alerts = [
            {
              id: `alert-${Date.now()}`,
              anomalyId: evalResult.anomaly.id,
              machineId: machine.id,
              machineCode: machine.code,
              title: `${evalResult.anomaly.severity}: ${evalResult.anomaly.anomalyType} on ${machine.code}`,
              severity: evalResult.anomaly.severity,
              status: 'NEW',
              timestamp: nowIso,
              rootCause: evalResult.anomaly.rootCauseAnalysis,
              recommendedAction: evalResult.anomaly.recommendedAction,
              assignedTechnician: 'Shift Maintenance Lead',
            },
            ...this.alerts,
          ];
        }
      }

      // Keep 60 points sliding window (last 2 minutes of 2s ticks)
      const updatedHistory = [...history, frame].slice(-60);
      this.telemetryHistory[machine.id] = updatedHistory;

      // Update machine status if needed
      let nextStatus = machine.status;
      if (frame.vibrationRms >= machine.thresholds.vibrationCritical || frame.temperatureCelsius >= machine.thresholds.tempCritical) {
        nextStatus = 'CRITICAL';
      } else if (frame.vibrationRms >= machine.thresholds.vibrationWarning || frame.temperatureCelsius >= machine.thresholds.tempWarning) {
        nextStatus = 'WARNING';
      }

      return {
        ...machine,
        status: nextStatus,
        lastTelemetry: frame,
      };
    });

    // Notify listeners
    this.notifyTelemetryListeners();
    this.notifyMachineListeners();
    if (hasNewAnomalies) {
      this.notifyAnomalyListeners();
    }
  }

  /**
   * Interactive demo trigger: Inject an abnormal condition onto a target machine
   */
  public injectFault(machineId: string, faultType: 'VIBRATION_SPIKE' | 'THERMAL_RUNAWAY' | 'PRESSURE_DROP') {
    const machineIndex = this.machines.findIndex(m => m.id === machineId);
    if (machineIndex === -1) return;

    const machine = this.machines[machineIndex];
    const nowIso = new Date().toISOString();

    let vib = machine.lastTelemetry?.vibrationRms || 2.5;
    let temp = machine.lastTelemetry?.temperatureCelsius || 55.0;
    let pressure = machine.lastTelemetry?.pressureBar;

    if (faultType === 'VIBRATION_SPIKE') {
      vib = Number((machine.thresholds.vibrationCritical + 1.8).toFixed(3));
    } else if (faultType === 'THERMAL_RUNAWAY') {
      temp = Number((machine.thresholds.tempCritical + 5.5).toFixed(1));
    } else if (faultType === 'PRESSURE_DROP' && machine.thresholds.pressureMin) {
      pressure = Number((machine.thresholds.pressureMin - 25).toFixed(1));
    }

    const faultFrame: SensorTelemetry = {
      id: `fault-${Date.now()}`,
      machineId: machine.id,
      timestamp: nowIso,
      vibrationRms: vib,
      vibrationPeak: Number((vib * 2.2).toFixed(3)),
      temperatureCelsius: temp,
      currentAmps: 38.5,
      pressureBar: pressure,
      spindleRpm: 2420,
      noiseDb: 91.2,
      isAnomaly: true,
    };

    const history = this.telemetryHistory[machine.id] || [];
    this.telemetryHistory[machine.id] = [...history, faultFrame].slice(-60);

    const evalResult = AnomalyDetector.evaluateTelemetry(machine, faultFrame);
    if (evalResult.anomaly) {
      this.anomalies = [evalResult.anomaly, ...this.anomalies];
      this.alerts = [
        {
          id: `alert-inj-${Date.now()}`,
          anomalyId: evalResult.anomaly.id,
          machineId: machine.id,
          machineCode: machine.code,
          title: `INJECTED FAULT: ${evalResult.anomaly.severity} on ${machine.code}`,
          severity: evalResult.anomaly.severity,
          status: 'NEW',
          timestamp: nowIso,
          rootCause: evalResult.anomaly.rootCauseAnalysis,
          recommendedAction: evalResult.anomaly.recommendedAction,
          assignedTechnician: 'Lead Diagnostics Engineer',
        },
        ...this.alerts,
      ];
    }

    this.machines[machineIndex] = {
      ...machine,
      status: 'CRITICAL',
      healthScore: Math.max(30, machine.healthScore - 25),
      lastTelemetry: faultFrame,
    };

    this.notifyTelemetryListeners();
    this.notifyMachineListeners();
    this.notifyAnomalyListeners();
  }

  // State Getters
  public getMachines(): Machine[] {
    return this.machines;
  }

  public getTelemetry(machineId: string): SensorTelemetry[] {
    return this.telemetryHistory[machineId] || [];
  }

  public getAllTelemetry(): Record<string, SensorTelemetry[]> {
    return this.telemetryHistory;
  }

  public getAnomalies(): Anomaly[] {
    return this.anomalies;
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a);
  }

  // Listener subscriptions
  public onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    listener(this.telemetryHistory);
    return () => this.telemetryListeners.delete(listener);
  }

  public onMachines(listener: MachineListener): () => void {
    this.machineListeners.add(listener);
    listener(this.machines);
    return () => this.machineListeners.delete(listener);
  }

  public onAnomalies(listener: AnomalyListener): () => void {
    this.anomalyListeners.add(listener);
    listener(this.anomalies);
    return () => this.anomalyListeners.delete(listener);
  }

  private notifyTelemetryListeners() {
    this.telemetryListeners.forEach(listener => listener({ ...this.telemetryHistory }));
  }

  private notifyMachineListeners() {
    this.machineListeners.forEach(listener => listener([...this.machines]));
  }

  private notifyAnomalyListeners() {
    this.anomalyListeners.forEach(listener => listener([...this.anomalies]));
  }
}

// Singleton Simulator Engine for Client & Edge Ingestion
export const telemetrySimulator = new TelemetryEngine();
