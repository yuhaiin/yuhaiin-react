import { useClipboard } from "@/component/v2/clipboard";
import { Button } from "@/component/v2/button";
import { DataListItem, DataSection } from "@/component/v2/datalist";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { clsx } from "clsx";
import { Check, Copy } from "lucide-react";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { levelStyles, parseLogFields, parseLogLine, type LogEntry } from "./log-buffer";

/** Full view of one log line: every field, the message unwrapped, and the raw text to copy. */
export const LogDetailModal: FC<{ entry: LogEntry; open: boolean; onClose: () => void }> = ({ entry, open, onClose }) => {
    const { t } = useTranslation("config");
    const { t: uiT } = useTranslation("ui");
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });
    const parsed = useMemo(() => parseLogLine(entry.line), [entry]);
    const fields = useMemo(() => parseLogFields(parsed?.details), [parsed]);
    const style = levelStyles[parsed.level];

    return (
        <>
            <Modal open={open} onOpenChange={(open) => !open && onClose()}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton>
                        <ModalTitle className="font-bold">{t("log.details")}</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={clsx("inline-flex h-6 min-w-[56px] items-center justify-center rounded px-2 font-mono text-xs font-semibold ring-1", style.badge)}>
                                        {parsed.level}
                                    </span>
                                    {(parsed.time ?? parsed.displayTime) && (
                                        <span className="font-mono text-xs text-ui-muted">{parsed.time ?? parsed.displayTime}</span>
                                    )}
                                </div>
                                <pre className={clsx("max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-ui-md bg-ui-surface-muted p-3 font-mono text-[13px] leading-5 select-text", style.text)}>
                                    {parsed.message}
                                </pre>
                                {(parsed.source || fields.length > 0) && (
                                    <DataSection title={t("log.fields")}>
                                        <DataListItem label={t("log.source")} value={parsed.source} />
                                        {fields.map((field, index) => (
                                            <DataListItem key={`${field.key}:${index}`} label={field.key} value={<span className="whitespace-pre-wrap font-mono text-[13px]">{field.value}</span>} />
                                        ))}
                                    </DataSection>
                                )}
                                <details className="group rounded-ui-md border border-ui-border">
                                    <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-ui-muted">{t("log.raw")}</summary>
                                    <pre className="m-0 max-h-60 overflow-auto whitespace-pre-wrap break-all border-t border-ui-border p-3 font-mono text-[12px] leading-5 text-ui-heading select-text">{entry.line}</pre>
                                </details>
                            </div>
                    </ModalBody>
                    <ModalFooter className="border-0 gap-2">
                        <Button className="flex-1" variant="outline-secondary" onClick={() => void copy(entry.line)}>
                            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                            {copied ? t("log.copied") : t("log.copyLine")}
                        </Button>
                        <Button className="flex-1 max-md:hidden" onClick={onClose}>{uiT("close")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {manualCopyModal}
        </>
    );
};
