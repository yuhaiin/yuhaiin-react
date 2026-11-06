import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { createDefaultInbound, createDefaultProtocol, createDefaultTransport, normalizeInbound, type Inbound } from '@/contract/inbound';
import { InboundEditor } from './editor';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const confirm = vi.hoisted(() => vi.fn(async () => true));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: confirm }));

let cleanup: (() => void) | undefined;
afterEach(() => { cleanup?.(); cleanup = undefined; confirm.mockClear(); });

function mount(initial: Inbound) {
    let value = initial;
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => act(() => root.render(<InboundEditor inbound={value} onChange={next => { value = next; render(); }} />));
    render();
    cleanup = () => { act(() => root.unmount()); host.remove(); };
    return { host, current: () => value };
}

it('puts the protocol before the listener and transports', () => {
    const { host } = mount(createDefaultInbound('mixed'));
    const titles = [...host.querySelectorAll('section h3')].map(item => item.textContent);
    expect(titles.indexOf('protocol')).toBeLessThan(titles.indexOf('inboundEditor.listener'));
    expect(titles.indexOf('inboundEditor.listener')).toBeLessThan(titles.indexOf('transport'));
    expect(host.textContent).not.toMatch(/\bUse\b|\bAdd\b/);
});

it('applies the listener mode immediately and shows a saved "disabled" as TCP only', () => {
    const inbound = normalizeInbound({ ...createDefaultInbound('mixed'), network: { type: 'tcp_udp', tcp_udp: { host: ':1080', udp: 'disabled' } } });
    const { host, current } = mount(inbound);
    const mode = host.querySelector('[aria-label="inboundEditor.mode"]')!;
    const pressed = () => mode.querySelector('[data-state="on"]')?.textContent;
    expect(pressed()).toBe('inboundEditor.udpMode.tcp_only');
    const both = [...mode.querySelectorAll<HTMLButtonElement>('button')].find(item => item.textContent === 'inboundEditor.udpMode.enabled')!;
    act(() => both.click());
    expect(current().network).toEqual({ type: 'tcp_udp', tcp_udp: { host: ':1080', udp: 'enabled' } });
});

it('keeps the listen address when switching from TCP/UDP to QUIC', () => {
    const inbound = normalizeInbound({ ...createDefaultInbound('mixed'), network: { type: 'tcp_udp', tcp_udp: { host: ':1080', udp: 'enabled' } } });
    const { host, current } = mount(inbound);
    const quic = [...host.querySelectorAll<HTMLButtonElement>('[aria-label="networkType"] button')].find(item => item.textContent === 'inboundEditor.networkType.quic')!;
    act(() => quic.click());
    expect(current().network).toMatchObject({ type: 'quic', quic: { host: ':1080' } });
});

it('shows transports as an ordered chain ending at the protocol', () => {
    const inbound = normalizeInbound({ ...createDefaultInbound('in'), protocol: createDefaultProtocol('yuubinsya'), transports: [createDefaultTransport('tls'), createDefaultTransport('websocket')] });
    const { host } = mount(inbound);
    const chain = host.querySelector('[aria-label="inboundEditor.transportOrder"]')!.textContent;
    expect(chain).toBe('inboundEditor.clientinboundEditor.transportType.tlsinboundEditor.transportType.websocketinboundEditor.protocolType.yuubinsya');
});

it('asks before switching protocol and leaves the inbound alone when cancelled', async () => {
    const { host, current } = mount(createDefaultInbound('in'));
    const choose = async (label: string) => {
        const combo = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="protocol"]')!;
        await act(async () => combo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent === label)!;
        await act(async () => option.click());
    };
    confirm.mockResolvedValueOnce(false);
    await choose('inboundEditor.protocolType.socks5');
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(current().protocol.type).toBe('mixed');
    await choose('inboundEditor.protocolType.socks5');
    expect(current().protocol.type).toBe('socks5');
});
