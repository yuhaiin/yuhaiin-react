import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import english from '@/i18n/resources/en/ui.json';
import japanese from '@/i18n/resources/ja/ui.json';
import korean from '@/i18n/resources/ko/ui.json';
import { InboundEditor } from './editor';
import { createDefaultInbound, normalizeInbound, selectInboundProtocol } from '@/contract/inbound';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values ? `${key}:${JSON.stringify(values)}` : key }) }));
const capabilities = vi.hoisted(() => ({ value: { platform: 'linux', protocols: ['ssh'], ssh: { serviceUID: 1000, serviceGID: 1001, root: false } } }));
vi.mock('@/api/inbounds', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/api/inbounds')>(),
    getInboundCapabilities: () => Promise.resolve(capabilities.value),
}));

it('configures SSH as TCP-only with no extra transports and an automatic host key', () => {
    const ssh = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    expect(ssh.network).toMatchObject({ type: 'tcp_udp', tcp_udp: { host: '127.0.0.1:2222', udp: 'tcp_only' } });
    expect(ssh.authentication).toBeUndefined();
    expect(ssh.transports).toEqual([]);
    if (ssh.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    expect(ssh.protocol.ssh).toMatchObject({
        hostKey: '', mtu: 1500, ipv6: true, maxSessions: 8,
        namespaceMode: 'rootless', uid: 0, gid: 0, allowUnsafeShell: false,
        shell: '', timezone: '', sftpReadOnlyPaths: [],
    });
    ssh.protocol.ssh.timezone = "Asia/Tokyo";
    const restored = normalizeInbound(JSON.parse(JSON.stringify(ssh)));
    expect(restored.protocol).toEqual(ssh.protocol);
});

it('edits and restores optional SFTP read-only directories without changing shell permissions', () => {
    let inbound = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={inbound} onChange={next => { inbound = next; render(); }} protocols={['ssh']} />);
    try {
        act(render);
        expect(host.textContent).toContain('sshSFTPHelp');
        expect(host.textContent).toContain('sshSFTPReadOnlyHelp');
        expect(host.textContent).toContain('sshShellHelp');
        const editor = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="sshSFTPReadOnlyPaths"]')!;
        expect(editor).not.toBeNull();
        const setValue = (value: string) => act(() => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(editor, value);
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        });
        setValue('/srv/archive\n/srv/backups');
        if (inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        expect(inbound.protocol.ssh.sftpReadOnlyPaths).toEqual(['/srv/archive', '/srv/backups']);
        expect(inbound.protocol.ssh.shell).toBe('');
        const restored = normalizeInbound(JSON.parse(JSON.stringify(inbound)));
        expect(restored.protocol).toEqual(inbound.protocol);
        setValue('');
        expect(inbound.protocol.ssh.sftpReadOnlyPaths).toEqual([]);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
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
            "sshShellAuto",
            "sshShellHelp",
            "sshTimezone",
            "sshTimezoneSystem",
            "sshTimezoneHelp",
            "sshSFTPHelp",
            "sshSFTPReadOnlyPaths",
            "sshSFTPReadOnlyHelp",
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
            "sshUnsafeShellWarning",
            "sshCgroupRoot",
            "sshCgroupRootHelp"
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

async function renderSSH(initial = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh')) {
    let inbound = initial;
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<InboundEditor inbound={inbound} onChange={next => { inbound = next; render(); }} protocols={['ssh']} />);
    await act(async () => { render(); await Promise.resolve(); await Promise.resolve(); });
    return { host, get inbound() { return inbound; }, cleanup: () => { act(() => root.unmount()); host.remove(); } };
}

it('defaults to rootless, explains it and shows the IDs this server can use', async () => {
    const view = await renderSSH();
    try {
        const text = view.host.textContent ?? '';
        for (const key of ['sshNamespaceMode', 'sshModeRootless', 'sshModeRootful', 'sshRootlessNormalUser', 'sshRootlessHostNetwork',
            'sshRootlessUserNamespace', 'sshRootlessTun', 'sshRootlessKernel', 'sshRootlessSupervisor', 'sshUnsafeShellWarningRootless']) {
            expect(text).toContain(key);
        }
        expect(text).toContain('sshRootlessIDs:{"uid":1000,"gid":1001}');
        const selected = view.host.querySelector('[role="radio"][aria-checked="true"], [data-state="on"]');
        expect(selected?.textContent).toBe('sshModeRootless');
        // UID/GID 0 means the Yuhaiin user and is shown as a placeholder.
        const uid = view.host.querySelector<HTMLInputElement>('input[placeholder^="sshServiceAccountID"]');
        expect(uid?.value).toBe('');
    } finally {
        view.cleanup();
    }
});

it('switches to rootful with explicit non-root IDs and warns when Yuhaiin is not root', async () => {
    const view = await renderSSH();
    try {
        const rootful = [...view.host.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'sshModeRootful');
        expect(rootful).toBeDefined();
        act(() => rootful!.click());
        if (view.inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        expect(view.inbound.protocol.ssh).toMatchObject({ namespaceMode: 'rootful', uid: 65534, gid: 65534 });
        const text = view.host.textContent ?? '';
        expect(text).toContain('sshRootfulHelp');
        expect(text).toContain('sshRootfulNotRoot:{"uid":1000}');
        expect(text).toContain('sshUnsafeShellWarning');
        const restored = normalizeInbound(JSON.parse(JSON.stringify(view.inbound)));
        expect(restored.protocol).toEqual(view.inbound.protocol);
    } finally {
        view.cleanup();
    }
});

it('treats a saved SSH inbound without a mode as rootless, like the server', async () => {
    const saved = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    if (saved.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    const { namespaceMode: _, ...legacy } = saved.protocol.ssh;
    saved.protocol.ssh = { ...legacy, uid: 65534, gid: 65534 };
    const view = await renderSSH(saved);
    try {
        expect(view.host.textContent).toContain('sshRootlessNormalUser');
        if (view.inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        expect(view.inbound.protocol.ssh.namespaceMode).toBeUndefined();
    } finally {
        view.cleanup();
    }
});
