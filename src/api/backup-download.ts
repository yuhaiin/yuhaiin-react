import type { RecoveryBackup } from './backup';
import { apiURL, authorizedFetch } from '@/auth/transport';
import { can, getSession } from '@/auth/session';

const maxBufferedDownload = 64 * 1024 * 1024;
type SavePicker = (options: { suggestedName: string }) => Promise<FileSystemFileHandle>;

// Chromium's native file stream keeps large archives outside the JS heap.
// Other browsers use an explicitly bounded fallback, never an unbounded blob.
export async function downloadRecoveryBackup(id: string): Promise<void> {
    if (getSession() && !can('backup:manage')) throw new Error('Permission denied');
    const picker = (window as Window & { showSaveFilePicker?: SavePicker }).showSaveFilePicker;
    let handle: FileSystemFileHandle | undefined;
    if (picker) {
        try { handle = await picker.call(window, { suggestedName: `${id}.yhb` }); }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            throw error;
        }
    }
    const response = await authorizedFetch(apiURL(`/api/v2/backup/recovery/${encodeURIComponent(id)}/download`), {
        method: 'GET', headers: { Accept: 'application/octet-stream' },
    });
    if (!response.ok || !response.body) {
        await response.body?.cancel();
        throw new Error(`Backup download failed (${response.status})`);
    }
    if (handle) {
        try {
            const destination = await handle.createWritable();
            await response.body.pipeTo(destination);
        } catch (error) {
            await response.body.cancel().catch(() => undefined);
            throw error;
        }
        return;
    }
    if (Number(response.headers.get('Content-Length')) > maxBufferedDownload) {
        await response.body.cancel();
        throw new Error('large_download_requires_streaming');
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let bytes = 0;
    try {
        for (;;) {
            const part = await reader.read();
            if (part.done) break;
            bytes += part.value.byteLength;
            if (bytes > maxBufferedDownload) throw new Error('large_download_requires_streaming');
            chunks.push(new Uint8Array(part.value));
        }
    } catch (error) {
        await reader.cancel();
        throw error;
    } finally { reader.releaseLock(); }
    const url = URL.createObjectURL(new Blob(chunks, { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}.yhb`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// This small public record contains object ownership and a ciphertext digest,
// never S3 credentials or a decryption key. Retain it outside the deployment.
export function saveRecoveryMetadata(item: RecoveryBackup): void {
    const metadata = {
        id: item.id, backupId: item.backupId, instanceId: item.instanceId,
        target: item.target, size: item.size, sha256: item.sha256, objectKey: item.objectKey,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
