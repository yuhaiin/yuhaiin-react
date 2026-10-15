import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, MainContainer } from "@/component/v2/card";
import { Activity, Download, Maximize2, Play, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
            void refresh().catch(e => setError(String(e)));
        }, 0);
        return () => window.clearTimeout(timer);
    }, [refresh]);

    const hasRunning = sessions.some(item => item.status === "running");
    useEffect(() => {
        if (!hasRunning) return;
        const poll = window.setInterval(() => {
            void refresh().catch(e => setError(String(e)));
        }, 1000);
        return () => window.clearInterval(poll);
    }, [hasRunning, refresh]);

    const current = useMemo(() => sessions.find(s => s.id === selected), [sessions, selected]);
    const viewer = current?.status === "completed"
        ? profilerURL(`/debug/profiler/${current.id}/flamegraph`)
        : null;

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
            await refresh();
        } catch (e) {
            setError(String(e));
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
            setError(String(e));
        } finally {
            setPending(false);
        }
    };

    const isSnapshot = seconds === 0;
    const canSnapshot = kind === "heap" || kind === "allocs" || kind === "goroutine";
    const canInterval = kind !== "goroutine";
    const waiting = current?.status === "running";

    return (
        <MainContainer className="flex h-full min-h-0 flex-col">
            <Card noMargin className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0 !px-3 py-3 sm:!px-4">
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Activity size={20} className="text-ui-muted" />
                            <h2 className="text-base font-semibold text-ui-heading">{t("profilerTitle")}</h2>
                        </div>
                        {current?.status === "completed" && (
                            <div className="flex items-center gap-1">
                                <a href={profilerURL(`/debug/profiler/${current.id}/download`)} download
                                    referrerPolicy="no-referrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-ui-sm border border-ui-border"
                                    title={t("profilerDownload")} aria-label={t("profilerDownload")}>
                                    <Download size={16} />
                                </a>
                                <Button variant="outline-secondary" size="icon"
                                    title={t("profilerExpand")} aria-label={t("profilerExpand")}
                                    onClick={() => setExpanded(v => !v)}>
                                    <Maximize2 size={16} />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid w-full grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(150px,1fr)_minmax(140px,1fr)_auto]">
                        <label className="flex min-w-0 flex-col gap-1 text-xs text-ui-muted">
                            {t("profilerType")}
                            <select value={kind} onChange={e => changeKind(e.target.value as ProfileKind)}
                                className="h-10 w-full rounded-ui-sm border border-ui-border bg-ui-surface px-3 text-sm text-ui-fg">
                                {types.map(value => <option key={value} value={value}>{value === "allocs" ? "Allocations" : value[0].toUpperCase() + value.slice(1)}</option>)}
                            </select>
                        </label>
                        <label className="flex min-w-0 flex-col gap-1 text-xs text-ui-muted">
                            {t("profilerDuration")}
                            <select value={seconds} onChange={e => setSeconds(Number(e.target.value))}
                                className="h-10 w-full rounded-ui-sm border border-ui-border bg-ui-surface px-3 text-sm text-ui-fg">
                                {canSnapshot && <option value={0}>{t("profilerSnapshot")}</option>}
                                {canInterval && [10, 30, 60].map(n => <option key={n} value={n}>{n}s</option>)}
                            </select>
                        </label>
                        <Button variant="primary" className="h-10" loading={pending}
                            disabled={!enabled || pending || (kind === "cpu" && sessions.some(s => s.type === "cpu" && s.status === "running"))}
                            onClick={() => void capture()}>
                            <Play size={16} />{t("profilerCapture")}
                        </Button>
                    </div>
                    <p className="w-full text-xs text-ui-muted">
                        {t(descriptions[kind])} {isSnapshot ? t("profilerSnapshot") : `${seconds}s`}
                    </p>
                    {error && <p role="alert" className="w-full text-sm text-ui-danger">{error}</p>}
                    {!enabled && <p role="status" className="w-full text-sm text-ui-danger">{t("profilerDisabled")}</p>}
                </CardHeader>

                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ui-border px-3 py-2 sm:px-4">
                    <label htmlFor="profiler-history" className="text-xs text-ui-muted">{t("profilerRecent")}</label>
                    <select id="profiler-history" className="h-9 min-w-0 flex-1 rounded-ui-sm border border-ui-border bg-ui-surface px-2 text-sm"
                        value={selected ?? ""} onChange={e => setSelected(e.target.value || null)}>
                        {sessions.length === 0 && <option value="">{t("profilerEmpty")}</option>}
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.type.toUpperCase()} · {s.seconds ? `${s.seconds}s` : t("profilerSnapshot")} · {new Date(s.createdAt).toLocaleTimeString()} ({s.status})
                            </option>
                        ))}
                    </select>
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

                <CardBody className={expanded ? "!p-0 flex min-h-[75vh] flex-1 flex-col" : "!p-0 flex min-h-[500px] flex-1 flex-col"}>
                    {viewer ? (
                        <iframe key={current?.id} src={viewer}
                            title={t("profilerTitle")} referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                            className="min-h-[500px] w-full flex-1 border-0 bg-white"
                            style={{ colorScheme: "light" }} />
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-ui-muted">
                            <Activity size={30} />
                            <span>{waiting ? t("profilerRunning") : current?.error || t("profilerEmpty")}</span>
                            {waiting && <span>{t("profilerRunningHint")}</span>}
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}
