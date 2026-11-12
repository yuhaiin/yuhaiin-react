import { confirmAction } from '@/component/v2/confirmation';
import { createRouteProfile, deleteRouteProfile, getRouteProfiles, saveRouteProfile, type RouteProfile } from '@/api/android';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import { Input, Textarea } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { AndroidOnly, errorText } from '../AndroidOnly';

/** Android route profiles: the IP ranges the VPN captures when the TUN inbound has no routes. */
export default function AndroidRoutesPage() {
    const { t } = useTranslation('android');
    return <AndroidOnly title={t('routes.title')} description={t('routes.description')}><RouteProfiles /></AndroidOnly>;
}

const RouteProfiles: FC = () => {
    const { t } = useTranslation('android');
    const { data, error, mutate } = useSWR('android/routes', getRouteProfiles);
    const [name, setName] = useState('');
    const [message, setMessage] = useState<string>();
    if (error) return <p className="text-sm text-ui-danger">{errorText(error)}</p>;
    if (!data) return <Loading />;
    const create = async () => {
        setMessage(undefined);
        try { await createRouteProfile(name.trim()); setName(''); await mutate(); }
        catch (e) { setMessage(errorText(e)); }
    };
    return <>
        <Card noMargin>
            <CardBody className="flex flex-wrap items-center gap-3">
                <Input className="min-w-0 flex-1" placeholder={t('routes.newName')} aria-label={t('routes.newName')} value={name} onChange={e => setName(e.target.value)} />
                <Button size="sm" variant="primary" disabled={!name.trim()} onClick={create}>{t('routes.create')}</Button>
                {message && <p className="m-0 w-full text-sm text-ui-danger">{message}</p>}
            </CardBody>
        </Card>
        {/* A saved or reloaded profile remounts its editor with the stored content. */}
        {data.profiles.map(profile => <RouteEditor key={`${profile.name}\n${profile.content}`} profile={profile} onChanged={() => mutate()} />)}
    </>;
};

export function routeLines(content: string): number {
    return content.split('\n').filter(line => line.trim() !== '').length;
}

const RouteEditor: FC<{ profile: RouteProfile; onChanged: () => void }> = ({ profile, onChanged }) => {
    const { t } = useTranslation('android');
    const [draft, setDraft] = useState(profile.content);
    const [status, setStatus] = useState<{ error?: string; saved?: boolean }>({});
    // Collapsed by default: long lists (1000+ ranges) would otherwise take over scrolling.
    const [open, setOpen] = useState(false);
    const dirty = draft !== profile.content;
    const save = async () => {
        try { await saveRouteProfile(profile.name, draft); setStatus({ saved: true }); onChanged(); }
        catch (e) { setStatus({ error: errorText(e) }); }
    };
    const remove = async () => {
        if (!await confirmAction(t('routes.deleteConfirm', { name: profile.name }))) return;
        try { await deleteRouteProfile(profile.name); onChanged(); }
        catch (e) { setStatus({ error: errorText(e) }); }
    };
    return <Card noMargin>
        <div className={`flex items-center justify-between gap-3 px-4 py-3.5${open ? ' border-b border-ui-border' : ''}`}>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="break-words font-medium leading-snug text-ui-heading">{t(`routes.preset.${profile.name}`, { defaultValue: profile.name })}</span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {profile.active && <Badge variant="success" pill>{t('routes.active')}</Badge>}
                    {profile.preset && <Badge variant="secondary" pill>{t('routes.builtIn')}</Badge>}
                    <span className="text-xs tabular-nums text-ui-muted">{t('routes.count', { count: routeLines(draft) })}</span>
                </div>
            </div>
            <Button size="sm" variant="outline-secondary" className="shrink-0 whitespace-nowrap" aria-expanded={open} onClick={() => setOpen(!open)}>{t(open ? 'routes.close' : 'routes.edit')}</Button>
        </div>
        {open && <CardBody className="flex flex-col gap-2">
            <Textarea rows={6} spellCheck={false} className="font-mono text-xs" aria-label={profile.name} value={draft}
                placeholder={t('routes.placeholder')} onChange={e => { setDraft(e.target.value); setStatus({}); }} />
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="primary" disabled={!dirty} onClick={save}>{t('routes.save')}</Button>
                {dirty && <Button size="sm" variant="ghost" onClick={() => setDraft(profile.content)}>{t('routes.revert')}</Button>}
                {!profile.preset && <Button size="sm" variant="outline-danger" onClick={remove}>{t('routes.delete')}</Button>}
                {status.saved && !dirty && <span className="text-sm text-ui-success">{t('routes.saved')}</span>}
                {status.error && <span className="text-sm text-ui-danger">{status.error}</span>}
            </div>
        </CardBody>}
    </Card>;
};
