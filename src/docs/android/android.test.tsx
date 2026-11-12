import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { AndroidStatus } from '@/api/android';

let status: AndroidStatus | undefined;
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-android-platform', () => ({
    useAndroidStatus: () => ({ data: status, error: undefined, mutate: vi.fn() }),
    useAndroidPlatform: () => ({ platform: 'android', session: true }),
}));

const { AndroidVpnCard, vpnSummary } = await import('./AndroidVpnCard');
const { filterApps } = await import('./page');

let root: Root;
let host: HTMLDivElement;
afterEach(() => { act(() => root.unmount()); host.remove(); });
function mount() { host = document.createElement('div'); document.body.append(host); root = createRoot(host); act(() => root.render(<AndroidVpnCard />)); }

function make(runtime: Partial<AndroidStatus['vpn']['runtime']>, enabled: boolean): AndroidStatus {
    return {
        platform: 'android',
        core: { running: true, startedAt: 1, port: 8080, https: true, lanAccess: false },
        vpn: { enabled, inboundId: 'tun', runtime: { state: 'stopped', generation: 0, reconfigurations: 0, reconfigureFailures: 0, changedAt: 1, ...runtime } },
    };
}

it('shows core and VPN state separately while the VPN is off', () => {
    status = make({}, false);
    mount();
    expect(host.textContent).toContain('core.running');
    expect(host.textContent).toContain('state.stopped');
    expect(host.textContent).toContain('vpn.connect');
});

it('asks for authorization through the fixed native link', () => {
    status = make({ state: 'failed', errorCode: 'permission_required', lastError: 'permission_required: x' }, true);
    mount();
    const link = host.querySelector('a');
    expect(link?.getAttribute('href')).toBe('yuhaiin-android://action/vpn/authorize');
    expect(host.textContent).toContain('vpn.permissionRequired');
});

it('hides authorization prompts once the VPN runs', () => {
    status = make({ state: 'running', errorCode: 'permission_required' }, true);
    mount();
    expect(host.querySelector('a')).toBeNull();
});

it('shows reconfiguration and the applied FakeIP routes', () => {
    status = make({ state: 'reconfiguring', generation: 4, applied: { mtu: 9000, dns: ['172.19.0.2'], routes: [], excludes: [], fakeIpRoutes: ['198.18.0.0/16'], platformRevision: 0 } }, true);
    mount();
    expect(host.textContent).toContain('vpn.reconfiguring');
    expect(host.textContent).toContain('198.18.0.0/16');
    expect(vpnSummary(status).mismatch).toBe(false);
});

it('flags a desired/actual mismatch', () => {
    expect(vpnSummary(make({ state: 'stopped' }, true)).mismatch).toBe(true);
    expect(vpnSummary(make({ state: 'running' }, false)).mismatch).toBe(true);
    expect(vpnSummary(make({ state: 'establishing' }, true)).mismatch).toBe(false);
});

it('filters apps, keeping selected system apps visible', () => {
    const apps = [
        { name: 'Zed', packageName: 'org.zed', system: false },
        { name: 'Alpha', packageName: 'org.alpha', system: false },
        { name: 'Phone', packageName: 'com.android.phone', system: true },
        { name: 'Settings', packageName: 'com.android.settings', system: true },
    ];
    const selected = new Set(['org.zed', 'com.android.phone']);
    expect(filterApps(apps, '', false, selected).map(a => a.packageName)).toEqual(['com.android.phone', 'org.zed', 'org.alpha']);
    expect(filterApps(apps, 'set', true, selected).map(a => a.packageName)).toEqual(['com.android.settings']);
});
