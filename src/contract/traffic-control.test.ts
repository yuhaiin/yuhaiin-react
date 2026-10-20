import {describe,it,expect} from "vitest";
import {blankTrafficConfig,normalizeTrafficControl,toMbps,fromMbps,validateTrafficControl} from "./traffic-control";
describe("traffic control contract",()=>{
 it("uses unlimited defaults and preserves independent copies",()=>{
  const x=blankTrafficConfig();
  const a=normalizeTrafficControl(x),b=normalizeTrafficControl(x);
  a.global.upload.bytesPerSecond=1250000;
  expect(b.global.upload.bytesPerSecond).toBe(0);
  expect(validateTrafficControl(a)).toBeNull();
 });
 it("converts decimal Mbps and rejects invalid profiles",()=>{
  expect(fromMbps(10)).toBe(1250000);
  expect(toMbps(1250000)).toBe(10);
  expect(validateTrafficControl({...blankTrafficConfig(),defaultProfile:"absent"})).toContain("Unknown");
  expect(validateTrafficControl({...blankTrafficConfig(),global:{
   upload:{bytesPerSecond:0,burstBytes:1},download:{bytesPerSecond:0,burstBytes:0}
  }})).toContain("Unlimited");
 });
});
