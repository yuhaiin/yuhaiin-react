import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { activateRecoveryImport } from '@/api/backup-import';
import type { RecoveryImport } from '@/api/backup-import';
import { GlobalToastContext } from '@/component/v2/toast';
import { RecoveryActivationDialog } from './activation-dialog';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/api/backup-import', () => ({ activateRecoveryImport: vi.fn() }));
const roots: ReturnType<typeof createRoot>[] = [];
const admitted = vi.fn(), close = vi.fn(), info = vi.fn();
afterEach(() => { act(() => roots.forEach(root => root.unmount())); roots.length = 0; document.body.innerHTML = ''; vi.clearAllMocks(); });
const point = (mode = 'original'): RecoveryImport => ({ id: 'import', previewId: 'preview-revision', createdAt: '', expiresAt: '', state: 'previewed', size: 1, sha256: '', preview: {
    mode, targetInstanceId: 'target-instance', instanceId: 'restored-instance', warnings: [], files: [],
    runtime: { managementAuth: true, managementTLS: 'files', workingDirectory: '/private/restore', listenAddress: '127.0.0.1:50051' },
    manifest: { id: 'backup', instanceId: 'source-instance', format: '', version: 2, createdAt: '', consistency: '', includesHistory: false,
        build: { version: 'same', commit: 'fixture', platform: 'linux', architecture: 'amd64', goVersion: '1.27' }, files: [] },
} });
async function mount(mode = 'original') {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    await act(async () => root.render(<GlobalToastContext.Provider value={{ Info: info, Error: vi.fn() }}><RecoveryActivationDialog item={point(mode)} onClose={close} onAdmitted={admitted} /></GlobalToastContext.Provider>));
    return document.querySelector('[role=dialog]')!;
}
function confirmButton(dialog: Element) { return [...dialog.querySelectorAll('button')].find(button => button.textContent === 'recoveryActivation.activate')!; }
async function consent(dialog: Element) {
    const input = dialog.querySelector<HTMLInputElement>('input')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'target-instance'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    for (const control of dialog.querySelectorAll<HTMLButtonElement>('[role=switch]')) await act(async () => control.click());
}

it('requires typed target identity and each destructive consent before submitting the exact preview', async () => {
    const dialog = await mount();
    expect(confirmButton(dialog).disabled).toBe(true);
    expect(activateRecoveryImport).not.toHaveBeenCalled();
    await consent(dialog);
    expect(confirmButton(dialog).disabled).toBe(false);
    vi.mocked(activateRecoveryImport).mockResolvedValue({ ...point(), state: 'activating' });
    await act(async () => confirmButton(dialog).click());
    expect(activateRecoveryImport).toHaveBeenCalledExactlyOnceWith({ id: 'import', confirmPreviewId: 'preview-revision', confirmBackupId: 'backup', confirmSourceInstanceId: 'source-instance',
        confirmTargetInstanceId: 'target-instance', confirmResultInstanceId: 'restored-instance', confirmMaintenance: true, confirmStartupChanges: true,
        confirmSourceStopped: true, confirmCredentialRevival: true, confirmIdentityReplacement: true, confirmCloneEnrollment: false });
    expect(admitted).toHaveBeenCalledWith(false);
});

it('requires clone re-enrollment consent and does not claim source credential revival', async () => {
    const dialog = await mount('clone');
    expect(dialog.textContent).toContain('recoveryActivation.enrollment');
    expect(dialog.textContent).not.toContain('recoveryActivation.revival');
    await consent(dialog);
    vi.mocked(activateRecoveryImport).mockResolvedValue({ ...point('clone'), state: 'activating' });
    await act(async () => confirmButton(dialog).click());
    expect(activateRecoveryImport).toHaveBeenCalledWith(expect.objectContaining({ confirmCloneEnrollment: true, confirmSourceStopped: false, confirmCredentialRevival: false }));
});

it('observes an uncertain disconnect once without automatically replaying a destructive request', async () => {
    const dialog = await mount(); await consent(dialog);
    vi.mocked(activateRecoveryImport).mockRejectedValue({ code: 0, msg: 'unreachable' });
    await act(async () => confirmButton(dialog).click());
    expect(activateRecoveryImport).toHaveBeenCalledOnce();
    expect(admitted).toHaveBeenCalledWith(true);
    expect(info).toHaveBeenCalledWith('recoveryActivation.uncertain');
});

it('keeps explicit server rejection visible without inventing an accepted operation', async () => {
    const dialog = await mount(); await consent(dialog);
    vi.mocked(activateRecoveryImport).mockRejectedValue({ code: 400, msg: 'Preview expired' });
    await act(async () => confirmButton(dialog).click());
    expect(dialog.querySelector('[role=alert]')?.textContent).toBe('Preview expired');
    expect(admitted).not.toHaveBeenCalled(); expect(close).not.toHaveBeenCalled();
});

it('keeps a durable admission with uncertain helper launch visible as pending', async () => {
    const dialog = await mount(); await consent(dialog);
    vi.mocked(activateRecoveryImport).mockResolvedValue({ ...point(), state: 'activating', errorCode: 'launch_uncertain' });
    await act(async () => confirmButton(dialog).click());
    expect(admitted).toHaveBeenCalledWith(true);
    expect(info).toHaveBeenCalledWith('recoveryActivation.uncertain');
    expect(activateRecoveryImport).toHaveBeenCalledOnce();
});
