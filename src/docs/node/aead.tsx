import { SettingEnumSelectVertical, SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { aead, AeadCryptoMethodSchema } from "../schema/node/protocol";
import { Props } from "./tools";

export const Aead: FC<Props<aead>> = ({ value, onChange, editable = true }) => {
    const current = {
        ...value,
        password: value?.password ?? "",
        cryptoMethod: typeof value?.cryptoMethod === "number" ? value.cryptoMethod : 0,
    };
    return <>
        <SettingInputVertical
            label="Password"
            value={current.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...current, password: e }) }}
        />
        <SettingEnumSelectVertical
            type={AeadCryptoMethodSchema}
            value={current.cryptoMethod}
            disabled={!editable}
            onChange={(e) => { onChange({ ...current, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}
