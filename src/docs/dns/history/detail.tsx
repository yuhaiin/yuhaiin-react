import { getDNSHistoryRecord, type DNSHistoryRecord, type DNSResourceRecord } from "@/api/dns-history";
import { can } from "@/auth/session";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { DataListCustomItem, DataListItem, DataSection } from "@/component/v2/datalist";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { navigation } from "@/hooks/navigation";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { clientAddress, formatLatency, outcomeBadge } from "./format";

/** The FakeIP mapping list, searched for this address. */
export function fakeIPEntryLocation(ip: string) {
    return `/docs/bypass/resolver?tab=fakeip&fakeip=${encodeURIComponent(ip)}`;
}

function RecordSection({ title, records, omitted }: { title: string; records?: DNSResourceRecord[]; omitted?: number }) {
    const { t } = useTranslation("dns");
    if (!records?.length && !omitted) return null;
    return <DataSection title={`${title} (${(records?.length ?? 0) + (omitted ?? 0)})`}>
        {(records ?? []).map((record, index) => <DataListCustomItem key={index}>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <Badge variant="secondary" className="font-mono">{record.type}</Badge>
                <span className="text-xs tabular-nums text-ui-muted">{t("detail.ttl", { ttl: record.ttl })}</span>
                {record.class !== "IN" && <span className="text-xs text-ui-muted">{record.class}</span>}
                <span className="min-w-0 break-all text-xs text-ui-muted">{record.name || "."}</span>
            </div>
            <div className="mt-1 break-all font-mono text-sm text-ui-heading">{record.data || "—"}{record.dataTruncated && <span className="ml-1 text-xs text-ui-warning">{t("detail.dataTruncated")}</span>}</div>
        </DataListCustomItem>)}
        {Boolean(omitted) && <DataListCustomItem><span className="text-xs text-ui-warning">{t("detail.recordsOmitted", { count: omitted })}</span></DataListCustomItem>}
    </DataSection>;
}

function Flags({ record }: { record: DNSHistoryRecord }) {
    const flags = record.flags;
    if (!flags) return null;
    const set = (["aa", "tc", "rd", "ra", "ad", "cd"] as const).filter(flag => flags[flag]);
    return <span className="inline-flex flex-wrap justify-end gap-1">{set.length ? set.map(flag => <Badge key={flag} variant="secondary" className="font-mono uppercase">{flag}</Badge>) : "—"}</span>;
}

export function DNSHistoryDetail({ summary, onClose }: { summary?: DNSHistoryRecord; onClose: () => void }) {
    const { t } = useTranslation("dns");
    const id = summary?.id;
    const { data, error, isLoading, mutate } = useSWR(id ? ["/api/v2/dns/history/get", id] : null, () => getDNSHistoryRecord(id!), { revalidateOnFocus: false });
    const record = data ?? summary;
    const value = (v?: string | number | boolean) => v === undefined || v === "" || v === 0 ? undefined : String(v);
    const yesNo = (v?: boolean) => t(v ? "detail.yes" : "detail.no");
    const label = (group: string, key?: string) => key ? t(`${group}.${key}`, { defaultValue: key }) : undefined;
    const fakeip = record?.fakeip;
    const canOpenFakeIP = can("resolver:read");
    return <Modal open={Boolean(summary)} onOpenChange={open => !open && onClose()}>
        <ModalContent width={720}>
            <ModalHeader closeButton><ModalTitle className="min-w-0 break-all font-bold">{record?.domain || t("detail.unknownDomain")}</ModalTitle></ModalHeader>
            <ModalBody className="space-y-4">
                {record && <>
                    <DataSection title={t("detail.request")}>
                        <DataListItem label={t("detail.domain")} value={record.domain || t("detail.notParsed")} />
                        <DataListItem label={t("detail.queryType")} value={record.queryType} />
                        <DataListItem label={t("detail.queryClass")} value={record.queryClass} />
                        <DataListItem label={t("detail.transactionId")} value={record.domain ? `0x${record.transactionId.toString(16).padStart(4, "0")}` : undefined} />
                        <DataListItem label={t("detail.transport")} value={record.transport.toUpperCase()} />
                        <DataListItem label={t("detail.requestSize")} value={t("detail.bytes", { count: record.requestSize })} />
                        <DataListItem label={t("detail.timestamp")} value={new Date(record.createdAt).toLocaleString()} />
                        {record.details && <DataListItem label={t("detail.requestFlags")} value={[record.details.requestRd && "RD", record.details.requestCd && "CD", record.details.requestAd && "AD", record.details.requestDo && "DO"].filter(Boolean).join(" ") || undefined} />}
                        <DataListItem label={t("detail.udpSize")} value={value(record.details?.requestUdpSize)} />
                    </DataSection>
                    <DataSection title={t("detail.client")}>
                        <DataListItem label={t("detail.sourceAddress")} value={clientAddress(record) || undefined} />
                        <DataListItem label={t("detail.sourceType")} value={label("source", record.sourceType)} />
                        <DataListItem label={t("detail.inbound")} value={record.inboundName || record.inboundId || undefined} />
                        <DataListItem label={t("detail.process")} value={record.processName || undefined} />
                        <DataListItem label={t("detail.pidUid")} value={record.pid || record.uid ? `${record.pid ?? 0} / ${record.uid ?? 0}` : undefined} />
                        <DataListItem label={t("detail.user")} value={[record.userId, record.credentialId].filter(Boolean).join(" · ") || undefined} />
                        <DataListItem label={t("detail.groups")} value={record.groupIds?.join(", ")} />
                    </DataSection>
                    <DataSection title={t("detail.resolver")}>
                        <DataListItem label={t("detail.resolverName")} value={record.resolverLabel || record.resolver || undefined} />
                        <DataListItem label={t("detail.server")} value={record.server || undefined} />
                        <DataListItem label={t("detail.serverType")} value={[record.serverType, record.details?.serverTransport && record.details.serverTransport !== record.serverType ? record.details.serverTransport : ""].filter(Boolean).join(" · ") || undefined} />
                        <DataListItem label={t("detail.routeMode")} value={record.routeMode || undefined} />
                        <DataListItem label={t("detail.matchedRule")} value={record.routeRuleName || record.routeRuleId || undefined} />
                        <DataListItem label={t("detail.selectionReason")} value={label("reason", record.details?.selectionReason)} />
                        <DataListItem label={t("detail.cacheStatus")} value={`${label("cache", record.cacheStatus)}${record.details?.cacheStale ? ` · ${t("detail.stale")}` : ""}${record.details?.sharedQuery ? ` · ${t("detail.shared")}` : ""}`} />
                        <DataListItem label={t("detail.resolutionSource")} value={label("resolution", record.resolutionSource)} />
                        <DataListItem label={t("detail.hostsRewrite")} value={record.details?.hostsRewrite} />
                        <DataListItem label={t("detail.admission")} value={label("admission", record.details?.admission)} />
                        <DataListItem label={t("detail.queueWait")} value={record.details?.queueWaitNs ? formatLatency(record.details.queueWaitNs) : undefined} />
                    </DataSection>
                    {fakeip && <DataSection title={t("detail.fakeip")}>
                        <DataListItem label={t("detail.fakeipRequested")} value={yesNo(fakeip.requested)} />
                        <DataListItem label={t("detail.fakeipReturned")} value={yesNo(fakeip.returned)} />
                        <DataListItem label="IPv4" value={fakeip.ipv4} />
                        <DataListItem label="IPv6" value={fakeip.ipv6} />
                        <DataListItem label={t("detail.fakeipPool")} value={[fakeip.poolIpv4, fakeip.poolIpv6].filter(Boolean).join(", ") || undefined} />
                        <DataListItem label={t("detail.fakeipReason")} value={label("fakeipReason", fakeip.reason)} />
                        <DataListItem label={t("detail.fakeipAllocation")} value={label("fakeipAllocation", fakeip.allocation)} />
                        <DataListItem label={t("detail.fakeipInputs")} value={[fakeip.force && t("detail.fakeipForce"), fakeip.global && t("detail.fakeipGlobal"), fakeip.skipCheck && t("detail.fakeipSkipCheck")].filter(Boolean).join(" · ") || undefined} />
                        <DataListItem label={t("detail.error")} value={fakeip.error} />
                        {fakeip.returned && canOpenFakeIP && <DataListCustomItem>
                            <div className="flex flex-wrap justify-end gap-2">
                                {[fakeip.ipv4, fakeip.ipv6].filter(Boolean).map(ip => <Button key={ip} size="sm" variant="outline-secondary" onClick={() => { onClose(); navigation.push(fakeIPEntryLocation(ip!)); }}>
                                    <ExternalLink size={14} aria-hidden="true" />{t("detail.openFakeIP", { ip })}
                                </Button>)}
                            </div>
                        </DataListCustomItem>}
                    </DataSection>}
                    <DataSection title={t("detail.response")}>
                        <DataListItem label={t("detail.rcode")} value={record.rcode || t("detail.noResponse")} />
                        <DataListItem label={t("detail.flags")} value={record.flags ? <Flags record={record} /> : undefined} />
                        <DataListItem label={t("detail.responseSize")} value={record.responseSize ? t("detail.bytes", { count: record.responseSize }) : undefined} />
                        <DataListItem label={t("detail.sentBytes")} value={record.rcode ? t("detail.bytes", { count: record.sentBytes }) : undefined} />
                        {record.flags?.serverTruncated && <DataListCustomItem><span className="text-xs text-ui-warning">{t("detail.serverTruncated")}</span></DataListCustomItem>}
                    </DataSection>
                    {isLoading && !data && <Loading />}
                    {error && !data && <Loading code={error.code} onRetry={() => void mutate()}>{error.msg ?? String(error)}</Loading>}
                    <RecordSection title={t("detail.answer")} records={record.answer} omitted={record.flags?.answerOmitted} />
                    <RecordSection title={t("detail.authority")} records={record.authority} omitted={record.flags?.authorityOmitted} />
                    <RecordSection title={t("detail.additional")} records={record.additional} omitted={record.flags?.additionalOmitted} />
                    <DataSection title={t("detail.diagnostics")}>
                        <DataListItem label={t("detail.outcome")} value={<Badge variant={outcomeBadge(record.outcome)}>{label("outcome", record.outcome)}</Badge>} />
                        <DataListItem label={t("detail.failureStage")} value={label("stage", record.failureStage)} />
                        <DataListItem label={t("detail.failureReason")} value={label("failure", record.failureReason)} />
                        <DataListItem label={t("detail.error")} value={record.error || undefined} />
                        <DataListItem label={t("detail.duration")} value={formatLatency(record.durationNs)} />
                    </DataSection>
                    {Boolean(record.details?.attempts?.length) && <DataSection title={t("detail.attempts")}>
                        {record.details!.attempts!.map((attempt, index) => <DataListCustomItem key={index}>
                            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                                <span className="min-w-0 break-all text-sm text-ui-heading">{index + 1}. {attempt.resolver}{attempt.server ? ` · ${attempt.server}` : ""}</span>
                                <Badge variant={attempt.result === "success" ? "success" : attempt.result === "truncated" ? "warning" : "danger"}>{label("attempt", attempt.result)}</Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-3 text-xs tabular-nums text-ui-muted">
                                {attempt.transport && <span>{attempt.transport}</span>}
                                <span>{t("detail.attemptStart", { offset: formatLatency(attempt.offsetNs) })}</span>
                                <span>{formatLatency(attempt.durationNs)}</span>
                                {attempt.rcode && <span>{attempt.rcode}</span>}
                            </div>
                            {attempt.error && <div className="mt-1 break-all text-xs text-ui-danger">{attempt.error}</div>}
                        </DataListCustomItem>)}
                    </DataSection>}
                </>}
            </ModalBody>
            <ModalFooter className="border-0 max-md:hidden"><Button className="w-full" onClick={onClose}>{t("detail.close")}</Button></ModalFooter>
        </ModalContent>
    </Modal>;
}
