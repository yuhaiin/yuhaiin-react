import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProtectedUpdateDialog, UpdateRecoveryReadiness, canInstallUpdate } from './protected-update';
import type { UpdateCompatibility } from '@/contract/update';
vi.mock('@/auth/policy', () => ({ useActionAllowed: () => true }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const compatibility: UpdateCompatibility = { state: 'compatible', reason:'schema_catalog_matches', currentConfiguration:23,targetConfiguration:23,currentManagement:0,targetManagement:5,databaseRecoveryRequired:false };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => { host=document.createElement('div'); document.body.append(host); root=createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
it('requires configured recovery for migrations and refuses unknown schema or unready protection', () => {
    expect(canInstallUpdate(compatibility)).toBe(true);
    const migrating={ ...compatibility,state:'migration_required',databaseRecoveryRequired:true };
    expect(canInstallUpdate(migrating)).toBe(false);
    expect(canInstallUpdate(migrating,{ enabled:true,supported:true,ready:true,reason:'ready' })).toBe(true);
    expect(canInstallUpdate(migrating,{ enabled:false,supported:true,ready:true,reason:'disabled_by_administrator' })).toBe(false);
    expect(canInstallUpdate(compatibility,{ enabled:true,supported:true,ready:false,reason:'configure_encrypted_backup' })).toBe(false);
    expect(canInstallUpdate({ ...compatibility,state:'unknown' })).toBe(false);
});
it.each([true,false])('requires explicit maintenance and manual recovery consent (protection=%s)',async enabled => {
    const onConfirm=vi.fn();
    await act(async () => root.render(<ProtectedUpdateDialog target="v2" recovery={{ enabled,supported:true,ready:true,reason:'ready' }} pending={false} onClose={vi.fn()} onConfirm={onConfirm} />));
    const confirm=() => [...document.querySelectorAll('button')].find(button=>button.textContent==='protectedUpdate.confirm')!;
    expect(confirm().disabled).toBe(true);
    const switches=[...document.querySelectorAll<HTMLButtonElement>('[role=switch]')];
    expect(switches.length).toBe(enabled?2:3);
    await act(async () => { switches[0].click();switches[1].click(); });
    expect(confirm().disabled).toBe(!enabled);
    if (!enabled) await act(async () => switches[2].click());
    await act(async () => confirm().click());
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith({ confirmMaintenance:true,confirmManualRecovery:true,confirmNoRecoveryPoint:!enabled });
});

it.each([true, false])('offers an offline path instead of backup setup for unsupported migrations (enabled=%s)', async enabled => {
    await act(async () => root.render(<UpdateRecoveryReadiness value={{enabled, supported:false, ready:!enabled, reason:'disabled_by_administrator'}} compatibility={{...compatibility,state:'migration_required',databaseRecoveryRequired:true}} assetUrl="https://github.com/yuhaiin/yuhaiin/releases/download/main/yuhaiin-darwin-arm64" releaseUrl="https://github.com/yuhaiin/yuhaiin/releases/tag/main" assetSha256={'a'.repeat(64)} />));
    expect(host.textContent).toContain('protectedUpdate.manualMigration');
    expect(host.textContent).not.toContain('protectedUpdate.configure');
    expect(host.querySelector('a[href$="yuhaiin-darwin-arm64"]')).not.toBeNull();
    expect(host.querySelector('a[href$="#manual-upgrade-on-unsupported-hosts"]')).not.toBeNull();
    expect(host.textContent).toContain('a'.repeat(64));
});
it('keeps backup setup available for supported migration hosts', async () => {
    await act(async () => root.render(<UpdateRecoveryReadiness value={{enabled:true,supported:true,ready:false,reason:'configure_encrypted_backup'}} compatibility={{...compatibility,state:'migration_required',databaseRecoveryRequired:true}} />));
    expect(host.querySelector('a[href="/docs/config/backup"]')).not.toBeNull();
    expect(host.textContent).not.toContain('protectedUpdate.manualMigration');
});

it('offers release files when an older backend omits the direct asset URL', async () => {
    await act(async () => root.render(<UpdateRecoveryReadiness value={{enabled:false,supported:false,ready:true,reason:'disabled_by_administrator'}} compatibility={{...compatibility,state:'migration_required',databaseRecoveryRequired:true}} releaseUrl="https://github.com/yuhaiin/yuhaiin/releases/tag/main" />));
    expect(host.querySelector('a[href="https://github.com/yuhaiin/yuhaiin/releases/tag/main"]')).not.toBeNull();
    expect(host.textContent).not.toContain('protectedUpdate.configure');
});
it('does not render unsafe release or download URLs', async () => {
    await act(async () => root.render(<UpdateRecoveryReadiness compatibility={{...compatibility,state:'migration_required',databaseRecoveryRequired:true}} assetUrl="javascript:alert(1)" releaseUrl="data:text/html,test" />));
    expect(host.querySelectorAll('a').length).toBe(1);
});
