import { FC, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
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

function makeSmoothPath(u: uPlot, seriesIdx: number, idx0: number, idx1: number) {
    const s = u.series[seriesIdx];
    const xdata = u.data[0];
    const ydata = u.data[seriesIdx];
    const scaleX = 'x';
    const scaleY = s.scale!;

    const stroke = new Path2D();

    let pts: [number, number][] = [];

    // 1. Collect valid points
    for (let i = idx0; i <= idx1; i++) {
        const y = ydata[i];
        if (y == null) continue;
        pts.push([
            u.valToPos(xdata[i], scaleX, true),
            u.valToPos(y, scaleY, true),
        ]);
    }

    if (pts.length < 2) return null;

    // --- Strict Monotone Cubic Spline (Fritsch-Carlson) ---
    const n = pts.length;
    const tangents: number[] = new Array(n).fill(0);
    const secants: number[] = new Array(n - 1).fill(0);

    // 1. Calculate secants (slope between points)
    for (let i = 0; i < n - 1; i++) {
        const dx = pts[i + 1][0] - pts[i][0];
        const dy = pts[i + 1][1] - pts[i][1];
        secants[i] = dy / dx;
    }

    // 2. Calculate initial tangents
    for (let i = 0; i < n; i++) {
        if (i === 0) {
            tangents[i] = secants[0];
        } else if (i === n - 1) {
            tangents[i] = secants[n - 2];
        } else {
            // Average of previous and next secant
            tangents[i] = (secants[i - 1] + secants[i]) / 2;

            // Fix 1: Zero out tangent at peaks/troughs
            if (secants[i - 1] * secants[i] <= 0) {
                tangents[i] = 0;
            }
        }
    }

    // 3. Apply "3x Constraint" to prevent overshoot on steep-to-flat transitions
    // This is the key fix for the negative values issue.
    for (let i = 0; i < n - 1; i++) {
        const m = secants[i];

        // Skip flat segments
        if (m === 0) {
            tangents[i] = 0;
            tangents[i + 1] = 0;
            continue;
        }

        // Check start point of the segment
        const alpha = tangents[i] / m;
        if (Math.abs(alpha) > 3) {
            tangents[i] = 3 * m;
        }

        // Check end point of the segment
        // (Note: we must re-evaluate tangent[i+1] in the context of this segment too)
        const beta = tangents[i + 1] / m;
        if (Math.abs(beta) > 3) {
            tangents[i + 1] = 3 * m;
        }
    }

    // --- Draw Path ---
    stroke.moveTo(pts[0][0], pts[0][1]);

    for (let i = 0; i < n - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const dx = p1[0] - p0[0];

        // Control Point calculation
        // CP1 = Start + Tangent * (dx / 3)
        // CP2 = End - Tangent * (dx / 3)
        let cp1x = p0[0] + dx / 3;
        let cp1y = p0[1] + tangents[i] * (dx / 3);

        let cp2x = p1[0] - dx / 3;
        let cp2y = p1[1] - tangents[i + 1] * (dx / 3);

        // --- Final Safety Net (Floating Point Protection) ---
        // Even with the math above, floating point errors can rarely cause micro-overshoots.
        // We clamp the control points strictly within the Y range of the two points.
        const yMin = Math.min(p0[1], p1[1]);
        const yMax = Math.max(p0[1], p1[1]);

        cp1y = Math.max(yMin, Math.min(yMax, cp1y));
        cp2y = Math.max(yMin, Math.min(yMax, cp2y));
        // ----------------------------------------------------

        stroke.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1[0], p1[1]);
    }

    const fill = new Path2D();
    const zeroY = u.valToPos(0, scaleY, true);

    fill.addPath(stroke);
    fill.lineTo(pts[pts.length - 1][0], zeroY);
    fill.lineTo(pts[0][0], zeroY);
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
    }, []);

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
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: minHeight,
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <div
                    ref={chartRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                />

                <div
                    ref={tooltipRef}
                    style={{
                        position: 'absolute',
                        display: 'none',
                        top: 0,
                        left: 0,
                        zIndex: 100,
                        pointerEvents: 'none',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate-900 with opacity
                        border: '0px solid rgba(255,255,255,0.1)',
                        padding: '0px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                        color: 'white',
                        fontSize: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.1s ease',
                    }}
                />
            </div >
        </>
    );
};

export default TrafficChart;