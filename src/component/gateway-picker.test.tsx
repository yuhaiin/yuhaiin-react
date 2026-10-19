import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { expect, it, vi } from 'vitest';
import { GatewayPicker } from './gateway-picker';

const getConfig=vi.hoisted(()=>vi.fn());
vi.mock('@/api/gateway',()=>({getGatewayConfig:getConfig}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
vi.mock('@/component/v2/select',()=>({Select:({items,onValueChange}: {items:{value:string;label:string}[];onValueChange:(value:string)=>void})=><select onChange={event=>onValueChange(event.target.value)}>{items.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>}));
it('loads named Gateways and returns a Gateway destination',async()=>{
 getConfig.mockResolvedValue({gateways:[{id:'g',name:'Spotify Filter',enabled:true}]});
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);const changed=vi.fn();
 try {
  await act(async()=>root.render(<SWRConfig value={{provider:()=>new Map()}}><GatewayPicker value={{type:'gateway',id:''}} onChange={changed}/></SWRConfig>));
  expect(host.textContent).toContain('Spotify Filter');
  const select=host.querySelector('select')!;
  await act(async()=>{select.value='g';select.dispatchEvent(new Event('change',{bubbles:true}))});
  expect(changed).toHaveBeenCalledWith({type:'gateway',id:'g'});
 }finally{act(()=>root.unmount());host.remove()}
});
