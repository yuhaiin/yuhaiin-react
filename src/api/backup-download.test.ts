import { afterEach, expect, it, vi } from 'vitest';
import { authorizedFetch } from '@/auth/transport';
import { downloadRecoveryBackup, saveRecoveryMetadata } from './backup-download';

vi.mock('@/auth/transport', () => ({ apiURL: (path: string) => path, authorizedFetch: vi.fn() }));
vi.mock('@/auth/session', () => ({ getSession: () => undefined, can: () => true }));
afterEach(() => { vi.clearAllMocks(); Reflect.deleteProperty(window, 'showSaveFilePicker'); });

it('rejects a large buffered download before consuming it', async () => {
    const response = new Response(new Uint8Array([1]), { headers: { 'Content-Length': String(65 * 1024 * 1024) } });
    const cancel = vi.spyOn(response.body!, 'cancel');
    vi.mocked(authorizedFetch).mockResolvedValue(response);
    await expect(downloadRecoveryBackup('fixture')).rejects.toThrow('large_download_requires_streaming');
    expect(cancel).toHaveBeenCalled();
});

it('streams directly to the chosen file without the buffered limit', async () => {
    const received: number[] = [];
    const destination = new WritableStream<Uint8Array>({ write: value => { received.push(...value); } });
    const createWritable = vi.fn(async () => destination);
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: vi.fn(async () => ({ createWritable })) });
    vi.mocked(authorizedFetch).mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Length': String(1024 * 1024 * 1024) } }));
    await downloadRecoveryBackup('fixture');
    expect(received).toEqual([1, 2, 3]);
    expect(createWritable).toHaveBeenCalledTimes(1);
});

it('bounds a chunked response even without Content-Length', async () => {
    const response = new Response(new Uint8Array(64 * 1024 * 1024 + 1));
    vi.mocked(authorizedFetch).mockResolvedValue(response);
    await expect(downloadRecoveryBackup('fixture')).rejects.toThrow('large_download_requires_streaming');
    expect(response.body!.locked).toBe(false);
});

it('does not request the archive after the user cancels file selection', async () => {
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: vi.fn(async () => { throw new DOMException('Cancelled', 'AbortError'); }) });
    await downloadRecoveryBackup('fixture');
    expect(authorizedFetch).not.toHaveBeenCalled();
});


it('exports only independently retainable object metadata without extra response fields or network traffic', async () => {
    let saved: Blob | undefined;
    const create = vi.fn((value: Blob) => { saved = value; return 'blob:metadata'; });
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const timer = vi.spyOn(globalThis, 'setTimeout');
    try {
        const extraResponse = { id: 'fixture', backupId: 'backup', instanceId: 'source', target: 's3', size: 12,
            sha256: 'digest', objectKey: 'recovery/source/backup.yhb', secretKey: 'must-not-export',
            state: 'verified', createdAt: '2026-10-27T00:00:00Z', includesHistory: false, uploadAttempts: 1 };
        saveRecoveryMetadata(extraResponse);
        const cleanup = timer.mock.results[timer.mock.results.length - 1];
        if (cleanup?.type === 'return') clearTimeout(cleanup.value);
        timer.mockRestore();
        const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsText(saved!);
        });
        expect(text).not.toContain('must-not-export');
        expect(JSON.parse(text)).toMatchObject({ objectKey: 'recovery/source/backup.yhb', size: 12, sha256: 'digest' });
        expect(authorizedFetch).not.toHaveBeenCalled();
        expect(click).toHaveBeenCalledOnce();
    } finally { timer.mockRestore(); click.mockRestore(); vi.unstubAllGlobals(); }
});
