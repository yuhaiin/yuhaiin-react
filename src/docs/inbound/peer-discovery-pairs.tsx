import { listPeerDiscoveryPairs, updatePeerDiscoveryPair } from "@/api/inbounds";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { confirmAction } from "@/component/v2/confirmation";
import { Pagination } from "@/component/v2/pagination";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { clampPage } from "@/hooks/use-pagination";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const PAGE_SIZE = 12;

export function PeerDiscoveryPairs({ id }: { id: string }) {
    const { t: uiT } = useTranslation("ui");
    const [open, setOpen] = useState(false);
    const [requestedPage, setPage] = useState(1);
    const [actionFailed, setActionFailed] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(
        open ? ["peer-discovery-pairs", id] : null, () => listPeerDiscoveryPairs(id),
        { refreshInterval: 5_000, revalidateOnFocus: false, shouldRetryOnError: false },
    );
    const { pending, run } = useAsyncAction(() => setActionFailed(true));
    const apply = (pairId: string, action: "kick" | "block" | "unblock") => {
        void run(async () => {
            if (action !== "unblock" && !await confirmAction(uiT(action === "kick" ? "peerTunnel.kickConfirm" : "peerTunnel.blockConfirm"))) return;
            setActionFailed(false);
            await updatePeerDiscoveryPair(id, pairId, action);
            await mutate();
        });
    };
    const total = data?.items.length ?? 0;
    const page = clampPage(requestedPage, total, PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;

    return <details className="min-w-0 rounded-ui-md border border-ui-border px-3 py-2" onToggle={event => setOpen(event.currentTarget.open)}>
        <summary className="cursor-pointer text-sm font-medium text-ui-heading">{uiT("peerTunnel.pairings")}</summary>
        {open && <div className="mt-3 grid gap-3">
            {error ? <p role="alert" className="text-sm text-ui-danger">{uiT("peerTunnel.peerListFailed")} <Button size="sm" onClick={() => void mutate()}>{uiT("refresh")}</Button></p> :
                isLoading ? <p role="status" className="text-sm text-ui-muted">{uiT("loading")}</p> :
                data && <>
                    <p className="text-sm text-ui-muted">{uiT(data.running ? "peerTunnel.pairingHelp" : "peerTunnel.pairsInactive")}</p>
                    <ul className="grid gap-2">
                        {data.items.slice(start, start + PAGE_SIZE).map((pair, index) => <li key={pair.id} className="grid min-w-0 gap-2 rounded-ui-md border border-ui-border p-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{uiT("peerTunnel.pairNumber", { number: start + index + 1 })}</span>
                                <code className="text-xs text-ui-muted" title={pair.id}>{pair.id.slice(0, 12)}</code>
                                {pair.blocked && <Badge variant="danger">{uiT("peerTunnel.peerState.blocked")}</Badge>}
                                {!pair.blocked && pair.retryAt && <Badge variant="warning">{uiT("peerTunnel.peerState.kicked")}</Badge>}
                            </div>
                            <dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                                <dt className="text-ui-muted">{uiT("peerTunnel.dialer")}</dt><dd className="break-all font-mono">{pair.dialerEndpoint ?? uiT("peerTunnel.peerState.offline")}</dd>
                                <dt className="text-ui-muted">{uiT("peerTunnel.publisher")}</dt><dd className="break-all font-mono">{pair.publisherEndpoint ?? uiT("peerTunnel.peerState.offline")}</dd>
                            </dl>
                            <div className="flex flex-wrap gap-2">
                                {!pair.blocked && <Button permission="inbounds:write" size="sm" disabled={pending || !data.running || (!pair.dialerEndpoint && !pair.publisherEndpoint)} onClick={() => apply(pair.id, "kick")}>{uiT("peerTunnel.kick")}</Button>}
                                <Button permission="inbounds:write" size="sm" disabled={pending} onClick={() => apply(pair.id, pair.blocked ? "unblock" : "block")}>{uiT(pair.blocked ? "peerTunnel.unblock" : "peerTunnel.block")}</Button>
                            </div>
                        </li>)}
                    </ul>
                    {total > PAGE_SIZE && <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
                </>}
            {actionFailed && <p role="alert" className="text-sm text-ui-danger">{uiT("peerTunnel.pairActionFailed")}</p>}
        </div>}
    </details>;
}
