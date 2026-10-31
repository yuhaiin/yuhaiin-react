import { cn } from '@/component/v2/styles';
import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { usageBytes, type UsageReport } from './usage-api';

const series = [
    { key: 'download', color: 'var(--chart-download)' },
    { key: 'upload', color: 'var(--chart-upload)' },
] as const;
const MAX_X_LABELS = 6;
/** Keeps the tooltip inside the chart when a bucket sits near either edge. */
const EDGE_ZONE = 25;

function axisStep(peak: number) {
    const unit = 1024 ** Math.max(0, Math.floor(Math.log(Math.max(peak, 1)) / Math.log(1024)));
    return [1, 2, 5, 10, 20, 50, 100, 200, 500, 1024].map(factor => factor * unit).find(step => peak / step <= 4) ?? peak;
}
const byteLabel = (value: number) => usageBytes(BigInt(Math.round(value)).toString()).replace('.00', '');
const bucketTime = (seconds: number, hourly: boolean) => {
    const text = new Date(seconds * 1000).toISOString().replace('T', ' ');
    return hourly ? `${text.slice(0, 16)} UTC` : text.slice(0, 10);
};

/** Stacked traffic per UTC bucket. Every tooltip value is also in the table beside it. */
export function UsageTrendChart({ report }: { report: UsageReport }) {
    const { t } = useTranslation('auth');
    const [active, setActive] = useState<number | null>(null);
    const [cursor, setCursor] = useState(0);
    const hourly = report.interval === 'hour';
    const bucket = hourly ? 3600 : 86400;
    const points = report.series;
    if (!points.length) return <p className="text-sm text-ui-muted">{t('usage.empty')}</p>;
    const start = Math.min(report.from, points[0].start);
    // The report may end mid-bucket, while the newest bar still needs its full slot.
    const end = Math.max(report.to, points[points.length - 1].start + bucket);
    const span = Math.max(end - start, bucket);
    const place = (seconds: number) => (seconds - start) / span * 100;
    const slot = bucket / span * 100;
    const totals = points.map(point => Number(point.upload) + Number(point.download));
    const step = axisStep(Math.max(...totals, 1));
    const ceiling = Math.max(Math.ceil(Math.max(...totals, 1) / step), 1) * step;
    const ticks = Array.from({ length: Math.round(ceiling / step) + 1 }, (_, index) => index * step);
    const labelEvery = Math.max(1, Math.ceil(span / bucket / MAX_X_LABELS));
    const labels = Array.from({ length: Math.ceil(span / bucket / labelEvery) }, (_, index) => start + index * labelEvery * bucket).filter(seconds => place(seconds) + slot / 2 < 96);
    const move = (event: KeyboardEvent<HTMLDivElement>) => {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!offset) return;
        event.preventDefault();
        const next = Math.min(points.length - 1, Math.max(0, cursor + offset));
        setCursor(next);
        event.currentTarget.querySelectorAll<HTMLElement>('button')[next]?.focus();
    };
    const current = active === null ? undefined : points[active];
    const currentCenter = current ? place(current.start) + slot / 2 : 0;
    return <figure className="m-0 space-y-2" aria-label={t('usage.trend')}>
        <figcaption className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-ui-muted">
            {[...series].reverse().map(item => <span key={item.key} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ background: item.color }} />{t(`usage.${item.key}`)}</span>)}
        </figcaption>
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)]">
            <div aria-hidden="true" className="relative h-48 text-xs tabular-nums text-ui-muted">
                {ticks.map(tick => <span key={tick} className="absolute right-2 -translate-y-1/2 whitespace-nowrap" style={{ bottom: `calc(${tick / ceiling * 100}% - 0.5em)` }}>{byteLabel(tick)}</span>)}
            </div>
            <div className="relative h-48" onPointerLeave={() => setActive(null)} onKeyDown={move}>
                {ticks.map(tick => <span key={tick} aria-hidden="true" className="absolute inset-x-0 h-px bg-ui-border/60" style={{ bottom: `${tick / ceiling * 100}%` }} />)}
                {points.map((point, index) => {
                    const upload = Number(point.upload) / ceiling * 100;
                    const download = Number(point.download) / ceiling * 100;
                    const time = bucketTime(point.start, hourly);
                    return <button key={point.start} type="button" tabIndex={index === cursor ? 0 : -1}
                        aria-label={`${time}, ${t('usage.download')} ${usageBytes(point.download)}, ${t('usage.upload')} ${usageBytes(point.upload)}`}
                        className={cn('absolute inset-y-0 flex flex-col items-center justify-end rounded-ui-sm px-px outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-primary', active === index && 'bg-ui-hover')}
                        style={{ left: `${place(point.start)}%`, width: `${slot}%` }}
                        onPointerEnter={() => setActive(index)} onFocus={() => { setActive(index); setCursor(index); }} onBlur={() => setActive(null)}>
                        {/* Upload rides on download; the two fills are parted by a surface gap and keep a visible minimum. */}
                        {upload > 0 && <span aria-hidden="true" className={cn('w-full max-w-6 min-h-px shrink-0 rounded-t-[4px]', download > 0 && 'mb-0.5')} style={{ height: `${upload}%`, background: 'var(--chart-upload)' }} />}
                        {download > 0 && <span aria-hidden="true" className={cn('w-full max-w-6 min-h-px shrink-0', upload === 0 && 'rounded-t-[4px]')} style={{ height: `${download}%`, background: 'var(--chart-download)' }} />}
                    </button>;
                })}
                {current && <div role="status" className={cn('pointer-events-none absolute top-0 z-10 min-w-44 space-y-1 rounded-ui-md border border-ui-border bg-ui-surface-raised px-3 py-2 text-xs shadow-ui-elevated', currentCenter > EDGE_ZONE && currentCenter < 100 - EDGE_ZONE && '-translate-x-1/2', currentCenter >= 100 - EDGE_ZONE && '-translate-x-full')}
                    style={{ left: `${currentCenter}%` }}>
                    <p className="m-0 whitespace-nowrap text-ui-muted">{bucketTime(current.start, hourly)}</p>
                    {series.map(item => <p key={item.key} className="m-0 flex items-center gap-2"><span aria-hidden="true" className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: item.color }} /><span className="font-medium tabular-nums text-ui-heading">{usageBytes(current[item.key])}</span><span className="ml-auto pl-3 text-ui-muted">{t(`usage.${item.key}`)}</span></p>)}
                    <p className="m-0 flex items-center gap-2 border-t border-ui-border/60 pt-1"><span className="font-medium tabular-nums text-ui-heading">{usageBytes((BigInt(current.upload) + BigInt(current.download)).toString())}</span><span className="ml-auto pl-3 text-ui-muted">{t('usage.total')}</span></p>
                </div>}
            </div>
            <div aria-hidden="true" className="relative col-start-2 mt-1 h-4 text-xs tabular-nums text-ui-muted">
                {labels.map(seconds => <span key={seconds} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${place(seconds) + slot / 2}%` }}>{new Date(seconds * 1000).toISOString().slice(hourly ? 11 : 5, hourly ? 16 : 10)}</span>)}
            </div>
        </div>
    </figure>;
}
