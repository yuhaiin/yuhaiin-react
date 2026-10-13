import type { Connection } from '@/contract/connection';
import { useTranslation } from 'react-i18next';
import { canDiagnoseHost, connectionDraftLink, connectionHost, resourceLink } from './actions';

type Props = { connection?: Connection; host?: string; process?: string };

export function ConnectionActions({ connection, host, process }: Props) {
    const { t } = useTranslation('routing');
    const target = connection ? connectionHost(connection) : host || '';
    const application = connection?.process || process;
    const linkClass = 'rounded-ui-md border border-ui-border px-3 py-2 text-sm text-ui-primary hover:bg-ui-hover focus-visible:outline-2 focus-visible:outline-ui-focus';
    return <section className="space-y-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted/40 p-4">
        {connection && <>
            <h3 className="text-base font-semibold text-ui-heading">{t('routingExplanation')}</h3>
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                <li>{connection.ruleId ? <a className="text-ui-primary underline" href={resourceLink('/docs/bypass', 'rule', connection.ruleId)}>{connection.ruleName || t('matchedRule')}</a> : t('usedDefaultRoute')}</li>
                <li aria-hidden="true">→</li>
                <li>{t(`action_${connection.mode}`, { defaultValue: connection.mode })}</li>
                {connection.mode !== 'block' && connection.selectorId && <><li aria-hidden="true">→</li><li><a className="text-ui-primary underline" href={resourceLink('/docs/group/selectors', 'selector', connection.selectorId)}>{connection.selectorName || t('sharedDestination')}</a></li></>}
                {connection.mode !== 'block' && connection.nodeId && <><li aria-hidden="true">→</li><li><a className="text-ui-primary underline" href={resourceLink('/docs/group', 'node', connection.nodeId)}>{connection.nodeName || t('selectedNode')}</a></li></>}
            </ol>
        </>}
        <div className="flex flex-wrap gap-2">
            {target && canDiagnoseHost(target) && <a className={linkClass} href={resourceLink('/docs/diagnostics', 'host', target)}>{t('diagnoseConnection')}</a>}
            {target && <a className={linkClass} href={connectionDraftLink('host', target)}>{t('routeThisHost')}</a>}
            {application && <a className={linkClass} href={connectionDraftLink('process', application)}>{t('routeThisProcess')}</a>}
        </div>
        {(target || application) && <p className="text-xs text-ui-muted">{t('connectionDraftHelp')}</p>}
    </section>;
}
