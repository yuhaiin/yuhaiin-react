import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { moveRule, orderedRules, type OutboundRouting, type RouteRule, type SystemNetworkCapabilities, type SystemNetworkConfig, type SystemNetworkInterfaces, type SystemNetworkStatus } from '@/contract/system-network';
import en from '@/i18n/resources/en/system-network.json';
import ja from '@/i18n/resources/ja/system-network.json';
import ko from '@/i18n/resources/ko/system-network.json';
import Page from './page';

const api = vi.hoisted(() => ({
    getSystemNetworkConfig: vi.fn(),
    putSystemNetworkConfig: vi.fn(),
    getSystemNetworkStatus: vi.fn(),
    getSystemNetworkInterfaces: vi.fn(),
    previewSystemNetwork: vi.fn(),
    getSystemNetworkRoutes: vi.fn(),
    getSystemNetworkOutbound: vi.fn(),
    systemNetworkKeys: { config: 'sn/config', status: 'sn/status', interfaces: 'sn/interfaces', routes: 'sn/routes', outbound: 'sn/outbound' },
}));
vi.mock('@/api/system-network', () => api);
vi.mock('@/api/route', () => ({ listGeoIPCountries: vi.fn().mockResolvedValue({ codes: ['JP', 'US'], loaded: true }) }));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, o?: Record<string, unknown>) => o ? `${key}:${JSON.stringify(o)}` : key, i18n: { language: 'en', resolvedLanguage: 'en' } }),
}));
const confirm = vi.hoisted(() => ({ confirmAction: vi.fn() }));
vi.mock('@/component/v2/confirmation', () => confirm);
vi.mock('@/auth/context', () => ({ usePermission: () => true, useSession: () => ({ principal: { permissions: ['settings:write'] } }) }));

const linux: SystemNetworkCapabilities = { platform: 'linux', routeManagement: true, multipleTargets: true, externalInterfaces: true, gateways: true,
    policyRouting: true, ipv4Forwarding: true, ipv6Forwarding: true, nat: true, tproxy: true, forwardSourceFilter: true,
    routeTargets: ['tun_inbound', 'interface'], forwardTargets: ['tun_inbound', 'interface', 'routes', 'tproxy'] };
const android: SystemNetworkCapabilities = { ...linux, platform: 'android', multipleTargets: false, externalInterfaces: false, gateways: false, policyRouting: false,
    ipv4Forwarding: false, ipv6Forwarding: false, nat: false, tproxy: false, forwardSourceFilter: false, routeTargets: ['tun_inbound'], forwardTargets: [] };
const windows: SystemNetworkCapabilities = { ...linux, platform: 'windows', policyRouting: false, nat: false, tproxy: false, forwardSourceFilter: false, forwardTargets: ['routes'] };

const rule = (id: string, priority: number, fields: Partial<RouteRule> = {}): RouteRule => ({ id, name: id, enabled: true, priority,
    match: { mode: 'global' }, target: { type: 'tun_inbound', inboundId: 'tun-a' }, ...fields });

const interfaces: SystemNetworkInterfaces = {
    items: [
        { name: 'eth0', index: 2, type: 'ethernet', up: true, mtu: 1500, addresses: ['192.168.1.20/24'], gateway: '192.168.1.1', ownership: 'system', routable: true, hardwareAddr: '02:00:00:00:00:02' },
        { name: 'wg0', index: 5, type: 'tunnel', up: true, mtu: 1420, addresses: ['10.8.0.2/32'], ownership: 'external', routable: true, pointToPoint: true },
        { name: 'utun8', index: 9, type: 'tunnel', up: true, mtu: 1500, addresses: ['172.19.0.1/30'], ownership: 'yuhaiin', inboundId: 'tun-a', inboundName: 'TUN A', routable: false },
    ],
    tunInbounds: [{ id: 'tun-a', name: 'TUN A', running: true, interface: 'utun8' }, { id: 'tun-b', name: 'TUN B', running: false }],
    tproxyInbounds: [{ id: 'tp', name: 'tproxy', listen: '0.0.0.0:7893' }],
    missing: [{ target: { type: 'interface', interfaceName: 'tailscale0' }, ruleIds: ['ts'] }],
};

function status(config: SystemNetworkConfig, capabilities = linux): SystemNetworkStatus {
    return { state: 'active', generation: 1, routes: 12, capabilities, appliedAt: 1700000000,
        rules: config.routes.map(r => ({ id: r.id, state: r.id === 'ts' ? 'unavailable' : 'active', ipv4Routes: 4, ipv6Routes: 2, error: r.id === 'ts' ? 'interface tailscale0 does not exist' : undefined })),
        forwarding: { state: 'disabled', ipv4: false, ipv6: false, rules: [] } };
}

let host: HTMLDivElement, root: Root;
let saved: SystemNetworkConfig[];

function setup(config: SystemNetworkConfig, capabilities = linux) {
    saved = [];
    api.getSystemNetworkConfig.mockResolvedValue(structuredClone(config));
    api.getSystemNetworkStatus.mockResolvedValue(status(config, capabilities));
    api.getSystemNetworkInterfaces.mockResolvedValue(structuredClone(interfaces));
    api.previewSystemNetwork.mockImplementation(async (c: SystemNetworkConfig) => ({ routes: 1, rules: c.routes.map(r => ({ id: r.id, ipv4Routes: 7, ipv6Routes: 3, shadowed: r.id === 'dns', overriddenBy: r.id === 'dns' ? ['global'] : undefined })) }));
    api.putSystemNetworkConfig.mockImplementation(async (c: SystemNetworkConfig) => {
        saved.push(structuredClone(c));
        return { config: structuredClone(c), status: status(c, capabilities) };
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }));
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

async function render() {
    await act(async () => {
        root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}><Page /></SWRConfig>);
    });
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    await vi.waitFor(() => expect(host.textContent).toContain('routing.title'));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
}

const buttons = () => [...document.querySelectorAll<HTMLButtonElement>('button')];
const byLabel = (label: string) => {
    const found = buttons().find(b => b.getAttribute('aria-label') === label || b.textContent?.trim() === label);
    if (!found) throw new Error(`Missing button ${label}: ${buttons().map(b => b.getAttribute('aria-label') || b.textContent).join(' | ')}`);
    return found;
};
const click = (label: string) => act(async () => byLabel(label).click());
async function choose(label: string, option: string) {
    const combo = document.querySelector<HTMLButtonElement>(`[role="combobox"][aria-label="${label}"]`);
    if (!combo) throw new Error(`Missing select ${label}`);
    await act(async () => combo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    const found = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(o => o.textContent?.includes(option));
    if (!found) throw new Error(`Missing option ${option}: ${[...document.querySelectorAll('[role="option"]')].map(o => o.textContent).join(' | ')}`);
    await act(async () => found.click());
}
function typeInto(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    act(() => { Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(element, value); element.dispatchEvent(new Event('input', { bubbles: true })); });
}
const field = (label: string) => {
    const l = [...document.querySelectorAll('label')].find(x => x.textContent === label);
    if (!l) throw new Error(`Missing field ${label}`);
    return document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[id="${CSS.escape(l.htmlFor)}"]`)!;
};

it('creates a rule to an external interface, edits, reorders and deletes rules, then saves once', async () => {
    setup({ routes: [rule('global', 100), rule('dns', 200, { match: { mode: 'custom', includeCidrs: ['8.8.8.8'] }, target: { type: 'tun_inbound', inboundId: 'tun-b' } })], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    await render();
    expect(host.textContent).toContain('state.active');
    expect(host.textContent).toContain('routing.destination.global');
    expect(host.textContent).toContain('TUN A');

    // Create: target first, then destinations.
    await click('routing.add');
    expect(document.body.textContent).toContain('editor.stepTarget');
    await act(async () => byLabel('editor.targetInterface').click());
    await choose('editor.chooseInterface', 'wg0');
    typeInto(field('editor.name'), 'Office');
    await act(async () => [...document.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(r => r.getAttribute('value') === 'custom')!.click());
    typeInto(field('match.custom.cidrLabel'), '10.10.0.0/16\n10.10.0.0/33');
    expect(byLabel('editor.apply').disabled).toBe(true);
    expect(document.body.textContent).toContain('match.cidr.prefix');
    typeInto(field('match.custom.cidrLabel'), '10.10.0.0/16');
    await click('editor.apply');
    expect(host.textContent).toContain('Office');
    expect(host.textContent).toContain('state.pending');
    expect(host.textContent).toContain('unsaved');

    // Shadowing from the preview is shown before saving.
    await vi.waitFor(() => expect(host.textContent).toContain('routing.shadowed'));

    // Priority: move the new rule to the top.
    await click('routing.moveUp:{"name":"Office"}');
    await click('routing.moveUp:{"name":"Office"}');
    const names = [...host.querySelectorAll('ol > li')].map(li => li.querySelector('.truncate')?.textContent);
    expect(names).toEqual(['Office', 'global', 'dns']);

    // Delete asks for confirmation first.
    confirm.confirmAction.mockResolvedValueOnce(false);
    await click('routing.remove:{"name":"dns"}');
    expect(host.textContent).toContain('dns');
    confirm.confirmAction.mockResolvedValueOnce(true);
    await click('routing.remove:{"name":"dns"}');
    expect(confirm.confirmAction).toHaveBeenLastCalledWith('routing.removeConfirm:{"name":"dns"}');

    await click('save');
    expect(saved).toHaveLength(1);
    const routes = orderedRules(saved[0].routes);
    expect(routes.map(r => r.name)).toEqual(['Office', 'global']);
    expect(routes[0]).toMatchObject({ priority: 100, enabled: true, match: { mode: 'custom', includeCidrs: ['10.10.0.0/16'] },
        target: { type: 'interface', interfaceName: 'wg0' } });
    expect(host.textContent).toContain('saved');
});

it('shows missing interfaces, ownership and unavailable rules', async () => {
    setup({ routes: [rule('ts', 100, { target: { type: 'interface', interfaceName: 'tailscale0' } })], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    await render();
    expect(host.textContent).toContain('state.unavailable');
    expect(host.textContent).toContain('interface tailscale0 does not exist');
    expect(host.textContent).toContain('routing.target.missing');
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === 'tabs.interfaces')!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
    await vi.waitFor(() => expect(host.textContent).toContain('interfaces.missingTitle'));
    expect(host.textContent).toContain('interfaces.ownership.external');
    expect(host.textContent).toContain('interfaces.ownership.yuhaiin');
    expect(host.textContent).toContain('interfaces.usedBy:{"rules":"ts"}');
    expect(host.textContent).toContain('192.168.1.1');
});

it('shows the system routes with Yuhaiin routes marked by their rule', async () => {
    setup({ routes: [rule('office', 100)], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    api.getSystemNetworkRoutes.mockResolvedValue({ platform: 'linux', readable: true, total: 3, yuhaiinRoutes: 2, routes: [
        { destination: '0.0.0.0/0', gateway: '192.168.1.1', interface: 'eth0', table: 254, metric: 100, type: 'unicast', yuhaiin: false },
        { destination: '10.10.0.0/16', interface: 'wg0', table: 63, type: 'unicast', yuhaiin: true, source: 'rule', ruleId: 'office', ruleName: 'Office' },
        { destination: '203.0.113.0/24', interface: 'utun8', table: 63, type: 'unicast', yuhaiin: true, source: 'stale' },
    ], rules: [{ priority: 30001, family: 2, selector: 'all', table: 63, yuhaiin: true }, { priority: 32766, family: 2, selector: 'all', table: 254, yuhaiin: false }] });
    await render();
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === 'tabs.routes')!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
    await vi.waitFor(() => expect(host.textContent).toContain('10.10.0.0/16'));
    const rows = () => [...host.querySelectorAll('ul[aria-label="routes.title"] > li:not([role="presentation"])')];
    const row = (dst: string) => rows().find(li => li.textContent?.includes(dst))!;
    expect(row('10.10.0.0/16').textContent).toContain('routes.yuhaiin');
    expect(row('10.10.0.0/16').textContent).toContain('routes.source.rule: Office');
    expect(row('203.0.113.0/24').textContent).toContain('routes.source.stale');
    expect(row('0.0.0.0/0').textContent).not.toContain('routes.yuhaiin');
    expect(row('0.0.0.0/0').textContent).toContain('routes.via:{"gateway":"192.168.1.1"}');
    // Linux groups by table and lists the policy rules.
    expect(host.textContent).toContain('routes.tables.main');
    expect(host.textContent).toContain('routes.tables.yuhaiin');
    expect(host.textContent).toContain('routes.rulesTitle');

    const toggle = host.querySelector<HTMLButtonElement>('[role="switch"]')!;
    await act(async () => toggle.click());
    expect(rows().map(li => li.textContent?.match(/^[\d.:/a-f]+/)?.[0])).toEqual(['10.10.0.0/16', '203.0.113.0/24']);
});

it('explains the Android route view', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } }, android);
    api.getSystemNetworkRoutes.mockResolvedValue({ platform: 'android', readable: false, total: 1, yuhaiinRoutes: 1, rules: [],
        routes: [{ destination: '10.0.0.0/8', interface: 'VPN', yuhaiin: true, source: 'vpn', ruleId: 'corp', ruleName: 'Corp' }] });
    await render();
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === 'tabs.routes')!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
    await vi.waitFor(() => expect(host.textContent).toContain('routes.androidVpnOnly'));
    expect(host.textContent).toContain('routes.source.vpn: Corp');
    expect(host.textContent).not.toContain('routes.rulesTitle');
});

it('offers only Android-supported targets and hides forwarding there', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } }, android);
    await render();
    expect(host.textContent).toContain('platform.android');
    expect([...host.querySelectorAll('[role="tab"]')].map(t => t.textContent)).toEqual(['tabs.routing', 'tabs.interfaces', 'tabs.outbound', 'tabs.routes']);
    await click('routing.add');
    expect(buttons().some(b => b.textContent === 'editor.targetInterface')).toBe(false);
    expect(document.body.textContent).toContain('editor.chooseTun');
});

it('configures a side-router forwarding rule with NAT', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    await render();
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === 'tabs.forwarding')!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
    await vi.waitFor(() => expect(host.textContent).toContain('forwarding.introTitle'));
    const ipv4 = [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find(s => s.textContent?.includes('forwarding.ipv4'))!;
    await act(async () => ipv4.click());
    await click('forwarding.add');
    await choose('forwarding.ingress', 'eth0');
    typeInto(field('forwarding.sources'), '192.168.20.0/24');
    await choose('editor.chooseTun', 'TUN A');
    const nat = [...document.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find(s => s.textContent?.includes('forwarding.masquerade'))!;
    expect(nat.getAttribute('aria-checked')).toBe('false');
    await act(async () => nat.click());
    await click('editor.apply');
    await click('save');
    expect(saved[0].forwarding).toMatchObject({ ipv4: true, ipv6: false, rules: [{ ingressInterface: 'eth0', sourceCidrs: ['192.168.20.0/24'], masquerade: true, egress: { type: 'tun_inbound', inboundId: 'tun-a' } }] });
});

it('offers Windows forwarding that follows the routing table, without sources or NAT', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } }, windows);
    await render();
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === 'tabs.forwarding')!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
    await vi.waitFor(() => expect(host.textContent).toContain('forwarding.platform.windows'));
    await click('forwarding.add');
    expect(document.body.textContent).toContain('forwarding.noSourceFilter');
    expect(document.body.textContent).toContain('forwarding.egressRoutesHelp');
    expect(document.body.textContent).not.toContain('forwarding.masquerade');
    expect(buttons().some(b => b.textContent === 'editor.targetTun')).toBe(false);
    await choose('forwarding.ingress', 'eth0');
    await click('editor.apply');
    await click('save');
    expect(saved[0].forwarding.rules).toMatchObject([{ ingressInterface: 'eth0', sourceCidrs: [], egress: { type: 'routes' } }]);
});

it('renumbers priorities when moving rules', () => {
    const rules = [rule('a', 10), rule('b', 10), rule('c', 500)];
    expect(moveRule(rules, 'c', -1).map(r => [r.id, r.priority])).toEqual([['a', 100], ['c', 200], ['b', 300]]);
    expect(moveRule(rules, 'a', -1).map(r => r.id)).toEqual(['a', 'b', 'c']);
});

it('stacks rule and interface layouts on narrow screens', async () => {
    setup({ routes: [rule('global', 100)], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    await render();
    const item = host.querySelector('ol > li')!;
    expect(item.className).toContain('grid');
    expect(item.querySelector('.flex-wrap')).not.toBeNull();
    for (const b of item.querySelectorAll('button')) expect(b.className).not.toContain('w-[');
});

const linuxOutbound: OutboundRouting = {
    platform: 'linux', state: 'active', method: 'SO_MARK', mark: 0x500, protectionActive: true, egressMode: 'kernel', ownTuns: ['tun0'],
    successes: 42, failures: 0,
    rules: [{ ipv6: false, priority: 30001, selector: 'not fwmark 0x500 lookup 63', table: 63, state: 'active' },
        { ipv6: true, priority: 30002, selector: 'not fwmark 0x500 lookup 63', table: 63, state: 'active' }],
    egress: [{ ipv6: false, interface: 'eth0', gateway: '192.168.1.1', prefix: '0.0.0.0/0' }, { ipv6: true, error: 'no route outside Yuhaiin\'s TUN' }],
    interfaces: [
        { name: 'eth0', index: 2, type: 'ethernet', up: true, ownership: 'system', addresses: ['192.168.1.20/24', 'fd00::20/64'], gateway: '192.168.1.1' },
        { name: 'tun0', index: 9, type: 'tunnel', up: true, ownership: 'yuhaiin', addresses: ['172.19.0.1/30'], excluded: true },
    ],
};

async function openTab(name: string) {
    const tab = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(b => b.textContent === name)!;
    await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); tab.click(); });
}

it('explains how Yuhaiin\'s own Linux connections avoid the TUN', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    api.getSystemNetworkOutbound.mockResolvedValue(structuredClone(linuxOutbound));
    await render();
    await openTab('tabs.outbound');
    await vi.waitFor(() => expect(host.textContent).toContain('outbound.headline.active'));
    // Values come from the API: the mark is formatted from it, not hard-coded.
    expect(host.textContent).toContain('outbound.protection.linux:{"mark":"0x500"}');
    expect(host.textContent).toContain('outbound.egressMode.kernel');
    expect(host.textContent).toContain('outbound.otherAppsHelp');
    expect(host.textContent).toContain('eth0');
    expect(host.textContent).toContain('outbound.excluded');
    expect(host.textContent).toContain('no route outside');
    // The scoped-route rows are macOS only.
    expect(host.textContent).not.toContain('outbound.scopedV4');
    // Rules and counters live in the details.
    expect(host.textContent).not.toContain('not fwmark 0x500 lookup 63');
    await click('outbound.details');
    expect(host.textContent).toContain('not fwmark 0x500 lookup 63');
    expect(host.textContent).toContain('outbound.socketsValue:{"ok":42,"failed":0}');
});

it('shows macOS scoped routes and never calls a degraded or failed state active', async () => {
    setup({ routes: [], forwarding: { ipv4: false, ipv6: false, rules: [] } });
    api.getSystemNetworkOutbound.mockResolvedValue({
        platform: 'darwin', state: 'degraded', method: 'IP_BOUND_IF / IPV6_BOUND_IF', protectionActive: true, egressMode: 'bound', ownTuns: ['utun5'],
        successes: 0, failures: 0, problems: ['could not install the scoped default route on en5: permission denied'],
        egress: [{ ipv6: false, interface: 'en0', gateway: '192.168.2.1' }, { ipv6: true, interface: 'en0' }],
        interfaces: [
            { name: 'en0', index: 11, type: 'wifi', up: true, ownership: 'system', addresses: ['192.168.2.184/24'], gateway: '192.168.2.1',
                scoped: { state: 'primary', gateway: '192.168.2.1' }, scopedV6: { state: 'unavailable', reason: 'no router known for this interface' } },
            { name: 'en5', index: 15, type: 'ethernet', up: true, ownership: 'system', addresses: ['192.168.20.100/24'],
                scoped: { state: 'failed', reason: 'permission denied' } },
        ],
    } satisfies OutboundRouting);
    await render();
    await openTab('tabs.outbound');
    await vi.waitFor(() => expect(host.textContent).toContain('outbound.headline.degraded'));
    expect(host.textContent).not.toContain('outbound.headline.active');
    const alert = host.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('permission denied');
    expect(host.textContent).toContain('outbound.scoped.primary');
    expect(host.textContent).toContain('outbound.scoped.unavailable');
    expect(host.textContent).toContain('outbound.scoped.failed');
    expect(host.textContent).toContain('outbound.protection.darwin');

    api.getSystemNetworkOutbound.mockResolvedValue({ ...linuxOutbound, state: 'failed', protectionActive: false, problems: ['the TUN policy rule does not exclude marked sockets'] });
    await click('outbound.refresh');
    await vi.waitFor(() => expect(host.textContent).toContain('outbound.headline.failed'));
    expect(host.textContent).toContain('state.failed');
});

it('keeps the three languages in sync', () => {
    const keys = (value: unknown, prefix = ''): string[] => value && typeof value === 'object'
        ? Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k)) : [prefix];
    expect(keys(ja).sort()).toEqual(keys(en).sort());
    expect(keys(ko).sort()).toEqual(keys(en).sort());
});
