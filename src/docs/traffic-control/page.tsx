import { PageHeader } from '@/component/v2/page-header';
import { PageTabs } from '@/component/v2/page-tabs';
import { ui } from '@/component/v2/styles';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { SwitchCard } from '@/component/v2/forms';
import { usePermission } from '@/auth/context';
import { blankProfile, type TrafficControlConfig } from '@/contract/traffic-control';
import { ChevronRight, Info, Plus, Save, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BindingTable } from './bindings';
import { TrafficControlDiagnostics } from './diagnostics';
import { ProfileEditor, useProfileSummary } from './rates';
import { useTrafficControlEditor } from './use-editor';
import { IdentityResourcePolicies, ResourceStatus } from './resources';

type Editor = ReturnType<typeof useTrafficControlEditor>;

function bindingCount(config: TrafficControlConfig, name: string) {
    return [...Object.values(config.inboundProfiles), ...Object.values(config.routeProfiles)]
        .filter((profile) => profile === name).length;
}

function ProfileList({ editor }: { editor: Editor }) {
    const { t } = useTranslation('trafficControl');
    const summary = useProfileSummary();
    const { draft, saving, patch, updateProfile, removeProfile } = editor;
    const [adding, setAdding] = useState(false);
    const [profileName, setProfileName] = useState('');
    const names = Object.keys(draft.profiles).sort();
    const trimmed = profileName.trim();
    const duplicate = Object.prototype.hasOwnProperty.call(draft.profiles, trimmed);
    const add = () => {
        if (!trimmed || duplicate) return;
        patch((c) => ({ ...c, profiles: { ...c.profiles, [trimmed]: blankProfile() } }));
        setProfileName('');
        setAdding(false);
    };
    return (
        <Card noMargin>
            <CardHeader>
                <h2 className={ui.sectionTitle}>
                    {t('profiles')}
                    <span className="ml-2 text-sm font-normal text-ui-muted">{names.length}</span>
                </h2>
                {!adding && (
                    <Button size="sm" variant="outline-secondary" disabled={saving} onClick={() => setAdding(true)}>
                        <Plus size={15} />
                        {t('addProfile')}
                    </Button>
                )}
            </CardHeader>
            <CardBody className="space-y-2">
                {adding && (
                    <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); add(); }}>
                        <Input
                            autoFocus
                            aria-label={t('newProfile')}
                            placeholder={t('newProfile')}
                            maxLength={64}
                            value={profileName}
                            disabled={saving}
                            onChange={(e) => setProfileName(e.target.value)}
                        />
                        <Button type="submit" disabled={saving || !trimmed || duplicate}>{t('add')}</Button>
                        <Button type="button" variant="ghost" onClick={() => { setAdding(false); setProfileName(''); }}>{t('cancel')}</Button>
                    </form>
                )}
                {names.map((name) => {
                    const isDefault = draft.defaultProfile === name;
                    const used = bindingCount(draft, name);
                    return (
                        <details key={name} name="qos-profile"
                            className="group rounded-ui-sm border border-ui-border open:bg-ui-surface-muted/30">
                            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                                <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-ui-muted transition-transform group-open:rotate-90" />
                                <span className="min-w-0 flex-1">
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="truncate text-sm font-medium text-ui-heading">{name}</span>
                                        {isDefault && <span className="shrink-0 rounded-full bg-ui-primary/15 px-2 py-0.5 text-[11px] font-medium text-ui-primary">{t('defaultBadge')}</span>}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-ui-secondary">
                                        {summary(draft.profiles[name])} · {t('usedBy', { count: used })}
                                    </span>
                                </span>
                            </summary>
                            <div className="space-y-4 border-t border-ui-border/60 px-4 py-4">
                                <ProfileEditor
                                    profile={draft.profiles[name]}
                                    disabled={saving}
                                    onChange={(next) => updateProfile(name, next)}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant={isDefault ? 'outline-primary' : 'outline-secondary'} disabled={saving}
                                        aria-pressed={isDefault}
                                        onClick={() => patch((c) => ({ ...c, defaultProfile: isDefault ? '' : name }))}>
                                        <Star size={14} />
                                        {isDefault ? t('unsetDefault') : t('setDefault')}
                                    </Button>
                                    <Button size="sm" variant="outline-danger" disabled={saving}
                                        aria-label={t('deleteProfile', { name })}
                                        onClick={() => removeProfile(name)}>
                                        <Trash2 size={14} />
                                        {t('remove')}
                                    </Button>
                                </div>
                            </div>
                        </details>
                    );
                })}
                {!names.length && !adding && <p className="text-sm text-ui-muted">{t('noProfiles')}</p>}
                {names.length > 0 && !draft.defaultProfile && <p className="text-xs text-ui-muted">{t('noDefaultHint')}</p>}
            </CardBody>
        </Card>
    );
}

function BandwidthTab({ editor }: { editor: Editor }) {
    const { t } = useTranslation('trafficControl');
    const { draft, dirty, saving, saved, failure, invalid, patch, save, discard } = editor;
    const names = Object.keys(draft.profiles).sort();
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
                {saved && <p role="status" className="mr-auto text-sm text-ui-secondary">{t('saved')}</p>}
                <Button variant="outline-secondary" disabled={!dirty || saving} onClick={discard}>
                    {t('discard')}
                </Button>
                <Button variant="primary" loading={saving} disabled={!dirty || saving || Boolean(invalid)} onClick={() => void save()}>
                    <Save size={16} />
                    {t('save')}
                </Button>
            </div>
            {(failure || invalid) && (
                <p role="alert" className="rounded-ui-sm border border-ui-danger/40 p-3 text-sm text-ui-danger">
                    {failure || invalid}
                </p>
            )}
            <Card noMargin>
                <CardHeader>
                    <h2 className={ui.sectionTitle}>{t('global')}</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    <SwitchCard
                        checked={draft.enabled}
                        disabled={saving}
                        label={t('enabled')}
                        description={t('enableHint')}
                        onCheckedChange={(enabled) => patch((c) => ({ ...c, enabled }))}
                    />
                    {draft.enabled && (
                        <ProfileEditor
                            profile={draft.global}
                            disabled={saving}
                            onChange={(global) => patch((c) => ({ ...c, global }))}
                        />
                    )}
                </CardBody>
            </Card>
            {!draft.enabled && names.length > 0 && (
                <p className="flex items-start gap-2 text-xs text-ui-muted">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    {t('profilesInactive')}
                </p>
            )}
            <ProfileList editor={editor} />
            <Card noMargin>
                <CardHeader>
                    <h2 className={ui.sectionTitle}>{t('bindings')}</h2>
                </CardHeader>
                <CardBody>
                    {names.length ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            <BindingTable
                                title={t('inbounds')}
                                kind="inbound"
                                profiles={names}
                                defaultProfile={draft.defaultProfile || undefined}
                                values={draft.inboundProfiles}
                                disabled={saving}
                                onChange={(inboundProfiles) => patch((c) => ({ ...c, inboundProfiles }))}
                            />
                            <BindingTable
                                title={t('routes')}
                                kind="route"
                                profiles={names}
                                defaultProfile={draft.defaultProfile || undefined}
                                values={draft.routeProfiles}
                                disabled={saving}
                                onChange={(routeProfiles) => patch((c) => ({ ...c, routeProfiles }))}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-ui-muted">{t('bindingsNeedProfile')}</p>
                    )}
                </CardBody>
            </Card>
            <p className="flex items-start gap-2 text-xs text-ui-muted">
                <Info size={14} className="mt-0.5 shrink-0" />
                {t('limitations')}
            </p>
        </div>
    );
}

export default function TrafficControlPage() {
    const { t } = useTranslation('trafficControl');
    const editor = useTrafficControlEditor();
    const resourcesReadable = usePermission('resources:read');
    const { data, error, isLoading, refresh } = editor;
    if (error && !data)
        return (
            <Loading onRetry={() => void refresh()}>
                {String((error as { msg?: string })?.msg ?? error)}
            </Loading>
        );
    if (isLoading || !data) return <Loading />;
    return (
        <MainContainer className="max-w-[1440px]">
            <div className="pb-8">
                <PageHeader title={t('title')} description={t('description')} />
                <PageTabs label={t('sections')} items={[
                    { value: 'bandwidth', label: t('tabBandwidth'), content: <BandwidthTab editor={editor} /> },
                    ...(resourcesReadable ? [{ value: 'resources', label: t('tabResources'), content: <IdentityResourcePolicies /> }] : []),
                    {
                        value: 'diagnostics', label: t('tabDiagnostics'), content: (
                            <div className="space-y-5">
                                <TrafficControlDiagnostics />
                                {resourcesReadable && <ResourceStatus />}
                            </div>
                        ),
                    },
                ]} />
            </div>
        </MainContainer>
    );
}
