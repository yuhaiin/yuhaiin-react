import { addPasskey, listPasskeys, passkeySupported, removePasskey } from '@/auth/passkey';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function Passkeys() {
    const { t } = useTranslation('auth');
    const { data, error: loadError, mutate } = useSWR('auth-passkeys', listPasskeys);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const supported = passkeySupported();

    const register = async () => {
        if (!name.trim() || name.trim().length > 64) return;
        setBusy(true); setError('');
        try {
            await addPasskey(name.trim());
            setName('');
            await mutate();
        } catch { setError(t('passkeyFailed')); }
        finally { setBusy(false); }
    };
    const remove = async (id: string) => {
        if (!await confirmAction(t('passkeyRemoveConfirm'))) return;
        setBusy(true); setError('');
        try { await removePasskey(id); await mutate(); }
        catch { setError(t('requestFailed')); }
        finally { setBusy(false); }
    };

    return <Card>
        <CardHeader><h2 className="m-0 font-medium">{t('passkeys')}</h2>
            <Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button>
        </CardHeader>
        <CardBody className="space-y-4">
            <p className="text-sm text-ui-muted">{t('passkeyHint')}</p>
            {!supported && <p className="text-sm text-ui-danger">{t('passkeyUnavailable')}</p>}
            <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-44 flex-1 space-y-2">
                    <span className="text-sm">{t('passkeyName')}</span>
                    <Input value={name} maxLength={64} disabled={busy || !supported}
                        onChange={e => setName(e.target.value)} placeholder={t('passkeyNamePlaceholder')} />
                </label>
                <Button disabled={busy || !supported || !name.trim()} onClick={() => void register()}>{t('addPasskey')}</Button>
            </div>
            {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
            {data?.length === 0 && <p className="text-sm text-ui-muted">{t('noPasskeys')}</p>}
            {data?.map(item => <section key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border p-3">
                <div className="min-w-0">
                    <p className="break-words font-medium">{item.name}</p>
                    <p className="text-xs text-ui-muted">{item.rpId}</p>
                    <p className="text-xs text-ui-muted">{t('sessionCreated')}: {new Date(item.createdAt * 1000).toLocaleString()}</p>
                </div>
                <Button permission="identity:read" variant="outline-danger" disabled={busy}
                    onClick={() => void remove(item.id)}>{t('removePasskey')}</Button>
            </section>)}
        </CardBody>
    </Card>;
}
