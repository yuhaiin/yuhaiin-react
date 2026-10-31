import { Badge } from '@/component/v2/badge';
import { SwitchCard } from '@/component/v2/switch';
import { authAPI, type Issued, type User } from '@/auth/api';
import { clearSession, getSession, setPendingEnrollment, updatePrincipal, type Principal } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { IssuedSecret } from './secret';
export function Users() {
    const { t } = useTranslation('auth');
    const { data: users, error: loadError, mutate } = useSWR('auth-users', () => authAPI<User[]>('GET', '/users'));
    const [name, setName] = useState('');
    const [role, setRole] = useState('read-only');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [issued, setIssued] = useState<Issued | null>(null);
    const run = async (operation: () => Promise<void>) => {
        setBusy(true); setError('');
        try { await operation(); await mutate(); }
        catch (cause) { setError(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'lastAdminOrConflict' : 'requestFailed')); }
        finally { setBusy(false); }
    };
    const create = (event: FormEvent) => {
        event.preventDefault();
        void run(async () => { const result = await authAPI<{ user: User; enrollment: Issued }>('POST', '/users', { login: name, role }); setIssued(result.enrollment); setName(''); });
    };
    const reset = (user: User) => void run(async () => {
        if (!await confirmAction(t('resetConfirm', { name: user.login }))) return;
        const enrollment = await authAPI<Issued>('POST', `/users/${user.id}/enrollment`, {});
        if (user.id === getSession()?.principal.userId) { setPendingEnrollment(enrollment.secret); clearSession(); }
        else setIssued(enrollment);
    });
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('users')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader>
        <CardBody className="space-y-5">
            <form onSubmit={create} className="flex flex-wrap items-end gap-3">
                <label className="min-w-0 flex-1 space-y-2"><span>{t('loginName')}</span><Input value={name} onChange={event => setName(event.target.value)} pattern="[A-Za-z0-9_.-]{1,64}" required maxLength={64} disabled={busy} /></label>
                <div className="min-w-40"><Select ariaLabel={t('role')} value={role} onValueChange={setRole} items={[{ value: 'read-only', label: t('readOnly') }, { value: 'none', label: t('proxyOnly') }, { value: 'admin', label: t('admin') }]} disabled={busy} /></div>
                <Button type="submit" variant="primary" disabled={busy}>{t('createUser')}</Button>
            </form>
            {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
            <div className="space-y-3">{users?.map(user => <UserRow key={`${user.id}:${user.updatedAt}:${user.login}:${user.role}:${user.disabled}`} user={user} busy={busy}
                lastAdmin={user.role === 'admin' && user.enrolled && !user.disabled && users.filter(item => item.role === 'admin' && item.enrolled && !item.disabled).length === 1}
                onSave={next => void run(async () => {
                    await authAPI('PUT', `/users/${user.id}`, next);
                    if (user.id === getSession()?.principal.userId) {
                        if (next.disabled) clearSession(); else updatePrincipal(await authAPI<Principal>('GET', '/me'));
                    }
                })} onReset={() => reset(user)} onDelete={() => void run(async () => { if (await confirmAction(t('deleteConfirm', { name: user.login }))) await authAPI('DELETE', `/users/${user.id}`); })} />)}</div>
        </CardBody>{issued && <IssuedSecret value={issued} onClose={() => setIssued(null)} />}
    </Card>;
}
const statusBadge = { active: 'success', pending: 'warning', disabled: 'secondary' } as const;
function UserRow({ user, busy, lastAdmin, onSave, onReset, onDelete }: { user: User; busy: boolean; lastAdmin: boolean; onSave: (user: Pick<User, 'login' | 'role' | 'disabled'>) => void; onReset: () => void; onDelete: () => void }) {
    const { t } = useTranslation('auth');
    const [name, setName] = useState(user.login); const [role, setRole] = useState(user.role); const [disabled, setDisabled] = useState(user.disabled);
    const status = user.disabled ? 'disabled' : user.enrolled ? 'active' : 'pending';
    return <section className="rounded-ui-md border border-ui-border p-4" aria-label={user.login}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="m-0 font-medium">{user.login}</h3><Badge variant={statusBadge[status]}>{t(status)}</Badge></div>
        <p className="mt-1 break-all text-xs text-ui-muted">{user.id}</p>
        {/* Saving only pauses these fields for a moment, so they keep their frame without the grey fill. */}
        <form className="mt-4 [&_:is(input,[role=combobox]):disabled]:bg-transparent" onSubmit={event => { event.preventDefault(); onSave({ login: name, role, disabled }); }}>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="min-w-0 space-y-2"><span className="block text-sm">{t('loginName')}</span><Input value={name} onChange={event => setName(event.target.value)} pattern="[A-Za-z0-9_.-]{1,64}" required disabled={busy} /></label>
                <div className="min-w-0 space-y-2"><span className="block text-sm">{t('role')}</span>
                    {lastAdmin
                        ? <p className="m-0 flex min-h-field items-center gap-2 text-sm"><Lock size={14} aria-hidden="true" className="shrink-0 text-ui-muted" />{t('admin')}</p>
                        : <Select ariaLabel={t('role')} value={role} onValueChange={value => setRole(value as User['role'])} items={[{ value: 'admin', label: t('admin') }, { value: 'read-only', label: t('readOnly') }, { value: 'none', label: t('proxyOnly') }]} disabled={busy} />}
                </div>
            </div>
            {lastAdmin
                ? <p className="mb-0 mt-3 text-xs text-ui-muted">{t('lastAdmin')}</p>
                : <SwitchCard className="mt-2" label={t('active')} checked={!disabled} onCheckedChange={active => setDisabled(!active)} disabled={busy} />}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ui-border pt-4">
                <div className="flex flex-wrap gap-2"><Button type="button" disabled={busy || lastAdmin} onClick={onReset}>{t('resetEnrollment')}</Button><Button type="button" variant="outline-danger" disabled={busy || lastAdmin} onClick={onDelete}>{t('delete')}</Button></div>
                <Button type="submit" disabled={busy}>{t('save')}</Button>
            </div>
        </form>
    </section>;
}
