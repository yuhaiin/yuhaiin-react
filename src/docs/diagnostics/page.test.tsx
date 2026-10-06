import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import '@/i18n';
import type { DiagnosticReport } from '@/contract/tools';
import { runDiagnostics } from '@/api/tools';
import Page from './page';

vi.mock('@/api/tools', () => ({ runDiagnostics: vi.fn() }));
vi.mock('@/component/v2/clipboard', () => ({ useClipboard: () => ({ copy: vi.fn(), reset: vi.fn(), manualCopyModal: null, copied: false }) }));
let root: Root;
let host: HTMLDivElement;
afterEach(() => { if (root) act(() => root.unmount()); host?.remove(); vi.clearAllMocks(); });
function mount() {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    act(() => root.render(<Page />));
}
function submit() { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
const report: DiagnosticReport = {
    schemaVersion: 1, startedAt: '2026-10-06T00:00:00Z', durationMs: 42, host: 'example.com', platform: 'android/arm64', version: 'test', ipv6Enabled: false,
    checks: [{ id: 'dns4', status: 'pass', message: 'dns_resolved', durationMs: 12, evidence: ['192.0.2.1'] }],
    findings: ['core_path_works', 'scope_limit'], report: 'safe report',
};
it('runs only on demand, prevents duplicate requests and renders evidence and guidance', async () => {
    let complete!: (value: DiagnosticReport) => void;
    vi.mocked(runDiagnostics).mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    mount();
    expect(runDiagnostics).not.toHaveBeenCalled();
    act(() => { submit(); submit(); });
    expect(runDiagnostics).toHaveBeenCalledTimes(1);
    expect(host.querySelector('input')!.disabled).toBe(true);
    await act(async () => complete(report));
    expect(host.textContent).toContain('192.0.2.1');
    expect(host.textContent).toContain('The core completed routed HTTPS');
    expect(host.textContent).toContain('OS routes, current TUN forwarding');
    expect(host.querySelector('input')!.disabled).toBe(false);
    expect(host.querySelector('button[type="submit"]')!.textContent).toContain('Run diagnostics');
});
it('cancels the request and releases the running state', async () => {
    vi.mocked(runDiagnostics).mockImplementation((_host, signal) => new Promise((_resolve, reject) => signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))));
    mount();
    act(submit);
    await act(async () => { const cancel = Array.from(host.querySelectorAll('button')).find(button => button.textContent?.includes('Cancel'))!; cancel.click(); });
    expect(host.querySelector('[role="alert"]')!.textContent).toContain('canceled');
    expect(host.querySelector('input')!.disabled).toBe(false);
});
it('shows a useful error when another client is already running diagnostics', async () => {
    vi.mocked(runDiagnostics).mockRejectedValue({ code: 429, msg: 'busy' });
    mount();
    await act(async () => submit());
    expect(host.querySelector('[role="alert"]')!.textContent).toContain('Another diagnosis');
});
it('aborts outstanding work when leaving the page', () => {
    let signal: AbortSignal;
    vi.mocked(runDiagnostics).mockImplementation((_host, s) => { signal = s!; return new Promise(() => {}); });
    mount();
    act(submit);
    act(() => root.unmount());
    expect(signal!.aborted).toBe(true);
});
