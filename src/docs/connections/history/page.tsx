import { PageHeader } from '@/component/v2/page-header';
import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

import { getAllHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { MainContainer } from "@/component/v2/card"
import { DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { HistoryList, HistoryListSkeleton, HistoryRow, HistoryToolbar, formatHistoryTime, formatProtocolLabel, historyToolbarButton, matchesHistorySearch } from "@/component/v2/history-list"
import type { AllHistory } from "@/contract/connection"
import { ArrowLeftRight, Info, ListFilter, Network, Radio, RefreshCw, ShieldCheck } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"
import { NodeModal } from "../../node/modal"
import { ConnectionInfo } from "../components"

const ListItem: FC<{ data: AllHistory }> = React.memo(({ data }) => {
    const { t: uiT } = useTranslation('ui');
    const connType = data.connection.network.connType;

    return (
        <HistoryRow
            icon={connType.startsWith("udp") ? Radio : ArrowLeftRight}
            title={data.connection.addr || "-"}
            subtitle={<>{uiT("idLabel")} {data.connection.id} • {formatProtocolLabel(connType)}</>}
            time={formatHistoryTime(new Date(data.time))}
            meta={[
                { icon: Network, text: formatProtocolLabel(connType), mobileOnly: true },
                { icon: ShieldCheck, text: formatProtocolLabel(data.connection.mode) },
                { icon: RefreshCw, text: uiT("eventCount", { count: Number(data.count) }), tone: "success" },
            ]}
        />
    );
});

function History() {
    const { t: uiT } = useTranslation('ui');

    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [networkFilter, setNetworkFilter] = useState("all");
    const [modalData, setModalData] = useState<{ show: boolean, data?: AllHistory }>({ show: false });
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/connections/history", getAllHistory);

    const values = useMemo(() => {
        const items = data?.items ?? [];
        return [...items]
            .filter(v => {
                if (networkFilter !== "all" && v.connection.network.connType !== networkFilter) return false;
                return matchesHistorySearch(filter, v.connection.addr, v.connection.process);
            })
            .sort((a, b) => {
                const dir = sortOrder === "asc" ? 1 : -1;
                if (sortBy === "Host") return a.connection.addr.localeCompare(b.connection.addr) * dir;
                if (sortBy === "Count") return (Number(a.count) - Number(b.count)) * dir;
                return (new Date(a.time).getTime() - new Date(b.time).getTime()) * dir;
            });
    }, [data, filter, networkFilter, sortBy, sortOrder]);

    const networkOptions = useMemo(() => {
        const values = new Set((data?.items ?? []).map(item => item.connection.network.connType).filter(Boolean));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [data]);

    const pageSize = 30;
    const resetKey = JSON.stringify([filter, networkFilter, sortBy, sortOrder]);
    const { page, setPage } = usePagination(values.length, pageSize, resetKey);

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>

    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);
    const networkLabel = networkFilter === "all" ? uiT("allNetworks") : formatProtocolLabel(networkFilter);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />
            <Modal open={modalData.show} onOpenChange={(open) => !open && setModalData(prev => ({ ...prev, show: false }))}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton><ModalTitle className="font-bold">{uiT("sessionDetail")}</ModalTitle></ModalHeader>
                    <ModalBody>
                        {modalData.data && (
                            <ConnectionInfo
                                value={modalData.data.connection}
                                showNodeModal={(id) => setNodeModal({ show: true, id })}
                                startContent={<>
                                    <DataListItem label={uiT("totalCount")} value={modalData.data.count} />
                                    <DataListItem label={uiT("lastActivity")} value={new Date(modalData.data.time).toLocaleString()} />
                                </>}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter className="border-0 max-md:hidden"><Button className="w-full" onClick={() => setModalData(prev => ({ ...prev, show: false }))}>{uiT("close")}</Button></ModalFooter>
                </ModalContent>
            </Modal>

            <PageHeader
                title={uiT("connectionHistory")}
                className="mb-4"
                stickyActions
                description={<span className="flex min-h-4 items-center text-xs">{data && <><Info className="mr-1.5" size={14} /><span>{uiT("historyCount", { count: values.length })}</span></>}</span>}
                actions={<HistoryToolbar
                    onSearch={setFilter}
                    filter={<Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm" variant="outline-secondary" className={`relative ${historyToolbarButton}`} aria-label={networkLabel}>
                                <ListFilter className="lg:hidden" size={16} />
                                <span className="hidden lg:inline">{networkLabel}</span>
                                {networkFilter !== "all" && <span aria-hidden="true" className="absolute top-2 right-2 size-1.5 rounded-full bg-ui-primary lg:hidden" />}
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="min-w-[160px] max-w-[220px]">
                            <DropdownRadioGroup value={networkFilter} onValueChange={setNetworkFilter}>
                                <DropdownRadioItem value="all">{uiT("allNetworks")}</DropdownRadioItem>
                                {networkOptions.map(option => (
                                    <DropdownRadioItem key={option} value={option}>{formatProtocolLabel(option)}</DropdownRadioItem>
                                ))}
                            </DropdownRadioGroup>
                        </DropdownContent>
                    </Dropdown>}
                    onRefresh={() => void mutate()}
                    refreshing={isValidating}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOptions={[
                        { value: "Time", label: uiT("time") },
                        { value: "Host", label: uiT("host") },
                        { value: "Count", label: uiT("count") },
                    ]}
                />}
            />

            {isLoading || data === undefined ? <HistoryListSkeleton /> : <HistoryList
                items={paginatedItems}
                getKey={(v) => `${v.connection.id}-${v.time}`}
                onClickItem={(v) => setModalData({ show: true, data: v })}
                renderRow={(v) => <ListItem data={v} />}
                page={page}
                totalItems={values.length}
                pageSize={pageSize}
                onPageChange={setPage}
                resetKey={resetKey}
            />}
        </MainContainer>
    );
}

export default History;
