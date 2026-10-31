import type { Go } from '@/api/generated-contracts';
import { blankProfile } from '@/contract/traffic-control';

export type ResourceConfig = Go.resource.Config;
export type ResourcePolicy = Go.resource.Policy;
export type ResourceLimits = Go.resource.Limits;
export type ResourceQuota = Go.resource.Quota;

export function blankLimits(): ResourceLimits {
    return { maxTcpSessions: 0, maxUdpSessions: 0, maxSessions: 0, connectionsPerSecond: 0, connectionBurst: 0, packetsPerSecond: 0, packetBurst: 0 };
}
export function blankResourcePolicy(): ResourcePolicy {
    return { profile: blankProfile(), limits: blankLimits(), quotas: [] };
}
export function normalizeResources(config: ResourceConfig): ResourceConfig {
    const policy = (value: ResourcePolicy): ResourcePolicy => ({ ...value, quotas: value.quotas ?? [] });
    return { ...config, defaultUser: policy(config.defaultUser), groups: (config.groups ?? []).map(group => ({ ...group, quotas: group.quotas ?? [] })), users: (config.users ?? []).map(user => ({ ...user, policy: policy(user.policy) })), credentials: (config.credentials ?? []).map(credential => ({ ...credential, policy: policy(credential.policy) })) };
}

// Byte quotas never pass through Number: values above 2^53 remain exact.
export function validQuotaBytes(value: string) {
    return value === '' || /^\d{1,19}$/.test(value) && BigInt(value) <= 9223372036854775807n;
}
export function parseThresholds(value: string): number[] | null {
    if (!value.trim()) return [];
    const parts = value.split(',').map(part => part.trim());
    if (parts.some(part => !/^\d{1,3}$/.test(part))) return null;
    const values = parts.map(Number);
    if (values.length > 10 || values.some(value => value < 1 || value > 100) || new Set(values).size !== values.length) return null;
    return values;
}
