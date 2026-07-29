import type { TrafficSeries } from "@/contract/connection";
import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { formatBytes } from "./format";
import { Tooltip, type ChartTooltipHandle } from "./tooltip";

const BUFFER_GROWTH_SIZE = 1024;
const TOOLTIP_WIDTH = 176;
const TOOLTIP_GAP = 12;

const dateFormat: Record<TrafficSeries["interval"], Intl.DateTimeFormatOptions> = {
    hour: { hour: "2-digit", minute: "2-digit" },
    day: { month: "short", day: "numeric" },
    month: { year: "numeric", month: "short" },
};

type LiveTrafficData = {
    download: number[];
    upload: number[];
    labels: string[];
    rawMax: number;
};

type TrafficChartProps = { minHeight: number } & (
    { mode: "live"; data: LiveTrafficData; emptyMessage?: string } |
    { mode: "history"; data?: TrafficSeries; error?: string }
);

type PlotData = {
    x: number[];
    labels: string[];
    download: number[];
    upload: number[];
    rawMax: number;
    time: boolean;
    items?: TrafficSeries["items"];
    interval?: TrafficSeries["interval"];
};

interface Buffers {
    xBuf: Float64Array;
    yBuf: Float64Array;
    tangentsBuf: Float64Array;
    secantsBuf: Float64Array;
}

type EnsureBufferFn = (size: number) => Buffers;

function niceMax(value: number) {
    if (value <= 0) return 1;
    const exp = Math.floor(Math.log10(value));
    const base = Math.pow(10, exp);
    return Math.ceil(value / base) * base;
}

function bucketSeconds(start: string, interval: TrafficSeries["interval"]): number {
    if (interval === "hour") return 60 * 60;
    if (interval === "day") return 24 * 60 * 60;
    const date = new Date(start);
    return (Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - date.getTime()) / 1000;
}

function chartPalette() {
    const dark = typeof document !== "undefined"
        && document.documentElement.getAttribute("data-bs-theme") === "dark";
    return {
        uploadStroke: dark ? "#8fc7a8" : "#198754",
        uploadFill: dark ? "rgba(143, 199, 168, 0.12)" : "rgba(25, 135, 84, 0.12)",
        downloadStroke: dark ? "#7dd3fc" : "#0284c7",
        downloadFill: dark ? "rgba(125, 211, 252, 0.12)" : "rgba(2, 132, 199, 0.12)",
        axis: dark ? "#94a3b8" : "#64748b",
        grid: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.06)",
        pointFill: dark ? "#1e293b" : "#ffffff",
    };
}

function makeSmoothPathCore(u: uPlot, seriesIdx: number, idx0: number, idx1: number, ensureBuffer: EnsureBufferFn) {
    const s = u.series[seriesIdx];
    const xdata = u.data[0];
    const ydata = u.data[seriesIdx];
    const stroke = new Path2D();
    let count = 0;
    const { xBuf, yBuf, tangentsBuf, secantsBuf } = ensureBuffer(idx1 - idx0 + 1);

    for (let i = idx0; i <= idx1; i++) {
        const y = ydata[i];
        if (y == null) continue;
        xBuf[count] = u.valToPos(xdata[i], "x", true);
        yBuf[count] = u.valToPos(y, s.scale!, true);
        count++;
    }

    if (count < 2) return null;

    for (let i = 0; i < count - 1; i++) {
        secantsBuf[i] = (yBuf[i + 1] - yBuf[i]) / (xBuf[i + 1] - xBuf[i]);
    }
    for (let i = 0; i < count; i++) {
        if (i === 0) tangentsBuf[i] = secantsBuf[0];
        else if (i === count - 1) tangentsBuf[i] = secantsBuf[count - 2];
        else {
            tangentsBuf[i] = (secantsBuf[i - 1] + secantsBuf[i]) / 2;
            if (secantsBuf[i - 1] * secantsBuf[i] <= 0) tangentsBuf[i] = 0;
        }
    }
    for (let i = 0; i < count - 1; i++) {
        const slope = secantsBuf[i];
        if (slope === 0) {
            tangentsBuf[i] = 0;
            tangentsBuf[i + 1] = 0;
            continue;
        }
        if (Math.abs(tangentsBuf[i] / slope) > 3) tangentsBuf[i] = 3 * slope;
        if (Math.abs(tangentsBuf[i + 1] / slope) > 3) tangentsBuf[i + 1] = 3 * slope;
    }

    stroke.moveTo(xBuf[0], yBuf[0]);
    for (let i = 0; i < count - 1; i++) {
        const p0x = xBuf[i];
        const p0y = yBuf[i];
        const p1x = xBuf[i + 1];
        const p1y = yBuf[i + 1];
        const dx = p1x - p0x;
        const yMin = Math.min(p0y, p1y);
        const yMax = Math.max(p0y, p1y);
        const cp1y = Math.max(yMin, Math.min(yMax, p0y + tangentsBuf[i] * (dx / 3)));
        const cp2y = Math.max(yMin, Math.min(yMax, p1y - tangentsBuf[i + 1] * (dx / 3)));
        stroke.bezierCurveTo(p0x + dx / 3, cp1y, p1x - dx / 3, cp2y, p1x, p1y);
    }

    const fill = new Path2D();
    fill.addPath(stroke);
    fill.lineTo(xBuf[count - 1], u.valToPos(0, s.scale!, true));
    fill.lineTo(xBuf[0], u.valToPos(0, s.scale!, true));
    fill.closePath();
    return { stroke, fill };
}

const TrafficChart: FC<TrafficChartProps> = (props) => {
    const { t } = useTranslation("home");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const uPlotInst = useRef<uPlot | null>(null);
    const tooltipRef = useRef<ChartTooltipHandle | null>(null);
    const plotDataRef = useRef<PlotData | null>(null);
    const bufferStateRef = useRef<{ bufSize: number; buffers: Buffers }>({
        bufSize: 0,
        buffers: {
            xBuf: new Float64Array(0),
            yBuf: new Float64Array(0),
            tangentsBuf: new Float64Array(0),
            secantsBuf: new Float64Array(0),
        },
    });

    const historyInterval = props.mode === "history" ? props.data?.interval ?? "hour" : "hour";
    const historyFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, dateFormat[historyInterval]), [historyInterval]);
    const plotData = useMemo<PlotData>(() => {
        if (props.mode === "live") {
            return {
                x: props.data.labels.map((_, index) => index),
                labels: props.data.labels,
                download: props.data.download,
                upload: props.data.upload,
                rawMax: props.data.rawMax,
                time: false,
            };
        }

        const items = props.data?.items ?? [];
        return {
            x: items.map(item => new Date(item.start).getTime() / 1000),
            labels: items.map(item => historyFormatter.format(new Date(item.start))),
            download: items.map(item => Number(item.download) || 0),
            upload: items.map(item => Number(item.upload) || 0),
            rawMax: Math.max(0, ...items.flatMap(item => [Number(item.download) || 0, Number(item.upload) || 0])),
            time: true,
            items,
            interval: historyInterval,
        };
    }, [historyFormatter, historyInterval, props.mode, props.data]);

    const makeSmoothPath = useCallback((u: uPlot, seriesIdx: number, idx0: number, idx1: number) => {
        const ensureBuffer = (size: number) => {
            const state = bufferStateRef.current;
            if (state.bufSize < size) {
                const nextSize = size + BUFFER_GROWTH_SIZE;
                bufferStateRef.current = {
                    bufSize: nextSize,
                    buffers: {
                        xBuf: new Float64Array(nextSize),
                        yBuf: new Float64Array(nextSize),
                        tangentsBuf: new Float64Array(nextSize),
                        secantsBuf: new Float64Array(nextSize),
                    },
                };
            }
            return bufferStateRef.current.buffers;
        };
        return makeSmoothPathCore(u, seriesIdx, idx0, idx1, ensureBuffer);
    }, []);

    useEffect(() => {
        plotDataRef.current = plotData;
    }, [plotData]);

    useLayoutEffect(() => {
        if (!wrapperRef.current || !chartRef.current || plotData.x.length === 0) return;

        const palette = chartPalette();
        const wrapper = wrapperRef.current;
        const chart = chartRef.current;
        const tooltipHeight = props.mode === "history" ? 92 : 72;
        const formatX = props.mode === "history"
            ? (value: number) => historyFormatter.format(new Date(value * 1000))
            : (value: number) => plotData.labels[value] || "";
        const opts: uPlot.Options = {
            width: Math.max(wrapper.clientWidth, 320),
            height: Math.max(wrapper.clientHeight, props.minHeight),
            mode: 1,
            padding: [10, 7, 10, 7],
            scales: {
                x: { time: plotData.time },
                y: { auto: false, range: [0, niceMax(plotData.rawMax)] },
            },
            series: [
                { value: (_, rawValue) => formatX(Number(rawValue)) },
                {
                    label: props.mode === "live" ? t("download") : "Download",
                    stroke: palette.downloadStroke,
                    fill: palette.downloadFill,
                    width: 2,
                    points: { show: false },
                    paths: makeSmoothPath,
                    value: (_, rawValue) => `${formatBytes(Number(rawValue) || 0, 2, " ")}${props.mode === "live" ? "/S" : ""}`,
                },
                {
                    label: props.mode === "live" ? t("upload") : "Upload",
                    stroke: palette.uploadStroke,
                    fill: palette.uploadFill,
                    width: 2,
                    points: { show: false },
                    paths: makeSmoothPath,
                    value: (_, rawValue) => `${formatBytes(Number(rawValue) || 0, 2, " ")}${props.mode === "live" ? "/S" : ""}`,
                },
            ],
            axes: [
                {
                    show: plotData.time,
                    stroke: palette.axis,
                    font: "11px sans-serif",
                    grid: { show: false },
                    ticks: { show: false },
                    values: (_, values) => values.map(value => formatX(value)),
                    size: 34,
                },
                {
                    stroke: palette.axis,
                    font: "10px sans-serif",
                    grid: { show: true, stroke: palette.grid, width: 1 },
                    ticks: { show: true, stroke: palette.grid },
                    values: (_, values) => values.map(value => `${formatBytes(Number(value), 0, " ")}${props.mode === "live" ? "/S" : ""}`),
                    size: 68,
                    gap: 0,
                },
            ],
            legend: { show: false },
            cursor: {
                drag: { setScale: false },
                points: {
                    size: 9,
                    width: 2,
                    stroke: (u, seriesIdx) => u.series[seriesIdx].stroke as string,
                    fill: () => palette.pointFill,
                },
            },
            hooks: {
                setCursor: [u => {
                    const idx = u.cursor.idx;
                    const current = plotDataRef.current;
                    if (idx == null || !current) {
                        tooltipRef.current?.hide();
                        return;
                    }

                    const upload = u.data[2][idx] ?? 0;
                    const download = u.data[1][idx] ?? 0;
                    const label = current.labels[idx] || "";
                    const wrapperRect = wrapper.getBoundingClientRect();
                    const cursorLeft = u.cursor.left ?? 0;
                    const cursorTop = u.cursor.top ?? 0;
                    let left = wrapperRect.left + u.bbox.left + cursorLeft + TOOLTIP_GAP;
                    let top = wrapperRect.top + u.bbox.top + cursorTop - tooltipHeight / 2;
                    if (left + TOOLTIP_WIDTH > window.innerWidth - TOOLTIP_GAP) left -= TOOLTIP_WIDTH + TOOLTIP_GAP * 2;
                    if (top + tooltipHeight > window.innerHeight - TOOLTIP_GAP) top -= tooltipHeight + TOOLTIP_GAP;

                    const item = current.items?.[idx];
                    const seconds = item && current.interval ? bucketSeconds(item.start, current.interval) : 1;
                    tooltipRef.current?.show({
                        left: Math.min(Math.max(left, TOOLTIP_GAP), Math.max(TOOLTIP_GAP, window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_GAP)),
                        top: Math.min(Math.max(top, TOOLTIP_GAP), Math.max(TOOLTIP_GAP, window.innerHeight - tooltipHeight - TOOLTIP_GAP)),
                        label,
                        upload,
                        download,
                        ...(props.mode === "history" ? {
                            uploadLabel: formatBytes(upload, 2, " "),
                            downloadLabel: formatBytes(download, 2, " "),
                            footer: `Average: Download ${formatBytes(download / seconds, 2, " ")}/s · Upload ${formatBytes(upload / seconds, 2, " ")}/s`,
                        } : {}),
                    });
                }],
            },
        };

        const chartInstance = new uPlot(opts, [plotData.x, plotData.download, plotData.upload], chart);
        uPlotInst.current = chartInstance;
        return () => {
            chartInstance.destroy();
            uPlotInst.current = null;
        };
        // Data values are updated through setData below; recreate only when the chart mode or shape changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyFormatter, makeSmoothPath, plotData.time, props.mode, props.minHeight, plotData.x.length === 0 ? 0 : 1, t]);

    useEffect(() => {
        const chart = uPlotInst.current;
        if (!chart || plotData.x.length === 0) return;
        chart.batch(() => {
            chart.setScale("y", { min: 0, max: niceMax(plotData.rawMax) });
            chart.setData([plotData.x, plotData.download, plotData.upload]);
        });
    }, [plotData]);

    useEffect(() => {
        if (!wrapperRef.current || !uPlotInst.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            const chart = uPlotInst.current;
            if (!chart) return;
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) chart.setSize({ width, height });
            }
        });
        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    if (props.mode === "live" && props.data.labels.length === 0) {
        return <div className="friendly-chart-empty"><span>{props.emptyMessage || "Waiting for live traffic samples…"}</span></div>;
    }
    if (props.mode === "history") {
        if (props.error) {
            return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-danger">{props.error}</div>;
        }
        if (!props.data) {
            return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-muted">Loading traffic history…</div>;
        }
        if (props.data.items.length === 0) {
            return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-muted">No traffic recorded in this range.</div>;
        }
    }

    return (
        <div ref={wrapperRef} className="relative min-h-0 w-full min-w-0" style={{ minHeight: props.minHeight }}>
            <div ref={chartRef} className="absolute inset-0 overflow-hidden" />
            <Tooltip ref={tooltipRef} />
        </div>
    );
};

export default TrafficChart;
