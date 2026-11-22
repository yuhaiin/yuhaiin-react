import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Dropdown, DropdownCheckboxItem, DropdownContent, DropdownItem, DropdownLabel, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Input } from "@/component/v2/input";
import { cn } from "@/component/v2/styles";
import { ArrowDown, ArrowUp, Layers, Pause, Play, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StreamState } from "../v2/use-connection-stream";
import { activeFilterCount, emptyFilter, type FilterOptions, type OutboundClass, type TopologyFilter } from "./model";
import { formatRate } from "./presentation";
import styles from "./topology.module.css";

interface ToolbarProps {
    state: StreamState;
    paused: boolean;
    onPausedChange: (paused: boolean) => void;
    visible: number;
    total: number;
    up: number;
    down: number;
    search: string;
    onSearchChange: (value: string) => void;
    matches: number;
    filter: TopologyFilter;
    options: FilterOptions;
    onFilterChange: (filter: TopologyFilter) => void;
    dnsAvailable: boolean;
    dns: boolean;
    onDnsChange: (value: boolean) => void;
}

const CLASSES: OutboundClass[] = ["direct", "proxy", "vpn", "block", "other"];

function toggle(values: string[], value: string) {
    return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

export function TopologyToolbar(props: ToolbarProps) {
    const { t } = useTranslation("topology");
    const { state, paused, visible, total, up, down, filter, options } = props;
    const filters = activeFilterCount(filter);
    const status = paused ? "paused" : state;
    const keepOpen = (event: Event) => event.preventDefault();

    return (
        <div className="mb-3 flex shrink-0 flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <h1 className="sr-only text-2xl font-semibold tracking-tight text-ui-heading lg:not-sr-only">{t("title")}</h1>
                <Badge variant={status === "live" ? "success" : status === "paused" ? "secondary" : "warning"} dot className="shrink-0" role="status">
                    {t(`stream.${status}`)}
                </Badge>
                <span className="flex min-w-0 items-baseline gap-1 text-xs text-ui-muted">
                    <span className="font-mono text-sm font-medium tabular-nums text-ui-heading">{visible}</span>
                    {visible === total ? t("toolbar.connections", { count: total }) : t("toolbar.connectionsOf", { count: total })}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-xs tabular-nums md:ml-0" aria-label={t("toolbar.rates")}>
                    <span className={cn("inline-flex items-center gap-0.5", styles.up)}><ArrowUp size={12} aria-hidden="true" />{formatRate(up)}</span>
                    <span className={cn("inline-flex items-center gap-0.5", styles.down)}><ArrowDown size={12} aria-hidden="true" />{formatRate(down)}</span>
                </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 md:ml-auto">
                <div className="relative min-w-0 flex-1 md:w-64 md:flex-none">
                    <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" />
                    <Input
                        value={props.search}
                        onChange={event => props.onSearchChange(event.target.value)}
                        placeholder={t("toolbar.searchPlaceholder")}
                        aria-label={t("toolbar.search")}
                        className="pl-8 pr-16"
                        type="search"
                    />
                    {props.search && (
                        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                            <span className="font-mono text-xs tabular-nums text-ui-muted" aria-live="polite">{props.matches}</span>
                            <button type="button" className="inline-flex size-6 items-center justify-center rounded-ui-sm text-ui-muted hover:text-ui-heading" aria-label={t("toolbar.clearSearch")} onClick={() => props.onSearchChange("")}>
                                <X size={13} />
                            </button>
                        </span>
                    )}
                </div>

                <Dropdown modal={false}>
                    <DropdownTrigger asChild>
                        <Button variant="outline-secondary" size="sm" className="shrink-0 max-md:min-h-11 max-md:min-w-11" aria-label={t("toolbar.filters")}>
                            <SlidersHorizontal size={14} />
                            <span className="hidden md:inline">{t("toolbar.filters")}</span>
                            {filters > 0 && <Badge variant="primary" pill className="min-w-5 px-1.5 py-0">{filters}</Badge>}
                        </Button>
                    </DropdownTrigger>
                    <DropdownContent align="end" className="w-72 max-w-[min(20rem,calc(100vw-24px))]" viewportClassName="max-h-[min(70vh,calc(var(--radix-dropdown-menu-content-available-height)-1rem))]">
                        <DropdownLabel>{t("filter.network")}</DropdownLabel>
                        <DropdownRadioGroup value={filter.network} onValueChange={value => props.onFilterChange({ ...filter, network: value as TopologyFilter["network"] })}>
                            {(["all", "tcp", "udp"] as const).map(value => <DropdownRadioItem key={value} value={value} onSelect={keepOpen}>{t(`filter.networkValue.${value}`)}</DropdownRadioItem>)}
                        </DropdownRadioGroup>
                        <DropdownLabel>{t("filter.family")}</DropdownLabel>
                        <DropdownRadioGroup value={filter.family} onValueChange={value => props.onFilterChange({ ...filter, family: value as TopologyFilter["family"] })}>
                            {(["all", "ipv4", "ipv6"] as const).map(value => <DropdownRadioItem key={value} value={value} onSelect={keepOpen}>{t(`filter.familyValue.${value}`)}</DropdownRadioItem>)}
                        </DropdownRadioGroup>
                        <DropdownLabel>{t("filter.class")}</DropdownLabel>
                        {CLASSES.map(value => (
                            <DropdownCheckboxItem key={value} checked={filter.classes.includes(value)} onSelect={keepOpen}
                                onCheckedChange={() => props.onFilterChange({ ...filter, classes: toggle(filter.classes, value) as OutboundClass[] })}>
                                {t(`filter.classValue.${value}`)}
                            </DropdownCheckboxItem>
                        ))}
                        <FilterGroup label={t("filter.inbound")} values={options.inbounds.map(item => ({ id: item.id, label: item.label || t("node.unknown") }))} selected={filter.inbounds}
                            onToggle={id => props.onFilterChange({ ...filter, inbounds: toggle(filter.inbounds, id) })} keepOpen={keepOpen} />
                        <FilterGroup label={t("filter.outbound")} values={options.outbounds.map(item => ({ id: item.id, label: item.label || t(`filter.outboundName.${item.id.replace("outbound:", "")}`, { defaultValue: item.id }) }))} selected={filter.outbounds}
                            onToggle={id => props.onFilterChange({ ...filter, outbounds: toggle(filter.outbounds, id) })} keepOpen={keepOpen} />
                        <FilterGroup label={t("filter.process")} values={options.processes.map(value => ({ id: value, label: value }))} selected={filter.processes}
                            onToggle={id => props.onFilterChange({ ...filter, processes: toggle(filter.processes, id) })} keepOpen={keepOpen} />
                        <FilterGroup label={t("filter.geo")} values={options.geo.map(value => ({ id: value, label: value.toUpperCase() }))} selected={filter.geo}
                            onToggle={id => props.onFilterChange({ ...filter, geo: toggle(filter.geo, id) })} keepOpen={keepOpen} />
                        {filters > 0 && <DropdownItem className="mt-1 border-t border-ui-border text-ui-primary" onSelect={() => props.onFilterChange(emptyFilter())}>{t("filter.clear")}</DropdownItem>}
                    </DropdownContent>
                </Dropdown>

                {props.dnsAvailable && (
                    <Button variant={props.dns ? "default" : "outline-secondary"} size="sm" className="shrink-0 max-md:min-h-11 max-md:min-w-11" aria-pressed={props.dns}
                        aria-label={t("toolbar.dnsLayer")} onClick={() => props.onDnsChange(!props.dns)}>
                        <Layers size={14} /><span className="hidden md:inline">DNS</span>
                    </Button>
                )}

                <Button variant={paused ? "primary" : "outline-secondary"} size="sm" className="shrink-0 max-md:min-h-11 max-md:min-w-11" aria-pressed={paused}
                    aria-label={paused ? t("toolbar.resume") : t("toolbar.pause")} onClick={() => props.onPausedChange(!paused)}>
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                    <span className="hidden md:inline">{paused ? t("toolbar.resume") : t("toolbar.pause")}</span>
                </Button>
            </div>
        </div>
    );
}

function FilterGroup({ label, values, selected, onToggle, keepOpen }: { label: string; values: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void; keepOpen: (event: Event) => void }) {
    if (!values.length) return null;
    return (
        <>
            <DropdownLabel>{label}</DropdownLabel>
            {values.map(value => (
                <DropdownCheckboxItem key={value.id} checked={selected.includes(value.id)} onSelect={keepOpen} onCheckedChange={() => onToggle(value.id)}>
                    <span className="notranslate">{value.label}</span>
                </DropdownCheckboxItem>
            ))}
        </>
    );
}
