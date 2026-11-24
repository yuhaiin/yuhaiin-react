import type { Go } from "@/api/generated-contracts";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { SwitchCard } from "@/component/v2/forms";
import { Input } from "@/component/v2/input";
import { Select } from "@/component/v2/select";
import { ui } from "@/component/v2/styles";
import { ArrowRight, Plus, Trash } from "lucide-react";
import { FC, useId, useState } from "react";
import { useTranslation } from "react-i18next";

type HostLoopback = Go.inbound.SSHHostLoopback;
type Mapping = Go.inbound.SSHHostLoopbackMapping;

/** Mirrors MaxSSHHostLoopbackMappings on the server. */
export const maxHostLoopbackMappings = 64;

const sessionAddresses = ["127.0.0.1", "::1"] as const;

/** Parses an IPv6 literal into its canonical form, or undefined. */
function canonicalIPv6(value: string): string | undefined {
    if (!value.includes(":") || value.includes("%") || value.includes("[") || value.includes("]")) return undefined;
    try {
        return new URL(`http://[${value}]/`).hostname.slice(1, -1);
    } catch {
        return undefined;
    }
}

/** 127.0.0.0/8 or ::1, as Go's netip would accept it (no leading zeros). */
export function isLoopbackAddress(value: string): boolean {
    const v4 = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value);
    if (v4) return v4.slice(1).every(octet => Number(octet) <= 255 && (octet === "0" || !octet.startsWith("0")));
    return canonicalIPv6(value) === "::1";
}

export function isSessionAddress(value: string): boolean {
    return value === "127.0.0.1" || canonicalIPv6(value) === "::1";
}

const validPort = (port: number) => Number.isInteger(port) && port >= 1 && port <= 65535;

export type HostLoopbackProblem = { index?: number; field?: keyof Mapping; key: string; values?: Record<string, unknown> };

/**
 * Validates like the server (SSHHostLoopback.Validate): mappings are checked
 * even while forwarding is disabled, so a saved configuration can always be
 * enabled.
 */
export function hostLoopbackProblems(value?: HostLoopback): HostLoopbackProblem[] {
    if (!value) return [];
    const problems: HostLoopbackProblem[] = [];
    const mappings = value.mappings ?? [];
    if (value.enabled && mappings.length === 0) problems.push({ key: "sshHostLoopbackNoMappings" });
    if (mappings.length > maxHostLoopbackMappings) problems.push({ key: "sshHostLoopbackTooMany", values: { max: maxHostLoopbackMappings } });
    const seen = new Map<string, number>();
    mappings.forEach((m, index) => {
        if (m.protocol !== "tcp" && m.protocol !== "udp") problems.push({ index, field: "protocol", key: "sshHostLoopbackBadProtocol" });
        if (!isSessionAddress(m.sessionAddress)) problems.push({ index, field: "sessionAddress", key: "sshHostLoopbackBadSessionAddress" });
        if (!validPort(m.sessionPort)) problems.push({ index, field: "sessionPort", key: "sshHostLoopbackBadPort" });
        if (!isLoopbackAddress(m.hostAddress.trim())) problems.push({ index, field: "hostAddress", key: "sshHostLoopbackBadHostAddress" });
        if (!validPort(m.hostPort)) problems.push({ index, field: "hostPort", key: "sshHostLoopbackBadPort" });
        const key = `${m.protocol} ${isSessionAddress(m.sessionAddress) && m.sessionAddress !== "127.0.0.1" ? "::1" : m.sessionAddress} ${m.sessionPort}`;
        const first = seen.get(key);
        if (first !== undefined) problems.push({ index, field: "sessionPort", key: "sshHostLoopbackDuplicate", values: { other: first + 1 } });
        else seen.set(key, index);
    });
    return problems;
}

/** The inbound-level check used before saving. */
export function inboundHostLoopbackProblems(inbound: { protocol: { type: string } & Record<string, unknown> }): HostLoopbackProblem[] {
    if (inbound.protocol.type !== "ssh") return [];
    return hostLoopbackProblems((inbound.protocol.ssh as { hostLoopback?: HostLoopback } | undefined)?.hostLoopback);
}

function newMapping(sessionAddress: string, port = 0): Mapping {
    const hostAddress = sessionAddress === "::1" ? "::1" : "127.0.0.1";
    return { protocol: "tcp", sessionAddress, sessionPort: port, hostAddress, hostPort: port };
}

function portValue(text: string): number {
    if (text.trim() === "") return 0;
    const n = Number(text);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/** Runtime availability as detected on the server, separate from the saved setting. */
const RuntimeStatus: FC<{ ssh?: Go.inbound.SSHCapabilities; supported: boolean }> = ({ ssh, supported }) => {
    const { t } = useTranslation("ui");
    if (!supported) return <p role="status" className="text-xs text-ui-warning">{t("sshHostLoopbackUnsupportedPlatform")}</p>;
    const env = ssh?.environment;
    if (!env) return null;
    if (env.error) return <p role="status" className="text-xs text-ui-warning">{t("sshHostLoopbackSessionsUnavailable")}</p>;
    const status = (value?: string) => value === "available" ? t("sshEnvAvailable") : value === "unavailable" ? t("sshEnvUnavailable") : t("sshEnvUnknown");
    const problem = env.features.hostLoopbackIPv4 === "unavailable" || env.features.hostLoopbackIPv6 === "unavailable";
    return <div role="status" className="grid gap-1 text-xs">
        <span className="inline-flex flex-wrap items-center gap-2">
            <span className="text-ui-muted">{t("sshHostLoopbackRuntime")}</span>
            {problem ? <Badge variant="warning" dot>IPv4 {status(env.features.hostLoopbackIPv4)} · IPv6 {status(env.features.hostLoopbackIPv6)}</Badge>
                : <span>IPv4 {status(env.features.hostLoopbackIPv4)} · IPv6 {status(env.features.hostLoopbackIPv6)}</span>}
        </span>
        {env.features.hostLoopbackError && <span className="break-words text-ui-warning">{env.features.hostLoopbackError}</span>}
    </div>;
};

/**
 * Host loopback forwarding of an SSH inbound: a table of mappings from a
 * session loopback endpoint to a host loopback endpoint. On narrow screens
 * every row becomes a labelled card.
 */
export const SSHHostLoopbackEditor: FC<{
    value?: HostLoopback;
    onChange: (value: HostLoopback) => void;
    ssh?: Go.inbound.SSHCapabilities;
    supported: boolean;
}> = ({ value, onChange, ssh, supported }) => {
    const { t } = useTranslation("ui");
    const headerId = useId();
    const current: HostLoopback = value ?? { enabled: false, mappings: [] };
    const mappings = current.mappings ?? [];
    const problems = hostLoopbackProblems(current);
    const fieldError = (index: number, field: keyof Mapping) => {
        const p = problems.find(p => p.index === index && p.field === field);
        return p ? t(p.key, p.values ?? {}) : undefined;
    };
    const set = (next: Mapping[]) => onChange({ ...current, mappings: next });
    const update = (index: number, fields: Partial<Mapping>) => set(mappings.map((m, i) => i === index ? { ...m, ...fields } : m));
    const full = mappings.length >= maxHostLoopbackMappings;
    const [bothPort, setBothPort] = useState("");
    // The same port for both families, so localhost works whichever address
    // a client resolves it to.
    const addBoth = () => {
        const port = portValue(bothPort);
        if (!validPort(port)) return;
        set([...mappings, newMapping("127.0.0.1", port), newMapping("::1", port)]);
        setBothPort("");
    };
    const columns = "md:grid-cols-[6.5rem_7.5rem_7.5rem_1.25rem_minmax(8rem,1fr)_7.5rem_2.5rem]";
    const label = "text-xs text-ui-muted md:sr-only";
    const general = problems.filter(p => p.index === undefined);

    return <div className="grid gap-3">
        <SwitchCard label={t("sshHostLoopbackEnable")} description={t("sshHostLoopbackDescription")}
            checked={current.enabled} onCheckedChange={(enabled) => onChange({ ...current, enabled })} />
        <ul className="grid list-disc gap-1 pl-5 text-xs text-ui-muted" aria-label={t("sshHostLoopbackNotes")}>
            <li>{t("sshHostLoopbackNoteMappedOnly")}</li>
            <li>{t("sshHostLoopbackNoteFamilies")}</li>
            <li>{t("sshHostLoopbackNoteListening")}</li>
            <li className="text-ui-warning">{t("sshHostLoopbackNoteAccess")}</li>
            <li>{t("sshHostLoopbackNoteUnmapped")}</li>
            <li>{t("sshHostLoopbackNoteNewSessions")}</li>
        </ul>
        <RuntimeStatus ssh={ssh} supported={supported} />

        {mappings.length > 0 && <div role="table" aria-labelledby={headerId} className="grid gap-3 md:gap-2">
            <span id={headerId} className="sr-only">{t("sshHostLoopbackMappings")}</span>
            <div role="row" className={`hidden gap-2 px-1 text-xs text-ui-muted md:grid ${columns}`}>
                <span role="columnheader">{t("sshHostLoopbackProtocol")}</span>
                <span role="columnheader">{t("sshHostLoopbackSessionAddress")}</span>
                <span role="columnheader">{t("sshHostLoopbackSessionPort")}</span>
                <span aria-hidden="true" />
                <span role="columnheader">{t("sshHostLoopbackHostAddress")}</span>
                <span role="columnheader">{t("sshHostLoopbackHostPort")}</span>
                <span className="sr-only" role="columnheader">{t("delete")}</span>
            </div>
            {mappings.map((m, index) => {
                const row = t("sshHostLoopbackRow", { index: index + 1 });
                return <div role="row" key={index} aria-label={row}
                    className={`${ui.softPanel} grid grid-cols-2 items-start gap-3 p-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:gap-2 ${columns}`}>
                    <label role="cell" className="order-1 grid gap-1 md:order-none">
                        <span className={label}>{t("sshHostLoopbackProtocol")}</span>
                        <Select ariaLabel={`${row} ${t("sshHostLoopbackProtocol")}`} value={m.protocol} error={fieldError(index, "protocol")}
                            items={[{ value: "tcp", label: "TCP" }, { value: "udp", label: "UDP" }]}
                            onValueChange={(protocol) => update(index, { protocol })} />
                    </label>
                    <label role="cell" className="order-3 grid gap-1 md:order-none">
                        <span className={label}>{t("sshHostLoopbackSessionAddress")}</span>
                        <Select ariaLabel={`${row} ${t("sshHostLoopbackSessionAddress")}`} value={m.sessionAddress} error={fieldError(index, "sessionAddress")}
                            items={sessionAddresses.map(address => ({ value: address, label: address }))}
                            onValueChange={(sessionAddress) => update(index, { sessionAddress })} />
                    </label>
                    <label role="cell" className="order-4 grid gap-1 md:order-none">
                        <span className={label}>{t("sshHostLoopbackSessionPort")}</span>
                        <Input aria-label={`${row} ${t("sshHostLoopbackSessionPort")}`} type="number" min={1} max={65535} step={1} inputMode="numeric"
                            value={m.sessionPort ? String(m.sessionPort) : ""} error={fieldError(index, "sessionPort")}
                            onChange={(e) => {
                                const sessionPort = portValue(e.target.value);
                                // Keep the host port in step until it is edited separately.
                                update(index, m.hostPort === m.sessionPort ? { sessionPort, hostPort: sessionPort } : { sessionPort });
                            }} />
                    </label>
                    <ArrowRight aria-hidden="true" size={16} className="hidden self-start text-ui-muted md:mt-3 md:block" />
                    <label role="cell" className="order-5 grid gap-1 md:order-none">
                        <span className={label}>{t("sshHostLoopbackHostAddress")}</span>
                        <Input aria-label={`${row} ${t("sshHostLoopbackHostAddress")}`} value={m.hostAddress} list="ssh-host-loopback-addresses"
                            spellCheck={false} autoComplete="off" error={fieldError(index, "hostAddress")}
                            onChange={(e) => update(index, { hostAddress: e.target.value.trim() })} />
                    </label>
                    <label role="cell" className="order-6 grid gap-1 md:order-none">
                        <span className={label}>{t("sshHostLoopbackHostPort")}</span>
                        <Input aria-label={`${row} ${t("sshHostLoopbackHostPort")}`} type="number" min={1} max={65535} step={1} inputMode="numeric"
                            value={m.hostPort ? String(m.hostPort) : ""} error={fieldError(index, "hostPort")}
                            onChange={(e) => update(index, { hostPort: portValue(e.target.value) })} />
                    </label>
                    <div role="cell" className="order-2 flex items-start justify-end md:order-none">
                        <Button size="icon" variant="outline-danger" aria-label={`${t("delete")} ${row}`}
                            onClick={() => set(mappings.filter((_, i) => i !== index))}>
                            <Trash size={16} />
                        </Button>
                    </div>
                </div>;
            })}
            <datalist id="ssh-host-loopback-addresses"><option value="127.0.0.1" /><option value="::1" /></datalist>
        </div>}

        {general.map(p => <p key={p.key} role="alert" className="text-xs text-ui-danger">{t(p.key, p.values ?? {})}</p>)}
        <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={full} onClick={() => set([...mappings, newMapping("127.0.0.1")])}><Plus size={16} className="mr-1" />{t("sshHostLoopbackAddIPv4")}</Button>
            <Button size="sm" disabled={full} onClick={() => set([...mappings, newMapping("::1")])}><Plus size={16} className="mr-1" />{t("sshHostLoopbackAddIPv6")}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Input aria-label={t("sshHostLoopbackBothPort")} placeholder={t("sshHostLoopbackBothPort")} type="number" min={1} max={65535} step={1}
                inputMode="numeric" className="w-52" value={bothPort} onChange={(e) => setBothPort(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBoth(); } }} />
            <Button size="sm" disabled={mappings.length + 2 > maxHostLoopbackMappings || !validPort(portValue(bothPort))} onClick={addBoth}>
                <Plus size={16} className="mr-1" />{t("sshHostLoopbackAddBoth")}</Button>
        </div>
    </div>;
};
