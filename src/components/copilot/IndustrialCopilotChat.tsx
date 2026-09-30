'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  X,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Copy,
  RotateCcw,
  Check
} from 'lucide-react';
import { CopilotMessage, Machine, Anomaly } from '@/types/industrial';
import { generateLocalCopilotResponse, CopilotContextPayload } from '@/lib/copilot-knowledge';
import { telemetrySimulator } from '@/lib/telemetry-simulator';

interface IndustrialCopilotChatProps {
  machines: Machine[];
  anomalies: Anomaly[];
  onSelectMachine?: (machineId: string) => void;
  isDrawer?: boolean;
  onClose?: () => void;
  initialQuery?: string;
}

const DEFAULT_PROMPTS = [
  'Which machine showed abnormal vibration today?',
  'Why did Machine 03 trigger a warning at 14:30?',
  'What maintenance action should I take next?',
  'What is our current plant OEE and where is the bottleneck?',
];

export function IndustrialCopilotChat({
  machines,
  anomalies,
  onSelectMachine,
  isDrawer = false,
  onClose,
  initialQuery,
}: IndustrialCopilotChatProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **YantraOS Industrial Copilot**. I am connected to the live telemetry stream of your Pune plant.
      
I continuously monitor vibration velocity (ISO 10816), thermal gradients, motor current, and hydraulic pressures across your fleet to prevent unscheduled machine breakdowns.

**How can I assist your maintenance shift right now?** Click one of the quick queries below or ask me anything.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMessage: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No telemetry diagnosis generated.',
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      // Graceful fallback for static GitHub Pages or offline environments
      try {
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
          alerts: telemetrySimulator.getAlerts(),
          telemetrySummary,
        };

        const localReply = generateLocalCopilotResponse(trimmed, contextPayload);
        const botMessage: CopilotMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: localReply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (fallbackErr: any) {
        const errorMessage: CopilotMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Diagnostic Pipeline Error**: ${err.message || 'Unable to connect to telemetry copilot API'}.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputQuery);
    }
  };

  return (
    <div className={`flex flex-col rounded-xl border border-industrial-800 bg-industrial-900/90 shadow-2xl backdrop-blur-md ${
      isDrawer ? 'h-full w-full' : 'h-[650px] w-full'
    }`}>
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-industrial-800 bg-industrial-950/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">Yantra Industrial Copilot</h3>
              <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[9px] font-mono text-cyan-400 border border-cyan-800/60">
                Grounded RAG
              </span>
            </div>
            <p className="text-[11px] text-industrial-400">
              Live fleet context: {machines.length} machines | {anomalies.filter(a => a.status === 'ACTIVE').length} active anomalies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Reset Chat Button */}
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: `Hello! I am your **YantraOS Industrial Copilot**. I am connected to the live telemetry stream of your Pune plant.\n\n**How can I assist your maintenance shift right now?** Click one of the quick queries below or ask me anything.`,
                  timestamp: new Date().toISOString(),
                }
              ]);
            }}
            className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-800 hover:text-white transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Copy Transcript Button */}
          <button
            onClick={() => {
              const transcript = messages.map(m => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleTimeString()}]:\n${m.content}\n`).join('\n---\n');
              navigator.clipboard.writeText(transcript);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-800 hover:text-white transition-colors"
            title="Copy Chat Transcript"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-industrial-400 hover:bg-industrial-800 hover:text-white transition-colors"
              title="Close Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-industrial-950/80 border border-industrial-800/80 text-industrial-100 rounded-tl-none'
                }`}
              >
                {/* Message Body with Markdown styling simulation */}
                <div className="space-y-2 leading-relaxed">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    // Check if paragraph is a table or markdown list
                    if (paragraph.startsWith('|')) {
                      // Simple table render
                      const rows = paragraph.trim().split('\n');
                      return (
                        <div key={pIdx} className="overflow-x-auto my-2">
                          <table className="w-full text-[11px] border border-industrial-800 text-left font-mono">
                            <tbody>
                              {rows.map((row, rIdx) => {
                                if (row.includes('---')) return null;
                                const cols = row.split('|').filter(c => c.trim().length > 0);
                                return (
                                  <tr key={rIdx} className={rIdx === 0 ? 'bg-industrial-900 font-bold text-cyan-300' : 'border-t border-industrial-800/60'}>
                                    {cols.map((col, cIdx) => (
                                      <td key={cIdx} className="p-1.5">{col.trim()}</td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    }

                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-xs font-bold text-cyan-300 border-b border-industrial-800 pb-1 mt-2">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }

                    if (paragraph.startsWith('#### ')) {
                      return (
                        <h5 key={pIdx} className="text-xs font-semibold text-industrial-300 mt-2">
                          {paragraph.replace('#### ', '')}
                        </h5>
                      );
                    }

                    return (
                      <p key={pIdx} className="text-xs leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-industrial-400 font-mono">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && (
                    <span className="flex items-center gap-1 text-cyan-400/80">
                      <ShieldCheck className="h-3 w-3" /> Telemetry Grounded
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-industrial-800 text-industrial-300 border border-industrial-700">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-xl rounded-tl-none border border-industrial-800 bg-industrial-950/80 px-4 py-3 text-industrial-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-xs text-cyan-300">Evaluating telemetry streams & ISO 10816 standards...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-industrial-800/80 bg-industrial-950/50 p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-industrial-400 mb-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Recommended Plant Queries:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="rounded-md border border-industrial-800 bg-industrial-900 px-2 py-1 text-[11px] text-industrial-300 transition-colors hover:border-cyan-500/50 hover:bg-industrial-850 hover:text-cyan-200 text-left disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-industrial-800 bg-industrial-950/90 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot (e.g. 'Why did Machine 03 trigger a warning at 14:30?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-industrial-800 bg-industrial-900 px-3.5 py-2 text-xs text-white placeholder-industrial-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(inputQuery)}
            disabled={isLoading || !inputQuery.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
