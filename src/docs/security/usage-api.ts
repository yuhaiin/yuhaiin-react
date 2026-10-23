import { authAPI } from '@/auth/api';
import type { Go } from '@/api/generated-contracts';

export interface UsageCounters { upload: string; download: string; opened: string; failed: string; sessionMillis: string; firstSeen: number; lastSeen: number }
export interface UsageHealth { pendingAudit: number; droppedAudit: string; lastFlush: number; persistenceError: boolean }
export interface UsageOptions { auditDays: number; maxAuditRows: number; hourlyDays: number; dailyDays: number }
export interface UsageBreakdown extends UsageCounters { id: string; name: string }
export interface UsageReport {
    summary: { userId: string; lifetime: UsageCounters; period: UsageCounters; activeTcp: number; activeUdp: number; peakTcp: number; peakUdp: number; activeMinutes: string; periodActiveMinutes: string; uploadRate: string; downloadRate: string };
    series: Array<UsageCounters & { start: number }>;
    nodes: UsageBreakdown[]; inbounds: UsageBreakdown[]; credentials: UsageBreakdown[]; protocols: UsageBreakdown[];
    interval: string; from: number; to: number; updatedAt: number; health: UsageHealth;
}
export interface UsageAudit {
    accessDecision?: Go.access.Decision;
	groupIds?: string[];
    id: string; userId: string; credentialId: string; inboundId: string; inboundName: string; nodeId: string; nodeName: string;
    selectorId: string; selectorName: string; ruleId: string; ruleName: string; protocol: string; mode: string; source: string; target: string; ip: string;
    startedAt: number; endedAt: number; lastSeen: number; durationMillis: string; upload: string; download: string; result: string; reason: string;
}
export interface UsageAuditPage { items: UsageAudit[]; next: string; health: UsageHealth }

export function usageBytes(raw: string): string {
    let value: bigint;
    try { value = BigInt(raw); } catch { return '—'; }
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    let unit = 0; let divisor = 1n;
    while (value >= divisor * 1024n && unit < units.length - 1) { divisor *= 1024n; unit++; }
    const scaled = value * 100n / divisor;
    return `${scaled / 100n}.${String(scaled % 100n).padStart(2, '0')} ${units[unit]}`;
}

export function usageDate(raw: number): string { return raw > 0 ? new Date(raw).toLocaleString(undefined, { timeZone: 'UTC', timeZoneName: 'short' }) : '—'; }
export function usageDuration(raw: string): string {
    try { const seconds = BigInt(raw) / 1000n; return `${seconds / 3600n}h ${seconds / 60n % 60n}m ${seconds % 60n}s`; } catch { return '—'; }
}

export function usagePath(path: string, parameters: Record<string, string>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) if (value) query.set(key, value);
    return `/usage${path}?${query}`;
}
export function fetchUsage<T>(path: string, parameters: Record<string, string>) { return authAPI<T>('GET', usagePath(path, parameters)); }

export function usageRange(preset: string, from: string, to: string, now = Date.now()): Record<string, string> {
    const date = new Date(now);
    let start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    let end = now + 1000;
    if (preset === 'month') start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    if (preset === '30days') start -= 29 * 86400000;
    if (preset === 'custom') { start = Date.parse(`${from}T00:00:00Z`); end = Math.min(Date.parse(`${to}T00:00:00Z`) + 86400000, end); }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error('Invalid date range');
    return { from: String(Math.floor(start / 1000)), to: String(Math.floor(end / 1000)), interval: preset === 'today' ? 'hour' : 'day' };
}
