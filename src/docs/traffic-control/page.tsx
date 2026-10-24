import { ui } from '@/component/v2/styles';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import Loading from '@/component/v2/loading';
import { SwitchCard } from '@/component/v2/forms';
import { blankProfile } from '@/contract/traffic-control';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Plus,
    Save,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BindingTable } from './bindings';
import { TrafficControlDiagnostics } from './diagnostics';
import { ProfileEditor } from './rates';
import { useTrafficControlEditor } from './use-editor';
import { IdentityResourcePolicies } from './resources';

export default function TrafficControlPage() {
    const { t } = useTranslation('trafficControl');
    const {
        data,
        error,
        isLoading,
        refresh,
        draft,
        dirty,
        saving,
        saved,
        failure,
        invalid,
        patch,
        save,
        discard,
        updateProfile,
        removeProfile,
    } = useTrafficControlEditor();
    const [profileName, setProfileName] = useState('');
    if (error && !data)
        return (
            <Loading onRetry={() => void refresh()}>
                {String((error as { msg?: string })?.msg ?? error)}
            </Loading>
        );
    if (isLoading || !data) return <Loading />;
    const names = Object.keys(draft.profiles).sort();
    return (
        <MainContainer className="max-w-screen-xl">
            <div className="space-y-5 pb-8">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-semibold text-ui-heading">
                            <ShieldCheck size={22} />
                            {t('title')}
                        </h1>
                        <p className="mt-1 text-sm text-ui-secondary">
                            {t('description')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline-secondary"
                            disabled={!dirty || saving}
                            onClick={discard}
                        >
                            {t('discard')}
                        </Button>
                        <Button
                            variant="primary"
                            loading={saving}
                            disabled={!dirty || saving || Boolean(invalid)}
                            onClick={() => void save()}
                        >
                            <Save size={16} />
                            {t('save')}
                        </Button>
                    </div>
                </header>
                {(failure || invalid) && (
                    <p
                        role="alert"
                        className="rounded-ui-sm border border-ui-danger/40 p-3 text-sm text-ui-danger"
                    >
                        {failure || invalid}
                    </p>
                )}
                {saved && (
                    <p role="status" className="text-sm text-ui-secondary">
                        {t('saved')}
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
                            onCheckedChange={(enabled) =>
                                patch((c) => ({ ...c, enabled }))
                            }
                        />
                        <ProfileEditor
                            profile={draft.global}
                            disabled={saving}
                            onChange={(global) =>
                                patch((c) => ({ ...c, global }))
                            }
                        />
                        <p className="text-xs text-ui-muted">{t('unitHint')}</p>
                    </CardBody>
                </Card>
                <Card noMargin>
                    <CardHeader>
                        <h2 className={ui.sectionTitle}>{t('profiles')}</h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                aria-label={t('newProfile')}
                                placeholder={t('newProfile')}
                                maxLength={64}
                                value={profileName}
                                disabled={saving}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                            <Button
                                disabled={
                                    saving ||
                                    !profileName.trim() ||
                                    Object.prototype.hasOwnProperty.call(
                                        draft.profiles,
                                        profileName.trim(),
                                    )
                                }
                                onClick={() => {
                                    const name = profileName.trim();
                                    if (!name) return;
                                    patch((c) => ({
                                        ...c,
                                        profiles: {
                                            ...c.profiles,
                                            [name]: blankProfile(),
                                        },
                                    }));
                                    setProfileName('');
                                }}
                            >
                                <Plus size={15} />
                                {t('add')}
                            </Button>
                        </div>
                        <label className="flex items-center gap-3 text-sm">
                            <span className="font-medium">
                                {t('defaultProfile')}
                            </span>
                            <Select
                                triggerClassName="max-w-56"
                                disabled={saving}
                                value={draft.defaultProfile ?? ''}
                                ariaLabel={t('defaultProfile')}
                                items={[
                                    { value: '', label: t('none') },
                                    ...names.map((name) => ({
                                        value: name,
                                        label: name,
                                    })),
                                ]}
                                onValueChange={(defaultProfile) =>
                                    patch((c) => ({ ...c, defaultProfile }))
                                }
                            />
                        </label>
                        {names.map((name) => (
                            <section
                                key={name}
                                className="rounded-ui-sm border border-ui-border p-4 space-y-3"
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <h3
                                        className={`${ui.sectionTitle} break-all`}
                                    >
                                        {name}
                                    </h3>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        disabled={saving}
                                        aria-label={t('deleteProfile', {
                                            name,
                                        })}
                                        onClick={() => removeProfile(name)}
                                    >
                                        <Trash2 size={14} />
                                        {t('remove')}
                                    </Button>
                                </div>
                                <ProfileEditor
                                    profile={draft.profiles[name]}
                                    disabled={saving}
                                    onChange={(next) =>
                                        updateProfile(name, next)
                                    }
                                />
                            </section>
                        ))}
                        {!names.length && (
                            <p className="text-sm text-ui-muted">
                                {t('noProfiles')}
                            </p>
                        )}
                    </CardBody>
                </Card>
                <Card noMargin>
                    <CardHeader>
                        <h2 className={ui.sectionTitle}>{t('bindings')}</h2>
                    </CardHeader>
                    <CardBody className="grid gap-5 lg:grid-cols-2">
                        <BindingTable
                            title={t('inbounds')}
                            kind="inbound"
                            profiles={names}
                            values={draft.inboundProfiles}
                            disabled={saving}
                            onChange={(inboundProfiles) =>
                                patch((c) => ({ ...c, inboundProfiles }))
                            }
                        />
                        <BindingTable
                            title={t('routes')}
                            kind="route"
                            profiles={names}
                            values={draft.routeProfiles}
                            disabled={saving}
                            onChange={(routeProfiles) =>
                                patch((c) => ({ ...c, routeProfiles }))
                            }
                        />
                    </CardBody>
                </Card>
                <IdentityResourcePolicies />
                <TrafficControlDiagnostics />
                <p className="text-xs text-ui-muted flex items-start gap-2">
                    <ArrowUpFromLine size={14} />
                    <ArrowDownToLine size={14} />
                    {t('limitations')}
                </p>
            </div>
        </MainContainer>
    );
}
