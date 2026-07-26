"use client";

import { createUser, deleteUser, listUsers, updateUser, type User } from "@/api/users";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, MainContainer, SettingLabel } from "@/component/v2/card";
import { Select, SettingInputVertical, SettingPasswordVertical } from "@/component/v2/forms";
import { SwitchCard } from "@/component/v2/switch";
import { Input } from "@/component/v2/input";
import { PageHeader } from "@/component/v2/page-header";
import { PageStatStrip } from "@/component/v2/page-patterns";
import { ResourceWorkspace } from "@/component/v2/resource-workspace";
import { AlertTriangle, KeyRound, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users as UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type Kind = "basic" | "uuid" | "token";

const emptyDraft = () => ({
    name: "",
    enabled: true,
    usage: "both" as "inbound" | "outbound" | "both",
    type: "basic" as Kind,
    username: "",
    password: "",
    uuid: "",
    token: "",
});

function label(user: User) {
    return user.name || user.id;
}

export default function UsersPage() {
    const { data, error, mutate } = useSWR("/api/v2/users", () => listUsers(), { revalidateOnFocus: false });
    const [selected, setSelected] = useState<User | undefined>();
    const [draft, setDraft] = useState(emptyDraft);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const users = data?.items ?? [];
    const loadErrorMessage = error instanceof Error
        ? error.message
        : error && typeof error === "object" && "msg" in error
            ? String((error as { msg?: unknown }).msg ?? "unknown error")
            : String(error ?? "unknown error");

    const credential = useMemo(() => {
        if (draft.type === "basic") {
            return {
                type: "basic" as const,
                basic: {
                    username: draft.username || undefined,
                    password: draft.password,
                },
            };
        }
        if (draft.type === "uuid") return { type: "uuid" as const, uuid: { uuid: draft.uuid } };
        return { type: "token" as const, token: { token: draft.token } };
    }, [draft]);

    useEffect(() => {
        if (!selected) {
            setDraft(emptyDraft());
            return;
        }
        setDraft({
            name: selected.name,
            enabled: selected.enabled,
            usage: selected.usage,
            type: selected.credential.type,
            username: selected.credential.username ?? "",
            password: selected.credential.password ?? "",
            uuid: selected.credential.uuid ?? "",
            token: selected.credential.token ?? "",
        });
    }, [selected]);

    async function save() {
        setSaving(true);
        setMessage("");
        try {
            if (selected) {
                const nextCredential = draft.password || draft.type !== "basic" ? credential : undefined;
                const saved = await updateUser(selected.id, { name: draft.name, enabled: draft.enabled, usage: draft.usage, credential: nextCredential });
                setSelected(saved);
            } else {
                const saved = await createUser({ name: draft.name, enabled: draft.enabled, usage: draft.usage, credential });
                setSelected(saved);
            }
            await mutate();
            setMessage("Saved");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!selected || !window.confirm(`Delete ${label(selected)}?`)) return;
        try {
            await deleteUser(selected.id);
            setSelected(undefined);
            await mutate();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Delete failed");
        }
    }

    return (
        <MainContainer className="product-page page-skin-account">
            <PageHeader
                eyebrow="People & access"
                title="User management"
                description="Inbound authentication uses enabled users. Outbound protocols can reuse the same credentials."
                icon={UsersIcon}
                actions={<Button onClick={() => setSelected(undefined)}><Plus size={16} className="mr-2" />New user</Button>}
            />
            <PageStatStrip
                stats={[
                    { label: "People", value: users.length, hint: "managed identities", icon: UsersIcon, tone: "primary" },
                    { label: "Enabled", value: users.filter((user) => user.enabled).length, hint: "available credentials", icon: ShieldCheck, tone: "success" },
                    { label: "Credential types", value: new Set(users.map((user) => user.credential.type)).size, hint: "basic, token, or UUID", icon: KeyRound, tone: "violet" },
                    { label: "Access model", value: "Central", hint: "reused by protocols", icon: ShieldCheck, tone: "warning" },
                ]}
                className="mb-4"
            />

            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-ui-lg border border-ui-danger/25 bg-ui-danger-soft p-4 text-ui-danger">
                    <AlertTriangle size={19} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold">User management is unavailable from this controller</div>
                        <div className="mt-1 text-sm opacity-80">The API target responded with: {loadErrorMessage}. Upgrade the controller if this page is required.</div>
                    </div>
                    <Button size="sm" variant="outline-danger" onClick={() => void mutate()}><RefreshCw size={15} className="mr-1" /> Retry</Button>
                </div>
            )}
            {message && <div className="mb-4 rounded-ui-md border border-ui-border p-3 text-ui-muted">{message}</div>}

            <ResourceWorkspace
                icon={UsersIcon}
                eyebrow="Access"
                title="One credential, many entry points"
                description="Create a user once, then choose whether that identity can be used by inbound, outbound, or both sides of the network."
                links={[{ label: "Inbound", href: "#/docs/inbound" }, { label: "Web UI", href: "#/docs/config/webui" }]}
            >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(360px,1.2fr)]">
                <Card noMargin>
                    <CardHeader><strong>Users</strong><span className="text-xs text-ui-muted">{users.length}</span></CardHeader>
                    <CardBody className="p-2">
                        {users.length === 0 ? <div className="p-6 text-center text-sm text-ui-muted">{error ? "No user data was returned." : "No users yet."}</div> : users.map((user) => (
                            <button key={user.id} className={`mb-1 flex w-full items-center justify-between rounded-ui-md px-3 py-3 text-left ${selected?.id === user.id ? "bg-ui-primary-soft text-ui-primary" : "hover:bg-ui-surface-muted"}`} onClick={() => setSelected(user)}>
                                <span><span className="block font-medium">{label(user)}</span><span className="text-xs text-ui-muted">{user.credential.type} · {user.usage}</span></span>
                                <span className={`text-xs ${user.enabled ? "text-ui-success" : "text-ui-muted"}`}>{user.enabled ? "Enabled" : "Disabled"}</span>
                            </button>
                        ))}
                    </CardBody>
                </Card>

                <Card noMargin>
                    <CardHeader><strong>{selected ? "Edit user" : "New user"}</strong>{selected && <Button variant="outline-secondary" onClick={remove}><Trash2 size={16} /></Button>}</CardHeader>
                    <CardBody>
                        <SettingInputVertical label="Name" value={draft.name} onChange={(name) => setDraft((v) => ({ ...v, name }))} placeholder="Alice" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><SettingLabel className="mb-2 block">Usage</SettingLabel><Select value={draft.usage} onValueChange={(usage) => setDraft((v) => ({ ...v, usage: usage as typeof v.usage }))} items={["inbound", "outbound", "both"].map((value) => ({ value, label: value }))} /></div>
                            <div><SettingLabel className="mb-2 block">Credential</SettingLabel><Select value={draft.type} onValueChange={(type) => setDraft((v) => ({ ...v, type: type as Kind }))} items={["basic", "uuid", "token"].map((value) => ({ value, label: value }))} /></div>
                        </div>
                        <SwitchCard label="Enabled" checked={draft.enabled} onCheckedChange={(enabled) => setDraft((v) => ({ ...v, enabled }))} className="my-4" />
                        {draft.type === "basic" && <><SettingInputVertical label="Username (optional)" value={draft.username} onChange={(username) => setDraft((v) => ({ ...v, username }))} /><SettingPasswordVertical label={selected ? "Password (blank keeps current)" : "Password"} value={draft.password} onChange={(password) => setDraft((v) => ({ ...v, password }))} /></>}
                        {draft.type === "uuid" && <SettingInputVertical label="UUID" value={draft.uuid} onChange={(uuid) => setDraft((v) => ({ ...v, uuid }))} />}
                        {draft.type === "token" && <div className="mb-4"><SettingLabel className="mb-2 block">Token</SettingLabel><Input type="password" value={draft.token} onChange={(e) => setDraft((v) => ({ ...v, token: e.target.value }))} /></div>}
                    </CardBody>
                    <div className="flex justify-end border-t border-ui-border px-6 py-4"><Button onClick={save} disabled={saving}><Save size={16} className="mr-2" />{saving ? "Saving…" : "Save"}</Button></div>
                </Card>
            </div>
            </ResourceWorkspace>
        </MainContainer>
    );
}
