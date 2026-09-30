import { NextRequest, NextResponse } from 'next/server';
import { telemetrySimulator } from '@/lib/telemetry-simulator';
import { 
  buildSystemPrompt, 
  generateLocalCopilotResponse, 
  CopilotContextPayload 
} from '@/lib/copilot-knowledge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message query is required' }, { status: 400 });
    }

    // 1. Gather live contextual factory state
    const machines = telemetrySimulator.getMachines();
    const anomalies = telemetrySimulator.getAnomalies();
    const alerts = telemetrySimulator.getAlerts();
    const allTelemetry = telemetrySimulator.getAllTelemetry();

    const telemetrySummary: Record<string, {
      latestVibration: number;
      latestTemp: number;
      status: string;
      isOverThreshold: boolean;
    }> = {};

    for (const m of machines) {
      const history = allTelemetry[m.id] || [];
      const latest = history[history.length - 1];
      telemetrySummary[m.id] = {
        latestVibration: latest?.vibrationRms ?? 0,
        latestTemp: latest?.temperatureCelsius ?? 0,
        status: m.status,
        isOverThreshold: (latest?.vibrationRms ?? 0) >= m.thresholds.vibrationWarning ||
                         (latest?.temperatureCelsius ?? 0) >= m.thresholds.tempWarning,
      };
    }

    const contextPayload: CopilotContextPayload = {
      factoryName: 'Yantra Precision Engineering Works',
      plantCode: 'PUNE-PLANT-01',
      machines,
      anomalies,
      alerts,
      telemetrySummary,
    };

    // 2. Check for LLM API Key (Google Gemini or OpenAI)
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = buildSystemPrompt(contextPayload);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${message}` }],
                },
              ],
              generationConfig: {
                temperature: 0.2, // Low temperature for factual industrial accuracy
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              reply: generatedText,
              provider: 'gemini-1.5-flash',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (llmErr) {
        console.warn('Gemini API call failed, falling back to local industrial engine:', llmErr);
      }
    } else if (openaiApiKey) {
      try {
        const systemPrompt = buildSystemPrompt(contextPayload);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              reply,
              provider: 'gpt-4o-mini',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (llmErr) {
        console.warn('OpenAI API call failed, falling back to local industrial engine:', llmErr);
      }
    }

    // 3. High-fidelity industrial fallback engine
    // Returns instantaneous, physics-accurate responses grounded in live machine state
    const localReply = generateLocalCopilotResponse(message, contextPayload);

    return NextResponse.json({
      reply: localReply,
      provider: 'yantra-industrial-knowledge-engine',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process copilot query', details: error.message },
      { status: 500 }
    );
  }
}
