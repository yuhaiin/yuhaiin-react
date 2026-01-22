import { FC } from "react"
import { SettingInputText } from "../../component/components"
import { SettingTypeSelect } from "../../component/switch"
import { aead } from "../pbes/config/inbound_pb"
import { AeadCryptoMethodSchema } from "../pbes/node/protocol_pb"

export const Aead: FC<{ aead: aead, onChange: (x: aead) => void }> = ({ aead, onChange }) => {
    return <>
        <SettingInputText
            label="Password"
            value={aead.password}
            onChange={(e: string) => { onChange({ ...aead, password: e }) }}
        />
        <SettingTypeSelect
            type={AeadCryptoMethodSchema}
            value={aead.cryptoMethod}
            onChange={(e) => { onChange({ ...aead, cryptoMethod: e }) }}
            label="Crypto Method"
        />
    </>
}