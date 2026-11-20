import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ProtectionStatus } from '@/contract/system-network';
import { ProtectionTab } from './protection';

const api = vi.hoisted(() => ({
    getNetworkProtection: vi.fn(),
    putNetworkProtection: vi.fn(),
    systemNetworkKeys: { protection: 'sn/protection' },
}));
vi.mock('@/api/system-network', () => api);
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, o?: Record<string, unknown>) => o && !('defaultValue' in o) ? `${key}:${JSON.stringify(o)}` : key, i18n: { language: 'en', resolvedLanguage: 'en' } }),
}));
const confirm = vi.hoisted(() => ({ confirmAction: vi.fn() }));
vi.mock('@/component/v2/confirmation', () => confirm);
vi.mock('@/auth/context', () => ({ usePermission: () => true, useSession: () => ({ principal: { permissions: ['settings:write'] } }) }));

const protectedStatus: ProtectionStatus = {
    state: 'protected', supported: true, backend: 'pf', backendName: 'macOS Packet Filter', mode: 'standard',
    desired: { enabled: true, startAtBoot: true }, effective: true, service: 'running',
    filter: { enabled: true, registered: true, persistent: true, loaded: true, reference: true, name: 'io.github.yuhaiin/protection' },
    checkedAt: 1700000000, updatedAt: 1700000000,
    physicalInterfaces: ['en0', 'en5'], tunnelInterfaces: ['utun4'], privateNetworks: ['10.0.0.0/8', 'fc00::/7'],
    bypassNetworks: ['203.0.113.0/24'], bypassCount: 1,
    ownTraffic: { allowed: true, method: 'socket_group', group: '_yuhaiin', groupId: 345, connections: 3 },
    tunnelIpv4: true, tunnelIpv6: false, blocked: { packets: 12, bytes: 840, lastAt: 1700000100 },
};

let host: HTMLDivElement, root: Root;
beforeEach(() => {
    vi.clearAllMocks();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); document.body.innerHTML = ''; });

async function render(status: ProtectionStatus) {
    api.getNetworkProtection.mockResolvedValue(structuredClone(status));
    await act(async () => {
        root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}><ProtectionTab /></SWRConfig>);
    });
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
}

const switchFor = (label: string) => {
    const s = [...document.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find(b => b.textContent?.includes(label));
    if (!s) throw new Error(`no switch ${label}`);
    return s;
};

it('shows the verified state, the allowed paths and the enforced policy', async () => {
    await render(protectedStatus);
    const text = host.textContent ?? '';
    expect(text).toContain('protection.state.protected');
    expect(text).toContain('protection.enforced');
    expect(text).toContain('utun4');
    expect(text).toContain('203.0.113.0/24');
    expect(text).toContain('protection.flow.noIPv6');
    expect(text).toContain('protection.policy.blockedValue');
    expect(text).toContain('sudo yuhaiin protection disable --recovery');
    expect(switchFor('protection.enable').getAttribute('aria-checked')).toBe('true');
});

it('never shows Protected when the rules are not enforced and explains why', async () => {
    await render({ ...protectedStatus, state: 'error', effective: false, error: 'pf rejected',
        filter: { ...protectedStatus.filter, loaded: false }, blocked: undefined,
        problems: [{ code: 'registration', message: 'main ruleset lacks the anchor', hint: 'Check /etc/pf.conf' }] });
    const text = host.textContent ?? '';
    expect(text).toContain('protection.state.error');
    expect(text).not.toContain('protection.state.protected');
    expect(text).toContain('protection.notEnforced');
    expect(text).toContain('protection.problem.registration');
    expect(text).toContain('Check /etc/pf.conf');
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
});

it('asks before enabling and reports the backend result', async () => {
    const off: ProtectionStatus = { ...protectedStatus, state: 'disabled', effective: false, desired: { enabled: false, startAtBoot: false }, tunnelInterfaces: [], blocked: undefined };
    await render(off);
    confirm.confirmAction.mockResolvedValueOnce(false);
    await act(async () => switchFor('protection.enable').click());
    expect(api.putNetworkProtection).not.toHaveBeenCalled();
    confirm.confirmAction.mockResolvedValueOnce(true);
    api.putNetworkProtection.mockResolvedValueOnce(protectedStatus);
    await act(async () => switchFor('protection.enable').click());
    expect(api.putNetworkProtection).toHaveBeenCalledWith({ enabled: true, startAtBoot: true });
    await vi.waitFor(() => expect(host.textContent).toContain('protection.state.protected'));
});

it('shows a failed change', async () => {
    await render(protectedStatus);
    api.putNetworkProtection.mockRejectedValueOnce({ msg: 'Cannot save the disabled state' });
    await act(async () => switchFor('protection.enable').click());
    expect(api.putNetworkProtection).toHaveBeenCalledWith({ enabled: false, startAtBoot: true });
    await vi.waitFor(() => expect(host.textContent).toContain('Cannot save the disabled state'));
});

it('explains unsupported platforms', async () => {
    await render({ ...protectedStatus, state: 'unsupported', supported: false, effective: false });
    expect(host.textContent).toContain('protection.unsupported');
    expect(document.querySelector('[role="switch"]')).toBeNull();
});
