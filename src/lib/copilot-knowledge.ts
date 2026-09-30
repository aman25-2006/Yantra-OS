import { Machine, Anomaly, Alert, SensorTelemetry } from '@/types/industrial';

export interface CopilotContextPayload {
  factoryName: string;
  plantCode: string;
  machines: Machine[];
  anomalies: Anomaly[];
  alerts: Alert[];
  telemetrySummary: Record<string, {
    latestVibration: number;
    latestTemp: number;
    status: string;
    isOverThreshold: boolean;
  }>;
}

export function buildSystemPrompt(context: CopilotContextPayload): string {
  const machineListStr = context.machines.map(m => `
- ${m.code} (${m.name}):
  Status: ${m.status} | Health Score: ${m.healthScore}% | Runtime: ${m.runtimeHours} hrs | Load: ${m.currentLoadPct}%
  OEE: Overall ${m.oee.overall}% (Avail: ${m.oee.availability}%, Perf: ${m.oee.performance}%, Qual: ${m.oee.quality}%)
  Thresholds: Vib Warn ${m.thresholds.vibrationWarning} mm/s, Vib Crit ${m.thresholds.vibrationCritical} mm/s, Temp Warn ${m.thresholds.tempWarning}°C, Temp Crit ${m.thresholds.tempCritical}°C
  Latest Telemetry: Vibration RMS ${context.telemetrySummary[m.id]?.latestVibration ?? '--'} mm/s, Temp ${context.telemetrySummary[m.id]?.latestTemp ?? '--'}°C
  Last Maintenance: ${m.lastMaintenance} | Next Service Due: ${m.nextServiceDue}
`).join('\n');

  const anomalyListStr = context.anomalies.map(a => `
- [${a.severity}] ${a.machineCode} at ${a.timestamp}:
  Metric: ${a.metricName} = ${a.observedValue} ${a.unit} (Threshold: ${a.thresholdValue} ${a.unit})
  Type: ${a.anomalyType} | Confidence: ${(a.confidenceScore * 100).toFixed(0)}%
  Root Cause: ${a.rootCauseAnalysis}
  Recommended Action: ${a.recommendedAction}
`).join('\n');

  return `You are YantraOS Industrial Copilot, an AI Predictive Maintenance and Operations Specialist for manufacturing plant "${context.factoryName}" (${context.plantCode}).
You assist plant managers, maintenance fitters, and operations heads with real-time machine telemetry, ISO 10816 vibration diagnosis, thermal dynamics, and proactive breakdown prevention.

CURRENT LIVE SHOP FLOOR TELEMETRY & FLEET STATUS:
${machineListStr}

RECENT DETECTED ANOMALIES & INCIDENTS:
${anomalyListStr.length > 0 ? anomalyListStr : 'No active anomalies recorded in this shift.'}

OPERATIONAL STANDARDS & GUIDELINES:
1. ISO 10816-3 Vibration Severity:
   - Zone A (< 1.8 mm/s): Excellent condition.
   - Zone B (1.8 - 4.5 mm/s): Normal continuous operation.
   - Zone C (4.5 - 7.1 mm/s): Warning / restricted operation. Schedule inspection.
   - Zone D (> 7.1 mm/s): Critical danger of catastrophic breakdown. Immediate shutdown recommended.
2. Root-cause heuristics:
   - High vibration with high crest factor (> 3.5) = Rolling element bearing defect (raceway fluting/spalling).
   - High vibration with 1x/2x shaft speed harmonics = Rotor unbalance or angular/parallel misalignment.
   - Elevated temperature with normal vibration = Cooling circuit failure or electrical overload.
   - Elevated temperature + high vibration = Lubricant starvation / frictional seizure.
3. Tone: Crisp, technically authoritative, safety-oriented, and immediately actionable. Provide structured bullet points with exact machine codes, threshold numbers, and Standard Operating Procedures (SOP).
`;
}

/**
 * Intelligent deterministic response engine for offline / prototype execution
 * Generates accurate domain responses grounded in current live simulator state.
 */
export function generateLocalCopilotResponse(query: string, context: CopilotContextPayload): string {
  const q = query.toLowerCase();

  // 1. Abnormal vibration query
  if (q.includes('vibration') || q.includes('vibrate') || q.includes('shaking')) {
    const highVibMachines = context.machines.filter(m => {
      const vib = context.telemetrySummary[m.id]?.latestVibration || 0;
      return vib >= m.thresholds.vibrationWarning;
    });

    if (highVibMachines.length === 0) {
      return `### Vibration Analysis Report
All connected fleet machines are currently operating within **ISO 10816 Zone A/B** nominal boundaries (< 4.5 mm/s RMS).
- Spindle vibration on **CNC-01**: Nominal at ~2.1 mm/s RMS.
- Utility compressor **CMP-04**: Nominal at ~0.4 mm/s RMS.`;
    }

    const machineDetails = highVibMachines.map(m => {
      const vib = context.telemetrySummary[m.id]?.latestVibration || 0;
      const anom = context.anomalies.find(a => a.machineId === m.id && a.metricName === 'vibrationRms');
      return `
* **${m.code} (${m.name})**:
  - **Observed Vibration**: \`${vib.toFixed(2)} mm/s RMS\` (Critical Threshold: \`${m.thresholds.vibrationCritical} mm/s\`)
  - **ISO Severity Zone**: **Zone D (Unacceptable / Danger)**
  - **Diagnostic Root Cause**: ${anom?.rootCauseAnalysis || 'Harmonic frequency peak with high crest factor indicating bearing outer race damage.'}
  - **Recommended Immediate SOP**: ${anom?.recommendedAction || 'Lock out drive, check grease lubrication, inspect bearing cage clearance.'}
`;
    }).join('\n');

    return `### Critical Vibration Alert Detected
The monitoring engine identified **${highVibMachines.length} machine(s)** with abnormal vibration telemetry today:

${machineDetails}

> ⚠️ **Safety Notice**: Machines exceeding ISO Zone D (7.1 mm/s) must not remain in continuous production to avoid catastrophic spindle or pump seizure.`;
  }

  // 2. Machine 03 / HYD-03 query
  if (q.includes('03') || q.includes('hyd') || q.includes('hydraulic') || q.includes('press')) {
    const hyd = context.machines.find(m => m.code === 'HYD-03');
    const hydAnom = context.anomalies.find(a => a.machineCode === 'HYD-03');
    const vib = hyd ? context.telemetrySummary[hyd.id]?.latestVibration : 8.42;

    return `### Incident Diagnosis: Hydraulic Press-03 (HYD-03)

**Status**: 🔴 **CRITICAL** (Health Score: 42.8%)
**Incident Trigger Time**: 14:30 (Shift 2)

#### 1. Telemetry Breach Analysis
- **Sensor**: Triaxial Accelerometer on Main Hydraulic Pump Motor
- **Observed Reading**: \`${(vib || 8.42).toFixed(2)} mm/s RMS\` (Peak: \`12.63 mm/s\`)
- **Safety Boundary**: Exceeded ISO 10816 Zone D critical threshold of \`7.10 mm/s\` by +18.6%.
- **Crest Factor**: \`4.18\` (High crest factor specifically indicates shock pulses from rolling element impacts).

#### 2. Root Cause Analysis
Spectra analysis indicates defect frequency modulation at **3.2x shaft running speed**, corresponding to **outer race fatigue spalling (bearing fluting)** on the spherical roller bearing. Lubrication degradation caused metal-to-metal boundary friction.

#### 3. Prescribed Maintenance SOP
1. **Immediate Lockout/Tagout (LOTO)**: Initiate controlled depressurization of the 500T hydraulic accumulator.
2. **Oil Analysis**: Sample ISO VG 46 hydraulic oil for bronze/steel particulate contamination.
3. **Bearing Replacement**: Replace drive bearing assembly (Part: \`SKF 22216-E\`).
4. **Coupling Alignment**: Laser-align motor to pump shaft to within \`< 0.05 mm\` radial runout before restart.`;
  }

  // 3. Maintenance action query
  if (q.includes('maintenance') || q.includes('action') || q.includes('next') || q.includes('todo') || q.includes('sop')) {
    return `### Prioritized Action Plan (Shift 2 Maintenance Queue)

Based on real-time health scores and anomaly severity, execute tasks in the following order:

| Priority | Machine | Severity | Issue | Recommended Action | Assigned To |
|:---|:---|:---|:---|:---|:---|
| **P1 (Urgent)** | **HYD-03** | 🔴 Critical | Bearing Race Spalling (8.4 mm/s RMS) | Controlled shutdown; inspect pump bearing & replace assembly. | Ramesh Sharma |
| **P2 (High)** | **INJ-02** | 🟡 Warning | Thermal Excursion (73.8°C vs 65°C limit) | Flush heat exchanger inlet filter; inspect chiller flow rate. | Anil Patil |
| **P3 (Planned)** | **CNC-01** | 🟢 Good | Preventive Due in 16 Days | Spindle oil top-up and tool turret alignment calibration. | Unassigned |
| **P4 (Utility)** | **CMP-04** | ⚪ Standby | Operating Nominally (15% load) | Routine condensate drain inspection. | Shopfloor Tech |`;
  }

  // 4. OEE or Overall Health query
  if (q.includes('oee') || q.includes('efficiency') || q.includes('overall') || q.includes('kpi')) {
    const avgOee = (context.machines.reduce((acc, m) => acc + m.oee.overall, 0) / context.machines.length).toFixed(1);
    const avgAvail = (context.machines.reduce((acc, m) => acc + m.oee.availability, 0) / context.machines.length).toFixed(1);
    const avgPerf = (context.machines.reduce((acc, m) => acc + m.oee.performance, 0) / context.machines.length).toFixed(1);
    const avgQual = (context.machines.reduce((acc, m) => acc + m.oee.quality, 0) / context.machines.length).toFixed(1);

    return `### Fleet Overall Equipment Effectiveness (OEE) Summary

Current Plant Average OEE: **${avgOee}%** *(World Class Benchmark: 85%)*

- **Availability**: **${avgAvail}%** — Dragged down primarily by **HYD-03** downtime risk and **INJ-02** thermal throttling.
- **Performance**: **${avgPerf}%** — High throughput on **CNC-01** running at 96% rated spindle speed.
- **Quality**: **${avgQual}%** — Excellent first-pass yield across CNC and Molding lines.

**Recommendation to boost OEE by +7.4%**: Resolving the bearing failure on HYD-03 will restore 500T press availability from 61% back to > 90%.`;
  }

  // Generic intelligent fallback
  return `### YantraOS Industrial Copilot Status

I have analyzed the live telemetry across your **${context.machines.length} connected machines** at **${context.factoryName}**:

- **Active Alerts**: ${context.alerts.filter(a => a.status === 'NEW').length} new alerts requiring technician review.
- **Fleet Health**:
  * 🟢 **CNC-01**: Normal (Health: 94.5%, Vib: ${context.telemetrySummary[context.machines[0]?.id]?.latestVibration?.toFixed(2) || '2.1'} mm/s)
  * 🟡 **INJ-02**: Warning (Overheating at ${context.telemetrySummary[context.machines[1]?.id]?.latestTemp?.toFixed(1) || '73.8'}°C)
  * 🔴 **HYD-03**: Critical (ISO Zone D breach at ${context.telemetrySummary[context.machines[2]?.id]?.latestVibration?.toFixed(2) || '8.4'} mm/s)
  * ⚪ **CMP-04**: Standby / Idle (15% load)

You can ask me specific questions such as:
1. *"Which machine showed abnormal vibration today?"*
2. *"Why did Machine 03 trigger a warning at 14:30?"*
3. *"What maintenance action should I take next?"*
4. *"What is the plant OEE breakdown?"*`;
}
