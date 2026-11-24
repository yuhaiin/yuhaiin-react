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
import toolbarStyles from "./toolbar.module.css";

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

    const connectionsLabel = visible === total ? t("toolbar.connectionsAria", { count: total }) : t("toolbar.connectionsOfAria", { visible, count: total });

    return (
        <div className={toolbarStyles.toolbar} data-topology-toolbar>
            <div className={toolbarStyles.row}>
                <div className={toolbarStyles.overview} data-part="overview">
                    {/* Below lg the app bar already shows the title. */}
                    <h1 className={cn(toolbarStyles.title, "sr-only lg:not-sr-only")}>{t("title")}</h1>
                    <Badge variant={status === "live" ? "success" : status === "paused" ? "secondary" : "warning"} dot className="shrink-0" role="status">
                        {t(`stream.${status}`)}
                    </Badge>
                    <span className={toolbarStyles.stats}>
                        <span className={toolbarStyles.count} data-part="count">
                            <span className="sr-only">{connectionsLabel}</span>
                            <span className={toolbarStyles.countShort} aria-hidden="true">
                                <span className={toolbarStyles.countValue}>{visible === total ? total : `${visible}/${total}`}</span>
                            </span>
                            <span className={toolbarStyles.countLong} aria-hidden="true">
                                <span className={toolbarStyles.countValue}>{visible}</span>{" "}
                                {visible === total ? t("toolbar.connections", { count: total }) : t("toolbar.connectionsOf", { count: total })}
                            </span>
                        </span>
                        <span className={toolbarStyles.rates} data-part="rates">
                            <span className="sr-only">{t("toolbar.ratesValue", { up: formatRate(up), down: formatRate(down) })}</span>
                            <span className={cn(toolbarStyles.rate, styles.up)} aria-hidden="true"><ArrowUp size={12} />{formatRate(up)}</span>
                            <span className={cn(toolbarStyles.rate, styles.down)} aria-hidden="true"><ArrowDown size={12} />{formatRate(down)}</span>
                        </span>
                    </span>
                </div>

                <div className={toolbarStyles.actions} data-part="actions">
                    <div className={toolbarStyles.search} data-part="search">
                        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" />
                        <Input
                            value={props.search}
                            onChange={event => props.onSearchChange(event.target.value)}
                            placeholder={t("toolbar.searchPlaceholder")}
                            aria-label={t("toolbar.search")}
                            className={props.search ? "pl-8 pr-16" : "pl-8"}
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
                        <Button variant="outline-secondary" size="sm" className={toolbarStyles.button} aria-label={t("toolbar.filters")} title={t("toolbar.filters")}>
                            <SlidersHorizontal size={14} />
                            <span className={toolbarStyles.label}>{t("toolbar.filters")}</span>
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
                        <FilterGroup label={t("filter.process")} values={options.processes.map(item => ({ id: item.id, label: item.label, title: item.id }))} selected={filter.processes}
                            onToggle={id => props.onFilterChange({ ...filter, processes: toggle(filter.processes, id) })} keepOpen={keepOpen} />
                        <FilterGroup label={t("filter.geo")} values={options.geo.map(value => ({ id: value, label: value.toUpperCase() }))} selected={filter.geo}
                            onToggle={id => props.onFilterChange({ ...filter, geo: toggle(filter.geo, id) })} keepOpen={keepOpen} />
                        {filters > 0 && <DropdownItem className="mt-1 border-t border-ui-border text-ui-primary" onSelect={() => props.onFilterChange(emptyFilter())}>{t("filter.clear")}</DropdownItem>}
                    </DropdownContent>
                </Dropdown>

                    {props.dnsAvailable && (
                        <Button variant={props.dns ? "default" : "outline-secondary"} size="sm" className={cn(toolbarStyles.button, props.dns && "border-ui-border-strong bg-ui-surface-muted")} aria-pressed={props.dns}
                            aria-label={t("toolbar.dnsLayer")} title={t("toolbar.dnsLayer")} onClick={() => props.onDnsChange(!props.dns)}>
                            <Layers size={14} /><span className={toolbarStyles.label}>DNS</span>
                        </Button>
                    )}

                    <Button variant={paused ? "primary" : "outline-secondary"} size="sm" className={toolbarStyles.button} aria-pressed={paused}
                        aria-label={paused ? t("toolbar.resume") : t("toolbar.pause")} title={paused ? t("toolbar.resume") : t("toolbar.pause")} onClick={() => props.onPausedChange(!paused)}>
                        {paused ? <Play size={14} /> : <Pause size={14} />}
                        <span className={toolbarStyles.label}>{paused ? t("toolbar.resume") : t("toolbar.pause")}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FilterGroup({ label, values, selected, onToggle, keepOpen }: { label: string; values: { id: string; label: string; title?: string }[]; selected: string[]; onToggle: (id: string) => void; keepOpen: (event: Event) => void }) {
    if (!values.length) return null;
    return (
        <>
            <DropdownLabel>{label}</DropdownLabel>
            {values.map(value => (
                <DropdownCheckboxItem key={value.id} checked={selected.includes(value.id)} onSelect={keepOpen} onCheckedChange={() => onToggle(value.id)}>
                    <span className="notranslate" title={value.title}>{value.label}</span>
                </DropdownCheckboxItem>
            ))}
        </>
    );
}
