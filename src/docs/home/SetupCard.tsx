import { listInbounds } from '@/api/inbounds';
import { getRouteActivationStatus } from '@/api/route';
import { listSelectors } from '@/api/selectors';
import { selectedNodes, getNode } from '@/api/nodes';
import { DefaultSelectionEditor } from '@/component/default-selection-editor';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useLocation } from 'wouter';

export default function SetupCard() {
    const { t } = useTranslation('routing');
    const [, navigate] = useLocation();
    const [editingDefault, setEditingDefault] = useState(false);
    const { data: selection } = useSWR('/api/v2/nodes/selected', selectedNodes);
    const { data: routing } = useSWR('/api/v2/route/activation', getRouteActivationStatus, { refreshInterval: 5000 });
    const target = routing?.runningConfig?.defaultTarget;
    const mode = routing?.runningConfig?.defaultMode;
    const { data: node } = useSWR(target?.type === 'node' && target.id ? ['/api/v2/nodes/detail', target.id] : null, () => getNode(target!.id!), { revalidateOnFocus: false });
    const { data: selectors } = useSWR(target?.type === 'selector' ? '/api/v2/outbound/selectors' : null, listSelectors);
    const destination = target?.type === 'node' ? node?.name
        : target?.type === 'selector' ? selectors?.items.find(item => item.id === target.id)?.name : t('defaultProxy');
    const { data: inbounds } = useSWR('/api/v2/inbounds', () => listInbounds());
    const hasDefault = Boolean(selection?.tcp && selection?.udp);
    const hasInbound = Boolean(inbounds?.items.some(item => item.enabled));
    const configured = Boolean(selection && inbounds && hasDefault && hasInbound);
    const body = <>
        {mode && <p className="mb-3 text-sm font-medium">{t("unmatchedTraffic")}: {t(mode)}{mode === "proxy" && ` · ${destination ?? t("unavailableDestination")}`} <Button size="sm" variant="outline-secondary" onClick={() => navigate("/docs/bypass/")}>{t("editRouting")}</Button></p>}
        <p className="mb-4 text-sm text-ui-muted">{t('setupHelp')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 border-l-2 border-ui-border pl-3">
                <p className="text-sm font-medium">1. {t('defaultDestination')}</p>
                <p className="text-sm text-ui-muted">{hasDefault ? selection?.tcp?.id === selection?.udp?.id ? selection?.tcp?.name : t('separateDestinations') : t('setupChooseDestination')}</p>
                <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setEditingDefault(true)}>{t('chooseNode')}</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/group/')}>{t('addNode')}</Button></div>
            </div>
            <div className="space-y-2 border-l-2 border-ui-border pl-3">
                <p className="text-sm font-medium">2. {t('setupTrafficEntry')}</p>
                <p className="text-sm text-ui-muted">{t(hasInbound ? 'setupEntryEnabled' : 'setupChooseEntry')}</p>
                <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/inbound')}>{t('setupConfigureEntry')}</Button>
            </div>
            <div className="space-y-2 border-l-2 border-ui-border pl-3">
                <p className="text-sm font-medium">3. {t('setupTest')}</p>
                <p className="text-sm text-ui-muted">{t('setupTestHelp')}</p>
                <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/diagnostics')}>{t('setupRunTest')}</Button>
            </div>
        </div>
    </>;
    return <>
        <DefaultSelectionEditor open={editingDefault} onClose={() => setEditingDefault(false)} />
        <Card className="mb-4" density="compact">
            {configured ? <details key="configured" className="group">
                <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-ui-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus [&::-webkit-details-marker]:hidden">
                    <CheckCircle2 size={16} className="shrink-0 text-ui-success" aria-hidden="true" />
                    <span className="font-medium text-ui-heading">{t('setupTitle')}</span>
                    <span className="min-w-0 flex-1 truncate">{selection?.tcp?.id === selection?.udp?.id ? selection?.tcp?.name : t('separateDestinations')} · {t('setupEntryEnabled')}</span>
                    <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <CardBody className="border-t border-ui-border">{body}</CardBody>
            </details> : <><CardHeader><h2 className="text-base font-medium">{t('setupTitle')}</h2></CardHeader><CardBody>{body}</CardBody></>}
        </Card>
    </>;
}
