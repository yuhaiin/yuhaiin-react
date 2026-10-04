import { createRouteRegistry, deleteRouteRegistry, listRouteRegistries, saveRouteRegistry } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { SettingInputVertical } from "@/component/v2/forms";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { Switch } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Registry } from "@/contract/route";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import useSWR from "swr";

export const REGISTRY_LIST_KEY = "/api/v2/route/registries";

export function RegistryManagerModal({
    open,
    onClose,
    onChanged,
}: {
    open: boolean;
    onClose: () => void;
    onChanged: () => void;
}) {
    const toast = useContext(GlobalToastContext);
    const [name, setName] = useState("");
    const [url, setURL] = useState("");
    const [saving, setSaving] = useState(false);
    const [busyID, setBusyID] = useState("");

    const { data, error, isLoading, mutate } = useSWR(
        open ? REGISTRY_LIST_KEY : null,
        listRouteRegistries,
        { revalidateOnFocus: false },
    );

    const run = async (id: string, action: () => Promise<unknown>) => {
        if (busyID) return;
        setBusyID(id);
        try {
            await action();
            await mutate();
            onChanged();
        } catch (err) {
            toast.Error(String((err as { msg?: string })?.msg ?? err));
        } finally {
            setBusyID("");
        }
    };

    const add = async () => {
        if (!url.trim() || saving) return;
        setSaving(true);
        try {
            await createRouteRegistry({
                id: "",
                name: name.trim(),
                url: url.trim(),
                enabled: true,
                builtin: false,
                updatedAt: "0",
            });
            setName("");
            setURL("");
            await mutate();
            onChanged();
            toast.Info("registry added");
        } catch (err) {
            toast.Error(String((err as { msg?: string })?.msg ?? err));
        } finally {
            setSaving(false);
        }
    };

    const toggle = (registry: Registry, enabled: boolean) =>
        run(registry.id, () => saveRouteRegistry(registry.id, { ...registry, enabled }));

    const remove = (registry: Registry) => {
        if (registry.builtin || !window.confirm(`Delete registry "${registry.name}"?`)) return;
        void run(registry.id, () => deleteRouteRegistry(registry.id));
    };

    return (
        <Modal open={open} onOpenChange={(next) => !next && onClose()}>
            <ModalContent width={780}>
                <ModalHeader closeButton>
                    <ModalTitle className="flex items-center gap-2">
                        <Settings2 size={18} /> Manage Registries
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div className="mb-5 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                        <div className="mb-3 font-semibold text-ui-heading">Add third-party registry</div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <SettingInputVertical label="Name" value={name} onChange={setName} placeholder="Community rules" />
                            <SettingInputVertical
                                label="Registry URL"
                                value={url}
                                onChange={setURL}
                                placeholder="https://example.com/manifest.json"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button size="sm" disabled={saving || !url.trim()} onClick={add}>
                                {saving ? <Spinner size="sm" className="mr-1.5" /> : <Plus size={15} className="mr-1.5" />}
                                Add registry
                            </Button>
                        </div>
                    </div>

                    <SettingLabel className="mb-2 block">Configured registries</SettingLabel>
                    {error ? (
                        <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                    ) : isLoading || !data ? (
                        <Loading />
                    ) : (
                        <div className="divide-y divide-ui-border/70 overflow-hidden rounded-ui-lg border border-ui-border/70">
                            {(data.items ?? []).map(registry => {
                                const busy = busyID === registry.id;
                                return (
                                    <div key={registry.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-ui-heading">{registry.name}</span>
                                                {registry.builtin && <Badge variant="primary" pill>Built-in</Badge>}
                                            </div>
                                            <div className="mt-1 truncate text-xs text-ui-muted" title={registry.url}>{registry.url}</div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            {busy && <Spinner size="sm" />}
                                            <Switch
                                                checked={registry.enabled}
                                                onCheckedChange={(enabled) => void toggle(registry, enabled)}
                                                disabled={Boolean(busyID)}
                                                aria-label={`Enable ${registry.name}`}
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                disabled={registry.builtin || Boolean(busyID)}
                                                onClick={() => remove(registry)}
                                                title={registry.builtin ? "Built-in registries cannot be deleted" : "Delete registry"}
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
            </ModalContent>
        </Modal>
    );
}
