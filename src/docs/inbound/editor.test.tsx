import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { InboundEditor } from './editor';
import { createDefaultInbound, createDefaultProtocol, type Inbound } from '@/contract/inbound';

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
