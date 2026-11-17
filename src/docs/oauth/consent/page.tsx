import { followRedirect, oauthServer, type AuthorizationDetails } from '@/auth/oauth-server';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@/component/v2/card';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useParams } from 'wouter';

const framed = () => { try { return window.top !== window.self; } catch { return true; } };

function duration(seconds: number, t: TFunction<'auth'>) {
    if (seconds >= 86400) return t('oauthServer.days', { count: Math.round(seconds / 86400) });
    if (seconds >= 3600) return t('oauthServer.hours', { count: Math.round(seconds / 3600) });
    return t('oauthServer.minutes', { count: Math.round(seconds / 60) });
}

/**
 * The consent page of the Yuhaiin Authorization Server. The user is already
 * signed in through the normal management login; signing in never approves a
 * request. Only the scopes ticked here are granted, and never more than the
 * user currently holds.
 */
export default function ConsentPage() {
    const { t } = useTranslation('auth');
    const { id = '' } = useParams<{ id: string }>();
    const [details, setDetails] = useState<AuthorizationDetails | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [isFramed] = useState(framed);

    useEffect(() => {
        if (isFramed) return;
        const request = new AbortController();
        void oauthServer.authorization(id, request.signal).then(value => {
            setDetails(value);
            setSelected(value.scopes.filter(scope => scope.available).map(scope => scope.id));
        }).catch(cause => {
            if (request.signal.aborted) return;
            setError(t(cause?.code === 404 ? 'oauthServer.requestExpired' : 'requestFailed'));
        });
        return () => request.abort();
    }, [id, isFramed, t]);

    // Clickjacking: the decision must be made on a top-level page.
    if (isFramed) return <p role="alert" className="p-5 text-sm text-ui-danger">{t('oauthServer.framed')}</p>;

    const decide = async (approve: boolean) => {
        setBusy(true); setError('');
        try { followRedirect((await oauthServer.decide(id, approve, approve ? selected : [])).redirectUri); }
        catch (cause) { setError(t((cause as { code?: number })?.code === 404 ? 'oauthServer.requestExpired' : 'requestFailed')); setBusy(false); }
    };
    const toggle = (scope: string, on: boolean) => setSelected(current => on ? [...current, scope] : current.filter(item => item !== scope));
    const requiredMissing = details?.scopes.some(scope => scope.required && !scope.available);
    const canApprove = Boolean(details) && !requiredMissing && selected.length > 0 && details!.scopes.every(scope => !scope.required || selected.includes(scope.id));

    return <div className="flex min-h-[100dvh] items-center justify-center bg-ui-bg p-4">
        <Card className="w-full max-w-lg !mb-0">
            <CardHeader><CardTitle><ShieldCheck size={22} />{t('oauthServer.consentTitle')}</CardTitle></CardHeader>
            <CardBody className="space-y-5">
                {!details && !error && <p role="status" className="text-sm text-ui-muted">{t('oauthServer.loadingRequest')}</p>}
                {details && <>
                    <div className="space-y-2">
                        <p className="text-base"><strong className="break-words">{details.clientName}</strong> {t('oauthServer.wantsAccess', { resource: details.resourceName })}</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={details.registration === 'dynamic' ? 'warning' : 'info'}>{t(details.registration === 'dynamic' ? 'oauthServer.selfRegistered' : 'oauthServer.registeredByAdmin')}</Badge>
                            <Badge>{t(`oauthServer.clientType.${details.clientType}`)}</Badge>
                            {details.existingGrant && <Badge variant="muted">{t('oauthServer.previouslyAuthorized')}</Badge>}
                        </div>
                        {details.registration === 'dynamic' && <p className="text-sm text-ui-muted">{t('oauthServer.selfRegisteredHint')}</p>}
                    </div>
                    <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
                        <dt className="text-ui-muted">{t('oauthServer.redirectTo')}</dt><dd className="break-all font-medium">{details.redirectOrigin}</dd>
                        <dt className="text-ui-muted">{t('oauthServer.resource')}</dt><dd className="break-all">{details.resourceName}<br /><code className="text-xs text-ui-muted">{details.resource}</code></dd>
                        <dt className="text-ui-muted">{t('oauthServer.clientId')}</dt><dd><code className="break-all text-xs">{details.clientId}</code></dd>
                        {details.clientUri && <><dt className="text-ui-muted">{t('oauthServer.website')}</dt><dd className="break-all">{details.clientUri}</dd></>}
                        <dt className="text-ui-muted">{t('oauthServer.validity')}</dt><dd>{t('oauthServer.validityValue', { access: duration(details.accessTokenTtl, t), grant: duration(details.grantTtl, t) })}</dd>
                    </dl>
                    <fieldset disabled={busy} className="min-w-0 space-y-2">
                        <legend className="mb-2 text-sm font-medium">{t('oauthServer.requestedPermissions')}</legend>
                        {details.scopes.map(scope => <label key={scope.id} className="flex min-h-11 cursor-pointer gap-3 rounded-ui-md border border-ui-border p-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70">
                            <input type="checkbox" className="mt-1 size-4 shrink-0 accent-ui-primary" checked={selected.includes(scope.id)} disabled={!scope.available || scope.required}
                                onChange={event => toggle(scope.id, event.target.checked)} aria-describedby={`scope-${scope.id}`} />
                            <span className="min-w-0 flex-1 space-y-1">
                                <span className="flex flex-wrap items-center gap-2"><code className="text-sm">{scope.id}</code>
                                    <Badge variant={scope.access === 'write' ? 'warning' : scope.access === 'read' ? 'success' : 'info'}>{t(`oauthServer.access.${scope.access}`)}</Badge>
                                    {scope.required && <Badge variant="muted">{t('oauthServer.required')}</Badge>}
                                </span>
                                <span id={`scope-${scope.id}`} className="block text-sm text-ui-muted">{scope.description}</span>
                                {!scope.available && <span className="block text-xs text-ui-danger">{t('oauthServer.notHeld')}</span>}
                            </span>
                        </label>)}
                    </fieldset>
                    {requiredMissing && <p role="alert" className="text-sm text-ui-danger">{t('oauthServer.requiredMissing')}</p>}
                    <p className="text-xs text-ui-muted">{t('oauthServer.consentFooter')}</p>
                </>}
                {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
            </CardBody>
            {details && <CardFooter className="flex flex-wrap justify-end gap-2">
                <Button disabled={busy} onClick={() => void decide(false)}>{t('oauthServer.deny')}</Button>
                <Button variant="primary" disabled={busy || !canApprove} onClick={() => void decide(true)}>{t('oauthServer.allow')}</Button>
            </CardFooter>}
        </Card>
    </div>;
}
