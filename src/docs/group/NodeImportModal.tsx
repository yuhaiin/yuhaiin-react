import { useTranslation } from 'react-i18next';
import { createNode, previewNodeImport, useNode } from '@/api/nodes';
import { listSubscriptions, saveSubscriptions, updateSubscriptions } from '@/api/subscriptions';
import { Button } from '@/component/v2/button';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Input, Textarea } from '@/component/v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import type { Go } from '@/api/generated-contracts';
import type { Node } from '@/contract/node';
import { useAsyncAction, useCloseGuard } from '@/hooks/use-editor-draft';
import { useEffect, useState } from 'react';
import { importNodeBatch, type ImportResult } from './node-import';

function message(error: unknown) {
    return error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error);
}

export default function NodeImportModal({ show, group, onHide, onSaved, onChanged }: {
    show: boolean; group: string; onHide: () => void; onSaved: () => void; onChanged: () => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const [source, setSource] = useState('nodes');
    const [text, setText] = useState('');
    const [subscriptionName, setSubscriptionName] = useState('');
    const [nodes, setNodes] = useState<Node[]>();
    const [issues, setIssues] = useState<Go.node.ImportIssue[]>([]);
    const [results, setResults] = useState<Array<ImportResult | undefined>>([]);
    const [defaultID, setDefaultID] = useState('');
    const [error, setError] = useState('');
    const { pending, run } = useAsyncAction(error => setError(message(error)));
    const successful = results.filter(result => result?.status === 'success').length;
    const failed = results.filter(result => result?.status === 'failed').length;
    const close = useCloseGuard(show && Boolean(text.trim()) && successful === 0, pending, onHide);
    useEffect(() => {
        if (show) {
            setSource('nodes'); setText(''); setSubscriptionName(''); setNodes(undefined);
            setResults([]); setIssues([]); setError(''); setDefaultID('');
        }
    }, [show]);
    const changeText = (value: string) => {
        setText(value); setError(''); setNodes(undefined); setIssues([]); setResults([]); setDefaultID('');
    };
    const preview = () => void run(async () => {
        setError('');
        const result = await previewNodeImport(text, group);
        setNodes(result.items); setIssues(result.errors); setResults([]); setDefaultID('');
    });
    const save = () => void run(async () => {
        setError('');
        if (!nodes?.length) return;
        const next = await importNodeBatch(nodes, createNode, results, setResults);
        if (next.some(result => result.status === 'success')) onChanged();
        if (next.every(result => result.status === 'success')) {
            if (defaultID) await useNode(defaultID);
            onSaved();
        }
    });
    const subscribe = () => void run(async () => {
        setError('');
        const url = text.trim();
        let name = subscriptionName.trim();
        if (!name) {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(t('subscriptionNameRequired'));
            name = parsed.hostname;
        }
        const existing = (await listSubscriptions()).items.find(item => item.name === name);
        if (existing && existing.url !== url) throw new Error(t('subscriptionNameConflict'));
        await saveSubscriptions([{ name, url, type: 'reserve' }]);
        await updateSubscriptions([name]);
        onChanged(); onSaved();
    });
    return (
        <Modal open={show} onOpenChange={open => !open && close()}>
            <ModalContent width={800}>
                <ModalHeader closeButton><ModalTitle>{t('importNodes')}</ModalTitle></ModalHeader>
                <ModalBody>
                    <SettingSelectVertical label={t('importSource')} value={source} disabled={pending || successful > 0}
                        values={[[t('nodeLinksOrJSON'), 'nodes'], [t('subscriptionURL'), 'subscription']]}
                        onChange={value => { setSource(value); changeText(''); }} />
                    <p className="mb-3 text-sm text-ui-muted">{t(source === 'nodes' ? 'nodeImportHelp' : 'subscriptionImportHelp')}</p>
                    {source === 'nodes' && <label className="mb-3 block text-sm">
                        {t('chooseImportFile')}
                        <Input type="file" accept=".json,.txt,application/json,text/plain" className="mt-2" disabled={pending || successful > 0}
                            onChange={event => {
                                const file = event.target.files?.[0];
                                if (file) void run(async () => {
                                    if (file.size > 4 * 1024 * 1024) throw new Error(t('importFileTooLarge'));
                                    changeText(await file.text());
                                });
                                event.target.value = '';
                            }} />
                    </label>}
                    <Textarea aria-label={t(source === 'nodes' ? 'nodeLinksOrJSON' : 'subscriptionURL')}
                        className="min-h-[25dvh] font-mono" value={text} disabled={pending || successful > 0}
                        onChange={event => changeText(event.target.value)}
                        placeholder={source === 'nodes' ? 'ss://…\ntrojan://…\n[{"name":"…","chain":[…]}]' : 'https://example.com/sub/…'} />
                    {source === 'subscription' && <SettingInputVertical className="mt-3" label={t('subscriptionNameOptional')}
                        value={subscriptionName} disabled={pending} onChange={setSubscriptionName} />}
                    {nodes && <>
                        <p role="status" className="my-3 text-sm">{uiT('importProgress', { success: successful, total: nodes.length, failed })}</p>
                        <ul className="max-h-48 space-y-1 overflow-auto text-sm">
                            {nodes.map(node => <li key={node.id} className="break-words">{node.name} · {node.chain.map(step => step.type).join(' → ')}</li>)}
                        </ul>
                        <SettingSelectVertical className="mt-3" label={t('defaultAfterImport')} value={defaultID} disabled={pending}
                            values={[[t('keepDefaultDestination'), ''], ...nodes.filter(node => node.enabled).map(node => [node.name, node.id] as [string, string])]}
                            onChange={setDefaultID} />
                    </>}
                    {issues.length > 0 && <div role="alert" className="mt-3 text-sm text-ui-danger">
                        <p>{t('importInvalidItems')}</p>
                        <ul>{issues.map((issue, index) => <li key={index}>{t('importLine', { line: issue.line })}: {issue.message}</li>)}</ul>
                    </div>}
                    {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{error}</p>}
                    {failed > 0 && <ul className="mt-3 space-y-2 text-sm text-ui-danger">
                        {results.map((result, index) => result?.status === 'failed' && <li key={index} className="break-words">{nodes?.[index].name}: {result.error}</li>)}
                    </ul>}
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline-secondary" onClick={close} disabled={pending}>{uiT('close')}</Button>
                    {source === 'subscription' ? <Button onClick={subscribe} disabled={pending || !text.trim()}>{pending && <Spinner size="sm" className="mr-2" />}{t('addAndFetchSubscription')}</Button>
                        : nodes?.length ? <Button onClick={save} disabled={pending}>{pending && <Spinner size="sm" className="mr-2" />}{failed ? uiT('retryFailedItems') : t(issues.length ? 'importValidNodes' : 'importNodes')}</Button>
                            : <Button onClick={preview} disabled={pending || !text.trim()}>{pending && <Spinner size="sm" className="mr-2" />}{t('previewImport')}</Button>}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
