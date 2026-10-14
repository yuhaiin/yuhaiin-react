import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GeoIPCountrySelect } from './geoip-country-select';

const api=vi.hoisted(()=>({listGeoIPCountries:vi.fn()}));
vi.mock('@/api/route',()=>api);
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en',resolvedLanguage:'en'}})}));
let host:HTMLDivElement,root:Root;
const change=vi.fn();
beforeEach(()=>{vi.clearAllMocks();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.restoreAllMocks();});
function Probe({initial}:{initial:string}){const [value,setValue]=useState(initial);return <GeoIPCountrySelect value={value} onChange={value=>{change(value);setValue(value);}}/>;}
async function render(initial='CN,LEGACY') {await act(async()=>root.render(<SWRConfig value={{provider:()=>new Map(),dedupingInterval:0,errorRetryCount:0}}><Probe initial={initial}/></SWRConfig>));}
async function click(label:string){const buttons=[...document.querySelectorAll<HTMLButtonElement>('button')];const button=buttons.find(b=>b.getAttribute('aria-label')===label)||buttons.find(b=>b.textContent?.trim()===label);if(!button)throw Error('Missing '+label);await act(async()=>button.click());}
function type(input:HTMLInputElement,value:string){act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});}
it('loads on open, searches localized names, and preserves stored codes across database updates',async()=>{
 api.listGeoIPCountries.mockResolvedValue({codes:['CN','LAN','US'],loaded:true});
 await render();expect(api.listGeoIPCountries).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();
 await click('countryCodes');expect(api.listGeoIPCountries).toHaveBeenCalledTimes(1);
 await click('United States (US)');expect(change).toHaveBeenLastCalledWith('CN,LEGACY,US');
 await click('action.close');api.listGeoIPCountries.mockResolvedValue({codes:['JP'],loaded:true});
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,20));});
 await click('countryCodes');expect(api.listGeoIPCountries.mock.calls.length).toBeGreaterThanOrEqual(2);
 expect(change).toHaveBeenCalledTimes(1);
 expect(document.querySelector('[role="checkbox"][aria-label="LEGACY"]')?.getAttribute('aria-checked')).toBe('true');
 type(document.querySelector<HTMLInputElement>('input[type="search"]')!,'Japan');
 expect([...document.querySelectorAll('[role="checkbox"]')].map(b=>b.getAttribute('aria-label'))).toEqual(['Japan (JP)']);
 await click('Japan (JP)');expect(change).toHaveBeenLastCalledWith('CN,LEGACY,US,JP');
});
it('keeps manual editing available when the backend cannot provide a catalog',async()=>{
 api.listGeoIPCountries.mockRejectedValue({code:404,msg:'endpoint unavailable'});
 await render('CN');await click('countryCodes');expect(document.querySelector('[role="alert"]')?.textContent).toContain('countryPickerFailed');
 expect(change).not.toHaveBeenCalled();await click('action.close');
 type(host.querySelector<HTMLInputElement>('input[aria-label="manualCountryCodes"]')!,'  ZZ,LAN ');
 expect(change).toHaveBeenLastCalledWith('  ZZ,LAN ');
});
it('does not clear a country when no database is loaded',async()=>{
 api.listGeoIPCountries.mockResolvedValue({codes:[],loaded:false});await render('CN');await click('countryCodes');
 expect(document.body.textContent).toContain('countryPickerEmpty');expect(change).not.toHaveBeenCalled();
 await click('China (CN)');expect(change).toHaveBeenLastCalledWith('');
});
