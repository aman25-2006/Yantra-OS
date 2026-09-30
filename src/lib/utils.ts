import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MachineStatus, AnomalySeverity } from "@/types/industrial";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMetric(val: number | undefined | null, decimals = 2, unit = ""): string {
  if (val === undefined || val === null || isNaN(val)) return `-- ${unit}`.trim();
  return `${val.toFixed(decimals)} ${unit}`.trim();
}

export function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return isoString;
  }
}

export function getStatusBadgeStyle(status: MachineStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'RUNNING':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        label: 'Running',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
        label: 'Warning',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
        dot: 'bg-rose-500 animate-ping shadow-[0_0_12px_rgba(244,63,94,0.9)]',
        label: 'Critical Alert',
      };
    case 'IDLE':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
        label: 'Standby / Idle',
      };
    case 'OFFLINE':
    default:
      return {
        bg: 'bg-slate-700/20',
        text: 'text-slate-400',
        border: 'border-slate-700/40',
        dot: 'bg-slate-500',
        label: 'Offline',
      };
  }
}

export function getSeverityBadgeStyle(severity: AnomalySeverity): {
  badge: string;
  border: string;
  text: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        border: 'border-rose-500',
        text: 'text-rose-400 font-semibold',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        border: 'border-amber-500',
        text: 'text-amber-400',
      };
    case 'LOW':
    default:
      return {
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        border: 'border-blue-500',
        text: 'text-blue-400',
      };
  }
}

// ISO 10816-3 Vibration Severity Classification for Class II/III industrial machines
export function getIsoVibrationZone(rms: number): {
  zone: 'A' | 'B' | 'C' | 'D';
  label: string;
  color: string;
  description: string;
} {
  if (rms < 1.8) {
    return {
      zone: 'A',
      label: 'Good (Zone A)',
      color: '#10b981',
      description: 'Newly commissioned machine vibration levels.',
    };
  } else if (rms <= 4.5) {
    return {
      zone: 'B',
      label: 'Acceptable (Zone B)',
      color: '#38bdf8',
      description: 'Satisfactory for unrestricted long-term operation.',
    };
  } else if (rms <= 7.1) {
    return {
      zone: 'C',
      label: 'Unsatisfactory (Zone C)',
      color: '#f59e0b',
      description: 'Restricted operation only. Schedule planned overhaul.',
    };
  } else {
    return {
      zone: 'D',
      label: 'Unacceptable (Zone D)',
      color: '#ef4444',
      description: 'Danger of damage. Immediate shutdown & inspection required.',
    };
  }
}
