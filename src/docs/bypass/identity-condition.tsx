import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import { DropdownSelect } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import type { RuleExpr } from '@/contract/route';
import type { TrafficGroup } from '@/docs/security/groups';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import useSWR from 'swr';

export type IdentityConditionKind = 'user' | 'group' | 'credential';
export function identityCondition(kind: IdentityConditionKind, ids: string[]): RuleExpr {
    switch (kind) {
        case 'user': return { type: kind, user: { ids } };
        case 'group': return { type: kind, group: { ids } };
        case 'credential': return { type: kind, credential: { ids } };
    }
}

export function IdentityCondition({ kind, ids, onChange }: { kind: IdentityConditionKind; ids: string[]; onChange: (ids: string[]) => void }) {
    const { t } = useTranslation('auth');
    const session = useSession();
    const canRead = session?.principal.permissions.includes('users:manage');
    const { data: users, error: usersError } = useSWR(canRead && kind === 'user' ? 'auth-users' : null, () => authAPI<User[]>('GET', '/users'));
    const { data: groups, error: groupsError } = useSWR(canRead && kind === 'group' ? 'auth-groups' : null, () => authAPI<TrafficGroup[]>('GET', '/groups'));
    const choices = kind === 'user' ? users?.map(user => ({ id: user.id, name: user.login })) : groups;
    const source = ids.join(',');
    const [edit, setEdit] = useState({ source, text: source });
    const draft = edit.source === source ? edit.text : source;
    return <div className="min-w-0 space-y-2">
        <p className="text-xs text-ui-muted">{t('identityConditions.help')}</p>
        {(usersError || groupsError) && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
        {choices && <DropdownSelect values={ids} items={[...new Set([...ids, ...choices.map(item => item.id)])]} format={id => choices.find(item => item.id === id)?.name ?? id} onUpdate={selected => { setEdit({ source: selected.join(','), text: selected.join(',') }); onChange(selected); }} />}
        <Input aria-label={t(`identityConditions.${kind}`)} value={draft} placeholder={t('identityConditions.ids')} onChange={event => {
            const selected = event.target.value.split(',').map(id => id.trim()).filter(Boolean);
            setEdit({ source: selected.join(','), text: event.target.value }); onChange(selected);
        }} />
    </div>;
}
