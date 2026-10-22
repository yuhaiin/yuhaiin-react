import { getRouteActivationStatus, getRouteConfig, saveRouteConfig, applyRouteChanges } from '@/api/route';
import { listResolvers } from '@/api/resolvers';
import { collectPages } from '@/api/paging';
import { ResolverModal } from '@/component/resolver-editor';
import { ResolverPicker } from '@/component/resolver-picker';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, CardFooter, SettingLabel } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function DNSRoles() {
    const { t } = useTranslation('routing');
    const { data: server, error: loadError, mutate } = useSWR('/api/v2/route/config', getRouteConfig);
    const { data: resolvers, mutate: refreshResolvers } = useSWR('/api/v2/resolvers/options', () => collectPages(listResolvers));
    const { mutate: refreshStatus } = useSWR('/api/v2/route/activation', getRouteActivationStatus);
    const [editingBootstrap, setEditingBootstrap] = useState(false);
    const [error, setError] = useState('');
    const { value, setValue, commit, dirty } = useEditorDraft('dns-roles', server, () => undefined);
    const { pending, run } = useAsyncAction(error => { setError(String((error as { msg?: string })?.msg ?? error)); void refreshStatus(); });
    useCloseGuard(dirty, pending, () => undefined);
    const bootstrap = resolvers?.items.find(item => item.id === 'bootstrap');
    const save = () => void run(async () => {
        if (!value) return;
        setError('');
        if (dirty) { const saved = await saveRouteConfig(value); commit(saved); await mutate(saved, { revalidate: false }); }
        await applyRouteChanges(); await refreshStatus();
    });
    if (loadError) return <Loading onRetry={() => void mutate()}>{t('dnsRolesFailed')}</Loading>;
    if (!value) return <Loading />;
    return <Card>
        <CardHeader><h2 className="text-lg font-semibold">{t('dnsQueryRoles')}</h2></CardHeader>
        <CardBody><fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><SettingLabel>{t('directDNSRole')}</SettingLabel><p className="text-sm text-ui-muted">{t('directDNSHelp')}</p>
                <ResolverPicker label={t("directDNSRole")} value={value.directResolver} onChange={directResolver => setValue(previous => previous ? { ...previous, directResolver } : previous)} />
            </div>
            <div className="space-y-2"><SettingLabel>{t('proxyDNSRole')}</SettingLabel><p className="text-sm text-ui-muted">{t('proxyDNSHelp')}</p>
                <ResolverPicker label={t("proxyDNSRole")} value={value.proxyResolver} onChange={proxyResolver => setValue(previous => previous ? { ...previous, proxyResolver } : previous)} />
            </div>
            <div className="space-y-2 md:col-span-2"><SettingLabel>{t('bootstrapDNSRole')}</SettingLabel><p className="text-sm text-ui-muted">{t('bootstrapDNSHelp')}</p>
                <p className="text-sm">{bootstrap?.name || t('deviceDNS')}</p><Button size="sm" variant="outline-secondary" onClick={() => setEditingBootstrap(true)}>{t('configureBootstrapDNS')}</Button>
            </div>
        </fieldset>
        <ResolverModal id="bootstrap" show={editingBootstrap} isNew={!bootstrap} onHide={() => setEditingBootstrap(false)} onSaved={() => { void refreshResolvers(); }} />
        {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{error}</p>}
        </CardBody>
        <CardFooter><Button permission="resolver:write" disabled={pending} onClick={save}>{t(error && !dirty ? 'retryApply' : 'saveAndApply')}</Button></CardFooter>
    </Card>;
}
