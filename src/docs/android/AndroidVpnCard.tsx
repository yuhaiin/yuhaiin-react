import { AndroidAPIError, nativeActionURL, setAndroidVpn, userActionCodes, vpnActive, type AndroidStatus, type PlatformVpnState } from '@/api/android';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import { iconToneStyles, type IconTone } from '@/component/v2/styles';
import { useAndroidStatus } from '@/hooks/use-android-platform';
import { Cpu, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';

type Variant = 'success' | 'warning' | 'danger' | 'secondary' | 'info';

const stateVariant: Record<PlatformVpnState, Variant> = {
    running: 'success',
    reconfiguring: 'info',
    establishing: 'warning',
    stopping: 'warning',
    stopped: 'secondary',
    failed: 'danger',
    revoked: 'danger',
};

const stateTone: Record<Variant, { color: string; borderColor: string; background: string }> = Object.fromEntries(
    (Object.entries({ success: 'success', info: 'info', warning: 'warning', danger: 'danger', secondary: 'neutral' }) as [Variant, IconTone][])
        .map(([variant, tone]) => [variant, { color: iconToneStyles[tone].color, borderColor: iconToneStyles[tone].border, background: iconToneStyles[tone].background }]),
) as Record<Variant, { color: string; borderColor: string; background: string }>;

/** Shown when the OS or the in-app disclosure must approve the VPN first. */
export const AuthorizeVpnLink: FC<{ code: string }> = ({ code }) => {
    const { t } = useTranslation('android');
    return <div className="rounded-ui-lg border border-ui-warning/40 bg-ui-warning-soft p-3 text-sm">
        <p className="m-0 text-ui-heading">{t(code === 'consent_required' ? 'vpn.consentRequired' : 'vpn.permissionRequired')}</p>
        {/* A user-initiated navigation the app turns into its consent and OS VPN dialog. */}
        <a className="mt-2 inline-block font-medium text-ui-primary underline" href={nativeActionURL('vpn/authorize')}>{t('vpn.authorize')}</a>
    </div>;
};

export function vpnSummary(status: AndroidStatus): { state: PlatformVpnState; mismatch: boolean } {
    const state = status.vpn.runtime.state;
    // Enabled in configuration but not running (or the reverse) is shown, not hidden.
    const mismatch = status.vpn.enabled !== (vpnActive(state) || state === 'establishing');
    return { state, mismatch };
}

export const AndroidVpnCard: FC<{ compact?: boolean }> = ({ compact }) => {
    const { t } = useTranslation('android');
    const { data: status, error, mutate } = useAndroidStatus(true);
    const [pending, setPending] = useState(false);
    const [actionError, setActionError] = useState<AndroidAPIError | null>(null);

    if (error && !status) return <Card><CardBody><p className="m-0 text-sm text-ui-danger">{String((error as Error).message ?? error)}</p></CardBody></Card>;
    if (!status) return null;

    const runtime = status.vpn.runtime;
    const { state, mismatch } = vpnSummary(status);
    const active = vpnActive(state) || state === 'establishing';
    // A refused request is stale once the VPN runs (the user authorized it in the app).
    const pendingError = active ? null : actionError;
    const code = active ? undefined : pendingError?.code ?? (userActionCodes.has(runtime.errorCode ?? '') ? runtime.errorCode : undefined);

    const toggle = async () => {
        setPending(true);
        setActionError(null);
        try {
            await mutate(await setAndroidVpn(!status.vpn.enabled), { revalidate: false });
        } catch (e) {
            setActionError(e instanceof AndroidAPIError ? e : new AndroidAPIError(0, 'error', String(e)));
        } finally {
            setPending(false);
        }
    };

    const tone = stateTone[stateVariant[state]];
    const Icon = active ? ShieldCheck : state === 'failed' || state === 'revoked' ? ShieldAlert : ShieldOff;
    const transitional = state === 'establishing' || state === 'stopping' || state === 'reconfiguring';

    // The connection state and its one action lead; core details and diagnostics follow.
    return <section aria-label={t('vpn.title')} className="ui-card mb-4 overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:p-5">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border" style={tone}>
                <Icon size={24} className={transitional ? 'motion-safe:animate-pulse' : undefined} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="m-0 text-xs text-ui-muted">{t('vpn.title')}</p>
                <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold leading-snug text-ui-heading" aria-live="polite">
                    <span className="whitespace-nowrap">{t(`state.${state}`)}</span>
                    <Badge variant="secondary" className="text-xs font-normal">{t(status.vpn.enabled ? 'vpn.desiredOn' : 'vpn.desiredOff')}</Badge>
                </p>
            </div>
            <Button variant={status.vpn.enabled ? 'outline-danger' : 'primary'} loading={pending} disabled={pending} onClick={toggle}
                className="min-h-11 min-w-32 max-sm:w-full">
                {t(status.vpn.enabled ? 'vpn.disconnect' : 'vpn.connect')}
            </Button>
        </div>
        <div className="flex flex-col gap-3 border-t border-ui-border px-4 py-3 text-sm sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ui-muted">
                <span className="inline-flex items-center gap-1.5"><Cpu size={14} aria-hidden="true" />{t(status.core.running ? 'core.running' : 'core.stopped')}</span>
                <span>{t('core.port', { port: status.core.port })}{status.core.https ? ' · HTTPS' : ''}</span>
                {status.core.lanAccess && <span>{t('core.lan')}</span>}
            </div>
            {state === 'reconfiguring' && <p className="m-0 text-ui-info">{t('vpn.reconfiguring')}</p>}
            {mismatch && state !== 'reconfiguring' && !code && <p className="m-0 text-ui-warning">{t('vpn.mismatch')}</p>}
            {code && <AuthorizeVpnLink code={code} />}
            {(pendingError && !code) && <p role="alert" className="m-0 text-ui-danger">{pendingError.message}</p>}
            {(runtime.lastError && !code && !pendingError) && <p className="m-0 ui-wrap-anywhere text-ui-danger">{runtime.lastError}</p>}
            {status.vpn.inboundError && !runtime.lastError && <p className="m-0 ui-wrap-anywhere text-ui-danger">{status.vpn.inboundError}</p>}
            {!compact && runtime.applied && <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-2 @container sm:grid-cols-2">
                <Row label={t('vpn.generation')} value={String(runtime.generation)} />
                <Row label="MTU" value={String(runtime.applied.mtu)} />
                <Row label={t('vpn.addresses')} value={[runtime.applied.ipv4 && `${runtime.applied.ipv4}/${runtime.applied.ipv4Prefix}`, runtime.applied.ipv6 && `${runtime.applied.ipv6}/${runtime.applied.ipv6Prefix}`].filter(Boolean).join(', ')} />
                <Row label="DNS" value={runtime.applied.dns.join(', ')} />
                <Row label={t('vpn.fakeIpRoutes')} value={runtime.applied.fakeIpRoutes.join(', ') || '—'} />
                <Row label={t('vpn.routes')} value={runtime.applied.routes.length ? runtime.applied.routes.join(', ') : t('vpn.profileRoutes')} />
                <Row label={t('vpn.reconfigurations')} value={`${runtime.reconfigurations} / ${runtime.reconfigureFailures}`} />
                {runtime.lastSwitchMillis ? <Row label={t('vpn.lastSwitch')} value={`${runtime.lastSwitchMillis} ms`} /> : null}
            </dl>}
            {!compact && runtime.pending && <p className="m-0 text-ui-muted">{t('vpn.pending', { mtu: runtime.pending.mtu, routes: runtime.pending.fakeIpRoutes.join(', ') })}</p>}
        </div>
    </section>;
};

const Row: FC<{ label: string; value: string }> = ({ label, value }) => <div className="min-w-0">
    <dt className="text-xs text-ui-muted">{label}</dt>
    <dd className="m-0 min-w-0 ui-wrap-anywhere font-mono text-[13px] text-ui-heading">{value}</dd>
</div>;
