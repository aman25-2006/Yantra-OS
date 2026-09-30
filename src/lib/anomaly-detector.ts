import { Machine, SensorTelemetry, Anomaly, AnomalySeverity, AnomalyType } from '@/types/industrial';

export interface DetectionResult {
  isAnomaly: boolean;
  anomaly?: Anomaly;
}

/**
 * Industrial Physics-Informed Anomaly Detection Engine
 * Implements ISO 10816 vibration severity standards and thermal dynamics.
 */
export class AnomalyDetector {
  /**
   * Evaluate incoming sensor frame against machine threshold bounds and physical heuristics
   */
  public static evaluateTelemetry(
    machine: Machine,
    currentTelemetry: SensorTelemetry,
    previousTelemetry?: SensorTelemetry
  ): DetectionResult {
    const { thresholds } = machine;
    const nowIso = new Date().toISOString();

    // 1. Evaluate Vibration Severity (ISO 10816-3 Standard)
    if (currentTelemetry.vibrationRms >= thresholds.vibrationCritical) {
      const crestFactor = currentTelemetry.vibrationRms > 0 
        ? currentTelemetry.vibrationPeak / currentTelemetry.vibrationRms 
        : 1.0;

      const isImpactingBearing = crestFactor > 3.5;
      const anomalyType: AnomalyType = isImpactingBearing ? 'BEARING_WEAR' : 'VIBRATION_SPIKE';

      const rootCause = isImpactingBearing
        ? `High vibration crest factor (${crestFactor.toFixed(2)}) with RMS of ${currentTelemetry.vibrationRms.toFixed(2)} mm/s exceeding ISO 10816 Zone D. Indicates spalling/pitting on bearing raceway.`
        : `Severe mechanical unbalance or shaft misalignment detected. RMS vibration (${currentTelemetry.vibrationRms.toFixed(2)} mm/s) breached critical boundary of ${thresholds.vibrationCritical} mm/s.`;

      const recommendation = isImpactingBearing
        ? `Immediate safety lockout. Inspect bearing housing for grease contamination, check clearance tolerance with dial gauge, and prepare replacement bearing assembly.`
        : `Halt cycle after current workpiece. Check motor mounting bolt torque, inspect flexible coupling elastomer for wear, and conduct dynamic balancing.`;

      return {
        isAnomaly: true,
        anomaly: {
          id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          machineId: machine.id,
          machineCode: machine.code,
          machineName: machine.name,
          metricName: 'vibrationRms',
          observedValue: currentTelemetry.vibrationRms,
          thresholdValue: thresholds.vibrationCritical,
          unit: 'mm/s',
          severity: 'CRITICAL',
          confidenceScore: 0.96,
          anomalyType,
          timestamp: nowIso,
          rootCauseAnalysis: rootCause,
          recommendedAction: recommendation,
          status: 'ACTIVE',
        },
      };
    }

    if (currentTelemetry.vibrationRms >= thresholds.vibrationWarning) {
      return {
        isAnomaly: true,
        anomaly: {
          id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          machineId: machine.id,
          machineCode: machine.code,
          machineName: machine.name,
          metricName: 'vibrationRms',
          observedValue: currentTelemetry.vibrationRms,
          thresholdValue: thresholds.vibrationWarning,
          unit: 'mm/s',
          severity: 'MEDIUM',
          confidenceScore: 0.88,
          anomalyType: 'VIBRATION_SPIKE',
          timestamp: nowIso,
          rootCauseAnalysis: `RMS vibration elevated to ${currentTelemetry.vibrationRms.toFixed(2)} mm/s (ISO Zone C - Restricted Operation). Mild spindle unbalance or tool wear suspected.`,
          recommendedAction: `Inspect tool clamping tightness, check spindle lubrication reservoir level, and log vibration trend over next 4 hours.`,
          status: 'ACTIVE',
        },
      };
    }

    // 2. Evaluate Thermal Runaway & High Stator/Bearing Temperature
    if (currentTelemetry.temperatureCelsius >= thresholds.tempCritical) {
      return {
        isAnomaly: true,
        anomaly: {
          id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          machineId: machine.id,
          machineCode: machine.code,
          machineName: machine.name,
          metricName: 'temperatureCelsius',
          observedValue: currentTelemetry.temperatureCelsius,
          thresholdValue: thresholds.tempCritical,
          unit: '°C',
          severity: 'CRITICAL',
          confidenceScore: 0.95,
          anomalyType: 'THERMAL_RUNAWAY',
          timestamp: nowIso,
          rootCauseAnalysis: `Critical temperature reading (${currentTelemetry.temperatureCelsius.toFixed(1)}°C) exceeds rated thermal insulation limit (${thresholds.tempCritical}°C). Risk of motor winding breakdown.`,
          recommendedAction: `Stop machine operation immediately. Inspect chiller fluid loop, verify cooling fan rotation, and check radiator fin blockage.`,
          status: 'ACTIVE',
        },
      };
    }

    // Thermal Rate of Rise Check (if previous telemetry available)
    if (previousTelemetry) {
      const dtMinutes = Math.max(
        0.1,
        (new Date(currentTelemetry.timestamp).getTime() - new Date(previousTelemetry.timestamp).getTime()) / 60000
      );
      const tempDelta = currentTelemetry.temperatureCelsius - previousTelemetry.temperatureCelsius;
      const rateOfRisePerMinute = tempDelta / dtMinutes;

      // > 3.0 °C per minute under steady state is abnormal
      if (rateOfRisePerMinute > 3.0 && currentTelemetry.temperatureCelsius > 55) {
        return {
          isAnomaly: true,
          anomaly: {
            id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            machineId: machine.id,
            machineCode: machine.code,
            machineName: machine.name,
            metricName: 'temperatureCelsius',
            observedValue: currentTelemetry.temperatureCelsius,
            thresholdValue: thresholds.tempWarning,
            unit: '°C',
            severity: 'MEDIUM',
            confidenceScore: 0.89,
            anomalyType: 'OVERHEATING',
            timestamp: nowIso,
            rootCauseAnalysis: `Abnormal thermal gradient (+${rateOfRisePerMinute.toFixed(1)}°C/min). Heat dissipation failing faster than operating load dissipation rate.`,
            recommendedAction: `Check heat exchanger flow rate, inspect thermal paste/pads, ensure ambient air temperature around enclosure is below 38°C.`,
            status: 'ACTIVE',
          },
        };
      }
    }

    // 3. Evaluate Hydraulic / Pneumatic Pressure Drop (if machine has pressure telemetry)
    if (
      machine.thresholds.pressureMin !== undefined &&
      currentTelemetry.pressureBar !== undefined &&
      currentTelemetry.pressureBar < machine.thresholds.pressureMin
    ) {
      return {
        isAnomaly: true,
        anomaly: {
          id: `anom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          machineId: machine.id,
          machineCode: machine.code,
          machineName: machine.name,
          metricName: 'pressureBar',
          observedValue: currentTelemetry.pressureBar,
          thresholdValue: machine.thresholds.pressureMin,
          unit: 'Bar',
          severity: 'MEDIUM',
          confidenceScore: 0.91,
          anomalyType: 'PRESSURE_DROP',
          timestamp: nowIso,
          rootCauseAnalysis: `Hydraulic circuit pressure fell to ${currentTelemetry.pressureBar.toFixed(1)} Bar (Min threshold: ${machine.thresholds.pressureMin} Bar). Possible fluid seal breach or pump cavitation.`,
          recommendedAction: `Inspect hydraulic lines for fluid seepage, verify pressure relief valve calibration, and check suction filter differential pressure.`,
          status: 'ACTIVE',
        },
      };
    }

    return { isAnomaly: false };
  }
}
