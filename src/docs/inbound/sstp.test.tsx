import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { InboundEditor } from './editor';
import { createDefaultInbound, normalizeInbound, selectInboundProtocol } from '@/contract/inbound';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('selects a rootless SSTP inbound with an internal TLS configuration and TCP-only listener', () => {
    const selected = selectInboundProtocol(createDefaultInbound('sstp'), 'sstp');
    expect(selected.network).toMatchObject({ type: 'tcp_udp', tcp_udp: { udp: 'tcp_only' } });
    expect(selected.transports).toEqual([]);
    expect(selected.authentication).toEqual({ users: [] });
    if (selected.protocol.type !== 'sstp') throw new Error('expected SSTP');
    expect(selected.protocol.sstp).toMatchObject({
        serverAddress: '10.90.0.1',
        clientAddresses: ['10.90.0.2'],
        mtu: 1400,
    });
    const reloaded = normalizeInbound(JSON.parse(JSON.stringify(selected)));
    expect(reloaded.protocol).toEqual(selected.protocol);
    expect(reloaded.network).toEqual(selected.network);
});

it('shows SSTP TLS settings without independent password fields', () => {
    let saved = selectInboundProtocol(createDefaultInbound('sstp'), 'sstp');
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={saved} onChange={next => { saved = next; }} />);
    try {
        act(render);
        expect(host.textContent).toContain('sstpRootlessHelp');
        expect(host.textContent).toContain('sstpNoExtraTransports');
        expect(host.textContent).toContain('sstpTLSCertificate');
        expect(host.textContent).toContain('sstpCredentialsHelp');

        expect(host.textContent).toContain('inboundUserAuthentication');
        expect(host.textContent).not.toContain('sstpUsers');
        expect(host.querySelectorAll('input[type="password"]')).toHaveLength(0);
        if (saved.protocol.type !== 'sstp') throw new Error('expected SSTP');
        expect(saved.protocol.sstp).not.toHaveProperty('users');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
