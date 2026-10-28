import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import type { Inbound } from '@/contract/inbound';
import { SwitchCard } from '@/component/v2/forms';
import { FormSection } from '@/component/v2/form-section';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function UserAuthentication({ inbound, onChange }: { inbound: Inbound; onChange: (value: Inbound) => void }) {
    const { t } = useTranslation('auth'); const session = useSession();
    const supported = ['http', 'socks5', 'mixed', 'yuubinsya', 'hysteria2', 'sstp'].includes(inbound.protocol.type);
    const available = session?.principal.credentialType !== 'local' && session?.principal.permissions.includes('users:manage');
    const { data: users, error } = useSWR(available && supported && inbound.authentication ? 'auth-users' : null, () => authAPI<User[]>('GET', '/users'));
    if (!supported || !available && !inbound.authentication) return null;
    return <FormSection title={t('inboundUserAuthentication')}>
        <SwitchCard label={t('inboundUserAuthentication')} description={t('inboundUserAuthenticationHelp')} checked={!!inbound.authentication} disabled={!available || inbound.protocol.type === "sstp"} onCheckedChange={enabled => onChange({ ...inbound, authentication: enabled ? { users: [] } : undefined })} />
        {inbound.authentication && <div className="space-y-3">
            <p className="text-sm text-ui-muted">{t('legacyPasswordRemainsValid')}</p>
            {inbound.protocol.type === 'mixed' && <p className="text-sm text-ui-muted">{t('mixedUserAuthenticationHelp')}</p>}
            {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
            <fieldset className="space-y-2"><legend>{t('allowedUsers')}</legend>{users?.map(user => <label key={user.id} className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={inbound.authentication!.users.includes(user.id)} disabled={!available} onChange={() => { const selected = inbound.authentication!.users; onChange({ ...inbound, authentication: { users: selected.includes(user.id) ? selected.filter(id => id !== user.id) : [...selected, user.id] } }); }} />{user.login}{user.disabled ? ` (${t('disabled')})` : ''}</label>)}</fieldset>
            {inbound.authentication.users.filter(id => !users?.some(user => user.id === id)).map(id => <p key={id} className="break-all text-xs text-ui-muted">{id}</p>)}
            <p className="text-xs text-ui-muted">{t('emptyUserSelectionHelp')}</p>
        </div>}
    </FormSection>;
}
