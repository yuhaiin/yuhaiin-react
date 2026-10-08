import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { normalizeNode } from '@/contract/node';
import { NodeEditor } from './NodeEditor';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('edits hopping intervals while preserving authentication, host and TLS settings', () => {
    const config = { host: 'server.example:443,20000-20020', auth: 'secret', upload_bps: 0, download_bps: 0, tls: { servernames: ['sni.example'] } };
    let saved = normalizeNode({ chain: [{ type: 'hysteria2', hysteria2: config }] });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = () => root.render(<NodeEditor value={saved} editable groups={[]}
        onChange={noop} onProtocolChange={(index, protocol) => { saved = { ...saved, chain: saved.chain.map((p, i) => i === index ? protocol : p) }; }}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    try {
        act(render);
        expect(host.textContent).toContain('hysteria2HopClientHelp');
        for (const [key, value] of [['minHopIntervalSeconds', '15'], ['maxHopIntervalSeconds', '45']]) {
            const label = [...host.querySelectorAll('label')].find(element => element.textContent === key)!;
            const input = host.querySelector<HTMLInputElement>(`[id="${label.htmlFor}"]`)!;
            expect(input.value).toBe('0');
            act(() => {
                Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            act(render);
            expect(input.value).toBe(value);
        }
        expect(saved.chain).toEqual([{ type: 'hysteria2', hysteria2: {
            ...config, min_hop_interval_seconds: 15, max_hop_interval_seconds: 45,
        } }]);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
