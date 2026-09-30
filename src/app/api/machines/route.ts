import { NextResponse } from 'next/server';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

export async function GET() {
  const machines = telemetrySimulator.getMachines();
  const anomalies = telemetrySimulator.getAnomalies();
  const alerts = telemetrySimulator.getAlerts();

  return NextResponse.json({
    machines,
    anomalies,
    alerts,
    timestamp: new Date().toISOString(),
  });
}
