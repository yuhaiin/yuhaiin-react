import { StageChangeButton } from "@/component/configuration-change";
import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import { authScope, updatePrincipal, type Principal } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input, Textarea } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { MultiSelectChips } from '@/component/v2/multi-select';
import { PermissionPicker } from './permission-picker';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export interface ManagementRole { id: string; name: string; description: string; permissions: string[]; revision: number; builtIn: boolean }
export interface RoleAssignment { userId: string; baseRole: string; disabled: boolean; enrolled: boolean; roleIds: string[]; revision: number; permissions: string[] }
interface Permission { id: string; category: string; description: string }

export function EffectivePermissions() {
    const { t } = useTranslation('auth');
    const session = useSession();
    if (!session) return null;
    return <Card><CardHeader><h2 className="font-medium">{t('roles.effective')}</h2></CardHeader><CardBody className="space-y-3">
        <p className="text-sm text-ui-muted">{t('roles.effectiveHelp')}</p>
        <ul className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-3">{session.principal.permissions.map(permission => <li key={permission} className="break-all">{permission}</li>)}</ul>
    </CardBody></Card>;
}

export function ManagementRoles() {
    const session = useSession();
    if (!session?.principal.permissions.includes('roles:read')) return null;
    return <RoleWorkspace key={authScope()} permissions={session.principal.permissions} userId={session.principal.userId} />;
}

function RoleWorkspace({ permissions, userId }: { permissions: string[]; userId: string }) {
    const { t } = useTranslation('auth');
    const scope = authScope();
    const writable = permissions.includes('roles:write');
    const assignable = writable && permissions.includes('users:manage');
    const { data: roles, error, mutate } = useSWR([scope, 'management-roles'], () => authAPI<ManagementRole[]>('GET', '/roles'), { revalidateOnFocus: false, revalidateOnReconnect: false });
    const { data: catalog, error: catalogError } = useSWR([scope, 'permission-catalog'], () => authAPI<Permission[]>('GET', '/permissions'));
    const { data: users } = useSWR(permissions.includes('users:manage') ? [scope, 'role-users'] : null, () => authAPI<User[]>('GET', '/users'));
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const run = async (action: () => Promise<void>) => {
        if (!writable || scope !== authScope()) return;
        if (!await confirmAction(t('roles.activateConfirm')) || scope !== authScope()) return;
        setBusy(true); setFailure('');
        try {
            await action();
            if (scope !== authScope()) return;
            await mutate();
            const principal = await authAPI<Principal>('GET', '/me');
            if (scope === authScope()) updatePrincipal(principal);
        } catch (cause) { if (scope === authScope()) setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'roles.conflict' : 'requestFailed')); }
        finally { if (scope === authScope()) setBusy(false); }
    };
    const save = (role: ManagementRole) => void run(async () => {
        await authAPI(role.id ? 'PUT' : 'POST', role.id ? `/roles/${encodeURIComponent(role.id)}` : '/roles', role);
        if (scope === authScope()) setCreating(false);
    });
    return <Card><CardHeader><h2 className="font-medium">{t('roles.title')}</h2><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={async () => { if (await confirmAction(t('roles.reloadConfirm')) && scope === authScope()) void mutate(); }}>{t('refresh')}</Button>{writable && <Button disabled={busy || !catalog} onClick={() => setCreating(true)}>{t('roles.create')}</Button>}</div></CardHeader>
        <CardBody className="space-y-4"><p className="text-sm text-ui-muted">{t('roles.help')}</p>
            {(failure || error || catalogError) && <p role="alert" className="text-sm text-ui-danger">{failure || t('requestFailed')}</p>}
            {creating && <RoleEditor catalog={catalog ?? []} permissions={permissions} writable busy={busy} onSave={save} onCommitted={async () => { setCreating(false); await mutate(); }} onCancel={() => setCreating(false)} />}
            {roles?.map(role => <RoleEditor key={`${role.id}:${role.revision}`} role={role} catalog={catalog ?? []} permissions={permissions} writable={writable && !role.builtIn && role.permissions.every(permission => permissions.includes(permission))} busy={busy} onSave={save} onCommitted={async () => { setCreating(false); await mutate(); }}
                onDelete={() => void run(async () => { await authAPI('DELETE', `/roles/${encodeURIComponent(role.id)}?revision=${role.revision}`); })} />)}
            {roles && <RoleAssignments key={scope} roles={roles} users={users ?? []} userId={userId} writable={assignable} />}
        </CardBody></Card>;
}

function RoleEditor({ role, catalog, permissions, writable, busy, onSave, onDelete, onCancel, onCommitted }: { role?: ManagementRole; catalog: Permission[]; permissions: string[]; writable: boolean; busy: boolean; onSave: (role: ManagementRole) => void; onDelete?: () => void; onCancel?: () => void; onCommitted?: () => Promise<void> }) {
    const { t } = useTranslation('auth');
    const [name, setName] = useState(role?.name ?? '');
    const [description, setDescription] = useState(role?.description ?? '');
    const [selected, setSelected] = useState(role?.permissions ?? []);
    const submit = (event: FormEvent) => { event.preventDefault(); if (writable && !busy) onSave({ id: role?.id ?? '', revision: role?.revision ?? 0, name, description, permissions: selected, builtIn: false }); };
    return <details open={!role} className="rounded-ui-md border border-ui-border p-4"><summary className="cursor-pointer break-words font-medium">{role?.builtIn ? t(`roles.builtin_${role.id}`) : role?.name ?? t('roles.create')}{role?.builtIn && <span className="ml-2 text-xs text-ui-muted">{t('roles.protected')}</span>}</summary>
        <form aria-label={role?.name ?? t('roles.create')} onSubmit={submit} className="mt-4 space-y-3">
            {role && <p className="break-all text-xs text-ui-muted">{role.id} · {t('roles.revision', { revision: role.revision })}</p>}
            <fieldset disabled={busy || !writable} className="space-y-3">
                <label className="block space-y-2"><span>{t('roles.name')}</span><Input required maxLength={128} value={name} onChange={event => setName(event.target.value)} /></label>
                <label className="block space-y-2"><span>{t('groups.description')}</span><Textarea maxLength={2048} value={description} onChange={event => setDescription(event.target.value)} /></label>
                <div className="max-h-96 overflow-auto"><PermissionPicker legend={t('roles.permissions')} permissions={catalog.map(permission => permission.id)} value={selected} onChange={setSelected} isDisabled={permission => !permissions.includes(permission)} /></div>
                {writable && <div className="flex flex-wrap gap-2"><Button type="submit">{t('save')}</Button><StageChangeButton request={{ store: "identity", kind: "role", resourceId: role?.id, payload: { id: role?.id ?? "", revision: role?.revision ?? 0, name, description, permissions: selected, builtIn: false } }} onCommitted={onCommitted} />{role && onDelete && <Button type="button" variant="outline-danger" onClick={onDelete}>{t('delete')}</Button>}{onCancel && <Button type="button" onClick={onCancel}>{t('cancel')}</Button>}</div>}
            </fieldset>
        </form></details>;
}

function RoleAssignments({ roles, users, userId, writable }: { roles: ManagementRole[]; users: User[]; userId: string; writable: boolean }) {
    const { t } = useTranslation('auth');
    const [owner, setOwner] = useState(userId);
    const scope = authScope();
    const { data, error, mutate } = useSWR([scope, 'role-assignment', owner], () => authAPI<RoleAssignment>('GET', `/users/${encodeURIComponent(owner)}/roles`), { revalidateOnFocus: false, revalidateOnReconnect: false });
    return <section className="space-y-3 border-t border-ui-border pt-4"><h3 className="font-medium">{t('roles.assignments')}</h3><p className="text-sm text-ui-muted">{t('roles.assignmentHelp')}</p>
        {users.length > 0 && <Select ariaLabel={t('roles.owner')} value={owner} onValueChange={setOwner} items={users.map(user => ({ value: user.id, label: user.login }))} />}
        <Button size="sm" onClick={async () => { if (await confirmAction(t('roles.reloadConfirm')) && scope === authScope()) void mutate(); }}>{t('refresh')}</Button>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
        {data && <AssignmentEditor key={`${scope}:${owner}:${data.revision}`} assignment={data} roles={roles.filter(role => !role.builtIn)} writable={writable} onSaved={async () => { await mutate(); }} />}
    </section>;
}

function AssignmentEditor({ assignment, roles, writable, onSaved }: { assignment: RoleAssignment; roles: ManagementRole[]; writable: boolean; onSaved: () => Promise<void> }) {
    const { t } = useTranslation('auth');
    const [selected, setSelected] = useState(assignment.roleIds);
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const scope = authScope();
    const submit = async (event: FormEvent) => {
        event.preventDefault(); if (!writable || busy || scope !== authScope()) return;
        if (!await confirmAction(t('roles.activateConfirm')) || scope !== authScope()) return;
        setBusy(true); setFailure('');
        try { await authAPI('PUT', `/users/${encodeURIComponent(assignment.userId)}/roles`, { roleIds: selected, revision: assignment.revision }); if (scope === authScope()) { await onSaved(); const principal = await authAPI<Principal>('GET', '/me'); if (scope === authScope()) updatePrincipal(principal); } }
        catch (cause) { if (scope === authScope()) setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'roles.conflict' : 'requestFailed')); }
        finally { if (scope === authScope()) setBusy(false); }
    };
    return <form onSubmit={event => void submit(event)} aria-label={t('roles.assignments')} className="space-y-3">
        <p className="break-all text-xs text-ui-muted">{assignment.userId} · {t('roles.baseRole')}: {t(`roles.builtin_${assignment.baseRole}`)}</p>
        {assignment.disabled && <p className="text-sm text-ui-muted">{t('disabled')}</p>}{assignment.enrolled === false && <p className="text-sm text-ui-muted">{t('pending')}</p>}
        {failure && <p role="alert" className="text-sm text-ui-danger">{failure}</p>}
        <fieldset disabled={!writable || busy} className="space-y-2"><legend className="text-sm font-medium">{t('roles.additional')}</legend><MultiSelectChips value={selected} onChange={setSelected} options={roles.map(role => ({ value: role.id, label: role.name }))} /></fieldset>
        {writable && <><Button disabled={busy} type="submit">{t('roles.saveAssignment')}</Button><StageChangeButton disabled={busy} request={{ store: "identity", kind: "role-assignment", resourceId: assignment.userId, payload: { revision: assignment.revision, roleIds: selected } }} onCommitted={onSaved} /></>}
        <details><summary className="cursor-pointer text-sm">{t('roles.effective')}</summary><ul className="mt-3 grid gap-2 text-xs sm:grid-cols-2">{assignment.permissions.map(permission => <li key={permission} className="break-all">{permission}</li>)}</ul></details>
    </form>;
}
