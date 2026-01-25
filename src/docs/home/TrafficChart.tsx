
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
import { formatBytes } from '../connections/components';

function niceMax(value: number) {
    if (value <= 0) return 1;
    const exp = Math.floor(Math.log10(value));
    const base = Math.pow(10, exp);
    return Math.ceil(value / base) * base;
}


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
                    return `${context.dataset.label}: ${formatBytes(context.parsed.y, 2, " ") + '/S'}`;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 1024 * 1024, // 1 MB/s
            ticks: {
                count: 5,
                callback: (value: any) => { return formatBytes(Number(value), 2, " ") + '/S'; },
                color: '#475569',
                font: { size: 10 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: { display: false }
    },
    elements: {
        line: {
            tension: 0.4, // Adjust tension for smoother curves
        }
    }
};

const TrafficChart: FC<{ data: { download: number[], upload: number[], labels: string[], rawMax: number } }> = ({ data }) => {
    const yMax = niceMax(data.rawMax);

    const dynamicOptions = {
        ...options,
        scales: {
            ...options.scales,
            y: {
                ...options.scales.y,
                max: yMax,
            }
        }
    };

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Upload',
                data: data.upload,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Download',
                data: data.download,
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