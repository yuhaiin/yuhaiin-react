import { getResponseRules, listDNSQueryTypes, saveResponseRules, type ResponseRule } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { Textarea } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { Select } from '@/component/v2/select';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { ArrowDown, ArrowUp, ListFilter, Plus, RotateCw, Save, Trash2 } from 'lucide-react';
import { useContext, useId, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const responseCodes = ['NOERROR', 'NXDOMAIN', 'REFUSED', 'SERVFAIL', 'FORMERR', 'NOTIMPL'];
const fallbackTypes = ['A', 'AAAA', 'CNAME', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TXT', 'ANY'];

export function CustomResponses() {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const toast = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR('/api/v2/resolver/responses', getResponseRules, { revalidateOnFocus: false });
    const { data: types } = useSWR('/api/v2/resolvers/query-types', listDNSQueryTypes);
    const { value: draft, setValue, dirty, commit } = useEditorDraft('dns-responses', server, () => undefined);
    const { pending, run } = useAsyncAction(error => toast.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(dirty, pending, () => undefined);
    const id = useId();

    if (error && !server) return <Loading onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading || !draft) return <Loading />;

    const update = (index: number, patch: Partial<ResponseRule>) => setValue(prev => prev ? {
        rules: prev.rules.map((rule, i) => i === index ? { ...rule, ...patch } : rule),
    } : prev);
    const add = (rule: ResponseRule) => setValue(prev => prev ? { rules: [...prev.rules, rule] } : prev);
    const move = (index: number, direction: number) => setValue(prev => {
        if (!prev || index + direction < 0 || index + direction >= prev.rules.length) return prev;
        const rules = [...prev.rules];
        [rules[index], rules[index + direction]] = [rules[index + direction], rules[index]];
        return { rules };
    });
    const save = (event: FormEvent) => {
        event.preventDefault();
        if (pending || !dirty) return;
        void run(async () => {
            const next = await saveResponseRules({ rules: draft.rules.map(rule => ({
                ...rule, domain: rule.domain.trim(),
                answers: rule.rcode === 'NOERROR' ? rule.answers.map(value => value.trim()).filter(Boolean) : [],
            })) });
            commit(next);
            await mutate(next, { revalidate: false });
            toast.Info(uiT('save'));
        });
    };
    const queryTypes = ['*', ...(types?.types ?? fallbackTypes)].map(value => ({ value, label: value === '*' ? t('dnsResponseAllTypes') : value }));

    return <form onSubmit={save}>
        <Card>
            <fieldset disabled={pending} className="contents" aria-busy={pending}>
                <CardHeader><IconBox icon={ListFilter} title={t('dnsResponsesTab')} description={t('dnsResponsesHelp')} /></CardHeader>
                <CardBody className="space-y-4">
                    <p className="text-sm text-ui-muted">{t('dnsResponsesMatching')}</p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={() => add({ domain: '', queryType: 'A', rcode: 'NOERROR', ttl: 300, answers: [] })}><Plus size={16} className="mr-2" />{t('dnsResponseAdd')}</Button>
                        <Button type="button" size="sm" onClick={() => add({ domain: '*.example.com', queryType: 'HTTPS', rcode: 'NXDOMAIN', ttl: 0, answers: [] })}>{t('dnsResponseBlockHTTPS')}</Button>
                        <Button type="button" size="sm" onClick={() => add({ domain: '*.a.example.com', queryType: 'AAAA', rcode: 'NOERROR', ttl: 300, answers: ['::1'] })}>{t('dnsResponseMapAAAA')}</Button>
                    </div>
                    {draft.rules.length === 0 && <p className="rounded-ui-md border border-dashed border-ui-border p-6 text-sm text-ui-muted">{t('dnsResponsesEmpty')}</p>}
                    {draft.rules.map((rule, index) => <section key={index} aria-label={t('dnsResponseNumber', { number: index + 1 })} className="rounded-ui-md border border-ui-border p-4">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-ui-heading">{t('dnsResponseNumber', { number: index + 1 })}</h3>
                            <div className="flex gap-1">
                                <Button type="button" size="sm" aria-label={t('dnsResponseMoveUp')} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></Button>
                                <Button type="button" size="sm" aria-label={t('dnsResponseMoveDown')} disabled={index === draft.rules.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></Button>
                                <Button type="button" size="sm" aria-label={t('dnsResponseRemove')} onClick={() => setValue(prev => prev ? { rules: prev.rules.filter((_, i) => i !== index) } : prev)}><Trash2 size={16} /></Button>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <SettingInputVertical label={t('dnsResponseDomain')} value={rule.domain} required placeholder="*.example.com" onChange={domain => update(index, { domain })} />
                            <div><p id={`${id}-${index}-type`} className="mb-2 text-sm text-ui-muted">{t('dnsResponseQueryType')}</p><Select ariaLabelledBy={`${id}-${index}-type`} value={rule.queryType} items={queryTypes} onValueChange={queryType => update(index, { queryType, answers: queryType === '*' || queryType === 'ANY' ? [] : rule.answers })} /></div>
                            <div><p id={`${id}-${index}-code`} className="mb-2 text-sm text-ui-muted">{t('dnsResponseCode')}</p><Select ariaLabelledBy={`${id}-${index}-code`} value={rule.rcode} items={responseCodes.map(value => ({ value, label: value }))} onValueChange={rcode => update(index, { rcode, answers: rcode === 'NOERROR' ? rule.answers : [] })} /></div>
                            <SettingInputVertical label={t('dnsResponseTTL')} type="number" min={0} max={2147483647} step={1} required value={rule.ttl} onChange={value => update(index, { ttl: Number(value) })} />
                        </div>
                        {rule.rcode === 'NOERROR' && rule.queryType !== '*' && rule.queryType !== 'ANY' && <div className="mt-2">
                            <label htmlFor={`${id}-${index}-answers`} className="mb-2 block text-sm text-ui-muted">{t('dnsResponseAnswers')}</label>
                            <Textarea code id={`${id}-${index}-answers`} value={rule.answers.join('\n')} rows={3} placeholder={rule.queryType === 'AAAA' ? '::1' : rule.queryType === 'A' ? '127.0.0.1' : rule.queryType === 'TXT' ? '"custom text"' : ''} onChange={event => update(index, { answers: event.target.value.split('\n') })} />
                        </div>}
                        <p className="mt-2 text-xs text-ui-muted">{rule.rcode === 'NOERROR' ? t('dnsResponseAnswersHelp') : t('dnsResponseCodeHelp')}</p>
                    </section>)}
                </CardBody>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" size="sm" disabled={!dirty || pending} onClick={() => server && commit(server)}><RotateCw size={16} className="mr-2" />{uiT('reset')}</Button>
                    <Button type="submit" size="sm" disabled={!dirty || pending}>{pending ? <Spinner size="sm" /> : <Save size={16} className="mr-2" />}{uiT('save')}</Button>
                </CardFooter>
            </fieldset>
        </Card>
    </form>;
}
