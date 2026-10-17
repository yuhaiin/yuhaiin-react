import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { InboundEditor } from './editor';
import { createDefaultInbound, createDefaultProtocol, selectInboundProtocol, type Inbound } from '@/contract/inbound';
import ui from '@/i18n/resources/en/ui.json';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('toggles automatic FakeIP routes and displays the saved value without editing routes', () => {
    let saved: Inbound = { ...createDefaultInbound('tun'), protocol: createDefaultProtocol('tun') };
    if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
    saved.protocol.tun.routes = ['192.0.2.0/24'];
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={saved} onChange={(value) => { saved = value; }} />);
    try {
        act(render);
        const control = () => [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')]
            .find(element => element.textContent?.includes('autoFakeIpRoute'))!;
        expect(control().getAttribute('aria-checked')).toBe('true');
        act(() => control().click());
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(saved.protocol.tun.autoFakeIpRoute).toBe(false);
        expect(saved.protocol.tun.routes).toEqual(['192.0.2.0/24']);
        saved = JSON.parse(JSON.stringify(saved)) as Inbound;
        act(render);
        expect(control().getAttribute('aria-checked')).toBe('false');
        act(() => control().click());
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(saved.protocol.tun.autoFakeIpRoute).toBe(true);
        expect(saved.protocol.tun.routes).toEqual(['192.0.2.0/24']);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it('edits hopping ports and explains why automatic server hopping needs root', () => {
    let saved = selectInboundProtocol(createDefaultInbound('hopping'), 'hysteria2');
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={saved} onChange={(value) => { saved = value; }} />);
    try {
        act(render);
        expect(document.querySelector('[role="tooltip"]')).toBeNull();
        expect(host.textContent).not.toContain('hysteria2HopServerHelp');
        const help = host.querySelector<HTMLButtonElement>('[aria-label="hopPortsHelp"]')!;
        act(() => help.click());
        const tooltip = document.querySelector('[role="tooltip"]')!;
        expect(tooltip.textContent).toContain('hysteria2HopServerHelp');
        expect(tooltip.id).toBe(help.getAttribute('aria-describedby'));
        expect(ui.hysteria2HopServerHelp).toContain('root or CAP_NET_ADMIN');
        expect(ui.hysteria2HopServerHelp).toContain('modifies kernel nftables rules');
        const label = [...host.querySelectorAll('label')].find(element => element.textContent === 'hopPorts')!;
        const input = host.querySelector<HTMLInputElement>(`[id="${label.htmlFor}"]`)!;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '443,20000-20020');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        if (saved.protocol.type !== 'hysteria2') throw new Error('unexpected protocol');
        expect(saved.protocol.hysteria2.hopPorts).toBe('443,20000-20020');
        expect(saved.network).toMatchObject({ type: 'tcp_udp', tcp_udp: { udp: 'udp_only' } });
        act(render);
        expect(input.value).toBe('443,20000-20020');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it('shows experimental TCP/IP stack options only when lightweight is selected', () => {
    let saved: Inbound = { ...createDefaultInbound('tun'), protocol: createDefaultProtocol('tun') };
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={saved} onChange={(value) => { saved = value; }} />);
    try {
        act(render);
        expect(host.textContent).toContain('tunStack');
        expect(host.textContent).not.toContain('tunCongestionControl');
        const driver = host.querySelector('[role="combobox"][aria-label="Driver"]');
        expect(driver?.textContent).toContain('fdbased');
        expect(host.querySelector('input[aria-label="Driver"]')).toBeNull();
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        saved = { ...saved, protocol: { ...saved.protocol, tun: { ...saved.protocol.tun, stack: 'lightweight', driver: 'channel', congestionControl: 'bbr' } } };
        act(render);
        expect(host.textContent).toContain('tunStackExperimentalWarning');
        expect(host.textContent).toContain('tunCongestionControl');
        expect(host.textContent).toContain('tunStackDriverHint');
        const combos = [...host.querySelectorAll('[role="combobox"]')];
        expect(combos.length).toBeGreaterThanOrEqual(3);
        const congestion = combos.find(combo => combo.getAttribute('aria-label') === 'tunCongestionControl');
        expect(congestion?.textContent).toContain('BBR v3');
        expect(combos.some(combo => combo.getAttribute('aria-label') === 'Driver')).toBe(true);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it('configures Darwin batching per TUN and hides it on other backends', () => {
    let saved = createDefaultInbound('batch');
    saved = { ...saved, protocol: createDefaultProtocol('tun') };
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = (platform = 'darwin') => root.render(<InboundEditor platform={platform} inbound={saved} onChange={value => { saved = value; }} />);
    try {
        act(() => render());
        const toggle = () => [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find(item => item.textContent?.includes('tunDarwinBatch'))!;
        expect(toggle().getAttribute('aria-checked')).toBe('false');
        expect(host.querySelector('[aria-label="tunDarwinBatchSize"]')).toBeNull();
        act(() => toggle().click());
        act(() => render());
        expect(host.querySelector('[aria-label="tunDarwinBatchSize"]')?.textContent).toContain('32');
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(saved.protocol.tun.darwin).toEqual({ experimentalBatch: true, batchSize: 32, pendingPackets: 32 });
        const choose = (label: string, value: string) => {
            const combo = host.querySelector<HTMLButtonElement>(`[role="combobox"][aria-label="${label}"]`)!;
            act(() => combo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
            const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent === value)!;
            expect(option).toBeDefined();
            act(() => option.click());
            act(() => render());
        };
        choose('tunDarwinBatchSize', '64');
        choose('tunDarwinPendingPackets', '128');
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(saved.protocol.tun.darwin).toEqual({ experimentalBatch: true, batchSize: 64, pendingPackets: 128 });
        saved = JSON.parse(JSON.stringify(saved));
        act(() => render());
        expect(toggle().getAttribute('aria-checked')).toBe('true');
        act(() => toggle().click());
        if (saved.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(saved.protocol.tun.darwin?.experimentalBatch).toBe(false);
        for (const platform of ['linux', 'android', 'windows', '']) {
            act(() => render(platform));
            expect(host.textContent).not.toContain('tunDarwinBatch');
        }
    } finally { act(() => root.unmount()); host.remove(); }
});
