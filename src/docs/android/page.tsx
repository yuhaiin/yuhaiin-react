import { AndroidAPIError, getAndroidApps, getAndroidSettings, nativeActionURL, reconfigureAndroidVpn, saveAndroidSettings, type AndroidApp, type AndroidSettingValues, type NativeAction } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { PageHeader } from '@/component/v2/page-header';
import { Select } from '@/component/v2/select';
import SwitchComponent from '@/component/v2/switch';
import { useAndroidPlatform } from '@/hooks/use-android-platform';
import { useMemo, useState, type FC } from 'react';
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
            <NativeLinksCard />
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
    if (!data) return <Loading />;
    const v = data.values;
    const select = (field: 'mtuProfile' | 'meteredMode' | 'bootConnectPolicy' | 'coreBackgroundPolicy' | 'routeProfile', items: string[]) =>
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
            </div>
            <SwitchComponent label={t('settings.appendHTTPProxy')} checked={v.appendHTTPProxy} onCheckedChange={appendHTTPProxy => save({ appendHTTPProxy })} />
            <SwitchComponent label={t('settings.autoConnect')} description={t('settings.autoConnectHint')} checked={v.autoConnect} onCheckedChange={autoConnect => save({ autoConnect })} />
            <SwitchComponent label={t('settings.notificationSpeed')} checked={v.notificationSpeed} onCheckedChange={notificationSpeed => save({ notificationSpeed })} />
            <SwitchComponent label={t('settings.trackUnderlyingNetwork')} checked={v.trackUnderlyingNetwork} onCheckedChange={trackUnderlyingNetwork => save({ trackUnderlyingNetwork })} />
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

const PerAppCard: FC = () => {
    const { t } = useTranslation('android');
    const { data: settings, save, saveError } = useSettings();
    const apps = useSWR(settings?.values.perApp ? 'android/apps' : null, getAndroidApps, { revalidateOnFocus: false });
    const [query, setQuery] = useState('');
    const [showSystem, setShowSystem] = useState(false);
    const selected = useMemo(() => new Set(settings?.values.appList ?? []), [settings?.values.appList]);
    const visible = useMemo(() => filterApps(apps.data ?? [], query, showSystem, selected), [apps.data, query, showSystem, selected]);
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
        <CardBody className="flex flex-col gap-3">
            <SwitchComponent label={t('perApp.enabled')} description={t('perApp.hint')} checked={v.perApp} onCheckedChange={perApp => save({ perApp })} />
            {v.perApp && <>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-ui-heading">{t('perApp.mode')}</span>
                    <Select ariaLabel={t('perApp.mode')} value={v.appBypass ? 'bypass' : 'allow'} onValueChange={mode => save({ appBypass: mode === 'bypass' })}
                        items={[{ value: 'allow', label: t('perApp.allow') }, { value: 'bypass', label: t('perApp.bypass') }]} />
                </label>
                {consent && <div className="text-sm">
                    <p className="m-0 text-ui-heading">{t('perApp.consent')}</p>
                    <a className="font-medium text-ui-primary underline" href={nativeActionURL('apps')}>{t('perApp.openNative')}</a>
                </div>}
                {apps.error && !consent && <p className="m-0 text-sm text-ui-danger">{(apps.error as Error).message}</p>}
                {apps.data && <>
                    <div className="flex flex-wrap items-center gap-3">
                        <Input className="min-w-0 flex-1" placeholder={t('perApp.search')} aria-label={t('perApp.search')} value={query} onChange={e => setQuery(e.target.value)} />
                        <SwitchComponent label={t('perApp.system')} checked={showSystem} onCheckedChange={setShowSystem} />
                    </div>
                    <p className="m-0 text-xs text-ui-muted">{t('perApp.count', { count: selected.size })}</p>
                    <ul className="m-0 flex max-h-96 list-none flex-col gap-1 overflow-y-auto p-0">
                        {visible.map(app => <li key={app.packageName}>
                            <label className="flex cursor-pointer items-center gap-3 rounded-ui-md px-2 py-2 hover:bg-ui-surface-muted">
                                <input type="checkbox" className="h-4 w-4 shrink-0" checked={selected.has(app.packageName)} onChange={() => toggleApp(app.packageName)} />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-ui-heading">{app.name}</span>
                                    <span className="block truncate text-xs text-ui-muted">{app.packageName}</span>
                                </span>
                            </label>
                        </li>)}
                    </ul>
                </>}
                {!apps.data && !apps.error && <Loading />}
            </>}
            {saveError && <p className="m-0 text-sm text-ui-danger">{saveError}</p>}
        </CardBody>
    </Card>;
};

const NativeLinksCard: FC = () => {
    const { t } = useTranslation('android');
    const links: NativeAction[] = ['logs', 'backup', 'update', 'privacy', 'routes', 'settings'];
    return <Card>
        <CardHeader><span className="font-medium text-ui-heading">{t('native.title')}</span></CardHeader>
        <CardBody className="flex flex-col gap-2">
            <p className="m-0 text-xs text-ui-muted">{t('native.hint')}</p>
            <div className="flex flex-wrap gap-2">
                {links.map(action => <Button key={action} asChild size="sm" variant="outline-secondary">
                    <a href={nativeActionURL(action)}>{t(`native.${action}`)}</a>
                </Button>)}
            </div>
        </CardBody>
    </Card>;
};
