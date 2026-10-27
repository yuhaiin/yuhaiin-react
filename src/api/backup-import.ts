import { requestJSON } from '@/api/client';
import type { Go } from '@/api/generated-contracts';
import { can, getSession } from '@/auth/session';
import { apiURL, authorizedFetch } from '@/auth/transport';

export type RecoveryImport = Go.recovery.Import;
const maxArchiveBytes = 100 * 1024 ** 3;

export function getRecoveryImports(): Promise<RecoveryImport[]> {
    return requestJSON('GET', '/api/v2/backup/recovery/imports');
}

export async function uploadRecoveryImport(file: File, signal?: AbortSignal): Promise<RecoveryImport> {
    if (getSession() && !can('backup:manage')) throw new Error('Permission denied');
    if (file.size < 1 || file.size > maxArchiveBytes) throw new Error('recovery_import_size');
    const timeout = AbortSignal.timeout(10 * 60_000);
    const response = await authorizedFetch(apiURL('/api/v2/backup/recovery/imports'), {
        method: 'POST', body: file,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        headers: { Accept: 'application/json', 'Content-Type': 'application/octet-stream' },
    });
    if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Recovery upload failed (${response.status})`);
    }
    return await response.json() as RecoveryImport;
}

export function previewRecoveryImport(id: string, mode: 'original' | 'clone', identity: string, passphrase: string): Promise<RecoveryImport> {
    return requestJSON('POST', `/api/v2/backup/recovery/imports/${encodeURIComponent(id)}/preview`, { mode, identity, passphrase });
}

export function discardRecoveryImport(id: string): Promise<void> {
    return requestJSON('DELETE', `/api/v2/backup/recovery/imports/${encodeURIComponent(id)}`, { confirm: true });
}

export function activateRecoveryImport(request: Go.recovery.ImportActivateRequest): Promise<RecoveryImport> {
    return requestJSON('POST', `/api/v2/backup/recovery/imports/${encodeURIComponent(request.id)}/activate`, request, undefined, AbortSignal.timeout(15_000));
}
