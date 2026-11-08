import { AndroidAPIError, androidAppIconURL, getAndroidApps, getAndroidSettings, nativeActionURL, reconfigureAndroidVpn, restartCore, saveAndroidSettings, type AndroidApp, type AndroidSettingValues } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { PageHeader } from '@/component/v2/page-header';
import { Select } from '@/component/v2/select';
import SwitchComponent from '@/component/v2/switch';
import { useAndroidPlatform } from '@/hooks/use-android-platform';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { AndroidVpnCard } from './AndroidVpnCard';

/** Android device settings. Only the in-app WebView (platform session) sees them. */
export default function AndroidPage() {
    const { t } = useTranslation('android');
    const platform = useAndroidPlatform();
    if (!platform) return <MainContainer>
        <PageHeader title={t('title')} />
        <Card><CardBody><p className="m-0 text-sm text-ui-muted">{t('unavailable')}</p></CardBody></Card>
    </MainContainer>;
    return <MainContainer>
        <PageHeader title={t('title')} description={t('description')} />
        <div className="flex flex-col gap-4">
            <AndroidVpnCard />
            <SettingsCard />
            <PerAppCard />
        </div>
    </MainContainer>;
}

function useSettings() {
    const swr = useSWR('android/settings', getAndroidSettings);
    const [error, setError] = useState<string>();
    const save = async (values: Partial<AndroidSettingValues>) => {
        setError(undefined);
        try { await swr.mutate(await saveAndroidSettings(values), { revalidate: false }); }
        catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    };
    return { ...swr, save, saveError: error };
}

const SettingsCard: FC = () => {
    const { t } = useTranslation('android');
    const { data, save, saveError } = useSettings();
    const [reconfiguring, setReconfiguring] = useState(false);
    const [restartNeeded, setRestartNeeded] = useState(false);
    if (!data) return <Loading />;
    const v = data.values;
    const select = (field: 'mtuProfile' | 'meteredMode' | 'bootConnectPolicy' | 'coreBackgroundPolicy' | 'routeProfile' | 'processLookupMode', items: string[]) =>
        <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ui-heading">{t(`settings.${field}`)}</span>
            <Select ariaLabel={t(`settings.${field}`)} value={v[field]} onValueChange={value => save({ [field]: value })}
                items={items.map(value => ({ value, label: t(`options.${field}.${value}`, { defaultValue: value }) }))} />
        </label>;
    return <Card>
        <CardHeader className="flex items-center justify-between gap-3">
            <span className="font-medium text-ui-heading">{t('settings.title')}</span>
            <Button size="sm" variant="outline-primary" loading={reconfiguring} onClick={async () => {
                setReconfiguring(true);
                try { await reconfigureAndroidVpn(); } finally { setReconfiguring(false); }
            }}>{t('vpn.rebuild')}</Button>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
            <p className="m-0 text-xs text-ui-muted">{t('settings.vpnHint')}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {select('routeProfile', data.routeProfiles)}
                {select('mtuProfile', data.options.mtuProfile ?? [])}
                {select('meteredMode', data.options.meteredMode ?? [])}
                {select('coreBackgroundPolicy', data.options.coreBackgroundPolicy ?? [])}
                {select('bootConnectPolicy', data.options.bootConnectPolicy ?? [])}
                {select('processLookupMode', data.options.processLookupMode ?? [])}
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ui-heading">{t('settings.httpProxyPort')}</span>
                    <Input type="number" min={0} max={65535} aria-label={t('settings.httpProxyPort')} defaultValue={v.httpProxyPort || ''}
                        onBlur={e => { const port = Number(e.target.value || 0); if (port !== v.httpProxyPort) void save({ httpProxyPort: port }); }} />
                </label>
            </div>
            <SwitchComponent label={t('settings.appendHTTPProxy')} checked={v.appendHTTPProxy} onCheckedChange={appendHTTPProxy => save({ appendHTTPProxy })} />
            <SwitchComponent label={t('settings.autoConnect')} description={t('settings.autoConnectHint')} checked={v.autoConnect} onCheckedChange={autoConnect => save({ autoConnect })} />
            <SwitchComponent label={t('settings.notificationSpeed')} checked={v.notificationSpeed} onCheckedChange={notificationSpeed => save({ notificationSpeed })} />
            <SwitchComponent label={t('settings.trackUnderlyingNetwork')} checked={v.trackUnderlyingNetwork} onCheckedChange={trackUnderlyingNetwork => save({ trackUnderlyingNetwork })} />
            <SwitchComponent label={t('settings.allowLan')} description={t('settings.allowLanHint')} checked={v.allowLan} onCheckedChange={async allowLan => { await save({ allowLan }); setRestartNeeded(true); }} />
            {restartNeeded && <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-ui-warning">{t('settings.restartNeeded')}</span>
                <Button size="sm" variant="outline-primary" onClick={async () => { setRestartNeeded(false); await restartCore(); }}>{t('settings.restartCore')}</Button>
            </div>}
            {saveError && <p className="m-0 text-sm text-ui-danger">{saveError}</p>}
        </CardBody>
    </Card>;
};

export function filterApps(apps: AndroidApp[], query: string, showSystem: boolean, selected: Set<string>): AndroidApp[] {
    const q = query.trim().toLowerCase();
    return apps
        .filter(app => showSystem || !app.system || selected.has(app.packageName))
        .filter(app => !q || app.name.toLowerCase().includes(q) || app.packageName.toLowerCase().includes(q))
        // Selected apps first, then by name.
        .sort((a, b) => Number(selected.has(b.packageName)) - Number(selected.has(a.packageName)) || a.name.localeCompare(b.name));
}

/** Selected packages that are not installed (e.g. restored from another device). */
export function missingApps(apps: AndroidApp[], selected: Set<string>): string[] {
    const installed = new Set(apps.map(app => app.packageName));
    return [...selected].filter(pkg => !installed.has(pkg)).sort();
}

const AppIcon: FC<{ app: AndroidApp }> = ({ app }) => {
    const [failed, setFailed] = useState(false);
    if (failed) return <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-md bg-ui-surface-muted text-sm font-semibold text-ui-muted">
        {(app.name.trim()[0] ?? '?').toUpperCase()}
    </span>;
    return <img src={androidAppIconURL(app.packageName)} alt="" loading="lazy" decoding="async" width={40} height={40}
        className="h-10 w-10 shrink-0 rounded-ui-md object-contain" onError={() => setFailed(true)} />;
};

const PerAppCard: FC = () => {
    const { t } = useTranslation('android');
    const { data: settings, save, saveError } = useSettings();
    const [waitingConsent, setWaitingConsent] = useState(false);
    // After the in-app disclosure, poll until the list becomes available.
    const apps = useSWR(settings?.values.perApp ? 'android/apps' : null, getAndroidApps, { revalidateOnFocus: false, onSuccess: () => setWaitingConsent(false) });
    // SWR skips interval refreshes while the key is in error (consent_required), so poll explicitly
    // until the native disclosure is accepted.
    const { mutate: reloadApps } = apps;
    useEffect(() => {
        if (!waitingConsent) return;
        const timer = setInterval(() => void reloadApps(), 1500);
        return () => clearInterval(timer);
    }, [waitingConsent, reloadApps]);
    const [query, setQuery] = useState('');
    const [showSystem, setShowSystem] = useState(false);
    const selected = useMemo(() => new Set(settings?.values.appList ?? []), [settings?.values.appList]);
    const visible = useMemo(() => filterApps(apps.data ?? [], query, showSystem, selected), [apps.data, query, showSystem, selected]);
    const missing = useMemo(() => apps.data ? missingApps(apps.data, selected) : [], [apps.data, selected]);
    if (!settings) return null;
    const v = settings.values;
    const toggleApp = (pkg: string) => {
        const next = new Set(selected);
        if (next.has(pkg)) next.delete(pkg); else next.add(pkg);
        void save({ appList: [...next] });
    };
    const consent = apps.error instanceof AndroidAPIError && apps.error.code === 'consent_required';
    return <Card>
        <CardHeader><span className="font-medium text-ui-heading">{t('perApp.title')}</span></CardHeader>
        <CardBody className="flex flex-col gap-4">
            <SwitchComponent label={t('perApp.enabled')} description={t('perApp.hint')} checked={v.perApp} onCheckedChange={perApp => save({ perApp })} />
            {v.perApp && <>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ui-heading">{t('perApp.mode')}</span>
                    <Select ariaLabel={t('perApp.mode')} value={v.appBypass ? 'bypass' : 'allow'} onValueChange={mode => save({ appBypass: mode === 'bypass' })}
                        items={[{ value: 'allow', label: t('perApp.allow') }, { value: 'bypass', label: t('perApp.bypass') }]} />
                </label>
                {consent && <div className="text-sm">
                    <p className="m-0 text-ui-heading">{t('perApp.consent')}</p>
                    <a className="font-medium text-ui-primary underline" href={nativeActionURL('consent/apps')} onClick={() => setWaitingConsent(true)}>{t('perApp.openNative')}</a>
                </div>}
                {apps.error && !consent && <p className="m-0 text-sm text-ui-danger">{(apps.error as Error).message}</p>}
                {apps.data && <div className="flex flex-col gap-2">
                    <div className="relative">
                        <Search aria-hidden="true" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ui-muted" />
                        <Input className="w-full pl-9" type="search" placeholder={t('perApp.search')} aria-label={t('perApp.search')} value={query} onChange={e => setQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-ui-muted">{t('perApp.count', { count: selected.size - missing.length })}</span>
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-ui-muted">
                            <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={showSystem} onChange={e => setShowSystem(e.target.checked)} />
                            {t('perApp.system')}
                        </label>
                    </div>
                    {missing.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 rounded-ui-md bg-ui-surface-muted px-3 py-2 text-xs text-ui-muted">
                        <span title={missing.join('\n')}>{t('perApp.missing', { count: missing.length })}</span>
                        <Button size="sm" variant="outline-primary" onClick={() => save({ appList: [...selected].filter(pkg => !missing.includes(pkg)) })}>{t('perApp.removeMissing')}</Button>
                    </div>}
                    <ul className="m-0 flex max-h-[28rem] list-none flex-col divide-y divide-ui-border overflow-y-auto rounded-ui-md border border-ui-border p-0">
                        {visible.map(app => {
                            const on = selected.has(app.packageName);
                            return <li key={app.packageName}>
                                <label className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${on ? 'bg-ui-surface-muted' : 'hover:bg-ui-surface-muted'}`}>
                                    <AppIcon app={app} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-ui-heading">{app.name}</span>
                                        <span className="block truncate text-xs text-ui-muted">{app.packageName}</span>
                                    </span>
                                    <input type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--accent)]" checked={on} onChange={() => toggleApp(app.packageName)} />
                                </label>
                            </li>;
                        })}
                        {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-ui-muted">{t('perApp.empty')}</li>}
                    </ul>
                </div>}
                {!apps.data && !apps.error && <Loading />}
            </>}
            {saveError && <p className="m-0 text-sm text-ui-danger">{saveError}</p>}
        </CardBody>
    </Card>;
};
