import { StageChangeButton } from "@/component/configuration-change";
import { authAPI, type User } from '@/auth/api';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input, Textarea } from '@/component/v2/input';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export interface TrafficGroup {
    id: string; name: string; description: string; members: string[];
    revision: number; createdAt: number; updatedAt: number;
}

export function Groups() {
    const { t } = useTranslation('auth');
    const { data, error, mutate } = useSWR('auth-groups', () => authAPI<TrafficGroup[]>('GET', '/groups'));
    const { data: users, error: usersError } = useSWR('auth-users', () => authAPI<User[]>('GET', '/users'));
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const [creating, setCreating] = useState(false);
    const run = async (operation: () => Promise<unknown>) => {
        setBusy(true); setFailure('');
        try { await operation(); await mutate(); }
        catch (cause) { setFailure(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'groups.conflict' : 'requestFailed')); }
        finally { setBusy(false); }
    };
    return <Card>
        <CardHeader><h2 className="font-medium">{t('groups.title')}</h2><Button disabled={busy} onClick={() => setCreating(true)}>{t('groups.create')}</Button></CardHeader>
        <CardBody className="space-y-4">
            <p className="text-sm text-ui-muted">{t('groups.help')}</p>
            {(error || usersError || failure) && <p role="alert" className="text-sm text-ui-danger">{failure || t('requestFailed')}</p>}
            {creating && <GroupEditor onCommitted={async () => { setCreating(false); await mutate(); }} users={users ?? []} busy={busy || !users} onCancel={() => setCreating(false)} onSave={request => void run(async () => { await authAPI('POST', '/groups', request); setCreating(false); })} />}
            {data?.map(group => <GroupEditor onCommitted={() => mutate()} key={`${group.id}:${group.revision}`} group={group} users={users ?? []} busy={busy || !users} onSave={request => void run(() => authAPI('PUT', `/groups/${group.id}`, request))}
                onDelete={() => void run(async () => { if (await confirmAction(t('groups.deleteConfirm', { name: group.name }))) await authAPI('DELETE', `/groups/${group.id}?revision=${group.revision}`); })} />)}
            {!data?.length && !creating && <p className="text-sm text-ui-muted">{t('groups.empty')}</p>}
        </CardBody>
    </Card>;
}

function GroupEditor({ group, users, busy, onSave, onDelete, onCancel, onCommitted }: {
    group?: TrafficGroup; users: User[]; busy: boolean;
    onSave: (request: Pick<TrafficGroup, 'name' | 'description' | 'members' | 'revision'>) => void;
    onDelete?: () => void; onCancel?: () => void; onCommitted?: () => void | Promise<unknown>;
}) {
    const { t } = useTranslation('auth');
    const [name, setName] = useState(group?.name ?? '');
    const [description, setDescription] = useState(group?.description ?? '');
    const [members, setMembers] = useState(group?.members ?? []);
    const submit = (event: FormEvent) => { event.preventDefault(); onSave({ name, description, members, revision: group?.revision ?? 0 }); };
    return <details open={!group} className="rounded-ui-md border border-ui-border p-4">
        <summary className="cursor-pointer break-words font-medium">{group?.name ?? t('groups.create')}{group && <span className="ml-2 text-xs text-ui-muted">{t('groups.memberCount', { count: group.members.length })}</span>}</summary>
        <form aria-label={group?.name ?? t('groups.create')} onSubmit={submit} className="mt-4 space-y-4">
            {group && <p className="break-all text-xs text-ui-muted">{group.id}</p>}
            <label className="block space-y-2"><span>{t('credentialName')}</span><Input required maxLength={128} value={name} disabled={busy} onChange={event => setName(event.target.value)} /></label>
            <label className="block space-y-2"><span>{t('groups.description')}</span><Textarea maxLength={2048} value={description} disabled={busy} onChange={event => setDescription(event.target.value)} /></label>
            <fieldset className="max-h-64 space-y-1 overflow-auto"><legend>{t('groups.members')}</legend>
                {users.map(user => <label key={user.id} className="flex min-h-11 items-center gap-2 break-all"><input type="checkbox" checked={members.includes(user.id)} disabled={busy} onChange={() => setMembers(selected => selected.includes(user.id) ? selected.filter(id => id !== user.id) : [...selected, user.id])} />{user.login}{user.disabled && ` (${t('disabled')})`}</label>)}
                {members.filter(id => !users.some(user => user.id === id)).map(id => <label key={id} className="flex min-h-11 items-center gap-2 break-all"><input type="checkbox" checked disabled={busy} onChange={() => setMembers(selected => selected.filter(member => member !== id))} />{id}</label>)}
            </fieldset>
            <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{t('save')}</Button><StageChangeButton disabled={busy || !name.trim()} request={{ store: "identity", kind: "group", resourceId: group?.id, payload: { name, description, members, revision: group?.revision ?? 0 } }} onCommitted={onCommitted} />{onDelete && <Button type="button" variant="outline-danger" disabled={busy} onClick={onDelete}>{t('delete')}</Button>}{onCancel && <Button type="button" disabled={busy} onClick={onCancel}>{t('cancel')}</Button>}</div>
        </form>
    </details>;
}
