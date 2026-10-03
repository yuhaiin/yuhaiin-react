import { useTranslation } from 'react-i18next';
import { createNode } from '@/api/nodes';
import { Button } from '@/component/v2/button';
import { Textarea } from '@/component/v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import type { Node } from '@/contract/node';
import { useEffect, useRef, useState } from 'react';
import { importNodeBatch, parseNodeImport, type ImportResult } from './node-import';

export default function NodeImportModal({ show, group, onHide, onSaved, onChanged }: {
    show: boolean; group: string; onHide: () => void; onSaved: () => void; onChanged: () => void;
}) {
    const { t: uiT } = useTranslation('ui');

    const [text, setText] = useState('');
    const [nodes, setNodes] = useState<Node[]>();
    const [results, setResults] = useState<Array<ImportResult | undefined>>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const locked = useRef(false);
    useEffect(() => {
        if (show) { setText(''); setNodes(undefined); setResults([]); setError(''); }
    }, [show]);
    const successful = results.filter(result => result?.status === 'success').length;
    const failed = results.filter(result => result?.status === 'failed').length;
    const close = () => { if (!locked.current) onHide(); };
    const save = async () => {
        if (locked.current) return;
        let batch: Node[];
        try { batch = nodes ?? parseNodeImport(text, group); }
        catch (error) { setError(error instanceof Error ? error.message : String(error)); return; }
        locked.current = true;
        setSaving(true);
        setError('');
        setNodes(batch);
        try {
            const next = await importNodeBatch(batch, createNode, results, setResults);
            if (next.some(result => result.status === 'success')) onChanged();
            if (next.every(result => result.status === 'success')) onSaved();
        } finally { locked.current = false; setSaving(false); }
    };
    return (
        <Modal open={show} onOpenChange={open => !open && close()}>
            <ModalContent width={800}>
                <ModalHeader closeButton><ModalTitle>{uiT("importJson")}</ModalTitle></ModalHeader>
                <ModalBody>
                    <Textarea aria-label={uiT("nodeJson")} className="min-h-[40dvh] sm:min-h-[55vh] font-mono" value={text}
                        disabled={saving || successful > 0}
                        onChange={event => { setText(event.target.value); setError(''); setNodes(undefined); setResults([]); }}
                        placeholder='{"name":"node-name","group":"manual","chain":[{"type":"direct","direct":{}}]}' />
                    {nodes && <p role="status" className="mt-3 text-sm">{uiT("importProgress", { success: successful, total: nodes.length, failed })}</p>}
                    {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{error}</p>}
                    {failed > 0 && <ul className="mt-3 space-y-2 text-sm text-ui-danger">
                        {results.map((result, index) => result?.status === 'failed' && <li key={index} className="break-words">{nodes?.[index].name}: {result.error}</li>)}
                    </ul>}
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline-secondary" onClick={close} disabled={saving}>{uiT("close")}</Button>
                    <Button onClick={() => void save()} disabled={saving || !text.trim()}>
                        {saving && <Spinner size="sm" className="mr-2" />}
                        {uiT(failed ? 'retryFailedItems' : 'import')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
