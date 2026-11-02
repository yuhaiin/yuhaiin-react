import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import english from '@/i18n/resources/en/ui.json';
import japanese from '@/i18n/resources/ja/ui.json';
import korean from '@/i18n/resources/ko/ui.json';
import { InboundEditor } from './editor';
import { createDefaultInbound, normalizeInbound, selectInboundProtocol } from '@/contract/inbound';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('configures SSH as TCP-only with no extra transports and an automatic host key', () => {
    const ssh = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    expect(ssh.network).toMatchObject({ type: 'tcp_udp', tcp_udp: { host: '127.0.0.1:2222', udp: 'tcp_only' } });
    expect(ssh.authentication).toBeUndefined();
    expect(ssh.transports).toEqual([]);
    if (ssh.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    expect(ssh.protocol.ssh).toMatchObject({
        hostKey: '', mtu: 1500, ipv6: true, maxSessions: 8,
        uid: 65534, gid: 65534, allowUnsafeShell: false,
    });
    const restored = normalizeInbound(JSON.parse(JSON.stringify(ssh)));
    expect(restored.protocol).toEqual(ssh.protocol);
});

it('shows SSH host-key generation help and the explicit security acknowledgement', () => {
    let inbound = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    try {
        act(() => root.render(<InboundEditor inbound={inbound} onChange={next => { inbound = next; }} protocols={['ssh']} />));
        expect(host.textContent).toContain('sshHostKeyAutoHelp');
        expect(host.textContent).toContain('sshUnsafeShellAcknowledgement');
        expect(host.textContent).toContain('sshNoExtraTransports');
        expect(host.textContent).toContain('sshAuthorizedPublicKey');
        const switches = [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')];
        const acknowledge = switches.find(x => x.textContent?.includes('sshUnsafeShellAcknowledgement'));
        expect(acknowledge).toBeDefined();
        act(() => acknowledge!.click());
        if (inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        expect(inbound.protocol.ssh.allowUnsafeShell).toBe(true);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it('translations provide localized SSH inbound settings and safety warnings', () => {
    const sshInboundKeys = [
            "sshNoExtraTransports",
            "sshSessionHelp",
            "sshLoginUsername",
            "sshShell",
            "sshUID",
            "sshGID",
            "sshMaxSessions",
            "sshAuthorizedPublicKey",
            "sshHostKeyAutoHelp",
            "sshAdvancedSettings",
            "sshOverrideHostKey",
            "sshEnableIPv6",
            "sshGatewayIPv4",
            "sshSessionIPv4",
            "sshGatewayIPv6",
            "sshSessionIPv6",
            "sshUnsafeShellAcknowledgement",
            "sshUnsafeShellWarning"
    ] as const;
    for (const key of sshInboundKeys) {
        expect(japanese[key], `Missing Japanese translation: ${key}`).toMatch(/[\u3040-\u30ff\u3400-\u9fff]/);
        expect(korean[key], `Missing Korean translation: ${key}`).toMatch(/[\uac00-\ud7a3]/);
        expect(japanese[key]).not.toBe(english[key]);
        expect(korean[key]).not.toBe(english[key]);
    }
});

it('preserves the optional delegated cgroup root in SSH inbound configuration', () => {
    const inbound = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    if (inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    inbound.protocol.ssh.cgroupRoot = '/sys/fs/cgroup/delegated/ssh-session';
    const normalized = normalizeInbound(JSON.parse(JSON.stringify(inbound)));
    if (normalized.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    expect(normalized.protocol.ssh.cgroupRoot).toBe('/sys/fs/cgroup/delegated/ssh-session');
});
