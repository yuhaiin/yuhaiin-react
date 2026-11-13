import type { Go } from '@/api/generated-contracts';
import { analyzeCidrs } from '@/common/cidr';

export type SystemNetworkConfig = Go.sysnet.Config;
export type RouteRule = Go.sysnet.RouteRule;
export type RouteMatch = Go.sysnet.RouteMatch;
export type RouteTarget = Go.sysnet.RouteTarget;
export type ForwardRule = Go.sysnet.ForwardRule;
export type SystemNetworkStatus = Go.sysnet.Status;
export type RuleStatus = Go.sysnet.RuleStatus;
export type SystemNetworkCapabilities = Go.sysnet.Capabilities;
export type SystemNetworkInterfaces = Go.sysnet.Interfaces;
export type NetworkInterface = Go.sysnet.Interface;
export type SystemNetworkPreview = Go.sysnet.Preview;
export type SystemNetworkSaveResult = Go.sysnet.SaveResult;
export type MatchMode = 'global' | 'non_private' | 'custom';

export function blankSystemNetworkConfig(): SystemNetworkConfig {
    return { routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } };
}

export function normalizeSystemNetworkConfig(value?: Partial<SystemNetworkConfig>): SystemNetworkConfig {
    return {
        ...value,
        routes: (value?.routes ?? []).map(rule => ({ ...rule, match: { ...rule.match }, target: { ...rule.target } })),
        forwarding: {
            ipv4: value?.forwarding?.ipv4 ?? false,
            ipv6: value?.forwarding?.ipv6 ?? false,
            rules: (value?.forwarding?.rules ?? []).map(rule => ({ ...rule, sourceCidrs: rule.sourceCidrs ?? [], egress: { ...rule.egress } })),
        },
    };
}

export function newID(prefix: string): string {
    return `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(16).slice(2, 10)}`;
}

/** Rules are evaluated by ascending priority, then list position. */
export function orderedRules(rules: readonly RouteRule[]): RouteRule[] {
    return rules.map((rule, index) => ({ rule, index }))
        .sort((a, b) => a.rule.priority - b.rule.priority || a.index - b.index)
        .map(item => item.rule);
}

export function nextPriority(rules: readonly RouteRule[]): number {
    return rules.reduce((max, rule) => Math.max(max, rule.priority), 0) + 100;
}

/** Moves a rule one step in evaluation order and renumbers priorities in steps of 100. */
export function moveRule(rules: readonly RouteRule[], id: string, step: -1 | 1): RouteRule[] {
    const order = orderedRules(rules);
    const index = order.findIndex(rule => rule.id === id);
    const target = index + step;
    if (index < 0 || target < 0 || target >= order.length) return order;
    [order[index], order[target]] = [order[target], order[index]];
    return order.map((rule, position) => ({ ...rule, priority: (position + 1) * 100 }));
}

export function newRouteRule(rules: readonly RouteRule[], target: RouteTarget): RouteRule {
    return { id: newID('route'), name: '', enabled: true, priority: nextPriority(rules), match: { mode: 'non_private' }, target };
}

/** Returns the first problem that would make the core reject the match, or undefined. */
export function matchError(match: RouteMatch): 'cidr' | 'empty' | undefined {
    if (analyzeCidrs(match.includeCidrs ?? []).errors.length || analyzeCidrs(match.bypassCidrs ?? []).errors.length) return 'cidr';
    if (match.mode === 'custom' && !match.includeCidrs?.length && !match.geoipCountries?.length && !match.geoipInvert) return 'empty';
    return undefined;
}

export function targetError(target: RouteTarget): 'target' | undefined {
    if (target.type === 'interface') return target.interfaceName ? undefined : 'target';
    return target.inboundId ? undefined : 'target';
}

/** Empty sources forward every device on the ingress; "routes" follows the routing table. */
export function forwardRuleError(rule: ForwardRule): 'ingress' | 'cidr' | 'target' | undefined {
    if (!rule.ingressInterface) return 'ingress';
    if (analyzeCidrs(rule.sourceCidrs).errors.length || analyzeCidrs(rule.destinationCidrs ?? []).errors.length) return 'cidr';
    return rule.egress.type === 'routes' ? undefined : targetError(rule.egress);
}

export function configHasErrors(config: SystemNetworkConfig): boolean {
    return config.routes.some(rule => matchError(rule.match) || targetError(rule.target)) || config.forwarding.rules.some(rule => forwardRuleError(rule));
}

/** Networks the core keeps off the target in non-private mode (pkg/sysnet/policy). */
export const nonPrivateExclusions = {
    private: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10', 'fc00::/7'],
    local: ['127.0.0.0/8', '169.254.0.0/16', '0.0.0.0/8', '224.0.0.0/3', '::/16', 'fe80::/10', 'ff00::/8'],
};
