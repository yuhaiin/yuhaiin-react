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
        expect(host.textContent).toContain('hysteria2HopServerHelp');
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
