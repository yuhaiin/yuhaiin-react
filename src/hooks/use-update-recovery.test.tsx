import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getInfo } from '@/api/settings';
import { getUpdateStatus } from '@/api/update';
import type { Info } from '@/contract/settings';
import type { UpdateCheck, UpdateStatus } from '@/contract/update';
import { isInstalledUpdate, useUpdateRecovery } from './use-update-recovery';
vi.mock('@/api/settings', () => ({ getInfo: vi.fn() }));
vi.mock('@/api/update', () => ({ getUpdateStatus: vi.fn() }));
vi.mock('@/common/apiurl', () => ({ getApiUrl: () => 'test-controller' }));
const previous: Info = { version: 'v1.0.0', commit: 'aaaaaaa', buildTime: 'old', goVersion: '', arch: '', platform: '', os: '', compiler: '', build: [] };
const installed = { ...previous, version: 'v2.0.0', commit: 'bbbbbbb', buildTime: 'new' };
const update: UpdateCheck = { channel:'stable', supported:true, currentVersion:previous.version, targetVersion:'v2.0.0', targetTag:'v2.0.0', prerelease:false, releaseUrl:'', releaseNotes:'', publishedAt:'', assetName:'', assetUrl:'', assetSha256:'', updateAvailable:true, reason:'' };
const idle: UpdateStatus = { running:false, stage:'', progress:0, bytesDownloaded:0, totalBytes:0, error:'' };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const verified = vi.fn();
function Probe() {
    const recovery = useUpdateRecovery(verified);
    return <><output>{recovery.phase}</output><button onClick={() => recovery.begin(update, previous)}>begin</button><button onClick={recovery.retry}>retry</button></>;
}
beforeEach(() => {
    vi.useFakeTimers(); vi.clearAllMocks(); sessionStorage.clear();
    vi.mocked(getUpdateStatus).mockResolvedValue(idle); vi.mocked(getInfo).mockResolvedValue(previous);
    host=document.createElement('div'); root=createRoot(host);
});
afterEach(() => { act(() => root.unmount()); vi.useRealTimers(); });
const render = () => act(async () => root.render(<Probe />));
const begin = () => act(async () => host.querySelector('button')!.click());
const tick = () => act(async () => vi.advanceTimersByTimeAsync(1500));

it('does not equate an installer completion or a reachable old server with success', async () => {
    await render(); await begin();
    vi.mocked(getUpdateStatus).mockResolvedValue({ ...idle, stage:'completed', progress:100 });
    await tick(); expect(host.textContent).toContain('restarting'); expect(verified).not.toHaveBeenCalled();
    vi.mocked(getUpdateStatus).mockRejectedValue(new Error('restart')); vi.mocked(getInfo).mockRejectedValue(new Error('offline'));
    await tick(); expect(verified).not.toHaveBeenCalled();
    vi.mocked(getUpdateStatus).mockResolvedValue(idle); vi.mocked(getInfo).mockResolvedValue(installed);
    await tick(); expect(host.textContent).toContain('complete'); expect(verified).toHaveBeenCalledExactlyOnceWith(installed);
    expect(sessionStorage.length).toBe(0);
});
it('persists the target across a page reload and verifies the recovered version', async () => {
    await render(); await begin(); expect(sessionStorage.length).toBe(1);
    act(() => root.unmount()); root=createRoot(host);
    vi.mocked(getInfo).mockResolvedValue(installed);
    await render(); expect(verified).toHaveBeenCalledExactlyOnceWith(installed);
});
it('reports updater errors and offers a bounded recovery retry after an outage', async () => {
    await render(); await begin();
    vi.mocked(getUpdateStatus).mockResolvedValue({ ...idle, error:'download failed' });
    await tick(); expect(host.textContent).toContain('error'); expect(sessionStorage.length).toBe(0);
    vi.mocked(getUpdateStatus).mockRejectedValue(new Error('offline')); vi.mocked(getInfo).mockRejectedValue(new Error('offline'));
    await begin();
    await act(async () => vi.advanceTimersByTimeAsync(303_000)); expect(host.textContent).toContain('timeout');
    vi.mocked(getUpdateStatus).mockResolvedValue(idle); vi.mocked(getInfo).mockResolvedValue(installed);
    await act(async () => host.querySelectorAll('button')[1].click()); expect(verified).toHaveBeenCalledExactlyOnceWith(installed);
});
it('requires the expected release or matching main commit rather than any changed version', () => {
    const pending={ target:update.targetVersion, previous, startedAt:0 };
    expect(isInstalledUpdate(previous,pending)).toBe(false);
    expect(isInstalledUpdate({ ...installed, version:'v9.0.0' },pending)).toBe(false);
    expect(isInstalledUpdate(installed,pending)).toBe(true);
    expect(isInstalledUpdate({ ...installed, version:'main', commit:'bbbbbbbcccc' },{ ...pending,target:'main-bbbbbbb' })).toBe(true);
});
