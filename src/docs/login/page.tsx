import { getApiUrl, setApiUrl } from '@/common/apiurl';
import { enroll, login } from '@/auth/api';
import { requireSecureController } from '@/auth/transport';
import { discardEnrollment, pendingEnrollment } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation('auth');
    const [mode, setMode] = useState<'login' | 'enroll'>(() => pendingEnrollment() ? 'enroll' : 'login');
    const [controller, setController] = useState(getApiUrl);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [capability, setCapability] = useState(pendingEnrollment);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const submit = async (event: FormEvent) => {
        event.preventDefault(); setError(''); setNotice('');
        if (mode === 'enroll' && password !== confirmation) { setError(t('passwordMismatch')); return; }
        setBusy(true);
        const enteredPassword = password;
        setPassword(''); setConfirmation('');
        try {
            requireSecureController(controller);
            setApiUrl(controller);
            if (mode === 'enroll') {
                await enroll(capability, enteredPassword);
                setCapability(''); discardEnrollment(); setMode('login'); setNotice(t('enrolled'));
            } else {
                await login(name, enteredPassword); window.location.hash = '/';
            }
        } catch (cause) {
            const code = cause && typeof cause === 'object' && 'code' in cause ? cause.code : 0;
            setError(t(code === 429 ? 'rateLimited' : code === 401 ? 'loginFailed' : code === 403 ? 'transportDenied' : 'requestFailed'));
        } finally { setBusy(false); }
    };
    return <div className="flex min-h-[100dvh] items-center justify-center bg-ui-bg p-4">
        <Card className="w-full max-w-md !mb-0">
            <CardHeader><CardTitle><LockKeyhole size={22} />{t(mode === 'login' ? 'signIn' : 'activateAccount')}</CardTitle></CardHeader>
            <form onSubmit={event => void submit(event)} autoComplete="off">
                <CardBody className="space-y-4">
                    <p className="text-sm text-ui-muted">{t(mode === 'login' ? 'loginHint' : 'enrollmentHint')}</p>
                    <label className="block space-y-2"><span>{t('controller')}</span><Input value={controller} onChange={event => setController(event.target.value)} placeholder={window.location.origin} disabled={busy} /></label>
                    {mode === 'login' ? <label className="block space-y-2"><span>{t('loginName')}</span><Input name="username" value={name} onChange={event => setName(event.target.value)} required maxLength={64} disabled={busy} /></label>
                    : <label className="block space-y-2"><span>{t('enrollmentCapability')}</span><Input type="password" value={capability} onChange={event => setCapability(event.target.value)} required autoComplete="off" disabled={busy} /></label>}
                    <label className="block space-y-2"><span>{t(mode === 'login' ? 'password' : 'newPassword')}</span><Input name="password" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="off" disabled={busy} /></label>
                    {mode === 'enroll' && <label className="block space-y-2"><span>{t('confirmPassword')}</span><Input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required autoComplete="off" disabled={busy} /></label>}
                    {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
                    {notice && <p role="status" className="text-sm text-ui-muted">{notice}</p>}
                    {mode === 'enroll' && <p className="text-xs text-ui-muted">{t('bootstrapHelp')}</p>}
                </CardBody>
                <CardFooter className="flex-col items-stretch">
                    <Button type="submit" variant="primary" loading={busy}>{t(mode === 'login' ? 'signIn' : 'activateAccount')}</Button>
                    <Button type="button" variant="ghost" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'enroll' : 'login'); setPassword(''); setConfirmation(''); setCapability(''); discardEnrollment(); setError(''); setNotice(''); }}>{t(mode === 'login' ? 'activateAccount' : 'backToLogin')}</Button>
                </CardFooter>
            </form>
        </Card>
    </div>;
}
