import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { formatBytes } from '../connections/components';
import { Tooltip } from './tooltip';

function niceMax(value: number) {
    if (value <= 0) return 1;
    const exp = Math.floor(Math.log10(value));
    const base = Math.pow(10, exp);
    return Math.ceil(value / base) * base;
}

interface TrafficChartProps {
    data: {
        download: number[];
        upload: number[];
        labels: string[];
        rawMax: number;
    };
    minHeight: number;
}

interface Buffers {
    xBuf: Float64Array;
    yBuf: Float64Array;
    tangentsBuf: Float64Array;
    secantsBuf: Float64Array;
}

type EnsureBufferFn = (size: number) => Buffers;

function makeSmoothPathCore(
    u: uPlot,
    seriesIdx: number,
    idx0: number,
    idx1: number,
    ensureBuffer: EnsureBufferFn
) {
    const s = u.series[seriesIdx];
    const xdata = u.data[0];
    const ydata = u.data[seriesIdx];
    const scaleX = 'x';
    const scaleY = s.scale!;

    const stroke = new Path2D();

    // 1. Collect valid points
    let cnt = 0;
    const { xBuf, yBuf, tangentsBuf, secantsBuf } = ensureBuffer(idx1 - idx0 + 1);

    for (let i = idx0; i <= idx1; i++) {
        const y = ydata[i];
        if (y == null) continue;
        xBuf[cnt] = u.valToPos(xdata[i], scaleX, true);
        yBuf[cnt] = u.valToPos(y, scaleY, true);
        cnt++;
    }

    if (cnt < 2) return null;

    // --- Strict Monotone Cubic Spline (Fritsch-Carlson) ---
    const n = cnt;

    // 1. Calculate secants (slope between points)
    for (let i = 0; i < n - 1; i++) {
        const dx = xBuf[i + 1] - xBuf[i];
        const dy = yBuf[i + 1] - yBuf[i];
        secantsBuf[i] = dy / dx;
    }

    // 2. Calculate initial tangents
    for (let i = 0; i < n; i++) {
        if (i === 0) {
            tangentsBuf[i] = secantsBuf[0];
        } else if (i === n - 1) {
            tangentsBuf[i] = secantsBuf[n - 2];
        } else {
            // Average of previous and next secant
            tangentsBuf[i] = (secantsBuf[i - 1] + secantsBuf[i]) / 2;

            // Fix 1: Zero out tangent at peaks/troughs
            if (secantsBuf[i - 1] * secantsBuf[i] <= 0) {
                tangentsBuf[i] = 0;
            }
        }
    }

    // 3. Apply "3x Constraint" to prevent overshoot on steep-to-flat transitions
    for (let i = 0; i < n - 1; i++) {
        const m = secantsBuf[i];

        // Skip flat segments
        if (m === 0) {
            tangentsBuf[i] = 0;
            tangentsBuf[i + 1] = 0;
            continue;
        }

        // Check start point of the segment
        const alpha = tangentsBuf[i] / m;
        if (Math.abs(alpha) > 3) {
            tangentsBuf[i] = 3 * m;
        }

        // Check end point of the segment
        const beta = tangentsBuf[i + 1] / m;
        if (Math.abs(beta) > 3) {
            tangentsBuf[i + 1] = 3 * m;
        }
    }

    // --- Draw Path ---
    stroke.moveTo(xBuf[0], yBuf[0]);

    for (let i = 0; i < n - 1; i++) {
        const p0x = xBuf[i];
        const p0y = yBuf[i];
        const p1x = xBuf[i + 1];
        const p1y = yBuf[i + 1];

        const dx = p1x - p0x;

        // Control Point calculation
        let cp1x = p0x + dx / 3;
        let cp1y = p0y + tangentsBuf[i] * (dx / 3);

        let cp2x = p1x - dx / 3;
        let cp2y = p1y - tangentsBuf[i + 1] * (dx / 3);

        // --- Final Safety Net (Floating Point Protection) ---
        const yMin = Math.min(p0y, p1y);
        const yMax = Math.max(p0y, p1y);

        cp1y = Math.max(yMin, Math.min(yMax, cp1y));
        cp2y = Math.max(yMin, Math.min(yMax, cp2y));

        stroke.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1x, p1y);
    }

    const fill = new Path2D();
    const zeroY = u.valToPos(0, scaleY, true);

    fill.addPath(stroke);
    fill.lineTo(xBuf[n - 1], zeroY);
    fill.lineTo(xBuf[0], zeroY);
    fill.closePath();

    return { stroke, fill };
}

const TrafficChart: FC<TrafficChartProps> = ({ data, minHeight }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const uPlotInst = useRef<uPlot | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState({
        visible: false,
        left: 0,
        top: 0,
        label: '',
        upload: 0,
        download: 0,
    });
    const indices = useMemo(() => Array.from({ length: data.labels.length }, (_, i) => i), [data.labels.length]);

    const latestLabelsRef = useRef(data.labels);
    useEffect(() => { latestLabelsRef.current = data.labels; }, [data.labels]);

    // Use a factory to create a closure for buffers, ensuring each chart instance has its own
    const makeSmoothPath = useMemo(() => {
        let bufSize = 0;
        let buffers: Buffers = {
            xBuf: new Float64Array(0),
            yBuf: new Float64Array(0),
            tangentsBuf: new Float64Array(0),
            secantsBuf: new Float64Array(0),
        };

        function ensureBuffer(size: number) {
            if (bufSize < size) {
                bufSize = size + BUFFER_GROWTH_SIZE;
                buffers = {
                    xBuf: new Float64Array(bufSize),
                    yBuf: new Float64Array(bufSize),
                    tangentsBuf: new Float64Array(bufSize),
                    secantsBuf: new Float64Array(bufSize),
                };
            }
            return buffers;
        }

        return (u: uPlot, seriesIdx: number, idx0: number, idx1: number) =>
            makeSmoothPathCore(u, seriesIdx, idx0, idx1, ensureBuffer);
    }, []);

    useLayoutEffect(() => {
        if (!wrapperRef.current || !chartRef.current) return;

        let width = wrapperRef.current.clientWidth;
        let height = wrapperRef.current.clientHeight;

        if (width === 0) width = 600;
        if (height === 0) height = 300;

        const opts: uPlot.Options = {
            width: width,
            height: height,
            mode: 1,
            padding: [
                10, // top
                7,  // right
                10, // bottom
                7  // left
            ],
            series: [
                { value: (_, rawValue) => data.labels[rawValue] || "" },
                {
                    label: "Upload",
                    stroke: "#10b981",
                    fill: "rgba(16, 185, 129, 0.1)",
                    width: 2,
                    points: { show: false },
                    value: (_, rawValue) => formatBytes(rawValue ?? 0, 2, " ") + '/S',
                    paths: makeSmoothPath
                },
                {
                    label: "Download",
                    stroke: "#3b82f6",
                    fill: "rgba(59, 130, 246, 0.1)",
                    width: 2,
                    points: { show: false },
                    value: (_, rawValue) => formatBytes(rawValue ?? 0, 2, " ") + '/S',
                    paths: makeSmoothPath
                }
            ],
            axes: [
                { show: false },
                {
                    show: true,
                    stroke: "#475569",
                    font: '10px sans-serif',
                    grid: { show: true, stroke: "rgba(255, 255, 255, 0.05)", width: 1 },
                    ticks: { show: true, stroke: "rgba(255, 255, 255, 0.05)" },
                    values: (_, ticks) => ticks.map(v => formatBytes(Number(v), 0, " ") + '/S'),
                    size: 65,
                    gap: 0,
                }
            ],
            legend: { show: false },
            cursor: {
                drag: { setScale: false },
                points: {
                    size: 9, width: 2,
                    stroke: (u, seriesIdx) => u.series[seriesIdx].stroke as string,
                    fill: () => "#1e293b",
                }
            },
            scales: {
                x: { time: false },
                y: { auto: false, range: [0, niceMax(data.rawMax)] }
            },
            hooks: {
                setCursor: [
                    (u) => {
                        const { idx, left: cursorLeft = 0, top: cursorTop = 0 } = u.cursor;

                        if (idx == null) {
                            setTooltip((t) => ({ ...t, visible: false }));
                            return;
                        }

                        const label = latestLabelsRef.current[idx] || '';
                        const upload = u.data[1][idx] ?? 0;
                        const download = u.data[2][idx] ?? 0;

                        const chartLeft = u.bbox.left;
                        const chartTop = u.bbox.top;

                        let left = chartLeft + cursorLeft + 20;
                        if (left > u.width - 150) left = chartLeft + cursorLeft - 160;

                        setTooltip({
                            visible: true,
                            left,
                            top: chartTop + cursorTop,
                            label,
                            upload,
                            download,
                        });
                    }
                ]
            }

        };

        const initialData = [indices, data.upload, data.download] as [number[], number[], number[]];

        const u = new uPlot(opts, initialData, chartRef.current);
        uPlotInst.current = u;

        return () => {
            u.destroy();
            uPlotInst.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [makeSmoothPath]);

    useEffect(() => {
        if (!uPlotInst.current) return;
        const u = uPlotInst.current;
        const yMax = niceMax(data.rawMax);
        const newData = [indices, data.upload, data.download] as [number[], number[], number[]];

        u.batch(() => {
            u.setScale('y', { min: 0, max: yMax });
            u.setData(newData);
        });
    }, [data, indices]);

    useEffect(() => {
        if (!wrapperRef.current || !uPlotInst.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (!uPlotInst.current) return;
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    uPlotInst.current.setSize({ width, height });
                }
            }
        });

        resizeObserver.observe(wrapperRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <>
            <Tooltip {...tooltip} />
            <div
                ref={wrapperRef}
                className="relative w-full h-full flex-auto flex flex-col min-w-0"
                style={{
                    minHeight: minHeight,
                }}
            >
                <div
                    ref={chartRef}
                    className="absolute top-0 left-0 w-full h-full overflow-hidden"
                />

                <div
                    ref={tooltipRef}
                    className="absolute hidden top-0 left-0 z-[100] pointer-events-none bg-slate-900/90 border-0 p-0 rounded-md shadow-md text-white text-[6px] whitespace-nowrap transition-opacity duration-100"
                />
            </div >
        </>
    );
};

export default TrafficChart;
