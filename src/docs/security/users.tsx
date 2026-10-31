import Switch from '@/component/v2/switch';
import { authAPI, type Issued, type User } from '@/auth/api';
import { clearSession, getSession, setPendingEnrollment, updatePrincipal, type Principal } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
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
function UserRow({ user, busy, lastAdmin, onSave, onReset, onDelete }: { user: User; busy: boolean; lastAdmin: boolean; onSave: (user: Pick<User, 'login' | 'role' | 'disabled'>) => void; onReset: () => void; onDelete: () => void }) {
    const { t } = useTranslation('auth');
    const [name, setName] = useState(user.login); const [role, setRole] = useState(user.role); const [disabled, setDisabled] = useState(user.disabled);
    return <section className="space-y-3 rounded-ui-md border border-ui-border p-4" aria-label={user.login}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="m-0 font-medium">{user.login}</h3><span className="text-xs text-ui-muted">{t(user.disabled ? 'disabled' : user.enrolled ? 'active' : 'pending')}</span></div>
        <p className="break-all text-xs text-ui-muted">{user.id}</p>
        <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); onSave({ login: name, role, disabled }); }}>
            <label className="min-w-0 flex-1 space-y-2"><span>{t('loginName')}</span><Input value={name} onChange={event => setName(event.target.value)} pattern="[A-Za-z0-9_.-]{1,64}" required disabled={busy} /></label>
            <div className="min-w-40"><Select ariaLabel={t('role')} value={role} onValueChange={value => setRole(value as User['role'])} items={[{ value: 'admin', label: t('admin') }, { value: 'read-only', label: t('readOnly') }, { value: 'none', label: t('proxyOnly') }]} disabled={busy || lastAdmin} /></div>
            <div className="w-fit"><Switch label={t('active')} checked={!disabled} onCheckedChange={active => setDisabled(!active)} disabled={busy || lastAdmin} /></div>
            <Button type="submit" disabled={busy}>{t('save')}</Button>
        </form>
        {lastAdmin && <p className="text-xs text-ui-muted">{t('lastAdmin')}</p>}
        <div className="flex flex-wrap gap-2"><Button disabled={busy || lastAdmin} onClick={onReset}>{t('resetEnrollment')}</Button><Button variant="outline-danger" disabled={busy || lastAdmin} onClick={onDelete}>{t('delete')}</Button></div>
    </section>;
}
