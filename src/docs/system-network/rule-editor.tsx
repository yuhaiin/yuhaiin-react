import { Button } from '@/component/v2/button';
import { SettingInputVertical, SwitchCard } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { cn, ui } from '@/component/v2/styles';
import { matchError, targetError, type RouteRule, type SystemNetworkCapabilities, type SystemNetworkInterfaces } from '@/contract/system-network';
import type { Go } from '@/api/generated-contracts';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteMatchEditor } from './match-editor';
import { TargetPicker } from './target-picker';

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
    return <section className="grid min-w-0 gap-3">
        <h3 className={cn(ui.sectionTitle, 'flex items-center gap-2')}>
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ui-primary text-xs text-ui-primary-foreground">{n}</span>{title}
        </h3>
        {children}
    </section>;
}

/**
 * Edits one route rule: first where traffic goes, then which destinations.
 * Changes stay in the page draft until the page is saved.
 */
export function RouteRuleEditor({ rule, isNew, capabilities, interfaces, preview, onSave, onClose }: {
    rule: RouteRule;
    isNew: boolean;
    capabilities: SystemNetworkCapabilities;
    interfaces?: SystemNetworkInterfaces;
    preview?: Go.sysnet.RulePreview;
    onSave: (rule: RouteRule) => void;
    onClose: () => void;
}) {
    const { t } = useTranslation('systemNetwork');
    const [draft, setDraft] = useState(rule);
    const problem = targetError(draft.target) ?? matchError(draft.match);
    return <Modal open onOpenChange={open => !open && onClose()}>
        <ModalContent width={760}>
            <ModalHeader closeButton><ModalTitle>{t(isNew ? 'editor.titleNew' : 'editor.titleEdit')}</ModalTitle></ModalHeader>
            <ModalBody className="@container grid min-w-0 gap-6">
                <SettingInputVertical label={t('editor.name')} value={draft.name} placeholder={t('editor.namePlaceholder')}
                    onChange={name => setDraft({ ...draft, name })} />
                <Step n={1} title={t('editor.stepTarget')}>
                    <TargetPicker value={draft.target} types={capabilities.routeTargets} interfaces={interfaces}
                        onChange={target => setDraft({ ...draft, target })} />
                </Step>
                <Step n={2} title={t('editor.stepMatch')}>
                    <RouteMatchEditor value={draft.match} onChange={match => setDraft({ ...draft, match })} />
                </Step>
                <details>
                    <summary className="cursor-pointer text-sm text-ui-muted">{t('editor.advanced')}</summary>
                    <div className="mt-3 grid gap-3">
                        <SettingInputVertical label={t('editor.priority')} type="number" min={0} max={65535} value={String(draft.priority)}
                            onChange={value => setDraft({ ...draft, priority: Math.max(0, Math.min(65535, Math.trunc(Number(value) || 0))) })} />
                        <p className="text-xs text-ui-muted">{t('editor.priorityHelp')}</p>
                        <SwitchCard label={t('editor.enabled')} checked={draft.enabled} onCheckedChange={enabled => setDraft({ ...draft, enabled })} />
                    </div>
                </details>
                {preview && !problem && <p role="status" className={cn(ui.softPanel, 'p-3 text-sm text-ui-fg')}>
                    {t('routing.previewRoutes', { v4: preview.ipv4Routes, v6: preview.ipv6Routes })}
                    {preview.shadowed && <span className="mt-1 block text-ui-warning">{t('routing.shadowed', { names: preview.overriddenBy?.join(', ') })}</span>}
                </p>}
                {problem && <p role="alert" className="text-sm text-ui-danger">{t(`editor.error.${problem}`)}</p>}
            </ModalBody>
            <ModalFooter className="flex flex-wrap justify-end gap-2">
                <Button variant="outline-secondary" onClick={onClose}>{t('editor.cancel')}</Button>
                <Button variant="primary" disabled={Boolean(problem)} onClick={() => onSave(draft)}>{t('editor.apply')}</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
