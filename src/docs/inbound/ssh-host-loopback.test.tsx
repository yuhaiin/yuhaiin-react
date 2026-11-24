import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import english from '@/i18n/resources/en/ui.json';
import japanese from '@/i18n/resources/ja/ui.json';
import korean from '@/i18n/resources/ko/ui.json';
import type { Go } from '@/api/generated-contracts';
import { createDefaultInbound, normalizeInbound, selectInboundProtocol } from '@/contract/inbound';
import { hostLoopbackProblems, inboundHostLoopbackProblems, isLoopbackAddress, isSessionAddress, SSHHostLoopbackEditor } from './ssh-host-loopback';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values && Object.keys(values).length ? `${key}:${JSON.stringify(values)}` : key }) }));

type HostLoopback = Go.inbound.SSHHostLoopback;
const mapping = (protocol: string, sessionAddress: string, sessionPort: number, hostAddress: string, hostPort: number) =>
    ({ protocol, sessionAddress, sessionPort, hostAddress, hostPort });

function render(initial: HostLoopback | undefined, ssh?: Go.inbound.SSHCapabilities, supported = true) {
    let value = initial;
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const draw = () => root.render(<SSHHostLoopbackEditor value={value} ssh={ssh} supported={supported} onChange={next => { value = next; draw(); }} />);
    act(draw);
    return { host, get value() { return value; }, cleanup: () => { act(() => root.unmount()); host.remove(); } };
}

const click = (el: Element | null | undefined) => act(() => (el as HTMLElement).click());
const button = (host: HTMLElement, text: string) => [...host.querySelectorAll('button')].find(b => b.textContent?.includes(text));
const setInput = (input: HTMLInputElement, value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
});

it('validates loopback addresses like the server', () => {
    for (const ok of ['127.0.0.1', '127.0.0.53', '127.255.255.255', '::1', '0:0:0:0:0:0:0:1']) expect(isLoopbackAddress(ok), ok).toBe(true);
    for (const bad of ['0.0.0.0', '::', '192.168.1.1', '8.8.8.8', '127.0.0.256', '127.0.0.01', 'localhost', '::ffff:127.0.0.1', '::1%lo', '[::1]', '', '127.0.0']) {
        expect(isLoopbackAddress(bad), bad).toBe(false);
    }
    expect(isSessionAddress('127.0.0.1')).toBe(true);
    expect(isSessionAddress('::1')).toBe(true);
    expect(isSessionAddress('127.0.0.2')).toBe(false);
});

it('reports invalid, duplicate and incomplete mappings', () => {
    expect(hostLoopbackProblems(undefined)).toEqual([]);
    expect(hostLoopbackProblems({ enabled: false })).toEqual([]);
    expect(hostLoopbackProblems({ enabled: true })).toEqual([{ key: 'sshHostLoopbackNoMappings' }]);
    const problems = hostLoopbackProblems({ enabled: true, mappings: [
        mapping('tcp', '127.0.0.1', 5432, '127.0.0.1', 5432),
        mapping('tcp', '127.0.0.1', 5432, '127.0.0.1', 5433), // duplicate session endpoint
        mapping('udp', '127.0.0.1', 5432, '127.0.0.1', 5432), // other protocol: fine
        mapping('tcp', '::1', 5432, '::1', 5432),             // other family: fine
        mapping('sctp', '0.0.0.0', 0, '192.168.1.2', 70000),
    ] });
    expect(problems.map(p => `${p.index}:${p.field}:${p.key}`)).toEqual([
        '1:sessionPort:sshHostLoopbackDuplicate',
        '4:protocol:sshHostLoopbackBadProtocol', '4:sessionAddress:sshHostLoopbackBadSessionAddress',
        '4:sessionPort:sshHostLoopbackBadPort', '4:hostAddress:sshHostLoopbackBadHostAddress', '4:hostPort:sshHostLoopbackBadPort',
    ]);
    // Mappings are checked while disabled too, like on the server.
    expect(hostLoopbackProblems({ enabled: false, mappings: [mapping('tcp', '127.0.0.1', 1, '10.0.0.1', 1)] })).toHaveLength(1);
    const many = Array.from({ length: 65 }, (_, i) => mapping('tcp', '127.0.0.1', 1000 + i, '127.0.0.1', 80));
    expect(hostLoopbackProblems({ enabled: true, mappings: many }).map(p => p.key)).toContain('sshHostLoopbackTooMany');
});

it('is off by default and adds IPv4, IPv6 and paired mappings', () => {
    const view = render(undefined);
    try {
        const toggle = [...view.host.querySelectorAll<HTMLButtonElement>('[role="switch"]')][0];
        expect(toggle.getAttribute('aria-checked')).toBe('false');
        expect(view.host.textContent).toContain('sshHostLoopbackDescription');
        expect(view.host.textContent).toContain('sshHostLoopbackNoteAccess');
        expect(view.host.querySelector('[role="table"]')).toBeNull();
        click(button(view.host, 'sshHostLoopbackAddIPv4'));
        click(button(view.host, 'sshHostLoopbackAddIPv6'));
        expect(view.value?.mappings).toEqual([mapping('tcp', '127.0.0.1', 0, '127.0.0.1', 0), mapping('tcp', '::1', 0, '::1', 0)]);
        // Empty ports are reported next to the fields.
        expect(view.host.textContent).toContain('sshHostLoopbackBadPort');
        const both = view.host.querySelector<HTMLInputElement>('input[aria-label="sshHostLoopbackBothPort"]')!;
        expect(button(view.host, 'sshHostLoopbackAddBoth')?.disabled).toBe(true);
        setInput(both, '6379');
        click(button(view.host, 'sshHostLoopbackAddBoth'));
        expect(view.value?.mappings?.slice(2)).toEqual([mapping('tcp', '127.0.0.1', 6379, '127.0.0.1', 6379), mapping('tcp', '::1', 6379, '::1', 6379)]);
        click(toggle);
        expect(view.value?.enabled).toBe(true);
    } finally {
        view.cleanup();
    }
});

it('edits each field and keeps session and host endpoints separate', () => {
    const view = render({ enabled: true, mappings: [mapping('tcp', '127.0.0.1', 8080, '127.0.0.1', 8080)] });
    try {
        const field = (name: string) => [...view.host.querySelectorAll<HTMLInputElement>('input')]
            .find(input => input.getAttribute('aria-label') === `sshHostLoopbackRow:{"index":1} ${name}`)!;
        // The host port follows the session port until edited separately.
        setInput(field('sshHostLoopbackSessionPort'), '5432');
        expect(view.value?.mappings?.[0]).toEqual(mapping('tcp', '127.0.0.1', 5432, '127.0.0.1', 5432));
        setInput(field('sshHostLoopbackHostPort'), '15432');
        setInput(field('sshHostLoopbackSessionPort'), '5433');
        expect(view.value?.mappings?.[0]).toEqual(mapping('tcp', '127.0.0.1', 5433, '127.0.0.1', 15432));
        setInput(field('sshHostLoopbackHostAddress'), '::1');
        expect(view.value?.mappings?.[0].hostAddress).toBe('::1');
        setInput(field('sshHostLoopbackHostAddress'), '192.168.1.10');
        expect(view.host.textContent).toContain('sshHostLoopbackBadHostAddress');
        expect(field('sshHostLoopbackHostAddress').getAttribute('aria-invalid')).toBe('true');
        // Session and host columns are both visible for every row.
        const headers = [...view.host.querySelectorAll('[role="columnheader"]')].map(h => h.textContent);
        expect(headers).toEqual(expect.arrayContaining(['sshHostLoopbackSessionAddress', 'sshHostLoopbackSessionPort', 'sshHostLoopbackHostAddress', 'sshHostLoopbackHostPort']));
        click(view.host.querySelector('button[aria-label^="delete"]'));
        expect(view.value?.mappings).toEqual([]);
        expect(view.host.textContent).toContain('sshHostLoopbackNoMappings');
    } finally {
        view.cleanup();
    }
});

it('shows runtime availability separately from the saved setting', () => {
    const features = { hostLoopbackIPv4: 'available', hostLoopbackIPv6: 'unavailable', hostLoopbackError: 'Loopback forward tcp [::1]:1 needs IPv6 on the session loopback' };
    const ssh = { serviceUID: 1000, serviceGID: 1000, root: false, environment: { features } } as unknown as Go.inbound.SSHCapabilities;
    let view = render({ enabled: true, mappings: [mapping('tcp', '::1', 80, '::1', 80)] }, ssh);
    try {
        const status = view.host.querySelector('[role="status"]')!.textContent;
        expect(status).toContain('IPv4 sshEnvAvailable · IPv6 sshEnvUnavailable');
        expect(status).toContain('needs IPv6 on the session loopback');
    } finally {
        view.cleanup();
    }
    view = render({ enabled: true, mappings: [mapping('tcp', '127.0.0.1', 80, '127.0.0.1', 80)] }, undefined, false);
    try {
        expect(view.host.querySelector('[role="status"]')!.textContent).toBe('sshHostLoopbackUnsupportedPlatform');
        // The configuration still edits and saves.
        expect(view.host.querySelector('[role="table"]')).not.toBeNull();
    } finally {
        view.cleanup();
    }
    const failed = { serviceUID: 1000, serviceGID: 1000, root: false, environment: { error: 'User Namespace is disabled', features: {} } } as unknown as Go.inbound.SSHCapabilities;
    view = render({ enabled: false }, failed);
    try {
        expect(view.host.querySelector('[role="status"]')!.textContent).toBe('sshHostLoopbackSessionsUnavailable');
    } finally {
        view.cleanup();
    }
});

it('round-trips through the inbound contract and blocks saving invalid mappings', () => {
    const inbound = selectInboundProtocol(createDefaultInbound('ssh'), 'ssh');
    if (inbound.protocol.type !== 'ssh') throw new Error('expected SSH protocol');
    expect(inbound.protocol.ssh.hostLoopback).toBeUndefined();
    inbound.protocol.ssh.hostLoopback = { enabled: true, mappings: [mapping('udp', '::1', 5353, '127.0.0.1', 5353)] };
    const restored = normalizeInbound(JSON.parse(JSON.stringify(inbound)));
    expect(restored.protocol).toEqual(inbound.protocol);
    expect(inboundHostLoopbackProblems(inbound)).toEqual([]);
    inbound.protocol.ssh.hostLoopback.mappings![0].hostAddress = '0.0.0.0';
    expect(inboundHostLoopbackProblems(inbound)).toHaveLength(1);
});

it('translates the host loopback settings', () => {
    const keys = Object.keys(english).filter(k => k.startsWith('sshHostLoopback'));
    expect(keys.length).toBeGreaterThan(25);
    for (const key of keys) {
        expect(japanese[key as keyof typeof japanese], key).toMatch(/[぀-ヿ㐀-鿿]/);
        expect(korean[key as keyof typeof korean], key).toMatch(/[가-힣]/);
    }
});
