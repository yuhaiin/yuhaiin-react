import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type {
    TrafficControlConfig,
    TrafficStatus,
} from '@/contract/traffic-control';
import Page from './page';

const api = vi.hoisted(() => ({
    getTrafficControl: vi.fn(),
    putTrafficControl: vi.fn(),
    getTrafficStatus: vi.fn(),
    listInbounds: vi.fn(),
    listRules: vi.fn(),
}));

vi.mock('@/api/traffic-control', () => api);
vi.mock('@/api/inbounds', () => ({ listInbounds: api.listInbounds }));
vi.mock('@/api/route', () => ({ listRules: api.listRules }));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const cacheProvider = () => new Map();
const config: TrafficControlConfig = {
    enabled: true,
    global: {
        upload: { bytesPerSecond: 0, burstBytes: 0 },
        download: { bytesPerSecond: 0, burstBytes: 0 },
    },
    defaultProfile: '',
    profiles: {},
    inboundProfiles: {},
    routeProfiles: {},
};
const counters: TrafficStatus['global'] = {
    Sessions: 0,
    QueueBytes: 0,
    PendingTasks: 0,
    DeniedSessions: 0,
    DeniedBytes: 0,
    DeniedPending: 0,
    DeniedRateSessions: 0,
    DeniedPackets: 0,
};
const status: TrafficStatus = {
    global: counters,
    nat: counters,
    inboundScopes: [],
    truncated: false,
    shaping: {
        admittedUploadBytes: 0,
        admittedDownloadBytes: 0,
        rejectedUploadDatagrams: 0,
        rejectedDownloadDatagrams: 0,
        pacingWaitNanos: 0,
    },
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
    }));
    api.getTrafficControl.mockResolvedValue(structuredClone(config));
    api.getTrafficStatus.mockResolvedValue(status);
    api.listInbounds.mockResolvedValue({
        items: [{ id: 'inbound-a', name: 'VPN' }],
        page: { page: 1, pageSize: 100, total: 1 },
    });
    api.listRules.mockResolvedValue({
        items: [{ id: 'route-a', name: 'Work' }],
        page: { page: 1, pageSize: 100, total: 1 },
    });
    api.putTrafficControl.mockImplementation(
        async (value: TrafficControlConfig) => structuredClone(value),
    );
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});

afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
});

async function render() {
    await act(async () => {
        root.render(
            <SWRConfig
                value={{
                    provider: cacheProvider,
                    dedupingInterval: 0,
                    shouldRetryOnError: false,
                }}
            >
                <Page />
            </SWRConfig>,
        );
        await Promise.resolve();
        await Promise.resolve();
    });
}

function button(label: string): HTMLButtonElement {
    const found = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (item) => item.textContent?.trim() === label,
    );
    if (!found) throw new Error(`Missing button ${label}`);
    return found;
}

function input(label: string): HTMLInputElement {
    const found = host.querySelector<HTMLInputElement>(
        `input[aria-label="${label}"]`,
    );
    if (!found) throw new Error(`Missing input ${label}`);
    return found;
}

function editInput(target: HTMLInputElement, value: string) {
    act(() => {
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value',
        )!.set!.call(target, value);
        target.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

async function selectProfile(label: string, profile: string) {
    const combo = host.querySelector<HTMLButtonElement>(
        `[role="combobox"][aria-label="${label}"]`,
    );
    if (!combo) throw new Error(`Missing binding ${label}`);
    await act(async () =>
        combo.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        ),
    );
    const option = [
        ...document.querySelectorAll<HTMLElement>('[role="option"]'),
    ].find((item) => item.textContent === profile);
    if (!option) throw new Error(`Missing profile ${profile}`);
    await act(async () => option.click());
}

it('creates a profile, binds it to inbound and route scopes, then saves the complete policy', async () => {
    await render();
    expect(host.textContent).toContain('bindingsNeedProfile');
    await act(async () => button('addProfile').click());
    editInput(input('newProfile'), 'video');
    await act(async () => button('add').click());
    await selectProfile('VPN', 'video');
    await selectProfile('Work', 'video');

    await act(async () => button('save').click());

    expect(api.putTrafficControl).toHaveBeenCalledWith(
        expect.objectContaining({
            profiles: {
                video: {
                    upload: { bytesPerSecond: 0, burstBytes: 0 },
                    download: { bytesPerSecond: 0, burstBytes: 0 },
                },
            },
            inboundProfiles: { 'inbound-a': 'video' },
            routeProfiles: { 'route-a': 'video' },
        }),
    );
    expect(host.querySelector('[role="status"]')?.textContent).toBe('saved');
});

it('paginates the binding choices so resources after the first 120 remain bindable', async () => {
    api.getTrafficControl.mockResolvedValue({ ...structuredClone(config), profiles: { video: { upload: { bytesPerSecond: 0, burstBytes: 0 }, download: { bytesPerSecond: 0, burstBytes: 0 } } } });
    api.listInbounds.mockImplementation(
        async ({ page = 1 }: { page?: number }) => ({
            items:
                page === 1
                    ? Array.from({ length: 100 }, (_, index) => ({
                          id: `inbound-${index + 1}`,
                          name: `VPN ${index + 1}`,
                      }))
                    : [{ id: 'inbound-201', name: 'VPN 201' }],
            page: { page, pageSize: 100, total: 201 },
        }),
    );
    await render();
    expect(
        host.querySelector('[role="combobox"][aria-label="VPN 201"]'),
    ).toBeNull();

    const next = host.querySelector<HTMLButtonElement>(
        'button[aria-label="pagination.next"]',
    );
    expect(next).not.toBeNull();
    await act(async () => {
        next!.click();
        await Promise.resolve();
        await Promise.resolve();
    });

    expect(api.listInbounds).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 100,
    });
    expect(
        host.querySelector('[role="combobox"][aria-label="VPN 201"]'),
    ).not.toBeNull();
});

it('keeps the edited draft and reports a failed configuration write', async () => {
    api.putTrafficControl.mockRejectedValue({ msg: 'backend rejected config' });
    await render();
    editInput(input('upload mbps'), '0.2');

    await act(async () => button('save').click());

    expect(input('upload mbps').value).toBe('0.2');
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
        'backend rejected config',
    );
    expect(button('save').disabled).toBe(false);
});

it('keeps diagnostics failures on the diagnostics tab, apart from a successful save', async () => {
    api.getTrafficStatus.mockRejectedValue(new Error('diagnostics offline'));
    await render();
    editInput(input('upload mbps'), '0.1');

    await act(async () => button('save').click());

    expect(host.querySelector('[role="status"]')?.textContent).toBe('saved');
    expect(host.querySelectorAll('[role="alert"]')).toHaveLength(0);
    expect(api.getTrafficStatus).not.toHaveBeenCalled();

    const tab = [...host.querySelectorAll('[role=tab]')].find((item) => item.textContent === 'tabDiagnostics')!;
    await act(async () => {
        tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    });
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const alerts = [...host.querySelectorAll('[role="alert"]')];
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toBe('statusUnavailable');
});

it('hides global rate fields while traffic limiting is disabled', async () => {
    api.getTrafficControl.mockResolvedValue({ ...structuredClone(config), enabled: false });
    await render();
    expect(host.querySelector('input[aria-label="upload mbps"]')).toBeNull();
});

it('preserves a configured burst when replacing a rate through an empty field', async () => {
    const saved = structuredClone(config);
    saved.enabled = true;
    saved.global.upload = { bytesPerSecond: 125000, burstBytes: 256 * 1024 };
    api.getTrafficControl.mockResolvedValue(saved);
    await render();
    // Clearing the field means unlimited; the burst is restored when a rate returns.
    editInput(input('upload mbps'), '');
    expect(button('save').disabled).toBe(false);
    editInput(input('upload mbps'), '2');
    await act(async () => button('save').click());
    expect(api.putTrafficControl).toHaveBeenLastCalledWith(
        expect.objectContaining({
            global: expect.objectContaining({
                upload: { bytesPerSecond: 250000, burstBytes: 256 * 1024 },
            }),
        }),
    );
    editInput(input('upload mbps'), '0');
    await act(async () => button('save').click());
    expect(api.putTrafficControl).toHaveBeenLastCalledWith(
        expect.objectContaining({
            global: expect.objectContaining({
                upload: { bytesPerSecond: 0, burstBytes: 0 },
            }),
        }),
    );
});
