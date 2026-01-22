import { FC } from "react";
import { SettingInputText } from "../../component/components";
import { SettingTypeSelect } from "../../component/switch";
import { aead, AeadCryptoMethodSchema } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const Aead: FC<Props<aead>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
        <SettingTypeSelect
            type={AeadCryptoMethodSchema}
            value={value.cryptoMethod}
            onChange={(e) => { onChange({ ...value, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}