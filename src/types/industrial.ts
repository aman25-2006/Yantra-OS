export type MachineStatus = 'RUNNING' | 'IDLE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'CRITICAL';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export type AnomalyType = 
  | 'VIBRATION_SPIKE'
  | 'BEARING_WEAR'
  | 'THERMAL_RUNAWAY'
  | 'OVERHEATING'
  | 'MOTOR_OVERLOAD'
  | 'PRESSURE_DROP'
  | 'CAVITATION'
  | 'MISALIGNMENT';

export interface ThresholdConfig {
  vibrationWarning: number;   // mm/s RMS (ISO 10816 Zone C threshold, e.g. 4.5)
  vibrationCritical: number;  // mm/s RMS (ISO 10816 Zone D threshold, e.g. 7.1)
  tempWarning: number;        // Celsius (e.g. 65.0)
  tempCritical: number;       // Celsius (e.g. 80.0)
  currentWarning: number;     // Amps
  currentCritical: number;    // Amps
  pressureMin?: number;       // Bar (for hydraulic/pneumatic)
  pressureMax?: number;       // Bar
}

export interface Machine {
  id: string;
  code: string;              // e.g. "CNC-01", "INJ-02", "HYD-03"
  name: string;              // e.g. "CNC Lathe - Spindle Alpha"
  type: string;              // e.g. "CNC Lathe", "Injection Molder", "Hydraulic Press"
  bay: string;               // e.g. "Bay 1 - High Precision Machining"
  status: MachineStatus;
  healthScore: number;       // 0 - 100
  runtimeHours: number;      // Total operational hours
  currentLoadPct: number;    // 0 - 100%
  oee: {
    overall: number;         // 0 - 100%
    availability: number;    // 0 - 100%
    performance: number;     // 0 - 100%
    quality: number;         // 0 - 100%
  };
  thresholds: ThresholdConfig;
  lastTelemetry?: SensorTelemetry;
  lastMaintenance: string;   // ISO date string
  nextServiceDue: string;    // ISO date string
}

export interface SensorTelemetry {
  id: string;
  machineId: string;
  timestamp: string;         // ISO timestamp
  vibrationRms: number;      // mm/s RMS (ISO 10816)
  vibrationPeak: number;     // mm/s Peak
  temperatureCelsius: number;// °C
  currentAmps: number;       // Amperes
  pressureBar?: number;      // Bar (Hydraulic/Pneumatic)
  spindleRpm?: number;       // RPM
  noiseDb?: number;          // dB (Acoustic emission)
  isAnomaly?: boolean;
}

export interface Anomaly {
  id: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  metricName: 'vibrationRms' | 'temperatureCelsius' | 'currentAmps' | 'pressureBar';
  observedValue: number;
  thresholdValue: number;
  unit: string;
  severity: AnomalySeverity;
  confidenceScore: number;   // 0.0 - 1.0 (e.g. 0.94)
  anomalyType: AnomalyType;
  timestamp: string;
  rootCauseAnalysis: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface Alert {
  id: string;
  anomalyId?: string;
  machineId: string;
  machineCode: string;
  title: string;
  severity: AnomalySeverity;
  status: AlertStatus;
  timestamp: string;
  rootCause: string;
  recommendedAction: string;
  assignedTechnician?: string;
  resolvedAt?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedMachineId?: string;
  suggestedActions?: string[];
  metricsSnapshot?: {
    machineCode: string;
    vibration: number;
    temperature: number;
    status: MachineStatus;
  };
}

export interface FactoryOverviewStats {
  totalMachines: number;
  runningCount: number;
  idleCount: number;
  warningCount: number;
  criticalCount: number;
  averageOee: number;
  activeAnomaliesCount: number;
  unacknowledgedAlerts: number;
  estimatedMtbfHours: number; // Mean Time Between Failures
}
