import { MultiSelectChips } from '@/component/v2/multi-select';
import { authAPI, type User } from '@/auth/api';
import { useSession } from '@/auth/context';
import type { Inbound } from '@/contract/inbound';
import { SwitchCard } from '@/component/v2/forms';
import { FormSection } from '@/component/v2/form-section';
import { Select } from '@/component/v2/select';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function UserAuthentication({ inbound, onChange }: { inbound: Inbound; onChange: (value: Inbound) => void }) {
    const { t } = useTranslation('auth'); const session = useSession();
    const supported = ['http', 'socks5', 'mixed', 'yuubinsya', 'hysteria2', 'sstp'].includes(inbound.protocol.type);
    const available = session?.principal.credentialType !== 'local' && session?.principal.permissions.includes('users:manage');
    const { data: users, error } = useSWR(available && supported && inbound.authentication ? 'auth-users' : null, () => authAPI<User[]>('GET', '/users'));
    if (!supported || !available && !inbound.authentication) return null;
    return <FormSection title={t('inboundUserAuthentication')}>
        <SwitchCard label={t('inboundUserAuthentication')} description={t('inboundUserAuthenticationHelp')} checked={!!inbound.authentication && inbound.authentication.mode !== 'legacy'} disabled={!available || inbound.protocol.type === "sstp"} onCheckedChange={enabled => onChange({ ...inbound, authentication: enabled ? { mode: 'users', users: [] } : undefined })} />
        {inbound.authentication && <div className="space-y-3">
            {inbound.protocol.type !== "sstp" && <Select ariaLabel={t('authenticationMode.title')} value={inbound.authentication.mode || 'mixed'} disabled={!available} items={['legacy', 'users', 'mixed'].map(value => ({ value, label: t(`authenticationMode.${value}`) }))} onValueChange={mode => onChange({ ...inbound, authentication: { ...inbound.authentication!, mode, users: mode === 'legacy' ? [] : inbound.authentication!.users } })} />}
            {inbound.protocol.type !== 'sstp' && (inbound.authentication.mode || 'mixed') === 'mixed' && <p role="note" className="text-sm text-ui-warning">{t('authenticationMode.mixedWarning')}</p>}
            {inbound.protocol.type === 'mixed' && <p className="text-sm text-ui-muted">{t('mixedUserAuthenticationHelp')}</p>}
            {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
            <fieldset className="space-y-2" disabled={!available || inbound.authentication.mode === 'legacy'}><legend className="text-sm font-medium">{t('allowedUsers')}</legend><MultiSelectChips value={inbound.authentication.users} onChange={selected => onChange({ ...inbound, authentication: { ...inbound.authentication!, users: selected } })} options={users?.map(user => ({ value: user.id, label: `${user.login}${user.disabled ? ` (${t('disabled')})` : ''}` })) ?? []} /></fieldset>
            {inbound.authentication.users.filter(id => !users?.some(user => user.id === id)).map(id => <p key={id} className="break-all text-xs text-ui-muted">{id}</p>)}
            <p className="text-xs text-ui-muted">{t('emptyUserSelectionHelp')}</p>
        </div>}
    </FormSection>;
}
