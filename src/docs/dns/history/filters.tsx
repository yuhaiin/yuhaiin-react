import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { Input } from "@/component/v2/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Select } from "@/component/v2/select";
import Switch from "@/component/v2/switch";
import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { emptyFilters, failedOutcomes, outcomes, queryTypes, timeRanges, type FilterState, type TimeRangeKey } from "./format";

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
    const id = useId();
    return <div className="min-w-0"><SettingLabel htmlFor={id}>{label}</SettingLabel>{children(id)}</div>;
}

/**
 * Edits a draft so text fields do not query on every keystroke; Apply sends
 * all filters at once and restarts the list at the newest records.
 */
export function DNSHistoryFilters({ open, onOpenChange, value, onApply, inbounds }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: FilterState;
    onApply: (filters: FilterState) => void;
    /** Inbound choices when the viewer may read inbounds; otherwise a free ID field. */
    inbounds?: { id: string; name: string }[];
}) {
    const { t } = useTranslation("dns");
    return <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent width={640}>
            {/* Content mounts per opening, so each opening starts from the applied filters. */}
            <FiltersForm value={value} onApply={onApply} inbounds={inbounds} title={t("filters.title")} />
        </ModalContent>
    </Modal>;
}

function FiltersForm({ value, onApply, inbounds, title }: { value: FilterState; onApply: (filters: FilterState) => void; inbounds?: { id: string; name: string }[]; title: string }) {
    const { t } = useTranslation("dns");
    const [draft, setDraft] = useState(value);
    const set = <K extends keyof FilterState>(key: K, next: FilterState[K]) => setDraft(previous => ({ ...previous, [key]: next }));
    const any = { value: "", label: t("filters.any") };
    const outcomeItems = [any, { value: failedOutcomes.join(","), label: t("filters.allErrors") }, ...outcomes.map(outcome => ({ value: outcome, label: t(`outcome.${outcome}`) }))];
    return <>
        <ModalHeader closeButton><ModalTitle>{title}</ModalTitle></ModalHeader>
        <ModalBody>
            <form id="dns-history-filters" className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); onApply(draft); }}>
                <Field label={t("filters.domain")}>{id => <Input id={id} value={draft.domain} placeholder="example.com" autoComplete="off" spellCheck={false} onChange={event => set("domain", event.target.value)} />}</Field>
                <Field label={t("filters.timeRange")}>{() => <Select ariaLabel={t("filters.timeRange")} value={draft.range} onValueChange={next => set("range", next as TimeRangeKey)}
                    items={timeRanges.map(range => ({ value: range.key, label: t(`range.${range.key}`) }))} />}</Field>
                <Field label={t("filters.queryType")}>{() => <Select ariaLabel={t("filters.queryType")} value={draft.queryType} onValueChange={next => set("queryType", next)}
                    items={[any, ...queryTypes.map(type => ({ value: type, label: type }))]} />}</Field>
                <Field label={t("filters.outcome")}>{() => <Select ariaLabel={t("filters.outcome")} value={draft.outcome} onValueChange={next => set("outcome", next)} items={outcomeItems} />}</Field>
                <Field label={t("filters.sourceType")}>{() => <Select ariaLabel={t("filters.sourceType")} value={draft.sourceType} onValueChange={next => set("sourceType", next)}
                    items={[any, { value: "local_dns", label: t("source.local_dns") }, { value: "dns_hijack", label: t("source.dns_hijack") }]} />}</Field>
                <Field label={t("filters.transport")}>{() => <Select ariaLabel={t("filters.transport")} value={draft.transport} onValueChange={next => set("transport", next)}
                    items={[any, { value: "udp", label: "UDP" }, { value: "tcp", label: "TCP" }]} />}</Field>
                <Field label={t("filters.inbound")}>{id => inbounds
                    ? <Select ariaLabel={t("filters.inbound")} value={draft.inboundId} onValueChange={next => set("inboundId", next)} items={[any, ...inbounds.map(item => ({ value: item.id, label: item.name || item.id }))]} />
                    : <Input id={id} value={draft.inboundId} autoComplete="off" spellCheck={false} onChange={event => set("inboundId", event.target.value)} />}</Field>
                <Field label={t("filters.process")}>{id => <Input id={id} value={draft.process} autoComplete="off" spellCheck={false} onChange={event => set("process", event.target.value)} />}</Field>
                <Field label={t("filters.resolver")}>{id => <Input id={id} value={draft.resolver} autoComplete="off" spellCheck={false} onChange={event => set("resolver", event.target.value)} />}</Field>
                <Field label={t("filters.server")}>{id => <Input id={id} value={draft.server} placeholder="1.1.1.1:53" autoComplete="off" spellCheck={false} onChange={event => set("server", event.target.value)} />}</Field>
                <div className="sm:col-span-2"><Switch label={t("filters.fakeipOnly")} description={t("filters.fakeipOnlyHelp")} checked={draft.fakeipOnly} onCheckedChange={next => set("fakeipOnly", next)} /></div>
            </form>
        </ModalBody>
        <ModalFooter>
            <Button variant="outline-secondary" onClick={() => setDraft(emptyFilters)}>{t("filters.reset")}</Button>
            {/* Filtering only reads: it must not inherit the page's write permission. */}
            <Button variant="primary" type="submit" form="dns-history-filters" permission="">{t("filters.apply")}</Button>
        </ModalFooter>
    </>;
}
