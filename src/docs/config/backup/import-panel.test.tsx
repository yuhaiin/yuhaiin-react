import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { RecoveryImport } from '@/api/backup-import';
import { discardRecoveryImport, previewRecoveryImport, uploadRecoveryImport } from '@/api/backup-import';
import { RecoveryImportPanel } from './import-panel';

const mocked = vi.hoisted(() => ({ items: [] as RecoveryImport[], mutate: vi.fn(async () => undefined) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('swr', () => ({ default: () => ({ data: mocked.items, error: undefined, mutate: mocked.mutate }) }));
vi.mock('@/api/backup-import', () => ({ discardRecoveryImport: vi.fn(), getRecoveryImports: vi.fn(), previewRecoveryImport: vi.fn(), uploadRecoveryImport: vi.fn() }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { act(() => roots.forEach(root => root.unmount())); roots.length = 0; document.body.innerHTML = ''; mocked.items = []; vi.clearAllMocks(); });

async function mount() {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    await act(async () => root.render(<RecoveryImportPanel />));
    return host;
}
const find = (host: ParentNode, key: string) => [...host.querySelectorAll('button')].find(button => button.textContent?.includes(key))!;
const point = (): RecoveryImport => ({ id: 'import', createdAt: '2026-10-27T00:00:00Z', expiresAt: '2026-10-27T00:30:00Z', state: 'uploaded', size: 1024, sha256: 'fixture' });

it('uploads the selected encrypted File and selects its server-issued identifier', async () => {
    vi.mocked(uploadRecoveryImport).mockResolvedValue(point());
    const host = await mount();
    const input = host.querySelector<HTMLInputElement>('input[type=file]')!;
    const file = new File(['encrypted'], 'restore.yhb');
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    await act(async () => find(host, 'recoveryImport.upload').click());
    expect(uploadRecoveryImport).toHaveBeenCalledWith(file, expect.any(AbortSignal));
    expect(mocked.mutate).toHaveBeenCalled();
});

it('requires confirmation before discarding uploaded private staging', async () => {
    mocked.items = [point()];
    const host = await mount();
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="recoveryImport.discard"]')!.click());
    expect(discardRecoveryImport).not.toHaveBeenCalled();
    await act(async () => find(document.querySelector('[role=dialog]')!, 'action.ok').click());
    expect(discardRecoveryImport).toHaveBeenCalledWith('import');
});

it('keeps preview disabled until a specific import and private input are selected', async () => {
    mocked.items = [point()];
    const host = await mount();
    expect(find(host, 'recoveryImport.preview').disabled).toBe(true);
    expect(previewRecoveryImport).not.toHaveBeenCalled();
    expect(host.textContent).toContain('recoveryImport.activationHint');
});
