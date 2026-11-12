import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { NodeProtocol, NodeProtocolType } from '@/contract/node';
import { createDefaultProtocol, getProtocolConfig, normalizeProtocol } from '@/contract/node';
import { OutboundTCPSettings } from './tcp-settings';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const vpnTypes: NodeProtocolType[] = ['wireguard', 'amneziawg', 'openvpn', 'l2tp', 'l2tpv3', 'globalprotect',
    'softether', 'ikev2', 'anyconnect', 'sstp', 'fortinet', 'nebula', 'zerotier', 'tailscale', 'masque', 'cloudflare_warp_masque'];

it.each(vpnTypes)('edits shared TCP settings and preserves the %s protocol configuration', (type) => {
    let saved: NodeProtocol = normalizeProtocol({ type, [type]: { ...getProtocolConfig(createDefaultProtocol(type)), mtu: 1370,
        tcpSettings: { congestionControl: 'bbr' }, ...(type === 'ikev2' ? { tcp: true } : {}) } });
    const original = structuredClone(getProtocolConfig(saved));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<OutboundTCPSettings protocol={saved} editable onChange={(next) => { saved = next; }} />);
    try {
        act(render);
        const trigger = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="tcpLossRecovery"]')!;
        expect(trigger).not.toBeNull();
        act(() => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
        const option = [...document.querySelectorAll('[role="option"]')].find(item => item.textContent === 'RACK-TLP')!;
        expect(option).toBeTruthy();
        act(() => option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        expect(getProtocolConfig(saved)).toMatchObject({ ...original, tcpSettings: { congestionControl: 'bbr', lossRecovery: 'rack-tlp' } });
        saved = normalizeProtocol(JSON.parse(JSON.stringify(saved)));
        act(render);
        expect(host.textContent).toContain('RACK-TLP');
        act(() => root.render(<OutboundTCPSettings protocol={saved} editable={false} onChange={vi.fn()} />));
        expect([...host.querySelectorAll<HTMLButtonElement>('[role="combobox"]')].every(button => button.disabled)).toBe(true);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it('does not offer inner TCP settings for a SOCKS outbound', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
        act(() => root.render(<OutboundTCPSettings protocol={createDefaultProtocol('socks5')} editable onChange={vi.fn()} />));
        expect(host.childElementCount).toBe(0);
    } finally { act(() => root.unmount()); }
});
