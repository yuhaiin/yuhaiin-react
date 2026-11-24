import type { Go } from "@/api/generated-contracts";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { ui } from "@/component/v2/styles";
import { CircleAlert, RefreshCw } from "lucide-react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type SSHCapabilities = Go.inbound.SSHCapabilities;
type SSHEnvironment = Go.inbound.SSHEnvironment;
type SSHIDRange = Go.inbound.SSHIDRange;
type SSHIDMapping = Go.inbound.SSHIDMapping;

/** Reports whether a host ID is inside one of the advertised ranges. */
export function sshIDAllowed(ranges: SSHIDRange[], id: number): boolean {
    return ranges.some(r => id >= r.start && id < r.start + r.count);
}

/** Renders ranges as "1009, 689824–755359". */
export function formatSSHIDRanges(ranges: SSHIDRange[]): string {
    return ranges.map(r => r.count === 1 ? String(r.start) : `${r.start}–${r.start + r.count - 1}`).join(", ");
}

type SSHIDConfig = { namespaceMode?: string; uid: number; gid: number; parentNamespaceUID?: number; parentNamespaceGID?: number };

export type SSHIDProblemKind = "notMappable" | "parentNotMappable" | "parentConflict" | "parentNeedsTarget" | "parentRootful";
export type SSHIDProblem = { field: "uid" | "gid" | "parentUID" | "parentGID"; kind: SSHIDProblemKind; id: number; idType: "UID" | "GID"; ranges?: string; parent?: number };

/** Translates a parent-namespace ID into the namespace, like IDMap.FromParent. */
function fromParent(map: SSHIDMapping[], id: number): number | undefined {
    const r = map.find(m => id >= m.parentID && id < m.parentID + m.count);
    return r ? r.namespaceID + (id - r.parentID) : undefined;
}

/** One effective session map line: session (target) ID -> parent namespace ID. */
export type SSHEffectiveMapping = { session: number; parent?: number; source: "automatic" | "manual" | "unresolved" };

/**
 * The mapping a rootless inbound will get: a manual parent override as
 * configured, or the automatic translation of the target ID through
 * Yuhaiin's namespace map. Without resolvable host IDs only the default
 * identity maps automatically.
 */
export function sshEffectiveMapping(config: SSHIDConfig, ssh: SSHCapabilities | undefined, kind: "uid" | "gid"): SSHEffectiveMapping | undefined {
    const env = ssh?.environment;
    if (!env || !ssh) return undefined;
    const configured = kind === "uid" ? config.uid : config.gid;
    const session = configured || (kind === "uid" ? ssh.serviceUID : ssh.serviceGID);
    const override = kind === "uid" ? config.parentNamespaceUID : config.parentNamespaceGID;
    if (override !== undefined) return { session, parent: override, source: "manual" };
    const ns = env.userNamespace;
    if (ns.hostIDsResolved) {
        const parent = fromParent(kind === "uid" ? ns.uidMap : ns.gidMap, session);
        return { session, parent, source: parent === undefined ? "unresolved" : "automatic" };
    }
    if (!configured) return { session, parent: kind === "uid" ? env.identity.namespaceUID : env.identity.namespaceGID, source: "automatic" };
    return { session, source: "unresolved" };
}

/**
 * Finds configured IDs the server cannot map. uid/gid are the SSH target
 * identity (host IDs where resolvable; 0 selects Yuhaiin's own identity);
 * parentNamespaceUID/GID are an optional manual override in Yuhaiin's own
 * namespace. Without a detection result (older servers) only structural
 * problems are reported; the server still verifies everything at start.
 */
export function sshIDProblems(config: SSHIDConfig, ssh?: SSHCapabilities): SSHIDProblem[] {
    const problems: SSHIDProblem[] = [];
    const rootless = (config.namespaceMode || "rootless") === "rootless";
    const identity = ssh?.environment?.identity;
    const ns = ssh?.environment?.userNamespace;
    for (const kind of ["uid", "gid"] as const) {
        const idType = kind === "uid" ? "UID" : "GID";
        const parentField = kind === "uid" ? "parentUID" : "parentGID";
        const id = kind === "uid" ? config.uid : config.gid;
        const override = kind === "uid" ? config.parentNamespaceUID : config.parentNamespaceGID;
        if (override !== undefined) {
            if (!rootless) { problems.push({ field: parentField, kind: "parentRootful", id: override, idType }); continue; }
            if (!id) { problems.push({ field: parentField, kind: "parentNeedsTarget", id: override, idType }); continue; }
            if (!identity || !ns) continue;
            const parentRanges = kind === "uid" ? identity.parentUIDRanges : identity.parentGIDRanges;
            if (parentRanges?.length && !sshIDAllowed(parentRanges, override)) {
                problems.push({ field: parentField, kind: "parentNotMappable", id: override, idType, ranges: formatSSHIDRanges(parentRanges) });
            } else if (ns.hostIDsResolved) {
                const automatic = fromParent(kind === "uid" ? ns.uidMap : ns.gidMap, id);
                if (automatic !== override) problems.push({ field: parentField, kind: "parentConflict", id: override, idType, parent: automatic });
            }
            continue;
        }
        if (!rootless || !identity || !id) continue;
        // Empty ranges mean the detection could not compute them.
        const ranges = kind === "uid" ? identity.uidRanges : identity.gidRanges;
        if (ranges.length && !sshIDAllowed(ranges, id)) problems.push({ field: kind, kind: "notMappable", id, idType, ranges: formatSSHIDRanges(ranges) });
    }
    return problems;
}

/** The translation key explaining a problem. */
export function sshIDProblemKey(problem: SSHIDProblem): string {
    switch (problem.kind) {
        case "notMappable": return problem.field === "uid" ? "sshUIDNotMappable" : "sshGIDNotMappable";
        case "parentNotMappable": return "sshParentNotMappable";
        case "parentConflict": return problem.parent === undefined ? "sshParentConflictUnmapped" : "sshParentConflict";
        case "parentNeedsTarget": return "sshParentNeedsTarget";
        case "parentRootful": return "sshParentRootful";
    }
}

/** The inbound-level check used before saving. */
export function inboundSSHIDProblems(inbound: { enabled: boolean; protocol: { type: string } & Record<string, unknown> }, ssh?: SSHCapabilities): SSHIDProblem[] {
    if (!inbound.enabled || inbound.protocol.type !== "ssh") return [];
    const config = inbound.protocol.ssh as SSHIDConfig | undefined;
    return config ? sshIDProblems(config, ssh) : [];
}

const Row: FC<{ label: ReactNode; children: ReactNode }> = ({ label, children }) =>
    <div className="grid min-w-0 grid-cols-1 gap-0.5 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-3">
        <dt className="text-xs text-ui-muted">{label}</dt>
        <dd className="m-0 min-w-0 break-words text-sm text-ui-fg">{children}</dd>
    </div>;

const Group: FC<{ title: ReactNode; children: ReactNode }> = ({ title, children }) =>
    <div className="grid min-w-0 gap-2">
        <h4 className={ui.cardTitle}>{title}</h4>
        <dl className="m-0 grid gap-2">{children}</dl>
    </div>;

/** Plain text when available; only problems are emphasized. */
const Status: FC<{ value: string; fallback?: ReactNode }> = ({ value, fallback }) => {
    const { t } = useTranslation("ui");
    if (value === "available") return <span>{t("sshEnvAvailable")}</span>;
    if (value === "unavailable") return fallback ? <span className="text-ui-muted">{fallback}</span> : <Badge variant="danger" dot>{t("sshEnvUnavailable")}</Badge>;
    return <span className="text-ui-muted">{t("sshEnvUnknown")}</span>;
};

const ids = (uid?: number, gid?: number) => uid === undefined || gid === undefined ? undefined : `${uid}:${gid}`;

const MapLines: FC<{ map?: SSHIDMapping[] }> = ({ map }) => {
    const { t } = useTranslation("ui");
    if (!map?.length) return <span className="text-ui-muted">{t("sshEnvNone")}</span>;
    return <code className="block whitespace-pre font-mono text-xs">{map.map(m => `${m.namespaceID} ${m.parentID} ${m.count}`).join("\n")}</code>;
};

/**
 * The detected rootless SSH environment: where Yuhaiin runs, which host
 * identity sessions get and whether the kernel confirmed it, plus the
 * isolation building blocks. Healthy items are plain text.
 */
const MappingRow: FC<{ label: ReactNode; mapping?: SSHEffectiveMapping }> = ({ label, mapping }) => {
    const { t } = useTranslation("ui");
    if (!mapping) return null;
    return <Row label={label}>
        {mapping.source === "unresolved"
            ? <span className="text-ui-warning">{t("sshEnvMapUnresolved", { session: mapping.session })}</span>
            : <span className="inline-flex flex-wrap items-center gap-2">
                <code className="font-mono text-xs">{t("sshEnvMapLine", { session: mapping.session, parent: mapping.parent })}</code>
                <Badge variant={mapping.source === "manual" ? "info" : "muted"}>{t(mapping.source === "manual" ? "sshEnvMapManual" : "sshEnvMapAutomatic")}</Badge>
            </span>}
    </Row>;
};

export const SSHEnvironmentPanel: FC<{ ssh?: SSHCapabilities; config?: SSHIDConfig; loading?: boolean; onRecheck?: () => void }> = ({ ssh, config, loading, onRecheck }) => {
    const { t } = useTranslation("ui");
    const env: SSHEnvironment | undefined = ssh?.environment;
    if (!env) {
        if (!loading) return null;
        return <div className={`${ui.softPanel} p-4 text-sm text-ui-muted`} aria-busy="true">{t("sshEnvChecking")}</div>;
    }
    const ns = env.userNamespace;
    const identity = env.identity;
    const session = env.session;
    const inherited = ns.origin === "inherited";
    const unmappedGroups = identity.groups.filter(g => g.hostGID === undefined && inherited).length;
    const hostIdentity = ids(identity.hostUID, identity.hostGID);
    const sessionIdentity = session ? ids(session.uid, session.gid) : undefined;
    const caps = [identity.capSetUID && "CAP_SETUID", identity.capSetGID && "CAP_SETGID", identity.capSetFCAP && "CAP_SETFCAP",
        identity.capSysAdmin && "CAP_SYS_ADMIN", identity.capNetAdmin && "CAP_NET_ADMIN"].filter(Boolean).join(", ");
    const ipFamilies = `IPv4 ${t(env.features.ipv4 === "available" ? "sshEnvAvailable" : env.features.ipv4 === "unavailable" ? "sshEnvUnavailable" : "sshEnvUnknown")} / IPv6 ${t(env.features.ipv6 === "available" ? "sshEnvAvailable" : env.features.ipv6 === "unavailable" ? "sshEnvUnavailable" : "sshEnvUnknown")}`;
    const ipProblem = env.features.ipv4 === "unavailable" || env.features.ipv6 === "unavailable";
    // The probe verifies the default identity; a configured other identity
    // or manual mapping is verified inside its session when the inbound starts.
    const customized = Boolean(config && (config.uid || config.gid || config.parentNamespaceUID !== undefined || config.parentNamespaceGID !== undefined));

    return <section aria-label={t("sshEnvTitle")} className={`${ui.softPanel} grid min-w-0 gap-4 p-4`}>
        <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={ui.cardTitle}>{t("sshEnvTitle")}</h3>
            {onRecheck && <Button size="sm" variant="outline-primary" disabled={loading} onClick={onRecheck}>
                <RefreshCw size={14} className="mr-1" />{t("sshEnvRecheck")}</Button>}
        </header>

        {env.error && <div role="alert" className="flex items-start gap-2 rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft p-3 text-sm text-ui-danger">
            <CircleAlert className="mt-0.5 shrink-0" size={16} />
            <span className="break-words">{t("sshEnvProbeFailed", { message: env.error })}</span>
        </div>}

        <Group title={t("sshEnvRuntime")}>
            <Row label={t("sshEnvMode")}>{t("sshEnvRootless")}</Row>
            <Row label={t("sshEnvUserNamespace")}>
                {t(ns.origin === "host" ? "sshEnvOriginHost" : inherited ? "sshEnvOriginInherited" : "sshEnvOriginUnknown")}
            </Row>
            {!ns.hostIDsResolved && <Row label={t("sshEnvHostIDs")}>
                <span className="text-ui-warning">{ns.depth > 1 ? t("sshEnvHostIDsUnresolved", { depth: ns.depth }) : t("sshEnvDepthUnknown", { reason: ns.depthError || t("sshEnvUnknown") })}</span>
            </Row>}
        </Group>

        <Group title={t("sshEnvFileAccess")}>
            <Row label={t("sshEnvHostIdentity")}>{hostIdentity ?? <span className="text-ui-muted">{t("sshEnvUnknown")}</span>}</Row>
            <Row label={t(customized ? "sshEnvDefaultSessionIdentity" : "sshEnvSessionIdentity")}>
                {sessionIdentity ? <>
                    {sessionIdentity}{session?.username ? ` (${session.username})` : ""}
                    {inherited && session && <span className="block text-xs text-ui-muted">{t("sshEnvNamespaceIdentity", { uid: session.namespaceUID, gid: session.namespaceGID })}</span>}
                </> : <span className="text-ui-muted">{t("sshEnvUnknown")}</span>}
            </Row>
            <Row label={t("sshEnvFilesystem")}>
                {session?.filesystemIdentityPreserved ? t(customized ? "sshEnvFilesystemDefaultOK" : "sshEnvFilesystemOK")
                    : <Badge variant="danger" dot>{t("sshEnvFilesystemNotVerified")}</Badge>}
                {customized && <span className="block text-xs text-ui-muted">{t("sshEnvFilesystemOnStart")}</span>}
            </Row>
            {config && <>
                <MappingRow label={t("sshEnvMapUID")} mapping={sshEffectiveMapping(config, ssh, "uid")} />
                <MappingRow label={t("sshEnvMapGID")} mapping={sshEffectiveMapping(config, ssh, "gid")} />
            </>}
            <Row label={t("sshEnvGroups")}>
                {session?.supplementaryGroupsInherited ? t("sshEnvGroupsInherited", { count: identity.groups.length }) : t("sshEnvUnknown")}
                {unmappedGroups > 0 && <span className="block text-xs text-ui-muted">{t("sshEnvGroupsUnmapped", { count: unmappedGroups })}</span>}
            </Row>
        </Group>

        <Group title={t("sshEnvNetwork")}>
            <Row label={t("sshEnvNetworkNamespace")}><Status value={env.features.networkNamespace} /></Row>
            <Row label="TUN"><Status value={env.features.tun} /></Row>
            <Row label="IPv4 / IPv6">{ipProblem ? <Badge variant="danger" dot>{ipFamilies}</Badge> : ipFamilies}</Row>
        </Group>

        <Group title={t("sshEnvProcess")}>
            <Row label={t("sshEnvPIDNamespace")}><Status value={env.features.pidNamespace} /></Row>
            <Row label="cgroup v2"><Status value={env.features.cgroupV2} fallback={t("sshEnvCgroupFallback")} /></Row>
            <Row label={t("sshEnvSupervisor")}><Status value={env.features.supervisor} /></Row>
        </Group>

        <details className="min-w-0">
            <summary className="cursor-pointer text-xs text-ui-muted">{t("sshEnvDetails")}</summary>
            <dl className="m-0 mt-3 grid gap-2">
                <Row label={t("sshEnvNestingDepth")}>{ns.depth >= 0 ? ns.depth : t("sshEnvUnknown")}</Row>
                <Row label={t("sshEnvUIDMap")}><MapLines map={ns.uidMap} /></Row>
                <Row label={t("sshEnvGIDMap")}><MapLines map={ns.gidMap} /></Row>
                <Row label={t("sshEnvSessionUIDMap")}><MapLines map={session?.uidMap} /></Row>
                <Row label={t("sshEnvSessionGIDMap")}><MapLines map={session?.gidMap} /></Row>
                <Row label={t("sshEnvUsableUIDs")}>{formatSSHIDRanges(identity.uidRanges) || t("sshEnvNone")}</Row>
                <Row label={t("sshEnvUsableGIDs")}>{formatSSHIDRanges(identity.gidRanges) || t("sshEnvNone")}</Row>
                <Row label={t("sshEnvUsableParentUIDs")}>{formatSSHIDRanges(identity.parentUIDRanges ?? []) || t("sshEnvNone")}</Row>
                <Row label={t("sshEnvUsableParentGIDs")}>{formatSSHIDRanges(identity.parentGIDRanges ?? []) || t("sshEnvNone")}</Row>
                <Row label={t("sshEnvSetgroups")}>{ns.setgroupsAllowed ? "allow" : "deny"}</Row>
                <Row label={t("sshEnvCapabilities")}>{caps || t("sshEnvNone")}</Row>
                {env.checkedAt && <Row label={t("sshEnvCheckedAt")}>{new Date(env.checkedAt).toLocaleString()}</Row>}
            </dl>
        </details>
    </section>;
};
