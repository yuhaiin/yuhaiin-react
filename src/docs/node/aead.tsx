import { SettingEnumSelectVertical, SettingInputVertical } from "@/component/v2/forms";
import { FC } from "react";
import { aead, AeadCryptoMethodSchema } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Aead: FC<Props<aead>> = ({ value, onChange, editable = true }) => {
    return <>
        <SettingInputVertical
            label="Password"
            value={value.password}
            disabled={!editable}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
        <SettingEnumSelectVertical
            type={AeadCryptoMethodSchema}
            value={value.cryptoMethod}
            disabled={!editable}
            onChange={(e) => { onChange({ ...value, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}