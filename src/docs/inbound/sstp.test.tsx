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
    expect(selected.authentication).toBeUndefined();
    if (selected.protocol.type !== 'sstp') throw new Error('expected SSTP');
    expect(selected.protocol.sstp).toMatchObject({
        serverAddress: '10.90.0.1',
        clientAddresses: ['10.90.0.2'],
        users: [],
        mtu: 1400,
    });
    const reloaded = normalizeInbound(JSON.parse(JSON.stringify(selected)));
    expect(reloaded.protocol).toEqual(selected.protocol);
    expect(reloaded.network).toEqual(selected.network);
});

it('edits SSTP credentials and shows its embedded TLS settings', () => {
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

        const add = [...host.querySelectorAll('button')].find(button =>
            button.textContent?.includes('add') && button.parentElement?.textContent?.includes('sstpUsers'));
        expect(add).toBeDefined();
        act(() => add!.click());
        if (saved.protocol.type !== 'sstp') throw new Error('expected SSTP');
        expect(saved.protocol.sstp.users).toEqual([{ username: '', password: '' }]);

        saved = normalizeInbound(JSON.parse(JSON.stringify(saved)));
        act(render);
        expect(host.textContent).toContain('sstpUser');
        const passwordLabel = [...host.querySelectorAll<HTMLLabelElement>('label')]
            .find(label => label.textContent === 'password');
        expect(passwordLabel).toBeDefined();
        const input = host.querySelector<HTMLInputElement>(`[id="${passwordLabel!.htmlFor}"]`);
        expect(input?.type).toBe('password');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
