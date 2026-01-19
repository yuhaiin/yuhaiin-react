
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { FC } from 'react';
import { Line } from 'react-chartjs-2';
import { formatBytes } from './connections/components';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
        y: { duration: 0 },
        x: { duration: 0 }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: function (context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += formatBytes(context.parsed.y) + '/s';
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 1024 * 1024, // 1 MB/s
            ticks: {
                callback: (value: any) => {
                    const mbValue = Number(value) / (1024 * 1024);
                    return `${mbValue.toFixed(2)} MB/s`;
                },
                color: '#475569',
                font: { size: 10 }
            },
            grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { display: false }
    },
    elements: {
        line: {
            tension: 0.4, // Adjust tension for smoother curves
        }
    }
};

interface data {
    upload: number,
    download: number,
    time: string,
}

const TrafficChart: FC<{ data: data[] }> = ({ data }) => {
    const MB = 1024 * 1024;

    const rawMax = Math.max(...data.flatMap(d => [d.upload, d.download]), 0);

    let smartMax = MB;
    if (rawMax > MB) {
        const power = Math.ceil(Math.log10(rawMax));
        smartMax = Math.pow(10, power);
    }

    const dynamicOptions = {
        ...options,
        scales: {
            ...options.scales,
            y: {
                ...options.scales.y,
                max: smartMax,
                ticks: {
                    ...options.scales.y.ticks,
                    count: 5,
                    callback: (value: any) => {
                        const val = Number(value);
                        const mbValue = val / MB;

                        if (val >= 1024 * MB) {
                            return `${(val / (1024 * MB)).toFixed(1)} GB/s`;
                        }

                        if (smartMax <= 1 * MB) {
                            return `${mbValue.toFixed(1)} MB/s`;
                        }

                        return `${mbValue.toFixed(0)} MB/s`;
                    }
                }
            }
        }
    };

    const chartData = {
        labels: data.map(d => d.time),
        datasets: [
            {
                label: 'Upload',
                data: data.map(d => d.upload),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Download',
                data: data.map(d => d.download),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return <Line options={dynamicOptions} data={chartData} />;
};

export default TrafficChart;