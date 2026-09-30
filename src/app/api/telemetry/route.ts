import { NextRequest, NextResponse } from 'next/server';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const machineId = searchParams.get('machineId');

  if (machineId) {
    const data = telemetrySimulator.getTelemetry(machineId);
    return NextResponse.json({ machineId, telemetry: data });
  }

  const all = telemetrySimulator.getAllTelemetry();
  return NextResponse.json({ telemetry: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machineId, faultType } = body;

    if (machineId && faultType) {
      telemetrySimulator.injectFault(machineId, faultType);
      return NextResponse.json({ 
        success: true, 
        message: `Injected fault '${faultType}' into machine ${machineId}` 
      });
    }

    return NextResponse.json({ error: 'machineId and faultType are required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
