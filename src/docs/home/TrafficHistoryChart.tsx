import type { TrafficSeries } from "@/contract/connection";
import { Chart as ChartJS, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip, type TooltipItem } from "chart.js";
import { FC, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { formatBytes } from "../connections/components";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const dateFormat: Record<TrafficSeries["interval"], Intl.DateTimeFormatOptions> = {
    hour: { hour: "2-digit", minute: "2-digit" },
    day: { month: "short", day: "numeric" },
    month: { year: "numeric", month: "short" },
};

function bucketSeconds(start: string, interval: TrafficSeries["interval"]): number {
    if (interval === "hour") return 60 * 60;
    if (interval === "day") return 24 * 60 * 60;
    const date = new Date(start);
    return (Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - date.getTime()) / 1000;
}

const TrafficHistoryChart: FC<{ data?: TrafficSeries; error?: string; minHeight: number }> = ({ data, error, minHeight }) => {
    const chartData = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(undefined, dateFormat[data?.interval ?? "hour"]);
        return {
            labels: (data?.items ?? []).map(item => formatter.format(new Date(item.start))),
            datasets: [
                {
                    label: "Download",
                    data: (data?.items ?? []).map(item => Number(item.download)),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.28,
                },
                {
                    label: "Upload",
                    data: (data?.items ?? []).map(item => Number(item.upload)),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.28,
                },
            ],
        };
    }, [data]);

    if (error) return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-danger">{error}</div>;
    if (!data) return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-muted">Loading traffic history…</div>;
    if (data.items.length === 0) return <div className="flex min-h-[400px] items-center justify-center p-6 text-sm text-ui-muted">No traffic recorded in this range.</div>;

    return (
        <div className="p-4" style={{ minHeight }}>
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { position: "top", align: "end", labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
                        tooltip: {
                            displayColors: false,
                            backgroundColor: "rgba(10, 14, 21, 0.94)",
                            padding: 10,
                            cornerRadius: 8,
                            titleFont: { size: 12, weight: 600 },
                            bodyFont: { size: 12, weight: 500 },
                            footerFont: { size: 11, weight: 400 },
                            titleMarginBottom: 6,
                            footerMarginTop: 6,
                            callbacks: {
                                label: (context: TooltipItem<"line">) => {
                                    const total = Number(context.parsed.y);
                                    return `${context.dataset.label}: ${formatBytes(total, 2, " ")}`;
                                },
                                footer: (contexts: TooltipItem<"line">[]) => {
                                    const item = data.items[contexts[0]?.dataIndex ?? 0];
                                    const rates = contexts.map(context => `${context.dataset.label} ${formatBytes(Number(context.parsed.y) / bucketSeconds(item.start, data.interval), 2, " ")}/s`);
                                    return `Average: ${rates.join(" · ")}`;
                                },
                            },
                        },
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: value => formatBytes(Number(value), 1, " ") }, grid: { color: "rgba(148, 163, 184, 0.14)" } },
                        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 18 } },
                    },
                }}
            />
        </div>
    );
};

export default TrafficHistoryChart;
