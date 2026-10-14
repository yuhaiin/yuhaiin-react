import { listGeoIPCountries } from '@/api/route';
import { Button } from './v2/button';
import { Input } from './v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './v2/modal';
import { Check, ChevronDown, Globe2, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/** Country values remain in the rule; database changes only update suggestions. */
export function GeoIPCountrySelect({ value, onChange, disabled = false }: { value: string; onChange: (countries: string) => void; disabled?: boolean }) {
    const { t, i18n } = useTranslation('routing');
    const { t: commonT } = useTranslation('common');
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const selected = value.split(',').map(code => code.trim()).filter(Boolean);
    const { data, error, isLoading, mutate } = useSWR(open ? '/api/v2/route/geoip/countries' : null, listGeoIPCountries, { revalidateOnMount: true, revalidateOnFocus: true });
    const names = useMemo(() => {
        try { return new Intl.DisplayNames([i18n.resolvedLanguage || i18n.language || 'en'], { type: 'region' }); }
        catch { return undefined; }
    }, [i18n.resolvedLanguage, i18n.language]);
    const countryName = (code: string) => /^[A-Za-z]{2}$/.test(code) ? names?.of(code.toUpperCase()) || code : code;
    const countryLabel = (code: string) => countryName(code) === code ? code : `${countryName(code)} (${code})`;
    const available = new Set(data?.codes ?? []);
    const codes = [...new Set([...(data?.codes ?? []), ...selected])];
    const needle = query.trim().toLocaleLowerCase();
    const filtered = codes.filter(code => `${code} ${countryName(code)}`.toLocaleLowerCase().includes(needle));
    const toggle = (code: string) => onChange((selected.includes(code) ? selected.filter(value => value !== code) : [...selected, code]).join(','));
    return <div className="min-w-0 space-y-2">
        <Button type="button" variant="outline-secondary" aria-label={t('countryCodes')} aria-haspopup="dialog" aria-expanded={open} disabled={disabled}
            className="w-full min-w-0 justify-between gap-2 font-normal" onClick={() => { setQuery(''); setOpen(true); }}>
            <Globe2 size={16} className="shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-left">{selected.length ? selected.map(countryLabel).join(', ') : t('chooseCountries')}</span>
            <ChevronDown size={16} className="shrink-0" aria-hidden="true" />
        </Button>
        {selected.length > 0 && <div className="flex flex-wrap gap-1.5">{selected.map((code, index) => <span key={`${code}:${index}`} className="inline-flex max-w-full items-center gap-1.5 rounded-ui-md bg-ui-primary-soft px-2 py-1 text-xs text-ui-primary">
            <span className="min-w-0 truncate" title={countryName(code)}>{code}</span>
            <button type="button" aria-label={`${commonT('action.remove')} ${code}`} disabled={disabled} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-ui-sm hover:bg-ui-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                onClick={() => onChange(selected.filter((_, position) => position !== index).join(','))}><X size={12} aria-hidden="true" /></button>
        </span>)}</div>}
        <details><summary className="cursor-pointer text-xs text-ui-muted">{t('manualCountryCodes')}</summary>
            <Input aria-label={t('manualCountryCodes')} className="mt-2" value={value} placeholder="CN,JP,US" disabled={disabled} onChange={event => onChange(event.target.value)} />
        </details>
        <Modal open={open} onOpenChange={setOpen}><ModalContent width={560}>
            <ModalHeader closeButton><ModalTitle className="flex items-center gap-2"><Globe2 size={18} />{t('chooseCountries')}</ModalTitle></ModalHeader>
            <ModalBody className="min-w-0 space-y-3">
                <div className="relative"><Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                    <Input type="search" aria-label={t('searchCountries')} placeholder={t('searchCountries')} value={query} className="pl-9" onChange={event => setQuery(event.target.value)} /></div>
                {isLoading && <p role="status" className="text-sm text-ui-muted">{t('loading')}</p>}
                {error && <p role="alert" className="text-sm text-ui-danger">{t('countryPickerFailed')} <Button size="sm" variant="outline-secondary" onClick={() => void mutate()}>{t('retry')}</Button></p>}
                {data && <p className="text-xs text-ui-muted">{t(data.loaded && data.codes.length ? 'countryPickerHelp' : 'countryPickerEmpty')}</p>}
                <div role="group" aria-label={t('countryCodes')} className="max-h-[min(40dvh,320px)] overflow-y-auto overscroll-contain">
                    {filtered.map(code => <button type="button" key={code} role="checkbox" aria-checked={selected.includes(code)} aria-label={countryLabel(code)} disabled={disabled}
                        className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-ui-md px-3 py-2 text-left hover:bg-ui-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus"
                        onClick={() => toggle(code)}>
                        <span aria-hidden="true" className="flex w-4 shrink-0 justify-center text-ui-primary">{selected.includes(code) && <Check size={16} />}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-ui-heading">{countryName(code)}{selected.includes(code) && data && !available.has(code) && <span className="ml-2 text-xs text-ui-muted">{t('countryOutsideDatabase')}</span>}</span>
                        <span className="shrink-0 font-mono text-xs text-ui-muted">{code}</span>
                    </button>)}
                    {!isLoading && !filtered.length && <p className="py-6 text-center text-sm text-ui-muted">{commonT('state.noRecords')}</p>}
                </div>
            </ModalBody>
            <ModalFooter><Button variant="primary" onClick={() => setOpen(false)}>{commonT('action.close')}</Button></ModalFooter>
        </ModalContent></Modal>
    </div>;
}
