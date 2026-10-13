import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';

/** Keep the node form's workflow independent of whether it is shown in a dialog or workspace. */
export function NodeEditorSurface({ presentation, show, title, dirty, onClose, children, footer }: {
    presentation: 'modal' | 'inline';
    show: boolean;
    title: string;
    dirty: boolean;
    onClose: () => void;
    children: ReactNode;
    footer: ReactNode;
}) {
    const { t } = useTranslation('routing');
    if (presentation === 'inline') {
        return <section aria-label={t('nodeSettings')} className="min-w-0">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ui-heading">{t('nodeSettings')}</h3>
                {dirty && <span role="status" className="text-xs text-ui-warning">{t('unsavedChanges')}</span>}
            </header>
            <div className="min-w-0">{children}</div>
            <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/60 pt-4">{footer}</footer>
        </section>;
    }
    return <Modal open={show} onOpenChange={open => !open && onClose()}>
        <ModalContent width={960}>
            <ModalHeader closeButton className="border-b-0 pb-0"><ModalTitle className="font-bold">{title}</ModalTitle></ModalHeader>
            <ModalBody className="pt-2">{children}</ModalBody>
            <ModalFooter className="flex justify-between">{footer}</ModalFooter>
        </ModalContent>
    </Modal>;
}
