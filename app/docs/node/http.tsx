import { FC } from "react";
import { SettingInputText } from "../../component/components";
import { http, http_termination } from "../pbes/node/protocol_pb";
import { Props } from "./tools";

export const HTTPv2: FC<Props<http>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="User"
            value={value.user}
            onChange={(e: string) => { onChange({ ...value, user: e }) }}
        />

        <SettingInputText
            label="Password"
            value={value.password}
            onChange={(e: string) => { onChange({ ...value, password: e }) }}
        />
    </>
}

export const UnWrapHttp: FC<Props<http_termination>> = ({ /*value, onChange*/ }) => {
    return <>
        {/* <SettingCheck label="Unwrap Tls" checked={value.unwrapTls} onChange={() => { onChange({ ...value, unwrapTls: !value.unwrapTls }) }} />
        <SettingSelect label="Default Scheme"
            value={value.defaultScheme ? value.defaultScheme : "https"}
            values={['http', 'https']}
            onChange={(e) => { onChange({ ...value, defaultScheme: e }) }}
        /> */}
    </>
}