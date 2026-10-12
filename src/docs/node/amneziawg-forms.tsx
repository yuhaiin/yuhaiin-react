import type { NodeProtocolConfig } from "@/contract/node";
import { FC } from "react";
import { StringField, NumberField, BoolField } from "./fields";
import { WireguardForm } from "./tunnel-forms";

// AWG shares the peer UI but not the transport engine with stock WireGuard.
export const AmneziaWGForm: FC<{
  config: NodeProtocolConfig<"amneziawg">;
  editable: boolean;
  onChange: (patch: Partial<NodeProtocolConfig<"amneziawg">>) => void;
}> = ({ config, editable, onChange }) => {
  const strings = ["h1", "h2", "h3", "h4", "i1", "i2", "i3", "i4", "i5", "header_protection_key", "content_padding_addition"] as const;
  const numbers = ["jc", "jmin", "jmax", "s1", "s2", "s3", "s4"] as const;
  return <div className="grid gap-4">
    <WireguardForm config={config} hideReserved editable={editable} onChange={onChange} />
    <fieldset className="grid gap-3 rounded-ui-md border border-ui-border p-3">
      <legend className="px-1 font-semibold">AmneziaWG 3.1 obfuscation</legend>
      <p className="mb-0 text-sm text-ui-muted">H1-H4 accept a number or numeric range. I1-I5 use upstream packet templates. Configure peers consistently.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {strings.map((key) => <StringField key={key} label={key} value={config[key] ?? ""} disabled={!editable}
          onChange={(value) => onChange({ [key]: value })} />)}
        {numbers.map((key) => <NumberField key={key} label={key} value={config[key] ?? 0} disabled={!editable}
          onChange={(value) => onChange({ [key]: Math.max(0, value) })} />)}
      </div>
      <BoolField label="RandomTrailers" value={config.random_trailers} disabled={!editable}
        onChange={(random_trailers) => onChange({ random_trailers })} />
      <BoolField label="DisableCookies" value={config.disable_cookies} disabled={!editable}
        onChange={(disable_cookies) => onChange({ disable_cookies })} />
    </fieldset>
  </div>;
};
