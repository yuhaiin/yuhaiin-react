import { afterEach, expect, it, vi } from 'vitest';
import { authorizedFetch } from '@/auth/transport';
import { uploadRecoveryImport } from './backup-import';

vi.mock('@/auth/transport', () => ({ apiURL: (path: string) => path, authorizedFetch: vi.fn() }));
vi.mock('@/auth/session', () => ({ getSession: () => undefined, can: () => true }));
afterEach(() => vi.clearAllMocks());

it('sends the File itself without buffering the archive in JavaScript', async () => {
    const file = new File(['ciphertext'], 'restore.yhb');
    const buffer = vi.fn(() => { throw new Error('must not buffer'); });
    Object.defineProperty(file, 'arrayBuffer', { value: buffer });
    vi.mocked(authorizedFetch).mockResolvedValue(new Response(JSON.stringify({ id: 'import', state: 'uploaded' })));
    await expect(uploadRecoveryImport(file)).resolves.toMatchObject({ id: 'import' });
    expect(authorizedFetch).toHaveBeenCalledWith('/api/v2/backup/recovery/imports', expect.objectContaining({ body: file, headers: expect.objectContaining({ 'Content-Type': 'application/octet-stream' }) }));
    expect(buffer).not.toHaveBeenCalled();
});

it('rejects empty and oversized archives before making a request', async () => {
    await expect(uploadRecoveryImport(new File([], 'empty.yhb'))).rejects.toThrow('recovery_import_size');
    const large = new File(['x'], 'large.yhb');
    Object.defineProperty(large, 'size', { value: 100 * 1024 ** 3 + 1 });
    await expect(uploadRecoveryImport(large)).rejects.toThrow('recovery_import_size');
    expect(authorizedFetch).not.toHaveBeenCalled();
});

it('cancels the response body when the upload is rejected', async () => {
    const response = new Response('rejected', { status: 413 });
    const cancel = vi.spyOn(response.body!, 'cancel');
    vi.mocked(authorizedFetch).mockResolvedValue(response);
    await expect(uploadRecoveryImport(new File(['x'], 'restore.yhb'))).rejects.toThrow('413');
    expect(cancel).toHaveBeenCalled();
});
