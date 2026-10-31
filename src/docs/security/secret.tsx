import { Button } from '@/component/v2/button';
import { useClipboard } from '@/component/v2/clipboard';
import { Textarea } from '@/component/v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { useTranslation } from 'react-i18next';
import type { Issued } from '@/auth/api';
export function IssuedSecret({ value, onClose }: { value: Pick<Issued, 'secret' | 'kind' | 'userId' | 'expiresAt'> & { scopes?: string[] }; onClose: () => void }) {
    const { t } = useTranslation('auth');
    const clipboard = useClipboard({ usePromptAsFallback: true });
    return <Modal open onOpenChange={open => { if (!open) onClose(); }}><ModalContent>
        <ModalHeader><ModalTitle>{t(value.kind === 'enrollment' ? 'enrollmentCapability' : value.kind === 'proxy' ? 'proxyCredentialCreated' : 'tokenCreated')}</ModalTitle></ModalHeader>
        <ModalBody className="space-y-3">
            <p className="text-sm text-ui-muted">{t('copyOnce')}</p>
            <label className="block space-y-2"><span>{t('secret')}</span><Textarea code readOnly value={value.secret} rows={3} onFocus={event => event.target.select()} className="break-all" /></label>
            <dl className="space-y-2 text-sm text-ui-muted"><dt>{t('owner')}</dt><dd className="break-all">{value.userId}</dd><dt>{t('scopes')}</dt><dd>{value.scopes?.join(', ') || t('enrollmentOnly')}</dd><dt>{t('expires')}</dt><dd>{value.expiresAt ? new Date(value.expiresAt * 1000).toLocaleString() : t('never')}</dd></dl>
            {clipboard.manualCopyModal}
        </ModalBody>
        <ModalFooter><Button onClick={() => void clipboard.copy(value.secret)}>{t(clipboard.copied ? 'copied' : 'copy')}</Button><Button onClick={onClose}>{t('done')}</Button></ModalFooter>
    </ModalContent></Modal>;
}
