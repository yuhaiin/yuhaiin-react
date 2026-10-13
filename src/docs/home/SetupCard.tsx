import { listInbounds } from '@/api/inbounds';
import { getRouteActivationStatus } from '@/api/route';
import { listSelectors } from '@/api/selectors';
import { selectedNodes, getNode } from '@/api/nodes';
import { DefaultSelectionEditor } from '@/component/default-selection-editor';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
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
    return <>
        <DefaultSelectionEditor open={editingDefault} onClose={() => setEditingDefault(false)} />
        <Card className="mb-4" density="compact"><CardHeader><h2 className="text-base font-semibold">{t('setupTitle')}</h2></CardHeader>
            <CardBody>
                {mode && <p className="mb-3 text-sm font-medium">{t("unmatchedTraffic")}: {t(mode)}{mode === "proxy" && ` · ${destination ?? t("unavailableDestination")}`} <Button size="sm" variant="outline-secondary" onClick={() => navigate("/docs/bypass/")}>{t("editRouting")}</Button></p>}
                <p className="mb-4 text-sm text-ui-muted">{t('setupHelp')}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2 rounded-ui-lg border border-ui-border p-3">
                        <p className="text-sm font-semibold">1. {t('defaultDestination')}</p>
                        <p className="text-sm text-ui-muted">{hasDefault ? selection?.tcp?.id === selection?.udp?.id ? selection?.tcp?.name : t('separateDestinations') : t('setupChooseDestination')}</p>
                        <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setEditingDefault(true)}>{t('chooseNode')}</Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/group/')}>{t('addNode')}</Button></div>
                    </div>
                    <div className="space-y-2 rounded-ui-lg border border-ui-border p-3">
                        <p className="text-sm font-semibold">2. {t('setupTrafficEntry')}</p>
                        <p className="text-sm text-ui-muted">{t(hasInbound ? 'setupEntryEnabled' : 'setupChooseEntry')}</p>
                        <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/inbound')}>{t('setupConfigureEntry')}</Button>
                    </div>
                    <div className="space-y-2 rounded-ui-lg border border-ui-border p-3">
                        <p className="text-sm font-semibold">3. {t('setupTest')}</p>
                        <p className="text-sm text-ui-muted">{t('setupTestHelp')}</p>
                        <Button size="sm" variant="outline-secondary" onClick={() => navigate('/docs/diagnostics')}>{t('setupRunTest')}</Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    </>;
}
