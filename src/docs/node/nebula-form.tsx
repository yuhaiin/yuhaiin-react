import type { NodeProtocolConfig } from "@/contract/node";
import { SettingLabel } from "@/component/v2/card";
import { Textarea } from "@/component/v2/input";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

// Nebula's full YAML is intentionally kept as one field. Importing the standard
// config preserves Lighthouse, static-host mappings, PKI and firewall policies.
export const NebulaForm: FC<{
    config: NodeProtocolConfig<"nebula">;
    editable: boolean;
    onChange: (patch: Partial<NodeProtocolConfig<"nebula">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t } = useTranslation("ui");
    return (
    <div className="grid gap-3">
        <div>
            <SettingLabel className="mb-2 block">{t("nodeForm.nebulaConfig")}</SettingLabel>
            <Textarea code secret
                aria-label={t("nodeForm.nebulaConfig")}
                rows={18}
                spellCheck={false}
                disabled={!editable}
                value={config.config_yaml ?? ""}
                placeholder={"pki:\n  ca: |\n    ...\n  cert: |\n    ...\n  key: |\n    ...\nlighthouse:\n  am_lighthouse: false\n  hosts:\n    - 10.42.0.1"}
                onChange={(event) => onChange({ config_yaml: event.target.value })}
            />
        </div>
        <p className="text-sm text-ui-muted">
            Paste an existing Nebula configuration, including inline CA, host certificate and private key.
            yuhaiin uses the memory-only IP stack, so a system TUN or administrator privileges are not required.
            Nebula opens its own UDP underlay and cannot be chained behind another outbound.
            Custom unsafe routes, the built-in SSH server and external statistics listeners are not supported.
        </p>
    </div>
    );
};
