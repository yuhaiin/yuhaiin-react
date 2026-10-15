import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingSelectVertical } from "@/component/v2/forms";
import { Select } from "@/component/v2/select";
import { Activity, Download, Maximize2, Minimize2, Play, Square, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PprofWASMGraph } from "./graph-wasm";

type ProfileKind = "cpu" | "heap" | "allocs" | "goroutine" | "mutex" | "block";
type CaptureStatus = "running" | "completed" | "failed" | "cancelled";

type Session = {
    id: string;
    type: ProfileKind;
    seconds: number;
    status: CaptureStatus;
    createdAt: string;
    completedAt?: string;
    size: number;
    error?: string;
};

type SessionList = {
    enabled: boolean;
    sessions: Session[];
};

const types: ProfileKind[] = ["cpu", "heap", "allocs", "goroutine", "mutex", "block"];
const profileNames: Record<ProfileKind, string> = {
    cpu: "CPU",
    heap: "Heap",
    allocs: "Allocations",
    goroutine: "Goroutine",
    mutex: "Mutex",
    block: "Block",
};
const profileOptions: [string, string][] = types.map(type => [profileNames[type], type]);

function profilerErrorMessage(error: unknown, networkMessage: string): string {
    if (error instanceof TypeError) return networkMessage;
    if (error instanceof Error) return error.message;
    return String(error);
}
const descriptions: Record<ProfileKind, string> = {
    cpu: "profilerCpuDescription",
    heap: "profilerHeapDescription",
    allocs: "profilerAllocsDescription",
    goroutine: "profilerGoroutineDescription",
    mutex: "profilerMutexDescription",
    block: "profilerBlockDescription",
};

function profilerURL(path: string): string {
    const api = getApiUrl();
    const url = new URL(api || window.location.href);
    url.hash = "";
    url.pathname = path;
    url.search = "";
    return url.toString();
}

async function profilerRequest<T>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown): Promise<T> {
    const token = localStorage.getItem(AuthTokenKey);
    const response = await fetch(profilerURL(path), {
        method,
        headers: {
            ...(token ? { Authorization: `Basic ${token}` } : {}),
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            Accept: "application/json",
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message.trim() || `HTTP ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export default function PprofPage() {
    const { t } = useTranslation("ui");
    const [kind, setKind] = useState<ProfileKind>("cpu");
    const [seconds, setSeconds] = useState(30);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [enabled, setEnabled] = useState(true);
    const [pending, setPending] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [graphOpen, setGraphOpen] = useState(false);
    const [graphQuery, setGraphQuery] = useState("");
    const [viewerPage, setViewerPage] = useState<"flamegraph" | "top" | "peek">("flamegraph");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const viewerPanelRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const data = await profilerRequest<SessionList>("GET", "/api/v2/profiler/sessions");
        setEnabled(data.enabled);
        setSessions(data.sessions);
        setSelected(current => {
            if (current && data.sessions.some(item => item.id === current)) return current;
            return data.sessions.find(item => item.status === "completed")?.id ?? data.sessions[0]?.id ?? null;
        });
    }, []);

    useEffect(() => {
        // Defer the initial fetch so state updates never cascade from this effect.
        const timer = window.setTimeout(() => {
            void refresh().catch(e => setError(profilerErrorMessage(e, t("profilerConnectionError"))));
        }, 0);
        return () => window.clearTimeout(timer);
    }, [refresh, t]);

    const hasRunning = sessions.some(item => item.status === "running");
    useEffect(() => {
        if (!hasRunning) return;
        const poll = window.setInterval(() => {
            void refresh().catch(e => setError(profilerErrorMessage(e, t("profilerConnectionError"))));
        }, 1000);
        return () => window.clearInterval(poll);
    }, [hasRunning, refresh, t]);

    const current = useMemo(() => sessions.find(s => s.id === selected), [sessions, selected]);
    const viewer = current?.status === "completed"
        ? profilerURL("/debug/profiler/" + current.id + "/" + viewerPage + graphQuery)
        : null;

    useEffect(() => {
        const origin = new URL(profilerURL("/debug/profiler/")).origin;
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== origin || event.source !== iframeRef.current?.contentWindow ||
                !current || current.status !== "completed") return;
            const message = event.data;
            if (!message || typeof message !== "object" || message.type !== "yuhaiin:pprof-graph") return;
            const query = message.query;
            if (typeof query !== "string" || query.length > 4096 ||
                (query !== "" && !query.startsWith("?"))) return;
            setGraphQuery(query);
            setGraphOpen(true);
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [current]);

    const changeKind = (next: ProfileKind) => {
        setKind(next);
        setSeconds(next === "cpu" || next === "mutex" || next === "block" ? 30 : 0);
    };

    const capture = async () => {
        setPending(true);
        setError(null);
        try {
            const session = await profilerRequest<Session>("POST", "/api/v2/profiler/sessions", {
                type: kind, seconds,
            });
            setSelected(session.id);
            setGraphOpen(false);
            setGraphQuery("");
            setViewerPage("flamegraph");
            await refresh();
        } catch (e) {
            setError(profilerErrorMessage(e, t("profilerConnectionError")));
        } finally {
            setPending(false);
        }
    };

    const remove = async (id: string) => {
        setPending(true);
        setError(null);
        try {
            await profilerRequest<void>("DELETE", `/api/v2/profiler/sessions/${id}`);
            await refresh();
        } catch (e) {
            setError(profilerErrorMessage(e, t("profilerConnectionError")));
        } finally {
            setPending(false);
        }
    };

    const isSnapshot = seconds === 0;
    const canSnapshot = kind === "heap" || kind === "allocs" || kind === "goroutine";
    const canInterval = kind !== "goroutine";
    const durationOptions: [string, string][] = [
        ...(canSnapshot ? [[t("profilerSnapshot"), "0"] as [string, string]] : []),
        ...(canInterval ? [10, 30, 60].map(n => [`${n}s`, String(n)] as [string, string]) : []),
    ];
    const waiting = current?.status === "running";

    const enterFullscreen = () => {
        const panel = viewerPanelRef.current;
        if (!panel) return;
        // The CSS overlay remains available on iOS Safari or when the browser
        // denies requestFullscreen (for example, inside an embedded webview).
        setExpanded(true);
        if (typeof panel.requestFullscreen === "function") {
            void panel.requestFullscreen().catch(() => {});
        }
    };

    const exitFullscreen = () => {
        setExpanded(false);
        if (document.fullscreenElement === viewerPanelRef.current) {
            void document.exitFullscreen().catch(() => {});
        }
    };

    useEffect(() => {
        if (!expanded) return;
        const panel = viewerPanelRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setExpanded(false);
            if (document.fullscreenElement === panel) {
                void document.exitFullscreen().catch(() => {});
            }
        };
        const onFullscreenChange = () => {
            // The browser can also exit native fullscreen via Escape or its UI.
            if (document.fullscreenElement !== panel) {
                setExpanded(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.body.style.overflow = previousOverflow;
            if (document.fullscreenElement === panel) {
                void document.exitFullscreen().catch(() => {});
            }
        };
    }, [expanded]);

    return (
        <MainContainer className="flex h-full min-h-0 flex-col max-sm:h-auto max-sm:min-h-full">
            <Card noMargin className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden max-sm:overflow-visible">
                <CardHeader className="!block shrink-0 space-y-3 !px-3 !py-3 sm:space-y-4 sm:!px-5 sm:!py-4">
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Activity size={20} className="text-ui-muted" />
                            <h2 className="text-base font-semibold text-ui-heading">{t("profilerTitle")}</h2>
                        </div>
                        {current?.status === "completed" && (
                            <div className="flex items-center gap-1">
                                <Button variant="outline-secondary" size="icon" asChild>
                                    <a href={profilerURL(`/debug/profiler/${current.id}/download`)} download
                                        referrerPolicy="no-referrer"
                                        title={t("profilerDownload")} aria-label={t("profilerDownload")}>
                                        <Download size={16} />
                                    </a>
                                </Button>
                                <Button variant="outline-secondary" size="icon"
                                    title={t("profilerExpand")} aria-label={t("profilerExpand")}
                                    onClick={enterFullscreen}>
                                    <Maximize2 size={16} />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid w-full grid-cols-1 items-end gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(200px,320px)_minmax(180px,240px)_auto]">
                        <SettingSelectVertical
                            className="!mb-0 min-w-0"
                            label={t("profilerType")}
                            value={kind}
                            values={profileOptions}
                            onChange={value => changeKind(value as ProfileKind)}
                        />
                        <SettingSelectVertical
                            className="!mb-0 min-w-0"
                            label={t("profilerDuration")}
                            value={String(seconds)}
                            values={durationOptions}
                            onChange={value => setSeconds(Number(value))}
                        />
                        <Button variant="primary" className="h-field w-full justify-center sm:col-span-2 lg:col-span-1 lg:min-w-[150px]"
                            loading={pending}
                            disabled={!enabled || pending || (kind === "cpu" && sessions.some(s => s.type === "cpu" && s.status === "running"))}
                            onClick={() => void capture()}>
                            <Play size={16} />{t("profilerCapture")}
                        </Button>
                    </div>
                    <p className="text-xs text-ui-muted">
                        {t(descriptions[kind])} · {isSnapshot ? t("profilerSnapshot") : `${seconds}s`}
                    </p>
                    {error && <div role="alert" className="flex items-start gap-2 rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft px-3 py-2 text-sm text-ui-danger">
                        <TriangleAlert size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                    </div>}
                    {!enabled && <p role="status" className="w-full text-sm text-ui-danger">{t("profilerDisabled")}</p>}
                </CardHeader>

                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ui-border px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
                    <SettingLabel className="shrink-0 max-sm:sr-only">{t("profilerRecent")}</SettingLabel>
                    <div className="min-w-0 flex-1 basis-[170px] sm:max-w-[520px]">
                        <Select
                            size="sm"
                            ariaLabel={t("profilerRecent")}
                            value={selected ?? ""}
                            disabled={sessions.length === 0}
                            items={sessions.length === 0
                                ? [{ value: "", label: t("profilerNoSessions") }]
                                : sessions.map(session => ({
                                    value: session.id,
                                    label: `${profileNames[session.type]} · ${session.seconds ? `${session.seconds}s` : t("profilerSnapshot")} · ${new Date(session.createdAt).toLocaleTimeString()} (${session.status})`,
                                }))
                            }
                            onValueChange={value => {
                                setSelected(value || null);
                                setGraphOpen(false);
                                setGraphQuery("");
                                setViewerPage("flamegraph");
                            }}
                        />
                    </div>
                    {current?.status === "running" && (
                        <Button size="sm" variant="outline-danger" disabled={pending} onClick={() => void remove(current.id)}>
                            <Square size={14} />{t("profilerCancel")}
                        </Button>
                    )}
                    {current && current.status !== "running" && (
                        <Button size="icon" variant="outline-secondary" disabled={pending}
                            title={t("profilerDelete")} aria-label={t("profilerDelete")}
                            onClick={() => void remove(current.id)}>
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>

                <CardBody className="!p-0 flex min-w-0 min-h-[500px] flex-1 flex-col max-sm:min-h-[65dvh]">
                    <div ref={viewerPanelRef} data-testid="profiler-viewer-panel"
                        className={expanded
                            ? "fixed inset-0 z-[200] flex h-[100dvh] w-screen min-h-0 flex-col overflow-hidden bg-ui-surface"
                            : "flex min-h-0 min-w-0 flex-1 flex-col bg-ui-surface"}>
                        {expanded && (
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ui-border bg-ui-surface px-3 py-2 sm:px-4">
                                <span className="min-w-0 truncate text-sm font-semibold text-ui-heading">{t("profilerTitle")}</span>
                                <Button variant="outline-secondary" size="sm" onClick={exitFullscreen}
                                    title={t("profilerExitFullscreen")} aria-label={t("profilerExitFullscreen")}>
                                    <Minimize2 size={16} />{t("profilerExitFullscreen")}
                                </Button>
                            </div>
                        )}
                        {viewer && graphOpen && current ? (
                        <PprofWASMGraph
                            key={current.id}
                            sessionId={current.id}
                            initialQuery={graphQuery}
                            makeURL={profilerURL}
                            onNavigate={(nextView, query) => {
                                setViewerPage(nextView);
                                setGraphQuery(query);
                                setGraphOpen(false);
                            }}
                        />
                    ) : viewer ? (
                        <iframe ref={iframeRef} key={current?.id} src={viewer}
                            title={t("profilerTitle")} referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                            className={expanded
                                ? "h-full min-h-0 w-full min-w-0 flex-1 border-0 bg-white"
                                : "min-h-[500px] w-full min-w-0 flex-1 border-0 bg-white max-sm:min-h-[65dvh]"}
                            style={{ colorScheme: "light" }} />
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-ui-muted">
                            <Activity size={30} />
                            <span>{waiting ? t("profilerRunning") : current?.error || t("profilerEmpty")}</span>
                            {waiting && <span>{t("profilerRunningHint")}</span>}
                        </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </MainContainer>
    );
}
