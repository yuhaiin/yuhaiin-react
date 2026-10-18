import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { InboundEditor } from './editor';
import { createDefaultInbound, selectInboundProtocol } from '@/contract/inbound';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('edits memory-only WireGuard inbound peer settings', () => {
    let saved = selectInboundProtocol(createDefaultInbound('wireguard'), 'wireguard');
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={saved} onChange={next => { saved = next; }} />);
    try {
        act(render);
        expect(host.textContent).toContain('wgNoSystemTun');
        expect(host.textContent).toContain('wgNoExtraTransports');
        const add = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('add'));
        expect(add).toBeDefined();
        act(() => add!.click());
        if (saved.protocol.type !== 'wireguard') throw new Error('expected WireGuard');
        expect(saved.protocol.wireguard.peers).toHaveLength(1);
        saved = JSON.parse(JSON.stringify(saved));
        act(render);
        expect(host.textContent).toContain('wgPeer');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
