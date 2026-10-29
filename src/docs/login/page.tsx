import { getApiUrl, setApiUrl } from '@/common/apiurl';
import { enroll, initialize, initializationStatus, login } from '@/auth/api';
import { loginWithPasskey, passkeySupported } from '@/auth/passkey';
import { requireSecureController } from '@/auth/transport';
import { discardEnrollment, pendingEnrollment, establishLocalConnection, getSession } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { LockKeyhole, Settings } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { OAuthLogin } from './oauth';

type Mode = 'login' | 'enroll' | 'setup';
export default function LoginPage() {
    const { t } = useTranslation('auth');
    const [mode, setMode] = useState<Mode>(() => pendingEnrollment() ? 'enroll' : 'login');
    const [controller, setController] = useState(getApiUrl);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [capability, setCapability] = useState(pendingEnrollment);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [required, setRequired] = useState<boolean | null>(null);
    const [expiresAt, setExpiresAt] = useState(0);
    const [checkVersion, setCheckVersion] = useState(0);

    useEffect(() => {
        const request = new AbortController();
        const timer = window.setTimeout(() => {
            void initializationStatus(controller, request.signal).then(status => {
                if (request.signal.aborted) return;
                if (status.authentication === 'none') {
                    setApiUrl(controller);
                    establishLocalConnection(getApiUrl());
                    window.location.hash = '/';
                    return;
                }
                setRequired(status.required); setExpiresAt(status.expiresAt);
                setMode(previous => status.required ? 'setup' : previous === 'setup' ? 'login' : previous);
            }).catch(() => { if (!request.signal.aborted) setError(t('requestFailed')); });
        }, 300);
        return () => { request.abort(); window.clearTimeout(timer); };
    }, [controller, checkVersion, t]);

    const submit = async (event: FormEvent) => {
        event.preventDefault(); setError(''); setNotice('');
        if (required === null) return;
        if (mode !== 'login' && password !== confirmation) { setError(t('passwordMismatch')); return; }
        setBusy(true);
        const enteredPassword = password;
        setPassword(''); setConfirmation('');
        try {
            requireSecureController(controller);
            setApiUrl(controller);
            if (mode === 'setup') {
                await initialize(capability, name, enteredPassword);
                setCapability(''); setRequired(false); setMode('login'); setNotice(t('setupComplete'));
            } else if (mode === 'enroll') {
                await enroll(capability, enteredPassword);
                setCapability(''); discardEnrollment(); setRequired(false); setMode('login'); setNotice(t('enrolled'));
            } else {
                await login(name, enteredPassword); window.location.hash = getSession()?.principal.permissions.includes('connections:read') ? '/' : '/docs/security';
            }
        } catch (cause) {
            const code = cause && typeof cause === 'object' && 'code' in cause ? cause.code : 0;
            setError(t(code === 429 ? 'rateLimited' : code === 401 ? mode === 'setup' ? 'setupFailed' : 'loginFailed' : code === 403 ? 'transportDenied' : 'requestFailed'));
        } finally { setBusy(false); }
    };
    const passkeyLogin = async () => {
        setBusy(true); setError(''); setNotice('');
        try {
            requireSecureController(controller);
            setApiUrl(controller);
            await loginWithPasskey();
            window.location.hash = getSession()?.principal.permissions.includes('connections:read') ? '/' : '/docs/security';
        } catch { setError(t('passkeyFailed')); }
        finally { setBusy(false); }
    };
    const title = mode === 'setup' ? 'createAdministrator' : mode === 'login' ? 'signIn' : 'activateAccount';
    return <div className="flex min-h-[100dvh] items-center justify-center bg-ui-bg p-4">
        <Card className="w-full max-w-md !mb-0">
            <CardHeader><CardTitle><LockKeyhole size={22} />{t(required === null ? 'connectController' : title)}</CardTitle></CardHeader>
            <form onSubmit={event => void submit(event)} autoComplete="off">
                <CardBody className="space-y-4">
                    <label className="block space-y-2"><span>{t('controller')}</span><Input value={controller} onChange={event => { setController(event.target.value); setRequired(null); setError(''); setCapability(''); setPassword(''); setConfirmation(''); discardEnrollment(); }} placeholder={window.location.origin} disabled={busy} /></label>
                    {required === null ? <p role="status" className="text-sm text-ui-muted">{t(error ? 'checkControllerHint' : 'checkingController')}</p> : <>
                        <p className="text-sm text-ui-muted">{t(mode === 'setup' ? 'setupHint' : mode === 'login' ? 'loginHint' : 'enrollmentHint')}</p>
                        {mode !== 'enroll' && <label className="block space-y-2"><span>{t('loginName')}</span><Input name="username" value={name} onChange={event => setName(event.target.value)} required maxLength={64} pattern={mode === 'setup' ? '[A-Za-z0-9_.-]{1,64}' : undefined} disabled={busy} /></label>}
                        {mode !== 'login' && <label className="block space-y-2"><span>{t(mode === 'setup' ? 'initializationCode' : 'enrollmentCapability')}</span><Input type="password" value={capability} onChange={event => setCapability(event.target.value)} required autoComplete="off" disabled={busy} /></label>}
                        <label className="block space-y-2"><span>{t(mode === 'login' ? 'password' : 'newPassword')}</span><Input name="password" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="off" disabled={busy} /></label>
                        {mode !== 'login' && <label className="block space-y-2"><span>{t('confirmPassword')}</span><Input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required autoComplete="off" disabled={busy} /></label>}
                        {mode === 'setup' && <p className="text-xs text-ui-muted">{t('setupRestartHint')}{expiresAt > 0 && <> {t('expires')}: {new Date(expiresAt * 1000).toLocaleString()}</>}</p>}
                        {mode === 'enroll' && <p className="text-xs text-ui-muted">{t('bootstrapHelp')}</p>}
                    </>}
                    {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                    {notice && <p role="status" className="text-sm text-ui-muted">{notice}</p>}
                </CardBody>
                <CardFooter className="flex-col items-stretch">
                    {required === null ? <Button type="button" disabled={busy} onClick={() => { setError(''); setCheckVersion(version => version + 1); }}>{t('retryConnection')}</Button> : <>
                        <Button type="submit" variant="primary" loading={busy}>{t(title)}</Button>
                        <Button type="button" variant="ghost" disabled={busy} onClick={() => { setMode(mode === 'enroll' ? required ? 'setup' : 'login' : 'enroll'); setPassword(''); setConfirmation(''); setCapability(''); discardEnrollment(); setError(''); setNotice(''); }}>{t(mode === 'enroll' ? required ? 'createAdministrator' : 'backToLogin' : 'activateAccount')}</Button>
                    </>}
                    <Button asChild variant="ghost"><a href="#/docs/webui"><Settings size={16} />{t('ui:webui')}</a></Button>
                </CardFooter>
            </form>
            {required === false && mode === 'login' && <>
                <div className="px-5 pb-4">
                    <Button className="w-full" disabled={busy || !passkeySupported()}
                        onClick={() => void passkeyLogin()}>{t('signInPasskey')}</Button>
                </div>
                <div className="px-5 pb-5"><OAuthLogin key={controller} controller={controller} /></div>
            </>}
        </Card>
    </div>;
}
