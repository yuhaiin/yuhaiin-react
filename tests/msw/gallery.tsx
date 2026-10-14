import '@/global.css';
import '@/i18n';
import { ThemeProvider, useTheme } from '@/common/ThemeProvider';
import { AccentPicker } from '@/component/accent-picker';
import { Button } from '@/component/v2/button';
import { Badge } from '@/component/v2/badge';
import { Input, Textarea } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { Combobox } from '@/component/v2/combobox';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownCheckboxItem } from '@/component/v2/dropdown';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import { Switch, SwitchCard } from '@/component/v2/switch';
import { FormSection } from '@/component/v2/form-section';
import { SettingRangeVertical } from '@/component/v2/forms';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/component/v2/modal';
import { Tooltip } from '@/component/v2/tooltip';
import { GlobalToastProvider, GlobalToastContext } from '@/component/v2/toast';
import { ListItem } from '@/component/v2/card';
import { Pagination } from '@/component/v2/pagination';
import { ui } from '@/component/v2/styles';
import { createRoot } from 'react-dom/client';
import { useContext, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ChevronDown, Plus, Settings, Trash } from 'lucide-react';

function Gallery() {
    const { preference, setPreference } = useTheme();
    const toast = useContext(GlobalToastContext);
    const [value, setValue] = useState('udp');
    const [segment, setSegment] = useState('simple');
    const [checked, setChecked] = useState(true);
    const [choice, setChoice] = useState('domains');
    const [level, setLevel] = useState(40);
    const [page, setPage] = useState(2);
    const [open, setOpen] = useState(false);
    const [nested, setNested] = useState(false);
    const [item, setItem] = useState(1);
    const [pendingProbe, setPendingProbe] = useState(false);
    return <main data-gallery-ready className="mx-auto max-w-6xl p-4 text-sm sm:p-6">
        <header className="mb-6 space-y-2"><h1 className={ui.pageTitle}>Component Gallery</h1><p className="text-ui-muted">Development-only MSW fixture · shared dimensions, surfaces and interaction states</p>
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]"><Select ariaLabel="Theme mode" value={preference} items={['light','dark','system'].map(value => ({value,label:value}))} onValueChange={value => setPreference(value as typeof preference)} /><AccentPicker /></div>
        </header>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            <FormSection title="Buttons" description="38px standard · 32px compact · 44px touch targets" className="border-t-0 pt-0">
                <div className="flex flex-wrap items-center gap-2"><Button data-testid="gallery-primary" variant="primary"><Plus />Primary</Button><Button>Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="destructive"><Trash />Delete</Button><Button variant="danger">Danger</Button></div>
                <div className="flex flex-wrap items-center gap-2"><Button variant="primary" size="sm">Compact</Button><Button size="icon" variant="ghost" aria-label="Icon settings"><Settings /></Button><Button disabled>Disabled</Button><Button loading variant="primary">Loading action</Button><Button data-testid="gallery-load-probe" size="sm" loading={pendingProbe} onClick={()=>setPendingProbe(true)}>Test load</Button></div>
            </FormSection>
            <FormSection title="Typography" className="border-t-0 pt-0">
                <h2 className={ui.sectionTitle}>Section title · 16px medium</h2><p>Regular body text · 14px</p><p className="text-xs text-ui-muted">Supporting text · 12px. 12.4 ms · 1024 MB · #route-01</p><p className="leading-relaxed">English · 网络管理工具 · ネットワーク設定 · 네트워크 설정</p>
            </FormSection>
            <FormSection title="Inputs and choices">
                <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1"><span className={ui.sectionLabel}>Standard input</span><Input aria-label="Gallery input" placeholder="Search or enter a name" /></label><label className="space-y-1"><span className={ui.sectionLabel}>Standard select</span><Select ariaLabel="Gallery select" value={value} onValueChange={setValue} items={['udp','tcp','https'].map(value=>({value,label:value.toUpperCase()}))} /></label></div>
                <div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Readonly" readOnly value="Read-only value" /><Input aria-label="Invalid" error="Enter a valid host or IP address." placeholder="Invalid field" /></div>
                <div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Disabled input" disabled value="Unavailable value" /><Select ariaLabel="Disabled select" value="udp" disabled onValueChange={setValue} items={[{value:'udp', label:'UDP'}]} /></div>
                <Textarea aria-label="Gallery textarea" placeholder="One entry per line" rows={2} />
                <Combobox aria-label="Gallery combobox" value={choice} onChange={setChoice} showAllOnFocus options={['domains','networks','processes'].map(value=>({value,label:value}))} />
            </FormSection>
            <FormSection title="Segments and switches">
                <ToggleGroup type="single" value={segment} aria-label="Gallery editor mode" onValueChange={value=>value&&setSegment(value)}><ToggleItem value="simple">Simple editor</ToggleItem><ToggleItem value="advanced">Advanced editor</ToggleItem><ToggleItem value="disabled" disabled>Disabled</ToggleItem></ToggleGroup>
                <div className="flex flex-wrap items-center gap-4"><Switch disabled checked={false} label="Disabled OFF" /><Switch disabled checked label="Disabled ON" /></div>
                <Switch checked={checked} onCheckedChange={setChecked} label="Standalone switch" />
                <SwitchCard checked={checked} onCheckedChange={setChecked} label="Whole-row switch" description="A quiet clickable row, with the same visual track." />
                <div className="flex flex-wrap gap-4"><label className="flex min-h-11 items-center gap-2"><input type="checkbox" defaultChecked />Checkbox</label><label className="flex min-h-11 items-center gap-2"><input type="radio" name="gallery-radio" defaultChecked />Radio</label><label className="flex min-h-11 items-center gap-2"><input type="radio" name="gallery-radio" />Alternative</label></div>
            </FormSection>
            <FormSection title="Metadata and slider">
                <div className="flex flex-wrap gap-2"><Badge>Protocol</Badge><Badge variant="primary">Accent</Badge><span className={ui.chip}>Group</span><Badge dot variant="success">Running</Badge><Badge variant="warning">Warning</Badge><Badge variant="danger">Failed</Badge><Badge variant="info">Information</Badge></div>
                <SettingRangeVertical label="Limit" value={level} min={0} max={100} step={1} onChange={setLevel} unit="%" />
            </FormSection>
            <FormSection title="Lists and pagination">
                <div className="space-y-1">{[1,2].map(id=><ListItem key={id} selected={item===id} onClick={()=>setItem(id)} density="compact"><span>Destination {id}</span></ListItem>)}</div>
                <div data-gallery-pagination><Pagination currentPage={page} pageSize={20} totalItems={120} onPageChange={setPage} /></div>
            </FormSection>
            <FormSection title="Floating surfaces" className="md:col-span-2">
                <div className="flex flex-wrap gap-2"><Button onClick={()=>setOpen(true)}>Open dialog</Button>
                    <Dropdown><DropdownTrigger asChild><Button>Open dropdown<ChevronDown /></Button></DropdownTrigger><DropdownContent><DropdownItem>Action</DropdownItem><DropdownCheckboxItem checked>Selected option</DropdownCheckboxItem><DropdownItem disabled>Unavailable</DropdownItem></DropdownContent></Dropdown>
                    <Tooltip content="Keyboard and pointer tooltip" id="gallery-tooltip"><Button variant="ghost">Tooltip trigger</Button></Tooltip>
                    <Button variant="destructive" onClick={()=>toast.Error('The request failed. Retry when the connection is available.')}>Error toast</Button>
                    <Button onClick={()=>toast.Info('A notification on the raised surface')}>Show toast</Button>
                </div>
            </FormSection>
            <FormSection title="Long labels and multilingual controls" className="md:col-span-2">
                <div className="grid gap-3 sm:grid-cols-2">{['Save configuration · English','保存并应用网络配置 · 中文','ネットワーク設定を保存 · 日本語','네트워크 설정 저장 · 한국어'].map(label => <div key={label} className="flex min-w-0 flex-wrap items-center gap-2"><Button variant="primary">{label}</Button><Button variant="ghost" size="icon" aria-label={label}><Settings /></Button></div>)}</div>
                <ToggleGroup type="single" value="one" aria-label="Long multilingual segments" className="flex-wrap"><ToggleItem value="one">すべて一致 · 全部匹配</ToggleItem><ToggleItem value="two">いずれか一致 · 하나라도 일치</ToggleItem></ToggleGroup>
                <Select ariaLabel="Long option" value="long" onValueChange={()=>{}} items={[{value:'long',label:'A long destination name · 很长的连接名称 · 長い接続先の名前 · 긴 연결 대상 이름'}]} />
                <SettingRangeVertical disabled label="Disabled limit" value={40} min={0} max={100} step={1} onChange={()=>{}} unit="%" />
            </FormSection>
        </div>
        <Modal open={open} onOpenChange={setOpen}><ModalContent width={620}><ModalHeader closeButton><ModalTitle>Gallery dialog</ModalTitle></ModalHeader><ModalBody><p className="mb-3 text-ui-muted">Opacity, focus trap, scroll lock and nested popovers can be inspected here.</p><Button onClick={()=>setNested(true)}>Open nested dialog</Button><div className="mt-4 space-y-2">{Array.from({length:40},(_,i)=><p key={i}>Long content row {i+1}</p>)}</div></ModalBody><ModalFooter><Button onClick={()=>setOpen(false)}>Close dialog</Button></ModalFooter></ModalContent>
            <Modal open={nested} onOpenChange={setNested}><ModalContent><ModalHeader closeButton><ModalTitle>Nested dialog</ModalTitle></ModalHeader><ModalBody><Select ariaLabel="Nested select" value={value} onValueChange={setValue} items={['udp','tcp'].map(value=>({value,label:value}))} /></ModalBody></ModalContent></Modal>
        </Modal>
    </main>;
}

createRoot(document.getElementById('root')!).render(<MotionConfig reducedMotion="user"><ThemeProvider><GlobalToastProvider><Gallery /></GlobalToastProvider></ThemeProvider></MotionConfig>);
