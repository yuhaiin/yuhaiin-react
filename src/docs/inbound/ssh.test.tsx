import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import english from '@/i18n/resources/en/ui.json';
import japanese from '@/i18n/resources/ja/ui.json';
import korean from '@/i18n/resources/ko/ui.json';
import { InboundEditor } from './editor';
import { createDefaultInbound, normalizeInbound, selectInboundProtocol } from '@/contract/inbound';
import { SWRConfig } from 'swr';
import type { Go } from '@/api/generated-contracts';
import { formatSSHIDRanges, inboundSSHIDProblems, sshEffectiveMapping, sshIDAllowed, sshIDProblems } from './ssh-environment';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values ? `${key}:${JSON.stringify(values)}` : key }) }));
const capabilities = vi.hoisted(() => ({ value: { platform: 'linux', protocols: ['ssh'], ssh: { serviceUID: 1000, serviceGID: 1001, root: false } } as { platform: string; protocols: string[]; ssh: unknown } }));
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
            "sshCgroupRootHelp",
            "sshRootlessIDsDetected",
            "sshUIDNotMappable",
            "sshGIDNotMappable",
            "sshEnvTitle",
            "sshEnvChecking",
            "sshEnvRecheck",
            "sshEnvProbeFailed",
            "sshEnvRuntime",
            "sshEnvMode",
            "sshEnvOriginHost",
            "sshEnvOriginInherited",
            "sshEnvOriginUnknown",
            "sshEnvHostIDs",
            "sshEnvHostIDsUnresolved",
            "sshEnvDepthUnknown",
            "sshEnvFileAccess",
            "sshEnvHostIdentity",
            "sshEnvSessionIdentity",
            "sshEnvNamespaceIdentity",
            "sshEnvFilesystem",
            "sshEnvFilesystemOK",
            "sshEnvFilesystemNotVerified",
            "sshEnvGroups",
            "sshEnvGroupsInherited",
            "sshEnvGroupsUnmapped",
            "sshEnvNetwork",
            "sshEnvProcess",
            "sshEnvCgroupFallback",
            "sshEnvAvailable",
            "sshEnvUnavailable",
            "sshEnvUnknown",
            "sshEnvNone",
            "sshEnvDetails",
            "sshEnvNestingDepth",
            "sshEnvUsableUIDs",
            "sshEnvUsableGIDs",
            "sshEnvCapabilities",
            "sshEnvCheckedAt",
            "sshParentNamespaceTitle",
            "sshParentUID",
            "sshParentGID",
            "sshParentAuto",
            "sshParentHelp",
            "sshParentNotMappable",
            "sshParentConflict",
            "sshParentConflictUnmapped",
            "sshParentNeedsTarget",
            "sshParentRootful",
            "sshEnvMapUID",
            "sshEnvMapGID",
            "sshEnvMapLine",
            "sshEnvMapAutomatic",
            "sshEnvMapManual",
            "sshEnvMapUnresolved",
            "sshEnvUsableParentUIDs",
            "sshEnvUsableParentGIDs",
            "sshEnvDefaultSessionIdentity",
            "sshEnvFilesystemDefaultOK",
            "sshEnvFilesystemOnStart"
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

const podmanMap = [{ namespaceID: 0, parentID: 1009, count: 1 }, { namespaceID: 1, parentID: 689824, count: 65536 }];

/** What a Yuhaiin started by `podman unshare` as host user 1009 reports. */
function podmanEnvironment(): Go.inbound.SSHEnvironment {
    const available = 'available';
    return {
        userNamespace: { origin: 'inherited', depth: 1, hostIDsResolved: true, uidMap: podmanMap, gidMap: podmanMap, setgroupsAllowed: true, nestedUserNamespaceSupported: true },
        identity: {
            hostUID: 1009, hostGID: 1009, namespaceUID: 0, namespaceGID: 0,
            groups: [{ namespaceGID: 65534 }, { namespaceGID: 0, hostGID: 1009 }],
            uidRanges: [{ start: 1009, count: 1 }, { start: 689824, count: 65536 }],
            gidRanges: [{ start: 1009, count: 1 }, { start: 689824, count: 65536 }],
            parentUIDRanges: [{ start: 0, count: 1 }, { start: 1, count: 65536 }],
            parentGIDRanges: [{ start: 0, count: 1 }, { start: 1, count: 65536 }],
            capSetUID: true, capSetGID: true, capSetFCAP: true, capSysAdmin: true, capNetAdmin: true,
        },
        session: {
            uid: 1009, gid: 1009, namespaceUID: 0, namespaceGID: 0,
            uidMap: [{ namespaceID: 1009, parentID: 0, count: 1 }], gidMap: [{ namespaceID: 1009, parentID: 0, count: 1 }],
            supplementaryGroupsInherited: true, supplementaryGroupsSettable: true, filesystemIdentityPreserved: true,
            username: 'example-user', home: '/home/example-user', shell: '/bin/bash',
        },
        features: { userNamespace: available, networkNamespace: available, mountNamespace: available, pidNamespace: available, idMapping: available,
            tun: available, ipv4: available, ipv6: available, supervisor: available, cgroupV2: 'unavailable', rootful: 'unavailable', hostLoopbackIPv4: available, hostLoopbackIPv6: available },
        checkedAt: '2026-11-24T06:25:13Z',
    };
}

async function renderWithEnvironment(environment: Go.inbound.SSHEnvironment, uid = 0, gid = 0, extra: Record<string, unknown> = {}) {
    capabilities.value = { platform: 'linux', protocols: ['ssh'], ssh: { serviceUID: 1009, serviceGID: 1009, root: false, environment } };
    let inbound = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    if (inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    inbound.protocol.ssh = { ...inbound.protocol.ssh, uid, gid, ...extra };
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const render = () => root.render(<SWRConfig value={{ provider: () => new Map() }}>
        <InboundEditor inbound={inbound} onChange={next => { inbound = next; render(); }} protocols={['ssh']} />
    </SWRConfig>);
    await act(async () => { render(); await Promise.resolve(); await Promise.resolve(); });
    return { host, get inbound() { return inbound; }, cleanup: () => { act(() => root.unmount()); host.remove(); } };
}

it('shows the detected Podman environment with host IDs and only flags problems', async () => {
    const view = await renderWithEnvironment(podmanEnvironment());
    try {
        const text = view.host.textContent ?? '';
        for (const expected of ['sshEnvTitle', 'sshEnvRootless', 'sshEnvOriginInherited', 'sshEnvFilesystemOK',
            '1009:1009 (example-user)', 'sshEnvNamespaceIdentity:{"uid":0,"gid":0}', 'sshEnvGroupsInherited:{"count":2}',
            'sshEnvGroupsUnmapped:{"count":1}', 'sshEnvCgroupFallback',
            'sshRootlessIDsDetected:{"uid":1009,"gid":1009,"uids":"1009, 689824–755359","gids":"1009, 689824–755359"}']) {
            expect(text).toContain(expected);
        }
        // The host identity row shows host IDs, never the namespace root.
        expect(text).toContain('sshEnvHostIdentity1009:1009');
        // Healthy environment: no alerts and no danger badges; a missing
        // cgroup delegation is explained, not flagged.
        expect(view.host.querySelector('[role="alert"]')).toBeNull();
        expect(view.host.querySelector('.text-ui-danger')).toBeNull();
        expect(text).not.toContain('sshRootlessIDsAsRoot');
        // Mapping details stay behind the disclosure.
        const details = view.host.querySelector('details');
        expect(details?.open).toBe(false);
        expect(details?.textContent).toContain('0 1009 1\n1 689824 65536');
        expect(details?.textContent).toContain('1009 0 1');
    } finally {
        view.cleanup();
    }
});

it('rejects a rootless UID/GID the server cannot map and names the usable IDs', async () => {
    const view = await renderWithEnvironment(podmanEnvironment(), 1000, 100);
    try {
        const alerts = [...view.host.querySelectorAll('[role="alert"]')].map(a => a.textContent);
        expect(alerts).toEqual([
            'sshUIDNotMappable:{"field":"uid","kind":"notMappable","id":1000,"idType":"UID","ranges":"1009, 689824–755359"}',
            'sshGIDNotMappable:{"field":"gid","kind":"notMappable","id":100,"idType":"GID","ranges":"1009, 689824–755359"}',
        ]);
        expect(view.host.querySelectorAll('input[aria-invalid="true"]').length).toBe(2);
        expect(inboundSSHIDProblems({ ...view.inbound, enabled: true }, { serviceUID: 1009, serviceGID: 1009, root: false, environment: podmanEnvironment() })).toHaveLength(2);
    } finally {
        view.cleanup();
    }
    const valid = await renderWithEnvironment(podmanEnvironment(), 1009, 689900);
    try {
        expect(valid.host.querySelector('[role="alert"]')).toBeNull();
    } finally {
        valid.cleanup();
    }
});

it('highlights failed checks and unresolvable host IDs', async () => {
    const environment = podmanEnvironment();
    environment.userNamespace = { ...environment.userNamespace, depth: 2, hostIDsResolved: false };
    environment.features = { ...environment.features, tun: 'unavailable', ipv6: 'unknown', supervisor: 'unknown' };
    environment.session = undefined;
    environment.error = '/dev/net/tun does not exist';
    environment.errorStage = 'tun';
    const view = await renderWithEnvironment(environment);
    try {
        const text = view.host.textContent ?? '';
        expect(view.host.querySelector('[role="alert"]')?.textContent).toContain('sshEnvProbeFailed:{"message":"/dev/net/tun does not exist"}');
        expect(text).toContain('sshEnvHostIDsUnresolved:{"depth":2}');
        expect(text).toContain('sshEnvFilesystemNotVerified');
        expect(text).toContain('sshEnvUnknown');
        expect(view.host.querySelectorAll('.bg-ui-danger-soft').length).toBeGreaterThanOrEqual(2);
    } finally {
        view.cleanup();
    }
});

it('validates rootless IDs against the advertised host ID ranges', () => {
    const ssh = { serviceUID: 1009, serviceGID: 1009, root: false, environment: podmanEnvironment() };
    const ranges = ssh.environment.identity.uidRanges;
    expect(formatSSHIDRanges(ranges)).toBe('1009, 689824–755359');
    for (const [id, allowed] of [[1008, false], [1009, true], [1010, false], [689823, false], [689824, true], [755359, true], [755360, false]] as const) {
        expect(sshIDAllowed(ranges, id), `ID ${id}`).toBe(allowed);
    }
    // 0 selects Yuhaiin's own identity; rootful IDs and older servers
    // without a detection result are left to the server.
    expect(sshIDProblems({ uid: 0, gid: 0 }, ssh)).toEqual([]);
    expect(sshIDProblems({ namespaceMode: 'rootful', uid: 1000, gid: 1000 }, ssh)).toEqual([]);
    expect(sshIDProblems({ uid: 1000, gid: 1000 }, { serviceUID: 1000, serviceGID: 1000, root: false })).toEqual([]);
    expect(sshIDProblems({ uid: 1000, gid: 1009 }, ssh)).toEqual([{ field: 'uid', kind: 'notMappable', id: 1000, idType: 'UID', ranges: '1009, 689824–755359' }]);
    expect(inboundSSHIDProblems({ enabled: false, protocol: { type: 'ssh', ssh: { uid: 1000, gid: 1000 } } }, ssh)).toEqual([]);
});

/** Podman inside another namespace (unshare -r): host IDs cannot be resolved. */
function deeperEnvironment(): Go.inbound.SSHEnvironment {
    const env = podmanEnvironment();
    const root = [{ namespaceID: 0, parentID: 0, count: 1 }];
    env.userNamespace = { ...env.userNamespace, depth: 2, hostIDsResolved: false, uidMap: root, gidMap: root, setgroupsAllowed: false };
    env.identity = { ...env.identity, hostUID: undefined, hostGID: undefined, groups: [{ namespaceGID: 65534 }, { namespaceGID: 0 }],
        uidRanges: [{ start: 0, count: 1 }], gidRanges: [{ start: 0, count: 1 }],
        parentUIDRanges: [{ start: 0, count: 1 }], parentGIDRanges: [{ start: 0, count: 1 }] };
    env.session = { ...env.session!, uid: 0, gid: 0, uidMap: [{ namespaceID: 0, parentID: 0, count: 1 }], gidMap: [{ namespaceID: 0, parentID: 0, count: 1 }], username: 'root' };
    return env;
}

it('keeps the SSH identity and a manual parent namespace mapping separate', async () => {
    const view = await renderWithEnvironment(deeperEnvironment(), 1009, 1009, { parentNamespaceUID: 0, parentNamespaceGID: 0 });
    try {
        const text = view.host.textContent ?? '';
        expect(text).toContain('sshEnvMapLine:{"session":1009,"parent":0}sshEnvMapManual');
        expect(view.host.querySelector('[role="alert"]')).toBeNull();
        // The test session shows the default identity, labelled as such.
        expect(text).toContain('sshEnvDefaultSessionIdentity0:0 (root)');
        expect(text).toContain('sshEnvFilesystemOnStart');
        const parentUID = view.host.querySelector<HTMLInputElement>('input[placeholder="sshParentAuto"]');
        expect(parentUID?.value).toBe('0');
        if (view.inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        // The SSH identity is untouched; the override round-trips, including 0.
        expect(view.inbound.protocol.ssh).toMatchObject({ uid: 1009, gid: 1009, parentNamespaceUID: 0, parentNamespaceGID: 0 });
        const restored = normalizeInbound(JSON.parse(JSON.stringify(view.inbound)));
        expect(restored.protocol).toEqual(view.inbound.protocol);
        // Clearing the field returns to automatic mapping.
        const setValue = (input: HTMLInputElement, value: string) => act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        setValue(parentUID!, '');
        if (view.inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
        expect(view.inbound.protocol.ssh.parentNamespaceUID).toBeUndefined();
        expect(view.inbound.protocol.ssh.uid).toBe(1009);
        expect(view.host.textContent).toContain('sshEnvMapUnresolved:{"session":1009}');
    } finally {
        view.cleanup();
    }
});

it('shows automatically detected mappings as automatic', async () => {
    const view = await renderWithEnvironment(podmanEnvironment(), 1009, 1009);
    try {
        expect(view.host.textContent).toContain('sshEnvMapLine:{"session":1009,"parent":0}sshEnvMapAutomatic');
        expect(view.host.textContent).not.toContain('sshEnvMapManual');
    } finally {
        view.cleanup();
    }
});

it('rejects manual parent namespace IDs the kernel would refuse', () => {
    const podman = { serviceUID: 1009, serviceGID: 1009, root: false, environment: podmanEnvironment() };
    const deeper = { serviceUID: 0, serviceGID: 0, root: false, environment: deeperEnvironment() };
    // Deeper than Podman: explicit host IDs alone cannot be verified...
    expect(sshIDProblems({ uid: 1009, gid: 1009 }, deeper).map(p => p.kind)).toEqual(['notMappable', 'notMappable']);
    // ...but a parent override that exists in Yuhaiin's namespace can.
    expect(sshIDProblems({ uid: 1009, gid: 1009, parentNamespaceUID: 0, parentNamespaceGID: 0 }, deeper)).toEqual([]);
    expect(sshIDProblems({ uid: 1009, gid: 1009, parentNamespaceUID: 7, parentNamespaceGID: 0 }, deeper))
        .toEqual([{ field: 'parentUID', kind: 'parentNotMappable', id: 7, idType: 'UID', ranges: '0' }]);
    // Where host IDs resolve, an override must agree with the automatic mapping.
    expect(sshIDProblems({ uid: 1009, gid: 1009, parentNamespaceUID: 0, parentNamespaceGID: 0 }, podman)).toEqual([]);
    expect(sshIDProblems({ uid: 1009, gid: 1009, parentNamespaceUID: 5 }, podman))
        .toEqual([{ field: 'parentUID', kind: 'parentConflict', id: 5, idType: 'UID', parent: 0 }]);
    expect(sshIDProblems({ uid: 0, gid: 1009, parentNamespaceUID: 0 }, deeper).map(p => p.kind)).toEqual(['parentNeedsTarget', 'notMappable']);
    expect(sshIDProblems({ namespaceMode: 'rootful', uid: 1009, gid: 1009, parentNamespaceGID: 0 }, podman).map(p => p.kind)).toEqual(['parentRootful']);
    // Older servers: only structural checks.
    expect(sshIDProblems({ uid: 1009, gid: 1009, parentNamespaceUID: 0 }, { serviceUID: 1009, serviceGID: 1009, root: false })).toEqual([]);
    expect(sshEffectiveMapping({ uid: 0, gid: 0 }, deeper, 'uid')).toEqual({ session: 0, parent: 0, source: 'automatic' });
    expect(sshEffectiveMapping({ uid: 1009, gid: 1009 }, deeper, 'uid')).toEqual({ session: 1009, source: 'unresolved' });
});
